import type { PWAManager } from "@jop/pwa-core";
import { usePWAManager } from "./PushProvider";

import { useSelector } from "@tanstack/react-store";

export function useSWUpdate(manager?: PWAManager) {
  const pwa = usePWAManager(manager);

  const swUpdateAvailable = useSelector(
    pwa.store,
    (state) => state.swUpdateAvailable,
  );

  return {
    swUpdateAvailable,
    activateWaiting: () => pwa.activateWaiting(),
  };
}
