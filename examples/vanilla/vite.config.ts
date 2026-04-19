import { defineConfig } from 'vite'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const pkg = JSON.parse(
  readFileSync(resolve(__dirname, '../../packages/pwa-core/package.json'), 'utf-8')
)

export default defineConfig({
  define: {
    __PKG_VERSION__: JSON.stringify(pkg.version),
  },
})
