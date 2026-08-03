import type { NextConfig } from "next"
import path from "node:path"

// The portal owns the site root. The deploy workflow sets
// PAGES_BASE_PATH="/react-shadcn"; local dev leaves it empty so the app serves
// from "/" and sibling apps sit one level below.
const basePath = process.env.PAGES_BASE_PATH ?? ""

const nextConfig: NextConfig = {
  // Static export: `next build` emits a fully static `out/` (no Node server).
  output: "export",
  // The export has no Next image server; serve <img> as-is.
  images: { unoptimized: true },
  // Emit `foo/index.html` so paths resolve without a server rewriting them.
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  // The portal links to sibling apps with plain anchors, which Next does not
  // rewrite. They build their hrefs from this value.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  // Pin the workspace root to the monorepo root (where package-lock.json and
  // the hoisted node_modules live). Turbopack refuses to resolve files outside
  // its root, so pointing this at the app directory makes the hoisted `next`
  // package unresolvable.
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
}

export default nextConfig
