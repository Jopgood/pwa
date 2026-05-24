import { createMDX } from "fumadocs-mdx/next"

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: "export",
  // Static export skips Next's image optimizer; assets are served as-is.
  images: { unoptimized: true },
}

const withMDX = createMDX()
export default withMDX(config)
