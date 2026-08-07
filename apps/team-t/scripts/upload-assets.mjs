// Team T's preview images: game screenshots and API page previews.
//
// SCOPE IS DERIVED FROM DIRECTORIES, not a hand-written file list, so a new
// preview dropped into one of them is uploaded on the next run without
// editing this script. Only the two `*-previews` directories move: public/
// games/api-cards/ is loaded by raw JS inside public/games/*.html via a
// RELATIVE path and fed to a WebGL texture loader, which would need CORS
// handling to survive a cross-origin move, and public/world/ belongs to
// in-progress 3D work.
//
// Run: npm -w apps/team-t run upload:assets
//      npm -w apps/team-t run upload:assets:check
//
// See scripts/r2-assets.mjs at the repo root for what this actually does
// (credential loading, manifest semantics, why --check is a separate entry).
import { resolve } from "node:path"
import { uploadAssets } from "../../../scripts/r2-assets.mjs"

await uploadAssets({
  appRoot: resolve(import.meta.dirname, ".."),
  // <public subdirectory> == <key prefix in the bucket>.
  mirroredDirs: ["game-previews", "api-page-previews"],
  // Produced here, consumed by validate-team-t-app.mjs. It sits next to its
  // only two users rather than in lib/team-t-app/, which is app data the
  // bundle reads.
  manifestRelPath: "scripts/asset-manifest.json",
  argv: process.argv.slice(2),
})
