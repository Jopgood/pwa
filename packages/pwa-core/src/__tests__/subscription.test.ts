import { describe, expect, it, vi } from "vitest";
import { SubscriptionManager } from "../subscription";
import { createPWAStore } from "../store";
import {
  installMockNotification,
  installMockServiceWorker,
  makeMockSubscription,
} from "./setup";

// Realistic-shaped VAPID public key (88 chars, urlsafe-base64). The
// manager only uses it inside urlBase64ToUint8Array; tests don't care
// about the bytes, just that the conversion doesn't throw.
const FAKE_VAPID =
  "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

describe("SubscriptionManager.subscribe — permission gate", () => {
  it("refuses to subscribe when permission is denied — without ever calling pushManager.subscribe", async () => {
    // Setup: SW is fine, but the user has blocked notifications. Without
    // the gate, Firefox/Safari would throw NotAllowedError from inside
    // pushManager.subscribe; Chrome would silently no-op or re-prompt.
    // We want a single deterministic path: refuse, report, return.
    installMockNotification("denied");
    const { pushManager } = installMockServiceWorker();

    const store = createPWAStore();
    const onError = vi.fn();
    const manager = new SubscriptionManager(
      store,
      FAKE_VAPID,
      undefined,
      onError,
    );

    const result = await manager.subscribe();

    expect(result).toBeNull();
    expect(pushManager.subscribe).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/permission not granted/i),
      }),
    );
    expect(store.state.error).toBeInstanceOf(Error);
    expect(store.state.isSubscribed).toBe(false);
    expect(store.state.subscription).toBeNull();
  });

  it("refuses to subscribe when permission is default — Chrome's implicit prompt is exactly the inconsistency we're eliminating", async () => {
    installMockNotification("default");
    const { pushManager } = installMockServiceWorker();

    const store = createPWAStore();
    const manager = new SubscriptionManager(store, FAKE_VAPID);

    const result = await manager.subscribe();

    expect(result).toBeNull();
    expect(pushManager.subscribe).not.toHaveBeenCalled();
    expect(store.state.error).toBeInstanceOf(Error);
  });

  it("subscribes and clears any prior error when permission is granted", async () => {
    // Happy path also pins the error-reset contract: a previous failure
    // populates store.error; a successful subscribe must clear it so
    // consumer error-banner UI doesn't stick forever.
    installMockNotification("granted");
    const { pushManager } = installMockServiceWorker();
    const fakeSubscription = makeMockSubscription();
    pushManager.subscribe.mockResolvedValueOnce(fakeSubscription);

    const store = createPWAStore();
    store.setState((s) => ({ ...s, error: new Error("stale failure") }));

    const onChange = vi.fn();
    const manager = new SubscriptionManager(store, FAKE_VAPID, onChange);

    const result = await manager.subscribe();

    expect(result).toBe(fakeSubscription);
    expect(pushManager.subscribe).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(fakeSubscription);
    expect(store.state.isSubscribed).toBe(true);
    expect(store.state.subscription).toBe(fakeSubscription);
    expect(store.state.error).toBeNull();
  });

  it("returns null without touching state when service worker is unsupported", async () => {
    installMockNotification("granted");

    const store = createPWAStore();
    const manager = new SubscriptionManager(store, FAKE_VAPID);

    const result = await manager.subscribe();

    expect(result).toBeNull();
    expect(store.state.isSubscribed).toBe(false);
    expect(store.state.error).toBeNull();
  });
});

