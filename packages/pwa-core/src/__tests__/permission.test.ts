import { describe, expect, it } from "vitest";
import { PermissionManager } from "../permission";
import { createPWAStore } from "../store";
import { installMockNotification } from "./setup";

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
