<div align="center">
  <img src="https://raw.githubusercontent.com/jopgood/pwa/main/media/header.png" alt="Jop PWA" />
</div>

<br />

<div align="center">
  <a href="https://npmjs.com/package/@jopgood/react-pwa">
    <img alt="npm downloads" src="https://img.shields.io/npm/dm/@jopgood/react-pwa.svg" />
  </a>
  <a href="https://bundlephobia.com/result?p=@jopgood/react-pwa">
    <img alt="bundle size" src="https://badgen.net/bundlephobia/minzip/@jopgood/react-pwa" />
  </a>
</div>

<br />

# @jopgood/react-pwa

React adapter for [`@jopgood/pwa-core`](https://github.com/jopgood/pwa/tree/main/packages/pwa-core). Hooks and a provider for push subscriptions, service worker lifecycle, and permissions.

```tsx
import { PWAManager } from '@jopgood/pwa-core'
import { PushProvider, usePushNotifications } from '@jopgood/react-pwa'

const manager = new PWAManager({
  serviceWorkerUrl: '/sw.js',
  vapidPublicKey: 'YOUR_VAPID_PUBLIC_KEY',
})

function App() {
  return (
    <PushProvider manager={manager}>
      <PushDemo />
    </PushProvider>
  )
}

function PushDemo() {
  const { permission, isSubscribed, subscribe, requestPermission } = usePushNotifications()

  return (
    <div>
      <p>Permission: {permission}</p>
      <button onClick={requestPermission}>Request permission</button>
      <button onClick={subscribe} disabled={permission !== 'granted' || isSubscribed}>
        Subscribe
      </button>
    </div>
  )
}
```

### [Read the docs →](https://github.com/jopgood/pwa)
