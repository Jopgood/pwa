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

export interface MockServiceWorker {
  state: ServiceWorkerState;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  postMessage: ReturnType<typeof vi.fn>;
  /** Helpers for tests — not part of the real SW interface. */
  _setState: (state: ServiceWorkerState) => void;
  _fire: (type: string) => void;
}

export interface MockServiceWorkerRegistration {
  installing: ServiceWorker | null;
  waiting: ServiceWorker | null;
  active: ServiceWorker | null;
  pushManager: MockPushManager;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  /** Helper: fire an event with this registration's captured handlers. */
  _fire: (type: string) => void;
}

export interface MockServiceWorkerContainer {
  ready: Promise<MockServiceWorkerRegistration>;
  controller: ServiceWorker | null;
  register: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  /** Helper: fire an event with the container's captured handlers. */
  _fire: (type: string) => void;
}

/**
 * Build a mock that captures `addEventListener` calls so a test can
 * later replay them. Honors `{ signal }` — if the signal is aborted at
 * fire-time, the listener is skipped, matching browser semantics. This
 * is what makes the AbortController-based cleanup pattern testable.
 */
function makeListenerCapture(): {
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  fire: (type: string) => void;
} {
  const captured = new Map<
    string,
    { listener: EventListener; signal?: AbortSignal }[]
  >();
  return {
    addEventListener: vi.fn(
      (
        type: string,
        listener: EventListener,
        options?: AddEventListenerOptions,
      ) => {
        const arr = captured.get(type) ?? [];
        arr.push({ listener, signal: options?.signal });
        captured.set(type, arr);
      },
    ),
    removeEventListener: vi.fn((type: string, listener: EventListener) => {
      const arr = captured.get(type) ?? [];
      captured.set(
        type,
        arr.filter((entry) => entry.listener !== listener),
      );
    }),
    fire: (type: string) => {
      const arr = captured.get(type) ?? [];
      for (const { listener, signal } of arr) {
        // Match real browser behavior: a listener attached with an
        // aborted signal is silently skipped.
        if (signal?.aborted) continue;
        listener(new Event(type));
      }
    },
  };
}

/**
 * Build a fake ServiceWorker object with controllable state and event
 * dispatching. The `_setState` / `_fire` helpers let tests drive the
 * worker through `installing` → `installed` → `activated` and trigger
 * the statechange callbacks the registrar attaches.
 */
export function makeMockSWWorker(
  initialState: ServiceWorkerState = "installing",
): MockServiceWorker {
  const cap = makeListenerCapture();
  const worker = {
    state: initialState,
    addEventListener: cap.addEventListener,
    removeEventListener: cap.removeEventListener,
    postMessage: vi.fn(),
    _setState(s: ServiceWorkerState) {
      worker.state = s;
    },
    _fire: cap.fire,
  };
  return worker;
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

  const regCap = makeListenerCapture();
  const registration: MockServiceWorkerRegistration = {
    installing: null,
    waiting: null,
    active: null,
    pushManager,
    addEventListener: regCap.addEventListener,
    removeEventListener: regCap.removeEventListener,
    _fire: regCap.fire,
  };

  const conCap = makeListenerCapture();
  const container: MockServiceWorkerContainer = {
    ready: Promise.resolve(registration),
    controller: null,
    register: vi.fn().mockResolvedValue(registration),
    addEventListener: conCap.addEventListener,
    removeEventListener: conCap.removeEventListener,
    _fire: conCap.fire,
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
 *
 * Pass `requestResult` to control what `Notification.requestPermission()`
 * resolves to. Defaults to the same value as `permission` (no-op flow).
 * The interesting case is permission='default' + requestResult='granted',
 * which exercises the recovery-after-prompt path.
 */
export function installMockNotification(
  permission: NotificationPermission | undefined,
  requestResult: NotificationPermission = permission ?? "default",
): { requestPermission: ReturnType<typeof vi.fn> } | null {
  if (permission === undefined) {
    // Reflect.deleteProperty is the only reliable way to remove a global
    // that happy-dom installs; `delete (globalThis as any).Notification`
    // silently fails under strict mode.
    Reflect.deleteProperty(globalThis, "Notification");
    return null;
  }

  const requestPermission = vi.fn().mockResolvedValue(requestResult);

  const NotificationMock = function Notification() {
    /* no-op constructor; we only care about the static surface */
  } as unknown as typeof globalThis.Notification;

  // writable: true so individual tests can still override per-case without
  // having to call installMockNotification again. configurable: true so
  // the afterEach Reflect.deleteProperty can wipe between tests.
  Object.defineProperty(NotificationMock, "permission", {
    configurable: true,
    writable: true,
    value: permission,
  });
  Object.defineProperty(NotificationMock, "requestPermission", {
    configurable: true,
    writable: true,
    value: requestPermission,
  });

  Object.defineProperty(globalThis, "Notification", {
    configurable: true,
    writable: true,
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
