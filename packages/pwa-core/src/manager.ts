import { SWRegistrar } from "./registry";
import { createPWAStore } from "./store";
import { PermissionManager } from "./permission";
import { SubscriptionManager } from "./subscription";

export interface PWAManagerOptions {
  serviceWorkerUrl: string;
  vapidPublicKey: string;
  onSubscriptionChange?: (subscription: PushSubscription | null) => void;
  onError?: (error: Error) => void;
}

export class PWAManager {
  store = createPWAStore();
  private registrar: SWRegistrar;
  private permissionManager: PermissionManager;
  private subscriptionManager: SubscriptionManager;
  private serviceWorkerUrl: string;

  constructor({
    serviceWorkerUrl,
    vapidPublicKey,
    onSubscriptionChange,
    onError,
  }: PWAManagerOptions) {
    this.registrar = new SWRegistrar(this.store, onError);
    this.serviceWorkerUrl = serviceWorkerUrl;
    this.permissionManager = new PermissionManager(this.store);
    this.subscriptionManager = new SubscriptionManager(
      this.store,
      vapidPublicKey,
      onSubscriptionChange,
      onError,
    );
  }

  mount() {
    this.registrar.register(this.serviceWorkerUrl);
    this.permissionManager.sync();
    this.subscriptionManager.sync();
  }

  unmount() {
    this.registrar.destroy();
  }

  async requestNotificationPermission() {
    return this.permissionManager.request();
  }

  async subscribe() {
    return this.subscriptionManager.subscribe();
  }

  async unsubscribe() {
    return this.subscriptionManager.unsubscribe();
  }

  activateWaiting() {
    this.registrar.activateWaiting();
  }
}
