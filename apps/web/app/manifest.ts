import type { MetadataRoute } from "next"

// Required for static export.
export const dynamic = "force-static"

/**
 * Web app manifest — makes the docs site itself installable as a PWA.
 * Generated as /manifest.webmanifest at build time and auto-linked from
 * every page by Next's metadata system.
 *
 * Icons rasterized from public/favicon.svg via scripts/generate-icons.mjs.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jopgood PWA",
    short_name: "Jopgood PWA",
    description:
      "Headless, type-safe primitives for managing push notification subscriptions.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffcf2", // brand cream
    theme_color: "#c84b31", // brand terracotta (matches favicon)
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        // Maskable variant — Android adaptive icons crop to a safe zone.
        // We reuse the same source for now; if Android crops awkwardly,
        // generate a dedicated maskable PNG with extra padding.
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
