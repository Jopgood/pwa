import { describe, expect, it } from "vitest";
import { PWAManager } from "../manager";
import {
  installMockNotification,
  installMockServiceWorker,
  makeMockSubscription,
} from "./setup";

const FAKE_VAPID =
  "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

// Every public method on the facade returns something useful: `null`
// for "unsupported / no-op", `false` for "nothing to unsubscribe", a
// PushSubscription on success. Consumers reading these can distinguish
// the three outcomes without inspecting store state.

describe("PWAManager — public API return contract", () => {
  it("subscribe() returns null when service worker is unsupported", async () => {
    installMockNotification("granted");
    // Deliberately no installMockServiceWorker — navigator.serviceWorker
    // is absent, mirroring an old browser or non-secure context.

    const manager = new PWAManager({
      serviceWorkerUrl: "/sw.js",
      vapidPublicKey: FAKE_VAPID,
    });

    const result = await manager.subscribe();
    expect(result).toBeNull();
  });

  it("subscribe() returns the PushSubscription on success", async () => {
    installMockNotification("granted");
    const { pushManager } = installMockServiceWorker();
    const fakeSubscription = makeMockSubscription();
    pushManager.subscribe.mockResolvedValueOnce(fakeSubscription);

    const manager = new PWAManager({
      serviceWorkerUrl: "/sw.js",
      vapidPublicKey: FAKE_VAPID,
    });

    const result = await manager.subscribe();
    expect(result).toBe(fakeSubscription);
  });

  it("unsubscribe() returns true when something was unsubscribed, false otherwise", async () => {
    const { pushManager } = installMockServiceWorker();
    const stored = makeMockSubscription();

    const manager = new PWAManager({
      serviceWorkerUrl: "/sw.js",
      vapidPublicKey: FAKE_VAPID,
    });
    manager.store.setState((s) => ({
      ...s,
      subscription: stored as unknown as PushSubscription,
      isSubscribed: true,
    }));

    expect(await manager.unsubscribe()).toBe(true);

    // Second call: nothing left to unsubscribe. The boolean is the only
    // thing distinguishing this from the first call.
    pushManager.getSubscription.mockResolvedValue(null);
    expect(await manager.unsubscribe()).toBe(false);
  });

  it("requestNotificationPermission() returns null in unsupported environments, the permission otherwise", async () => {
    // Unsupported: Notification global absent entirely.
    installMockNotification(undefined);

    const manager = new PWAManager({
      serviceWorkerUrl: "/sw.js",
      vapidPublicKey: FAKE_VAPID,
    });

    expect(await manager.requestNotificationPermission()).toBeNull();

    // Supported + already granted: short-circuit returns the current value.
    installMockNotification("granted");
    expect(await manager.requestNotificationPermission()).toBe("granted");
  });
});
