import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site-url"

// Required for static export.
export const dynamic = "force-static"

/**
 * Generated as static /robots.txt at build time (compatible with
 * `output: "export"`). Allows all crawlers, points at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
