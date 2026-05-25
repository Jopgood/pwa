/**
 * Canonical site URL for the current build, resolved from the environment.
 * Imported by anywhere that needs to emit absolute URLs at build time
 * (metadata, sitemap, robots).
 *
 * See app/layout.tsx for the full resolution order; in short:
 *   NEXT_PUBLIC_SITE_URL → CF_PAGES_URL → production fallback.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.CF_PAGES_URL ??
  "https://www.jopgood.com"
