import type { createPWAStore } from "./store";

export class SWRegistrar {
  constructor(
    private store: ReturnType<typeof createPWAStore>,
    private onError?: (error: Error) => void,
  ) {}

  private registration: ServiceWorkerRegistration | undefined;

  private handleControllerChange = () => {
    this.store.setState((s) => ({ ...s, swUpdateAvailable: false }));
  };

  async register(url: string, options?: RegistrationOptions) {
    if ("serviceWorker" in navigator) {
      this.store.setState((state) => ({
        ...state,
        isSupported: true,
        isLoading: true,
      }));
      try {
        this.registration = await navigator.serviceWorker.register(
          url,
          options,
        );
        this.registration.addEventListener("updatefound", () => {
          const installingWorker = this.registration!.installing;
          if (installingWorker) {
            installingWorker.addEventListener("statechange", () => {
              if (installingWorker.state === "activated") {
                this.store.setState((state) => ({
                  ...state,
                  swState: "active",
                }));
              }
              if (
                installingWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                this.store.setState((state) => ({
                  ...state,
                  swUpdateAvailable: true,
                }));
              }
            });
          }
        });

        if (this.registration.installing) {
          this.store.setState((state) => ({ ...state, swState: "installing" }));
        } else if (
          this.registration.waiting &&
          navigator.serviceWorker.controller
        ) {
          this.store.setState((state) => ({
            ...state,
            swState: "waiting",
            swUpdateAvailable: true,
          }));
        } else if (this.registration.active) {
          this.store.setState((state) => ({ ...state, swState: "active" }));
        }

        navigator.serviceWorker.addEventListener(
          "controllerchange",
          this.handleControllerChange,
        );
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.store.setState((state) => ({
          ...state,
          swState: "error",
          error: err,
        }));
        this.onError?.(err);
      } finally {
        this.store.setState((state) => ({ ...state, isLoading: false }));
      }
    } else {
      this.store.setState((state) => ({ ...state, isSupported: false }));
    }
  }

  activateWaiting() {
    if (!this.registration?.waiting) return;
    this.store.setState((state) => ({ ...state, swUpdateAvailable: false }));
    this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }

  destroy() {
    navigator.serviceWorker.removeEventListener(
      "controllerchange",
      this.handleControllerChange,
    );
  }
}
