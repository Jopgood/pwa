import { describe, expect, it } from "vitest";
import { PermissionManager } from "../permission";
import { SubscriptionManager } from "../subscription";
import { createPWAStore } from "../store";
import { installMockNotification, installMockServiceWorker } from "./setup";

const FAKE_VAPID =
  "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

// Two small smoke tests for PermissionManager. Their purpose isn't to
// catch a known bug — it's to prove the test harness (vitest config,
// happy-dom env, the Notification mock helpers in ./setup.ts) is wired
// correctly end-to-end. Future bug-fix PRs will layer real regression
// tests on top of this scaffolding.
//
// They double as the only durable coverage PermissionManager warrants
// today: the class has two methods and both are mostly thin wrappers
// over native APIs. Anything more would be testing the mocks.

describe("PermissionManager (test infrastructure smoke check)", () => {
  it("sync() reflects Notification.permission into the store", () => {
    installMockNotification("granted");

    const store = createPWAStore();
    const manager = new PermissionManager(store);

    expect(store.state.permission).toBe("default");
    manager.sync();
    expect(store.state.permission).toBe("granted");
  });

  it("request() short-circuits if permission already resolved", async () => {
    const mocks = installMockNotification("denied");

    const store = createPWAStore();
    const manager = new PermissionManager(store);

    const result = await manager.request();

    expect(result).toBe("denied");
    // Critically — the native prompt was not re-fired. Re-prompting an
    // already-denied user is the kind of bad UX that puts notification
    // permissions in browser quarantine.
    expect(mocks?.requestPermission).not.toHaveBeenCalled();
  });
});

// Cross-cutting contract: any operation that successfully mutates
// user-facing state clears store.error. Otherwise an error banner
// sticks after the user fixed the root cause. The recovery flow —
// subscribe fails because permission denied → user grants permission →
// app retries — is the headline test; sync paths are smaller pins of
// the same contract.

describe("successful operations clear stale store.error", () => {
  it("PermissionManager.request() clears prior error on a successful grant", async () => {
    // The classic recovery flow: a prior subscribe() failed (because
    // permission was 'default' or 'denied') and left store.error set.
    // The user clicks "Enable notifications" → request() resolves
    // 'granted'. The error banner must vanish.
    // Permission is 'default' now (so request() takes the async path);
    // mock's requestPermission resolves 'granted' (the recovery flow).
    installMockNotification("default", "granted");

    const store = createPWAStore();
    store.setState((s) => ({
      ...s,
      error: new Error("previous subscribe failed: permission not granted"),
    }));

    const manager = new PermissionManager(store);

    const result = await manager.request();

    expect(result).toBe("granted");
    expect(store.state.permission).toBe("granted");
    expect(store.state.error).toBeNull();
  });

  it("PermissionManager.sync() clears stale error", async () => {
    // sync() runs on mount(). If a previous lifecycle left an error in
    // the store (theoretical if the store outlives a mount/unmount
    // cycle), re-mounting should give a clean slate as the manager
    // reconciles fresh browser state.
    installMockNotification("granted");

    const store = createPWAStore();
    store.setState((s) => ({ ...s, error: new Error("stale") }));

    new PermissionManager(store).sync();

    expect(store.state.error).toBeNull();
  });

  it("SubscriptionManager.sync() clears stale error on successful reconciliation", async () => {
    // sync() reads the current subscription from the browser and writes
    // it into the store. A successful read is a recovery signal — the
    // SW is up, the push manager responds. Stale error should clear.
    installMockServiceWorker();

    const store = createPWAStore();
    store.setState((s) => ({ ...s, error: new Error("stale") }));

    await new SubscriptionManager(store, FAKE_VAPID).sync();

    expect(store.state.error).toBeNull();
  });
});
