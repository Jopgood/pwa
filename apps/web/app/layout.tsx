import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { RootProvider } from "fumadocs-ui/provider/next"
import SearchDialog from "@/components/search-dialog"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
})

const interHead = Inter({
  subsets: ["latin"],
  variable: "--font-head",
  weight: ["700", "800", "900"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Jopgood PWA",
  description: "A small, framework-agnostic toolkit for building PWAs.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${interHead.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ThemeProvider>
          <RootProvider
            // Light-only for now; next-themes is also disabled by our
            // ThemeProvider passthrough above.
            theme={{ enabled: false }}
            search={{
              // Custom dialog using our own shadcn primitives. The hook
              // inside it points at /api/search (built by createFromSource
              // + staticGET, emitted as a static JSON asset by
              // `output: "export"`).
              SearchDialog,
            }}
          >
            {children}
          </RootProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
