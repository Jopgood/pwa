import { ImageResponse } from "next/og"

/**
 * Default OpenGraph image (1200×630) — used as the link preview when
 * www.jopgood.com is shared on Slack / Twitter / LinkedIn / Discord.
 *
 * Pre-rendered to a static PNG at build time (works with
 * `output: "export"`); no runtime needed.
 *
 * Brand: brutalist — cream bg, terracotta accent tile, dark brown text,
 * matching the favicon and the docs theme.
 */
// Required for static export: pre-render the image at build time rather
// than treating it as a runtime route.
export const dynamic = "force-static"
export const revalidate = false

export const alt =
  "Jopgood PWA — Headless push-notification primitives for the web."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#fffcf2",
          color: "#2a1810",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top: logo tile + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Brutalist J tile with offset shadow */}
          <div style={{ position: "relative", display: "flex" }}>
            <div
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                width: 96,
                height: 96,
                borderRadius: 20,
                background: "#2a1810",
              }}
            />
            <div
              style={{
                position: "relative",
                width: 96,
                height: 96,
                borderRadius: 20,
                background: "#c84b31",
                border: "4px solid #2a1810",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 64,
                fontWeight: 900,
                color: "#fffcf2",
                lineHeight: 1,
              }}
            >
              J
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 1,
            }}
          >
            <div style={{ fontSize: 40, fontWeight: 900 }}>Jopgood PWA</div>
            <div
              style={{
                marginTop: 10,
                fontSize: 18,
                color: "#5a4030",
                fontFamily: "monospace",
              }}
            >
              core + adapters
            </div>
          </div>
        </div>

        {/* Middle: headline */}
        <div
          style={{
            display: "flex",
            fontSize: 84,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          Headless push-notification primitives for the web.
        </div>

        {/* Bottom: URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "monospace",
            fontSize: 22,
            color: "#5a4030",
          }}
        >
          <span>www.jopgood.com</span>
          <span>@jopgood/pwa-core · @jopgood/react-pwa</span>
        </div>
      </div>
    ),
    size,
  )
}
