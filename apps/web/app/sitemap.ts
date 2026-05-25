import type { MetadataRoute } from "next"
import { source } from "@/lib/source"

// Required for static export.
export const dynamic = "force-static"

const SITE_URL = "https://www.jopgood.com"

/**
 * Generated as static /sitemap.xml at build time. Includes the root page
 * plus every docs page enumerated from the fumadocs source. Add new
 * top-level routes here as the site grows.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const docs = source.getPages().map((page) => ({
    url: `${SITE_URL}${page.url}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    ...docs,
  ]
}
