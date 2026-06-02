import { describe, expect, it } from "vitest";
import { SWRegistrar } from "../registry";
import { createPWAStore } from "../store";
import { installMockServiceWorker, makeMockSWWorker } from "./setup";

// SWRegistrar attaches listeners to both the registration and the
// container, including a nested statechange listener inside updatefound.
// All cleanup goes through a single AbortController so destroy() can
// detach everything atomically; register() is idempotent so React
// StrictMode's mount/unmount/mount sequence doesn't stack listeners.

describe("SWRegistrar — listener cleanup & idempotency", () => {
  it("destroy() aborts every listener attached during register()", async () => {
    const { container, registration } = installMockServiceWorker();

    const store = createPWAStore();
    const registrar = new SWRegistrar(store);
    await registrar.register("/sw.js");

    // Every addEventListener call should have been given a signal.
    // This is what makes destroy() truly clean up — not just the one
    // controllerchange listener the original code removed by hand.
    const allCalls = [
      ...container.addEventListener.mock.calls,
      ...registration.addEventListener.mock.calls,
    ];
    expect(allCalls.length).toBeGreaterThan(0);
    const signals = allCalls
      .map((c) => (c[2] as AddEventListenerOptions | undefined)?.signal)
      .filter((s): s is AbortSignal => Boolean(s));
    expect(signals.length).toBe(allCalls.length);

    // Before destroy, no signal aborted.
    for (const s of signals) expect(s.aborted).toBe(false);

    registrar.destroy();

    // After destroy, every captured signal is aborted — every listener
    // is effectively detached, including any future `statechange`
    // listener inside an `updatefound` handler.
    for (const s of signals) expect(s.aborted).toBe(true);
  });

  it("double register() is a no-op — no listener stacking under StrictMode-like remounts", async () => {
    const { container } = installMockServiceWorker();

    const store = createPWAStore();
    const registrar = new SWRegistrar(store);

    await registrar.register("/sw.js");
    await registrar.register("/sw.js");

    // Underlying browser API called exactly once. Without idempotency,
    // a re-render would register the SW twice and attach a second set
    // of listeners — exactly the leak StrictMode would surface.
    expect(container.register).toHaveBeenCalledTimes(1);
  });

  it("destroy() is safe when service worker is unsupported — no throw", () => {
    // Don't install the mock — navigator.serviceWorker is absent,
    // simulating an old browser or insecure context. register() should
    // short-circuit and destroy() should be a no-op rather than
    // calling removeEventListener on `undefined`.
    const store = createPWAStore();
    const registrar = new SWRegistrar(store);

    // register() short-circuits (no SW) — no await needed; sync no-op.
    void registrar.register("/sw.js");

    expect(() => registrar.destroy()).not.toThrow();
  });
});

// During an SW update there's a window where a new worker is installed
// but an old one still controls the page. swState must reflect that
// ("waiting", not "active") so consumers driving UI from store state see
// a coherent picture, and must flip to "active" once the new worker
// takes over via controllerchange.

describe("SWRegistrar — swState coherence during updates", () => {
  it("a new worker reaching 'installed' with a controller present sets swState: 'waiting' AND swUpdateAvailable: true", async () => {
    const { container, registration } = installMockServiceWorker();
    // Simulate a page that already has an active SW controlling it.
    container.controller = { state: "activated" } as unknown as ServiceWorker;

    const store = createPWAStore();
    const registrar = new SWRegistrar(store);
    await registrar.register("/sw.js");

    // The browser fires `updatefound` when a new SW starts installing.
    // Wire one up and fire it.
    const installingWorker = makeMockSWWorker("installing");
    registration.installing = installingWorker as unknown as ServiceWorker;
    registration._fire("updatefound");

    // The registrar's updatefound handler should have attached a
    // statechange listener. Transition the worker to "installed" and
    // fire statechange.
    installingWorker._setState("installed");
    installingWorker._fire("statechange");

    expect(store.state.swState).toBe("waiting");
    expect(store.state.swUpdateAvailable).toBe(true);
  });

  it("subsequent controllerchange flips swState to 'active' and clears swUpdateAvailable", async () => {
    const { container, registration } = installMockServiceWorker();
    container.controller = { state: "activated" } as unknown as ServiceWorker;

    const store = createPWAStore();
    const registrar = new SWRegistrar(store);
    await registrar.register("/sw.js");

    // Reproduce the update flow up to the waiting state...
    const installingWorker = makeMockSWWorker("installing");
    registration.installing = installingWorker as unknown as ServiceWorker;
    registration._fire("updatefound");
    installingWorker._setState("installed");
    installingWorker._fire("statechange");

    expect(store.state.swState).toBe("waiting");
    expect(store.state.swUpdateAvailable).toBe(true);

    // ...then simulate the new worker taking over.
    container._fire("controllerchange");

    expect(store.state.swState).toBe("active");
    expect(store.state.swUpdateAvailable).toBe(false);
  });
});