describe("SubscriptionManager.unsubscribe — uses stored subscription", () => {
  it("uses the subscription in the store without re-fetching from pushManager", async () => {
    // The current implementation always calls pushManager.getSubscription()
    // even though sync()/subscribe() already populated the store. This pins
    // the property that we use what we already have — eliminating an
    // unnecessary round-trip and (more importantly) the inconsistency
    // demonstrated in the next test.
    const { pushManager } = installMockServiceWorker();
    const stored = makeMockSubscription();

    const store = createPWAStore();
    store.setState((s) => ({
      ...s,
      subscription: stored as unknown as PushSubscription,
      isSubscribed: true,
    }));

    const onChange = vi.fn();
    const manager = new SubscriptionManager(
      store,
      FAKE_VAPID,
      onChange,
    );

    await manager.unsubscribe();

    // The stored subscription's unsubscribe was called, not pushManager's
    // getSubscription path.
    expect(stored.unsubscribe).toHaveBeenCalledOnce();
    expect(pushManager.getSubscription).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(null);
    expect(store.state.subscription).toBeNull();
    expect(store.state.isSubscribed).toBe(false);
  });

  it("clears the store even when the browser-side subscription was invalidated out-of-band", async () => {
    // Real-world scenario: the user's subscription was cleared elsewhere
    // (different tab, server pushed an unsubscribe, push service expired
    // it). The store still thinks isSubscribed: true, but
    // pushManager.getSubscription() returns null.
    //
    // CURRENT (buggy) behavior: the early-return in `if (subscription)`
    // means the store is never reset — the consumer's UI shows
    // "Subscribed" forever despite the user wanting to leave.
    //
    // FIXED behavior: we use the stored subscription; calling .unsubscribe()
    // on it is a no-op or throws-and-is-caught, but we still clear store
    // state so the UI reflects reality.
    const { pushManager } = installMockServiceWorker();
    pushManager.getSubscription.mockResolvedValue(null);

    const stored = makeMockSubscription();
    // Simulate the browser-side push subscription being already gone:
    // calling unsubscribe on the stale object resolves false (or throws,
    // depending on the browser). We model the benign case.
    stored.unsubscribe.mockResolvedValue(false);

    const store = createPWAStore();
    store.setState((s) => ({
      ...s,
      subscription: stored as unknown as PushSubscription,
      isSubscribed: true,
    }));

    const onChange = vi.fn();
    const manager = new SubscriptionManager(
      store,
      FAKE_VAPID,
      onChange,
    );

    await manager.unsubscribe();

    expect(onChange).toHaveBeenCalledWith(null);
    expect(store.state.subscription).toBeNull();
    expect(store.state.isSubscribed).toBe(false);
  });

  it("surfaces low-level subscription.unsubscribe() errors via onError but still clears state — user intent succeeded", async () => {
    // Transparency contract: if the browser-side unsubscribe call throws
    // (e.g. the push subscription is already gone server-side), we don't
    // want a stuck UI showing "Subscribed". The user wanted out, the
    // store reflects that. But we also don't want to silently swallow —
    // a debugging consumer needs the signal that something went wrong
    // down at the API boundary. Route through onError, leave store.error
    // alone because the user-facing operation succeeded.
    installMockServiceWorker();
    const stored = makeMockSubscription();
    const browserError = new Error("subscription already invalidated");
    stored.unsubscribe.mockRejectedValueOnce(browserError);

    const store = createPWAStore();
    store.setState((s) => ({
      ...s,
      subscription: stored as unknown as PushSubscription,
      isSubscribed: true,
    }));

    const onError = vi.fn();
    const onChange = vi.fn();
    const manager = new SubscriptionManager(
      store,
      FAKE_VAPID,
      onChange,
      onError,
    );

    const result = await manager.unsubscribe();

    expect(result).toBe(true);
    expect(onError).toHaveBeenCalledWith(browserError);
    // store.error stays null because the user-facing intent was met.
    expect(store.state.error).toBeNull();
    expect(store.state.isSubscribed).toBe(false);
    expect(store.state.subscription).toBeNull();
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("returns false without touching state when no subscription exists anywhere", async () => {
    // No store subscription, no browser subscription. Caller can now
    // distinguish this from a successful unsubscribe via the boolean.
    const { pushManager } = installMockServiceWorker();
    pushManager.getSubscription.mockResolvedValue(null);

    const store = createPWAStore();
    const onChange = vi.fn();
    const manager = new SubscriptionManager(
      store,
      FAKE_VAPID,
      onChange,
    );

    const result = await manager.unsubscribe();

    expect(result).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
    expect(store.state.isSubscribed).toBe(false);
  });

  it("falls back to pushManager.getSubscription() when the store has none — defensive path for unsubscribe-before-sync", async () => {
    // Defensive path: if a consumer calls unsubscribe() before sync()
    // populated the store (rare, but legal), we should still be able to
    // unsubscribe the live browser-side subscription rather than no-op.
    const { pushManager } = installMockServiceWorker();
    const browserSide = makeMockSubscription();
    pushManager.getSubscription.mockResolvedValue(browserSide);

    const store = createPWAStore();
    // store.subscription stays null — sync() never ran
    const onChange = vi.fn();
    const manager = new SubscriptionManager(
      store,
      FAKE_VAPID,
      onChange,
    );

    await manager.unsubscribe();

    expect(pushManager.getSubscription).toHaveBeenCalled();
    expect(browserSide.unsubscribe).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(null);
    expect(store.state.subscription).toBeNull();
    expect(store.state.isSubscribed).toBe(false);
  });
});
