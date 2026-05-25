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

In the dashboard (Workers & Pages → **Create** → **Import a repository** → `Jopgood/pwa`):

| Setting | Value |
| --- | --- |
| Root directory | _(leave blank — commands run from repo root)_ |
| Build command | `pnpm install && pnpm build:core && pnpm build:react && pnpm --filter web build` |
| **Production** deploy command | `pnpm --filter web deploy` |
| **Non-production branch** deploy command | `pnpm --filter web deploy:preview` |

The `deploy` / `deploy:preview` scripts in this package's `package.json` run `wrangler deploy` / `wrangler versions upload` respectively. Running them via `pnpm --filter web` means they execute in `apps/web/`'s cwd, so wrangler finds `wrangler.jsonc` and the locally-installed `wrangler` binary (no `npx` download cost on every deploy).

_(Cloudflare's monorepo guide suggests setting Root directory to the app folder and using shorter commands. That works too — see the [advanced setups doc](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/#monorepos) — but the pnpm-filter approach keeps everything driven by package scripts.)_

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
- **Wrangler download warning during deploy** (`npm warn exec The following package was not found and will be installed: wrangler@…`): you're running `npx wrangler` from the wrong cwd. Use `pnpm --filter web deploy` instead — it picks up the locally-installed wrangler from `apps/web/node_modules/.bin/`, so no download.
- **`Missing entry-point to Worker script or to assets directory`** during deploy: wrangler can't find `wrangler.jsonc`. Same root cause — deploy command must run from `apps/web/`. The `pnpm --filter web deploy` pattern handles this.
- **404s on every page**: `assets.directory` in `wrangler.jsonc` is wrong, or the build never produced `out/`. Check that the build step actually ran.
- **Headers not applied**: `_headers` must land in `out/`, not `out/public/`. Next copies from `public/` to `out/` root during export, so the source file lives at `apps/web/public/_headers`.
- **Sidebar active state broken in prod**: trailing-slash mismatch. `next.config.mjs` does NOT set `trailingSlash: true`; the sidebar's `samePath()` helper normalises either form. If you re-enable trailing slashes, both still work.
