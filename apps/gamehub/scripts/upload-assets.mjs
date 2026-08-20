import { resolve } from "node:path"
import { uploadAssets } from "../../../scripts/r2-assets.mjs"

await uploadAssets({
  appRoot: resolve(import.meta.dirname, ".."),
  manifestRelPath: "scripts/asset-manifest.json",
  mirroredDirs: ["gamehub-previews"],
  argv: process.argv.slice(2),
})
