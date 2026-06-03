import type { MetadataRoute } from "next"
import { source } from "@/lib/source"
import { SITE_URL } from "@/lib/site-url"

// Required for static export.
export const dynamic = "force-static"

/**
 * Generated as static /sitemap.xml at build time. Includes the root page
 * plus every docs page enumerated from the fumadocs source. Add new
 * top-level routes here as the site grows.
 *
 * `lastModified` is intentionally omitted. Per Google's sitemap guidance,
 * `<lastmod>` should reflect when content meaningfully changed; lying
 * with `new Date()` on every deploy actively hurts ranking because the
 * crawler stops trusting it. Wire it back up only when we can derive
 * real dates (frontmatter or file mtime).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const docs = source.getPages().map((page) => ({
    url: `${SITE_URL}${page.url}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    ...docs,
  ]
}
