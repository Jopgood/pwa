import { PWAManager } from "@jopgood/pwa-core";
import * as React from "react";

export const PushContext = React.createContext<PWAManager | undefined>(
  undefined,
);

export type PushProviderProps = {
  manager: PWAManager;
  children?: React.ReactNode;
};

export const usePWAManager = (manager?: PWAManager) => {
  const context = React.useContext(PushContext);

  if (manager) {
    return manager;
  }

  if (!context) {
    throw new Error("No PWAManager set, use PushProvider to set one");
  }
  return context;
};

export const PushProvider = ({ manager, children }: PushProviderProps) => {
  React.useEffect(() => {
    manager.mount();
    return () => {
      manager.unmount();
    };
  }, [manager]);
  return (
    <PushContext.Provider value={manager}>{children}</PushContext.Provider>
  );
};
