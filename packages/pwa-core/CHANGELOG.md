# @jopgood/pwa-core

## 0.0.3

### Patch Changes

- Fix push subscription lifecycle and service worker update flow. ([#11](https://github.com/Jopgood/pwa/pull/11))
  - `subscribe()` now refuses (with a descriptive error via `onError`) when notification permission is `denied` or `default`, instead of letting Chrome silently prompt while Firefox/Safari throw `NotAllowedError`. Call `requestNotificationPermission()` first.
  - `unsubscribe()` uses the stored subscription rather than re-fetching from `pushManager`, so it correctly clears store state when the browser-side subscription was invalidated out-of-band (different tab, server-pushed `410 Gone`, expired). Low-level browser errors during unsubscribe are surfaced via `onError` but no longer block the state clear.
  - `SWRegistrar` no longer leaks listeners under React StrictMode's mount/unmount/mount sequence — every listener is now attached with `AbortController`-scoped signals, and `register()` is idempotent. `destroy()` is also safe to call in unsupported environments.
  - `swState` now correctly reports `"waiting"` (not `"active"`) while an updated service worker is installed but the old one still controls the page, then flips to `"active"` when `controllerchange` fires.
  - Every successful state-changing operation now clears any prior `store.error`, so consumer error UI doesn't stick after recovery.
  - Public API methods have explicit return types: `subscribe(): Promise<PushSubscription | null>`, `unsubscribe(): Promise<boolean>`, `requestNotificationPermission(): Promise<NotificationPermission | null>`. `null` / `false` are the canonical no-op signals.

## 0.0.2

### Patch Changes

- Fix published package resolving workspace and catalog specifiers to concrete versions ([`6510856`](https://github.com/Jopgood/pwa/commit/6510856c406351aebca7481a73006f9196d60354))
