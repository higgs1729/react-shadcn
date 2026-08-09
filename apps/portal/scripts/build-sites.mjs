import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const outDir = path.join(appDir, "out")
const distDir = path.join(appDir, "dist")
const clientDir = path.join(distDir, "client")
const serverDir = path.join(distDir, "server")

await readFile(path.join(outDir, "index.html"))
await rm(distDir, { recursive: true, force: true })
await mkdir(serverDir, { recursive: true })
await cp(outDir, clientDir, { recursive: true })

await writeFile(
  path.join(serverDir, "index.js"),
  `export default {
  async fetch() {
    return new Response("Not Found", { status: 404 })
  },
}
`,
)

await writeFile(
  path.join(serverDir, "wrangler.json"),
  `${JSON.stringify(
    {
      name: "higgs1729-apps",
      compatibility_date: "2026-08-09",
      main: "index.js",
      no_bundle: true,
      rules: [{ type: "ESModule", globs: ["**/*.js", "**/*.mjs"] }],
      assets: {
        directory: "../client",
        html_handling: "auto-trailing-slash",
        not_found_handling: "404-page",
      },
    },
    null,
    2,
  )}\n`,
)

console.log(`Sites build staged at ${distDir}`)
