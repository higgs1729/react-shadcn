import type { NextConfig } from "next"
import path from "node:path"

const basePath = `${process.env.PAGES_BASE_PATH ?? ""}/gamehub`

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_BASE_PATH: process.env.PAGES_BASE_PATH ?? "",
  },
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
}

export default nextConfig
