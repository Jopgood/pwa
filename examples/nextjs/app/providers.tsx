"use client";
import { useMemo } from "react";
import { PushProvider, PWAManager } from "@jopgood/react-pwa";
import type * as React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const manager = useMemo(
    () =>
      new PWAManager({
        serviceWorkerUrl: "/sw.js",
        vapidPublicKey:
          "BEWHPLWMZWWVe8QwlTcOu5ECtUWIKx-SpKSgm3spDw9y22Cn8mFW0fuL4neOvkZE0T04W0e_K_khl3BFFPDFlc8",
        onSubscriptionChange: (sub) => {
          console.log("Subscription changed:", sub);
        },
        onError: (error) => {
          console.error("PWA error:", error);
        },
      }),
    [],
  );

  return <PushProvider manager={manager}>{children}</PushProvider>;
}
