import type { NextConfig } from "next"
import path from "node:path"

// Every app in this monorepo is exported statically and composed into one
// GitHub Pages site. The deploy workflow sets PAGES_BASE_PATH="/react-shadcn";
// this app then owns the "/python-test" subtree beneath it. Local dev leaves
// PAGES_BASE_PATH empty, so the route shape stays identical to production.
const basePath = `${process.env.PAGES_BASE_PATH ?? ""}/python-test`

const nextConfig: NextConfig = {
  // The shared UI kit ships TypeScript sources, so Next has to compile it
  // instead of treating it as a prebuilt dependency.
  transpilePackages: ["@react-shadcn/shadcn-kit"],
  // Playwright smoke tests use the loopback IP while `next dev` defaults to
  // localhost. Next 16 blocks that dev-only cross-origin asset request unless
  // the additional origin is declared explicitly.
  allowedDevOrigins: ["127.0.0.1"],
  // Static export: `next build` emits a fully static `out/` (no Node server).
  output: "export",
  // The export has no Next image server; serve <img> as-is.
  images: { unoptimized: true },
  // Emit `foo/index.html` so paths resolve without a server rewriting them.
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    // The site root, where apps/portal lives. Distinct from basePath: links
    // back to the portal have to escape this app's own subtree, and Next only
    // ever prefixes basePath, never strips it.
    NEXT_PUBLIC_SITE_BASE_PATH: process.env.PAGES_BASE_PATH ?? "",
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
