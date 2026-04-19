import type { createPWAStore } from "./store";

export class PermissionManager {
  constructor(private store: ReturnType<typeof createPWAStore>) {}

  sync() {
    if (!("Notification" in window)) return;

    const permission = Notification.permission;

    this.store.setState((state) => ({ ...state, permission }));
  }

  async request() {
    if (!("Notification" in window)) return;

    if (Notification.permission !== "default") return Notification.permission;

    const permission = await Notification.requestPermission();

    this.store.setState((state) => ({ ...state, permission }));

    return permission;
  }
}
