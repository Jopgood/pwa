// Test setup for @jopgood/pwa-core.
//
// happy-dom gives us window/document/navigator/Notification scaffolding
// but NOT ServiceWorker or PushManager — neither does jsdom. Tests
// install lightweight mocks via the helpers below and reset them between
// runs so state never leaks.
//
// Design choices:
// - Helpers return the mock objects so individual tests can script
//   behavior per-case (e.g. make `pushManager.subscribe` throw) without
//   the setup file needing to know which scenario is being exercised.
// - Real `DOMException` is used for the NotAllowedError case — happy-dom
//   provides it, and constructing the actual exception type matters
//   because production code (and downstream consumers) may pattern-match
//   on `error.name`.
// - We patch globals via `Object.defineProperty` because `navigator` is
//   a getter on happy-dom's window; plain assignment is silently ignored.

import { afterEach, beforeEach, vi } from "vitest";

export interface MockPushSubscription {
  endpoint: string;
  unsubscribe: ReturnType<typeof vi.fn>;
  toJSON: () => unknown;
}

export interface MockPushManager {
  subscribe: ReturnType<typeof vi.fn>;
  getSubscription: ReturnType<typeof vi.fn>;
}

export interface MockServiceWorkerRegistration {
  installing: ServiceWorker | null;
  waiting: ServiceWorker | null;
  active: ServiceWorker | null;
  pushManager: MockPushManager;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
}

export interface MockServiceWorkerContainer {
  ready: Promise<MockServiceWorkerRegistration>;
  controller: ServiceWorker | null;
  register: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
}

/**
 * Build a fresh PushSubscription-shaped mock. `endpoint` defaults to a
 * stable string so equality checks are easy.
 */
export function makeMockSubscription(
  overrides: Partial<MockPushSubscription> = {},
): MockPushSubscription {
  return {
    endpoint: "https://push.example/test-endpoint",
    unsubscribe: vi.fn().mockResolvedValue(true),
    toJSON: () => ({ endpoint: "https://push.example/test-endpoint" }),
    ...overrides,
  };
}

/**
 * Install a mocked `navigator.serviceWorker` and return the mock so the
 * test can script `register` / `pushManager.subscribe` etc. Call inside
 * a test or beforeEach; the global afterEach in this file restores.
 */
export function installMockServiceWorker(): {
  container: MockServiceWorkerContainer;
  registration: MockServiceWorkerRegistration;
  pushManager: MockPushManager;
} {
  const pushManager: MockPushManager = {
    subscribe: vi.fn(),
    getSubscription: vi.fn().mockResolvedValue(null),
  };

  const registration: MockServiceWorkerRegistration = {
    installing: null,
    waiting: null,
    active: null,
    pushManager,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  const container: MockServiceWorkerContainer = {
    ready: Promise.resolve(registration),
    controller: null,
    register: vi.fn().mockResolvedValue(registration),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: container,
  });

  return { container, registration, pushManager };
}

/**
 * Set `Notification.permission` and stub `requestPermission`. Pass
 * `undefined` to remove `Notification` entirely (simulates an
 * unsupported environment).
 */
export function installMockNotification(
  permission: NotificationPermission | undefined,
): { requestPermission: ReturnType<typeof vi.fn> } | null {
  if (permission === undefined) {
    // Reflect.deleteProperty is the only reliable way to remove a global
    // that happy-dom installs; `delete (globalThis as any).Notification`
    // silently fails under strict mode.
    Reflect.deleteProperty(globalThis, "Notification");
    return null;
  }

  const requestPermission = vi.fn().mockResolvedValue(permission);

  const NotificationMock = function Notification() {
    /* no-op constructor; we only care about the static surface */
  } as unknown as typeof globalThis.Notification;

  Object.defineProperty(NotificationMock, "permission", {
    configurable: true,
    value: permission,
  });
  Object.defineProperty(NotificationMock, "requestPermission", {
    configurable: true,
    value: requestPermission,
  });

  Object.defineProperty(globalThis, "Notification", {
    configurable: true,
    value: NotificationMock,
  });

  return { requestPermission };
}

beforeEach(() => {
  // Default: notification supported, permission default. Individual
  // tests override with installMockNotification / installMockServiceWorker.
  installMockNotification("default");
});

afterEach(() => {
  // Wipe both globals so a test that runs second never inherits state
  // from a test that ran first.
  Reflect.deleteProperty(navigator as object, "serviceWorker");
  Reflect.deleteProperty(globalThis, "Notification");
  vi.restoreAllMocks();
});
