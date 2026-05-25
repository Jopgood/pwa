#!/usr/bin/env node
/**
 * Rasterizes public/favicon.svg into the PNG sizes used by:
 *   - <link rel="apple-touch-icon" href="/apple-touch-icon.png"> (iOS)
 *   - app manifest icons (PWA install on Android / Chrome)
 *
 * Run when favicon.svg changes:
 *   pnpm --filter web icons:generate
 *
 * Sharp is a devDep; output PNGs land in public/ and are committed alongside
 * the source SVG so deploys don't have to rerun this.
 */
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const here = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(here, "..", "public")
const svgPath = path.join(publicDir, "favicon.svg")

const sizes = [
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
]

const svg = await fs.readFile(svgPath)

for (const { name, size } of sizes) {
  const out = path.join(publicDir, name)
  await sharp(svg, { density: 384 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out)
  console.log(`✓ wrote public/${name} (${size}×${size})`)
}
