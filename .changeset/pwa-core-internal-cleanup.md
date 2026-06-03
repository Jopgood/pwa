---
"@jopgood/pwa-core": patch
---

Internal type cleanups. No public API or runtime behavior change.

- `urlBase64ToUint8Array` helper now returns plain `Uint8Array`; the `BufferSource` narrowing happens at the `pushManager.subscribe` call site. Source no longer requires TypeScript 5.7+ generic syntax to read — useful for consumers browsing the source on npm.
- `PWAState.permission` is now typed as the DOM-provided `NotificationPermission` alias instead of the open-coded union, so the type stays in sync with the spec.
