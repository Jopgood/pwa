import type { createPWAStore } from "./store";

export class SubscriptionManager {
  constructor(
    private store: ReturnType<typeof createPWAStore>,
    private vapidPublicKey: string,
    private onSubscriptionChange?: (
      subscription: PushSubscription | null,
    ) => void,
    private onError?: (error: Error) => void,
  ) {}

  async sync() {
    if (!("serviceWorker" in navigator)) return;
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.getSubscription();

    this.onSubscriptionChange?.(subscription);
    this.store.setState((prev) => ({
      ...prev,
      subscription,
      isSubscribed: !!subscription,
    }));
  }

  async subscribe() {
    if (!("serviceWorker" in navigator)) return;
    const registration = await navigator.serviceWorker.ready;

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      });

      this.onSubscriptionChange?.(subscription);
      this.store.setState((prev) => ({
        ...prev,
        subscription,
        isSubscribed: true,
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.store.setState((prev) => ({
        ...prev,
        error: err,
      }));
      this.onError?.(err);
    }
  }

  async unsubscribe() {
    if (!("serviceWorker" in navigator)) return;
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      this.onSubscriptionChange?.(null);
      this.store.setState((prev) => ({
        ...prev,
        subscription: null,
        isSubscribed: false,
      }));
    }
  }

  private urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const base64Std = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64Std);
    const output = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      output[i] = rawData.charCodeAt(i);
    }
    return output;
  }
}
