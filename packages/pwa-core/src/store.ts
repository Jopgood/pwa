import { createStore } from "@tanstack/store";

export interface PWAState {
  permission: "default" | "granted" | "denied";
  isSupported: boolean;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  swState: "idle" | "installing" | "waiting" | "active" | "error";
  swUpdateAvailable: boolean;
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
