// The portal's artwork: the pickup stacks (p-*), the app cards (a-*) and the
// site cards (w-*) from lib/works.ts, all 1000x625 webp.
//
// Run: npm -w apps/portal run upload:assets
//      npm -w apps/portal run upload:assets:check
//
// See scripts/r2-assets.mjs at the repo root for what this actually does
// (credential loading, manifest semantics, why --check is a separate entry).
import { resolve } from "node:path"
import { uploadAssets } from "../../../scripts/r2-assets.mjs"

await uploadAssets({
  appRoot: resolve(import.meta.dirname, ".."),
  // <public subdirectory> == <key prefix in the bucket>.
  mirroredDirs: ["portal-previews"],
  manifestRelPath: "scripts/asset-manifest.json",
  argv: process.argv.slice(2),
})
