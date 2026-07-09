import type { NextConfig } from "next"
import path from "node:path"

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. A stray package-lock.json in the
  // user's home directory otherwise makes Turbopack treat the entire home
  // folder as the workspace, scanning/watching it until the heap OOMs.
  turbopack: {
    root: path.join(__dirname),
  },
}

export default nextConfig
