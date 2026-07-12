import type { NextConfig } from "next"
import path from "node:path"

// GitHub Pages serves a project site under /<repo>. The deploy workflow sets
// PAGES_BASE_PATH="/react-shadcn"; local dev and a future custom domain leave it
// empty so basePath/assetPrefix stay "" and nothing is rewritten.
const basePath = process.env.PAGES_BASE_PATH ?? ""

const nextConfig: NextConfig = {
  // Static export: `next build` emits a fully static `out/` (no Node server),
  // hostable on GitHub Pages. Registry/coverage are read at build time.
  output: "export",
  // The export has no Next image server; serve <img> as-is.
  images: { unoptimized: true },
  // Emit `foo/index.html` so paths resolve without a server rewriting them.
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  // Pin the workspace root to this project. A stray package-lock.json in the
  // user's home directory otherwise makes Turbopack treat the entire home
  // folder as the workspace, scanning/watching it until the heap OOMs.
  turbopack: {
    root: path.join(__dirname),
  },
}

export default nextConfig
