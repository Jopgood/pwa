import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "Jopgood PWA",
    },
    links: [
      {
        text: "GitHub",
        url: "https://github.com/jopgood/pwa",
        external: true,
      },
    ],
  }
}
