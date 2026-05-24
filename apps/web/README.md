# apps/web — Jopgood PWA docs

Next.js 16 (App Router) + fumadocs-mdx, statically exported via `output: "export"`. Deployed to Cloudflare Pages.

## Local development

From the repo root:

```bash
pnpm install
pnpm build:core && pnpm build:react   # packages first, web consumes via workspace:*
pnpm --filter web dev                  # localhost:3000
```

Hot reload picks up content changes (MDX) and component changes.

## Production build

```bash
pnpm build:core && pnpm build:react && pnpm --filter web build
```

Output lands in `apps/web/out/` as a pure static site (~3.5MB). Verify locally:

```bash
npx serve apps/web/out
```

No runtime required.

## Cloudflare Pages deploy

The site is wired to Cloudflare Pages via the dashboard git integration — every push to `main` triggers a production deploy, every PR gets a preview URL automatically.

### Project settings (set once in the dashboard)

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | `pnpm install && pnpm build:core && pnpm build:react && pnpm --filter web build` |
| Build output directory | `apps/web/out` |
| Root directory | _(leave blank — repo root)_ |
| Branch | `main` |

### Environment variables

| Name | Value | Why |
| --- | --- | --- |
| `NODE_VERSION` | `22` | Repo requires `>=20`; `.nvmrc` in this folder also pins to 22 for local consistency. |
| `PNPM_VERSION` | `10.18.0` | Matches `packageManager` in the root `package.json`. |

### Headers and caching

[`public/_headers`](./public/_headers) defines security defaults (HSTS, frame-deny, sane Permissions-Policy) and cache rules:

- `/_next/static/*` → immutable, 1 year (Next hashes these by content)
- `/api/search` → 1 hour, must-revalidate (search index rebuilds on every deploy)
- everything else → Cloudflare's default (HTML doesn't get the immutable hint, so deploys propagate fast)

Cloudflare Pages reads the file from the build output root; Next copies `public/_headers` there during export.

## Custom domain

Add the domain in the Cloudflare Pages project → Custom domains. If the domain's DNS is managed in the same Cloudflare account, the records get created automatically.

## Search index

`app/api/search/route.ts` exports `createFromSource(source).staticGET`. Marked `dynamic = "force-static"` so Next pre-renders it during build; the resulting JSON (~200KB) ships as `out/api/search`. The client dialog ([`components/search-dialog.tsx`](./components/search-dialog.tsx)) fetches it once and runs Orama queries locally.

## When something breaks the deploy

- **Build fails with "Cannot find module"**: packages probably weren't built. Build command must include `pnpm build:core && pnpm build:react` before `pnpm --filter web build`.
- **404s on every page**: output directory wrong — should be `apps/web/out`, not `out` or `apps/web/.next`.
- **Headers not applied**: `_headers` must land in `out/`, not `out/public/`. Next copies from `public/` to `out/` root during export, so the source file lives at `apps/web/public/_headers`.
- **Sidebar active state broken in prod**: trailing-slash mismatch. `next.config.mjs` does NOT set `trailingSlash: true`; the sidebar's `samePath()` helper normalises either form. If you re-enable trailing slashes, both still work.
