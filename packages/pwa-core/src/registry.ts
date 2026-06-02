import type { createPWAStore } from "./store";

export class SWRegistrar {
  constructor(
    private store: ReturnType<typeof createPWAStore>,
    private onError?: (error: Error) => void,
  ) {}

  private registration: ServiceWorkerRegistration | undefined;
  // Single AbortController per registration lifecycle. Every listener
  // is attached with `{ signal: controller.signal }` so destroy() can
  // detach all of them by calling controller.abort() — including the
  // statechange listener attached deep inside the updatefound handler,
  // which is otherwise impossible to remove without tracking bound
  // function references.
  private controller: AbortController | undefined;

  private handleControllerChange = () => {
    // The new SW has taken over the page. swState reflects that, and
    // the update flag is no longer accurate.
    this.store.setState((s) => ({
      ...s,
      swUpdateAvailable: false,
      swState: "active",
    }));
  };

  async register(url: string, options?: RegistrationOptions) {
    // Two guards, two distinct races — collapsing them reintroduces a leak.
    //   - this.registration: we've already finished registering once.
    //   - this.controller (not aborted): a register() call is still in
    //     flight (StrictMode mount fires before the first await resolves).
    if (this.registration) return;
    if (this.controller && !this.controller.signal.aborted) return;

    if (!("serviceWorker" in navigator)) {
      this.store.setState((state) => ({ ...state, isSupported: false }));
      return;
    }

    const controller = new AbortController();
    this.controller = controller;

    this.store.setState((state) => ({
      ...state,
      isSupported: true,
      isLoading: true,
    }));

    try {
      const registration = await navigator.serviceWorker.register(
        url,
        options,
      );
      // If destroy() ran while register() was in flight (StrictMode
      // cleanup), bail without attaching anything — the signal is
      // already aborted, so further addEventListener calls would be
      // ignored anyway, but skipping is cleaner.
      if (controller.signal.aborted) return;

      this.registration = registration;

      registration.addEventListener(
        "updatefound",
        () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;
          installingWorker.addEventListener(
            "statechange",
            () => {
              if (installingWorker.state === "activated") {
                this.store.setState((state) => ({
                  ...state,
                  swState: "active",
                  error: null,
                }));
              }
              if (
                installingWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // An old worker still controls the page; the new one is
                // installed and queued. "waiting" is the truthful state
                // for the update window, not "active".
                this.store.setState((state) => ({
                  ...state,
                  swState: "waiting",
                  swUpdateAvailable: true,
                }));
              }
            },
            { signal: controller.signal },
          );
        },
        { signal: controller.signal },
      );

      if (registration.installing) {
        this.store.setState((state) => ({
          ...state,
          swState: "installing",
          error: null,
        }));
      } else if (
        registration.waiting &&
        navigator.serviceWorker.controller
      ) {
        this.store.setState((state) => ({
          ...state,
          swState: "waiting",
          swUpdateAvailable: true,
          error: null,
        }));
      } else if (registration.active) {
        this.store.setState((state) => ({
          ...state,
          swState: "active",
          error: null,
        }));
      }

      navigator.serviceWorker.addEventListener(
        "controllerchange",
        this.handleControllerChange,
        { signal: controller.signal },
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      const err = error instanceof Error ? error : new Error(String(error));
      this.store.setState((state) => ({
        ...state,
        swState: "error",
        error: err,
      }));
      this.onError?.(err);
    } finally {
      if (!controller.signal.aborted) {
        this.store.setState((state) => ({ ...state, isLoading: false }));
      }
    }
  }

  activateWaiting() {
    if (!this.registration?.waiting) return;
    this.store.setState((state) => ({ ...state, swUpdateAvailable: false }));
    this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }

  destroy() {
    // Safe in unsupported envs: when register() short-circuited because
    // navigator.serviceWorker was absent, this.controller is undefined
    // and the optional chain no-ops. Aborting detaches every listener
    // attached with `{ signal }` above without per-listener bookkeeping.
    this.controller?.abort();
    this.controller = undefined;
    this.registration = undefined;
  }
}
