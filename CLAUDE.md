# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is pnpm (>=10.18), Node >=20. All commands run from the repo root.

- `pnpm build` — build all packages via `tsdown` (workspace mode, dual ESM/CJS + d.ts)
- `pnpm build:core` / `pnpm build:react` — build a single package by filter
- `pnpm dev` — `tsdown --watch` across packages; examples consume via `workspace:*` so they pick up rebuilds
- `pnpm test:types` — runs `tsc --noEmit` in each package (the only "test" suite — there is no unit-test runner)
- `pnpm format` — Prettier across `**/*.{ts,tsx,md,json}`
- `pnpm clean` — remove every package `dist`
- `pnpm --filter vanilla dev` / `pnpm --filter nextjs dev` — run an example (build the packages first)

Releases use Changesets, not manual version bumps:

- `pnpm changeset` to declare a bump in a PR (commit the generated `.changeset/*.md`)
- Merging the auto-opened "Version Packages" PR triggers `pnpm changeset:publish` → npm
- Never hand-edit `version` in `packages/*/package.json`; examples are in the changeset `ignore` list

## Architecture

Monorepo with two published packages plus consumers:

- `packages/pwa-core` — framework-agnostic. Public surface is `PWAManager` (`src/manager.ts`), which is a thin facade composing four pieces over a shared `@tanstack/store`:
  - `SWRegistrar` (`registry.ts`) — service worker lifecycle (register, waiting/active tracking, `activateWaiting`)
  - `PermissionManager` (`permission.ts`) — Notification permission state + request
  - `SubscriptionManager` (`subscription.ts`) — PushSubscription create/destroy, fires `onSubscriptionChange`
  - `createPWAStore` (`store.ts`) — the single reactive store all three submanagers write to
  - All browser work is deferred to `manager.mount()` so the package is SSR-safe (Next.js).
- `packages/react-pwa` — React adapter. `PushProvider` puts a `PWAManager` in context; hooks (`usePushNotifications`, `usePermission`, `useSWUpdate`) subscribe to its store via `@tanstack/react-store`. Depends on `@jopgood/pwa-core` as `workspace:*`.

Key constraint: the core never imports React. The store is the integration seam — adapters subscribe to it; they do not own state.

## Build system

- `tsdown.config.ts` at the root drives builds for both packages via `workspace: "packages/*"`. Outputs ESM + CJS with `fixedExtension: false` and `unbundle: true` (one output file per source file). `react`, `react-dom`, and any `@jop/*` are marked `neverBundle`. `publint` runs in CI.
- `pnpm-workspace.yaml` uses **catalogs** (`dev`, `peer`, `prod`) — when adding a dep that already lives in a catalog (TypeScript, React, `@tanstack/store`, etc.), reference it as `"catalog:dev"` / `"catalog:peer"` / `"catalog:prod"` instead of pinning a version in the package.
- Turborepo (`turbo.json`) is configured but the root scripts mostly call `tsdown` / `pnpm -r` directly; `^build` dependency is wired for when tasks are run through `turbo`.

## Examples and apps

- `examples/vanilla` (Vite + TS) and `examples/nextjs` (App Router) are reference consumers. They are in the Changesets `ignore` list and never publish.
- `apps/web` exists but is untracked scaffolding — not part of the published surface.
