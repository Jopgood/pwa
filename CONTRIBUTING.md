# Contributing

Thanks for your interest in Jop PWA. Issues and PRs are welcome.

## Setup

Requires Node `>=20` and [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm build
```

## Repo layout

- `packages/pwa-core` — framework-agnostic core
- `packages/react-pwa` — React adapter
- `examples/vanilla` — Vite + TypeScript demo
- `examples/nextjs` — Next.js App Router demo

## Scripts

- `pnpm build` — build all packages
- `pnpm build:core` / `pnpm build:react` — build a single package
- `pnpm dev` — watch mode
- `pnpm test:types` — type-check all packages
- `pnpm format` — Prettier
- `pnpm clean` — remove `dist` folders

## Running the examples

```sh
pnpm build
pnpm --filter vanilla dev
pnpm --filter nextjs dev
```

The examples consume the packages via `workspace:*`, so rebuild (`pnpm build` or `pnpm dev`) after changing package source.

## Pull requests

- Keep changes focused — one concern per PR
- Run `pnpm test:types` and `pnpm format` before pushing
- For anything non-trivial, open an issue or discussion first
