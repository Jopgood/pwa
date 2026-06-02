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

  /**
   * Boot the manager. All browser API work — SW registration, reading
   * Notification.permission, reading the current push subscription —
   * is deferred to this call so the package is safe to import in SSR
   * contexts (Next.js App Router, etc.). Call from a `useEffect`,
   * `onMount`, or wherever your framework signals "client only."
   */
  mount(): void {
    this.registrar.register(this.serviceWorkerUrl);
    this.permissionManager.sync();
    this.subscriptionManager.sync();
  }

  /**
   * Tear down listeners attached during mount(). Safe to call from a
   * `useEffect` cleanup. Does not unregister the service worker or
   * unsubscribe from push — that's the user's decision, not a lifecycle
   * event. Calling mount() again after unmount() is supported.
   */
  unmount(): void {
    this.registrar.destroy();
  }

  /**
   * Request notification permission from the user. Returns the resolved
   * permission, or `null` when the browser has no Notification API at all
   * (insecure context, very old browsers, server-side). `null` is the
   * canonical "no-op / unsupported" signal across the manager's API.
   */
  async requestNotificationPermission(): Promise<NotificationPermission | null> {
    return this.permissionManager.request();
  }

  /**
   * Subscribe to push notifications. Resolves to the created
   * PushSubscription on success, or `null` if the manager refused
   * (permission not granted, service worker unsupported, or the
   * underlying pushManager.subscribe threw — see store.error / onError
   * for the cause).
   */
  async subscribe(): Promise<PushSubscription | null> {
    return this.subscriptionManager.subscribe();
  }

  /**
   * Unsubscribe from push notifications. Resolves to `true` if something
   * was unsubscribed (whether the browser-side call cleanly succeeded or
   * not — store state is cleared either way), `false` if there was
   * nothing to unsubscribe or the environment is unsupported. Low-level
   * errors during the browser-side unsubscribe are surfaced via the
   * onError callback you passed to PWAManager.
   */
  async unsubscribe(): Promise<boolean> {
    return this.subscriptionManager.unsubscribe();
  }

  /**
   * Tell a waiting service worker to take over the page immediately
   * (posts `SKIP_WAITING`). No-op when there's no worker waiting. The
   * actual `swState: "active"` transition happens once the browser
   * fires `controllerchange` — `swUpdateAvailable` is cleared
   * optimistically here so consumers can dismiss their update banner
   * right away.
   */
  activateWaiting(): void {
    this.registrar.activateWaiting();
  }
}
