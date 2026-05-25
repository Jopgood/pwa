# apps/web — Jopgood PWA docs

Next.js 16 (App Router) + fumadocs-mdx, statically exported via `output: "export"`. Deployed to Cloudflare via Workers Static Assets, wired through [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) so every push to `main` ships and every PR gets a preview URL.

## Local development

From the repo root:

```bash
pnpm install
pnpm build:core && pnpm build:react   # packages first; web consumes them via workspace:*
pnpm --filter web dev                  # localhost:3000
```

## Production build

```bash
pnpm build:core && pnpm build:react && pnpm --filter web build
```

Static export lands in `apps/web/out/` (~3.5MB). Verify locally:

```bash
npx serve apps/web/out
```

No runtime required.

## Cloudflare deploy

Deployed as a **Worker with Static Assets**, not a Pages project. Config lives in [`wrangler.jsonc`](./wrangler.jsonc):

```jsonc
{
  "name": "jopgood-pwa-docs",
  "compatibility_date": "2026-05-24",
  "assets": {
    "directory": "./out",
    "not_found_handling": "404-page"
  }
}
```

No `main` entry — there's no Worker code, just assets. `not_found_handling: "404-page"` makes Workers serve `out/404.html` for unknown paths (and handles pretty-URL fallbacks like `/docs/installation` → `/docs/installation.html` automatically).

### Workers Builds setup (dashboard, one-time)

Follow [Cloudflare's monorepo guide](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/#monorepos). In the dashboard:

1. Workers & Pages → **Create** → **Import a repository** → pick `Jopgood/pwa`
2. **Root directory**: `apps/web/`
   _(tells Cloudflare where `wrangler.jsonc` lives and what cwd commands run in)_
3. **Build command**:
   ```
   cd ../.. && pnpm install && pnpm build:core && pnpm build:react && pnpm --filter web build
   ```
   _(escape to repo root for the workspace install + package builds, then build the web app)_
4. **Deploy command**:
   ```
   npx wrangler deploy
   ```
   _(runs from `apps/web/`, finds `wrangler.jsonc` automatically, uploads `./out`)_

### Environment variables

| Name | Value | Why |
| --- | --- | --- |
| `NODE_VERSION` | `22` | Repo requires `>=20`; [`.nvmrc`](./.nvmrc) also pins 22 for local consistency. |
| `PNPM_VERSION` | `10.18.0` | Matches `packageManager` in the root `package.json`. |

### Build watch paths (optional but recommended)

Saves CI time on unrelated commits. In the Worker's Build settings, set watch paths to:

```
apps/web/**
packages/**
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
tsdown.config.ts
turbo.json
```

A push that only changes (say) `examples/` won't trigger a docs deploy.

## Headers and caching

[`public/_headers`](./public/_headers) defines security defaults (HSTS, frame-deny, sane Permissions-Policy) and cache rules:

- `/_next/static/*` → immutable, 1 year (Next hashes these by content)
- `/api/search` → 1 hour, must-revalidate (search index rebuilds on every deploy)
- everything else → default (HTML doesn't get the immutable hint, so deploys propagate fast)

Workers Static Assets reads `_headers` from the build output root; Next copies `public/_headers` there during export.

## Custom domain

Cloudflare dashboard → Worker → **Domains & Routes** → Add custom domain. If the domain's DNS is managed in the same Cloudflare account, records get created automatically.

## Search index

[`app/api/search/route.ts`](./app/api/search/route.ts) exports `createFromSource(source).staticGET` and is marked `dynamic = "force-static"`, so Next pre-renders it during build. The resulting JSON (~200KB) ships as `out/api/search`. The client dialog ([`components/search-dialog.tsx`](./components/search-dialog.tsx)) fetches it once and runs Orama queries locally — no server.

## When something breaks the deploy

- **Build fails with "Cannot find module"**: packages weren't built. Build command must include `pnpm build:core && pnpm build:react` before `pnpm --filter web build`.
- **`wrangler: command not found`** during deploy: wrangler is a devDep of `apps/web`. Make sure the build command ran `pnpm install` so `apps/web/node_modules/.bin/wrangler` exists; then `npx wrangler` finds it.
- **404s on every page**: `assets.directory` in `wrangler.jsonc` is wrong, or the build never produced `out/`. Check that the build step actually ran.
- **Headers not applied**: `_headers` must land in `out/`, not `out/public/`. Next copies from `public/` to `out/` root during export, so the source file lives at `apps/web/public/_headers`.
- **Sidebar active state broken in prod**: trailing-slash mismatch. `next.config.mjs` does NOT set `trailingSlash: true`; the sidebar's `samePath()` helper normalises either form. If you re-enable trailing slashes, both still work.
