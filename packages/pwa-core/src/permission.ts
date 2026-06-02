import type { createPWAStore } from "./store";

export class PermissionManager {
  constructor(private store: ReturnType<typeof createPWAStore>) {}

  sync(): void {
    if (!("Notification" in window)) return;

    const permission = Notification.permission;

    this.store.setState((state) => ({ ...state, permission, error: null }));
  }

  // Returns null when the browser has no Notification API (insecure
  // context, very old browsers, server-side). Returns the current
  // NotificationPermission otherwise — including after a fresh prompt.
  async request(): Promise<NotificationPermission | null> {
    if (!("Notification" in window)) return null;

    if (Notification.permission !== "default") return Notification.permission;

    const permission = await Notification.requestPermission();

    this.store.setState((state) => ({ ...state, permission, error: null }));

    return permission;
  }
}
