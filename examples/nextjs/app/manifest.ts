import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "@jopgood/react-pwa Demo",
    short_name: "PWA Demo",
    description:
      "Demo app for @jopgood/react-pwa — React adapter for @jopgood/pwa-core",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#171717",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
