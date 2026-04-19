import { defineConfig } from 'tsdown'

export default defineConfig({
  workspace: 'packages/*',
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  unbundle: true,
  fixedExtension: false,
  deps: {
    neverBundle: ['react', 'react-dom', /^react\//, /^@jop\//],
  },
  publint: 'ci-only',
})
