import type { createPWAStore } from "./store";

export class SubscriptionManager {
  constructor(
    private store: ReturnType<typeof createPWAStore>,
    private vapidPublicKey: string,
    private onSubscriptionChange?: (
      subscription: PushSubscription | null,
    ) => void,
    private onError?: (error: Error) => void,
  ) {}

  async sync() {
    if (!("serviceWorker" in navigator)) return;
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.getSubscription();

    this.onSubscriptionChange?.(subscription);
    this.store.setState((prev) => ({
      ...prev,
      subscription,
      isSubscribed: !!subscription,
      error: null,
    }));
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!("serviceWorker" in navigator)) return null;

    // Permission gate — without this, Chrome implicitly prompts on
    // subscribe() while Firefox/Safari throw NotAllowedError, so callers
    // see browser-dependent behavior from the same code path. We refuse
    // unless permission is explicitly granted; callers drive the prompt
    // separately via requestNotificationPermission(). The "default" case
    // is treated the same as "denied" on purpose — we never want a
    // surprise prompt fired from subscribe().
    const permission =
      typeof Notification !== "undefined" ? Notification.permission : "denied";
    if (permission !== "granted") {
      const err = new Error(
        "Notification permission not granted — call requestNotificationPermission() first",
      );
      this.store.setState((prev) => ({ ...prev, error: err }));
      this.onError?.(err);
      return null;
    }

    const registration = await navigator.serviceWorker.ready;

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // DOM types want a Uint8Array backed by ArrayBuffer specifically
        // (not the SharedArrayBuffer variant). The helper produces one
        // via the `new Uint8Array(length)` constructor — narrow at the
        // boundary rather than thread the generic through the helper's
        // return type, which would impose TypeScript 5.7+ on consumers.
        applicationServerKey: this.urlBase64ToUint8Array(
          this.vapidPublicKey,
        ) as BufferSource,
      });

      this.onSubscriptionChange?.(subscription);
      this.store.setState((prev) => ({
        ...prev,
        subscription,
        isSubscribed: true,
        error: null,
      }));
      return subscription;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.store.setState((prev) => ({
        ...prev,
        error: err,
      }));
      this.onError?.(err);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!("serviceWorker" in navigator)) return false;

    // Use the stored subscription — it's the only reference we can act
    // on when the browser-side subscription has been invalidated
    // out-of-band (different tab, server-pushed 410 Gone, expired). In
    // those cases pushManager.getSubscription() returns null, so calling
    // it first would silently no-op and leave the store wedged at
    // isSubscribed: true forever. The pushManager fallback below only
    // exists for the unsubscribe-before-sync path.
    let subscription: PushSubscription | null = this.store.state.subscription;
    if (!subscription) {
      const registration = await navigator.serviceWorker.ready;
      subscription = await registration.pushManager.getSubscription();
    }
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();
    } catch (error) {
      // The browser-side subscription may already be gone (server-pushed
      // 410, expired). The user's intent — "be in an unsubscribed state"
      // — is still satisfied, so we don't poison store.error and the
      // success path below still runs. But the consumer deserves to know
      // a low-level call failed, so we surface via onError.
      const err = error instanceof Error ? error : new Error(String(error));
      this.onError?.(err);
    }

    this.onSubscriptionChange?.(null);
    this.store.setState((prev) => ({
      ...prev,
      subscription: null,
      isSubscribed: false,
      error: null,
    }));
    return true;
  }

  private urlBase64ToUint8Array(base64: string): Uint8Array {
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const base64Std = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64Std);
    const output = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      output[i] = rawData.charCodeAt(i);
    }
    return output;
  }
}
