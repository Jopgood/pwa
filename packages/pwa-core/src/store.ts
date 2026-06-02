import { createStore } from "@tanstack/store";

export interface PWAState {
  permission: "default" | "granted" | "denied";
  /** False until `mount()` runs and confirms the browser exposes the
   *  Service Worker API. Stays false in unsupported envs. */
  isSupported: boolean;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  /** `"idle"` means no `register()` has resolved yet — distinct from
   *  `"error"`, which is set when registration itself failed. During
   *  an update, transitions are `"active"` → `"waiting"` →
   *  (after the new SW takes over) `"active"`. */
  swState: "idle" | "installing" | "waiting" | "active" | "error";
  /** Set to true when a new worker reaches `"installed"` while an
   *  existing controller is still serving the page. Cleared by
   *  `activateWaiting()` or when `controllerchange` fires. */
  swUpdateAvailable: boolean;
  /** True only while `register()` is in flight. */
  isLoading: boolean;
  error: null | Error;
}

export const createPWAStore = () =>
  createStore<PWAState>({
    permission: "default",
    isSupported: false,
    isSubscribed: false,
    subscription: null,
    swState: "idle",
    swUpdateAvailable: false,
    isLoading: false,
    error: null,
  });
