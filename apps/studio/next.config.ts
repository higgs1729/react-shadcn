import type { NextConfig } from "next"
import path from "node:path"

// Every app in this monorepo is exported statically and composed into one
// GitHub Pages site. The deploy workflow sets PAGES_BASE_PATH="/react-shadcn";
// the studio then owns the "/studio" subtree beneath it, while apps/portal
// takes the root. Local dev leaves PAGES_BASE_PATH empty, so the app serves
// from "/studio" and the route shape stays identical to production.
const basePath = `${process.env.PAGES_BASE_PATH ?? ""}/studio`

const nextConfig: NextConfig = {
  // The shared UI kit ships TypeScript sources, so Next has to compile it
  // instead of treating it as a prebuilt dependency.
  transpilePackages: ["@react-shadcn/shadcn-kit"],
  // Playwright smoke tests use the loopback IP while `next dev` defaults to
  // localhost. Next 16 blocks that dev-only cross-origin asset request unless
  // the additional origin is declared explicitly.
  allowedDevOrigins: ["127.0.0.1"],
  // Static export: `next build` emits a fully static `out/` (no Node server),
  // hostable on GitHub Pages. Registry/coverage are read at build time.
  output: "export",
  // The export has no Next image server; serve <img> as-is.
  images: { unoptimized: true },
  // Emit `foo/index.html` so paths resolve without a server rewriting them.
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  // Exposed to client code so URL helpers (e.g. Team T's getApiPageUrl) can
  // build absolute asset paths instead of relying on route-relative links.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  // Pin the workspace root to the monorepo root (where package-lock.json and
  // the hoisted node_modules live). Turbopack refuses to resolve files outside
  // its root, so pointing this at the app directory makes the hoisted `next`
  // package unresolvable. Pinning it explicitly also keeps auto-detection from
  // walking past the repo to a stray package-lock.json in the user's home
  // directory, which made Turbopack watch the entire home folder until it OOMed.
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
}

export default nextConfig
