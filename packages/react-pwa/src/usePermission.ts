import type { PWAManager } from "@jopgood/pwa-core";
import { usePWAManager } from "./PushProvider";

import { useSelector } from "@tanstack/react-store";

export function usePermission(manager?: PWAManager) {
  const pwa = usePWAManager(manager);

  const permission = useSelector(pwa.store, (state) => state.permission);

  return {
    permission,
    requestPermission: () => pwa.requestNotificationPermission(),
  };
}
