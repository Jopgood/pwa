<div align="center">
  <img src="https://raw.githubusercontent.com/jopgood/pwa/main/media/header.png" alt="Jop PWA" />
</div>

<br />

<div align="center">
  <a href="https://npmjs.com/package/@jopgood/pwa-core">
    <img alt="npm downloads" src="https://img.shields.io/npm/dm/@jopgood/pwa-core.svg" />
  </a>
  <a href="https://bundlephobia.com/result?p=@jopgood/pwa-core">
    <img alt="bundle size" src="https://badgen.net/bundlephobia/minzip/@jopgood/pwa-core" />
  </a>
</div>

<br />

# @jopgood/pwa-core

Headless, type-safe PWA primitives. Manage push notification subscriptions, service worker lifecycle, and permissions through a framework-agnostic API.

```ts
import { PWAManager } from '@jopgood/pwa-core'

const manager = new PWAManager({
  serviceWorkerUrl: '/sw.js',
  vapidPublicKey: 'YOUR_VAPID_PUBLIC_KEY',
  onSubscriptionChange: (subscription) => {
    // send subscription to your backend
  },
})

manager.mount()
manager.requestNotificationPermission()
manager.subscribe()
```

Pair with [`@jopgood/react-pwa`](https://github.com/jopgood/pwa/tree/main/packages/react-pwa) for React hooks.

### [Read the docs →](https://github.com/jopgood/pwa)
