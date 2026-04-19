import type { PWAManager } from "@jop/pwa-core";
import { usePWAManager } from "./PushProvider";

import { useSelector } from "@tanstack/react-store";

export function usePushNotifications(manager?: PWAManager) {
  const pwa = usePWAManager(manager);

  const permission = useSelector(pwa.store, (state) => state.permission);
  const isSupported = useSelector(pwa.store, (state) => state.isSupported);
  const isSubscribed = useSelector(pwa.store, (state) => state.isSubscribed);
  const subscription = useSelector(pwa.store, (state) => state.subscription);
  const swState = useSelector(pwa.store, (state) => state.swState);
  const swUpdateAvailable = useSelector(
    pwa.store,
    (state) => state.swUpdateAvailable,
  );
  const isLoading = useSelector(pwa.store, (state) => state.isLoading);
  const error = useSelector(pwa.store, (state) => state.error);

  return {
    // state
    permission,
    isSupported,
    isSubscribed,
    subscription,
    swState,
    swUpdateAvailable,
    isLoading,
    error,
    // actions
    subscribe: () => pwa.subscribe(),
    unsubscribe: () => pwa.unsubscribe(),
    requestPermission: () => pwa.requestNotificationPermission(),
    activateWaiting: () => pwa.activateWaiting(),
  };
}
