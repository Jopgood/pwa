import { defineConfig } from "vitest/config";

// happy-dom over jsdom: ~2-3× faster on this workload, smaller install,
// and neither implements ServiceWorker/PushManager so the broader DOM
// surface of jsdom buys us nothing here — we mock the PWA APIs explicitly
// in src/__tests__/setup.ts.
export default defineConfig({
  test: {
    name: "@jopgood/pwa-core",
    environment: "happy-dom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.ts"],
  },
});
