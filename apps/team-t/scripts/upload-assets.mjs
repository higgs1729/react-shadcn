// Uploads this app's preview images to the Cloudflare R2 bucket that serves
// them in production. Images live in R2 rather than git because they are the
// bulk of this repository's weight and they keep growing; the repo should carry
// code, not a picture library.
//
// SCOPE IS DERIVED FROM DIRECTORIES, not a hand-written file list, so a new
// preview dropped into one of them is uploaded on the next run without editing
// this script. Only the two `*-previews` directories move: public/games/
// api-cards/ is loaded by raw JS inside public/games/*.html via a RELATIVE path
// and fed to a WebGL texture loader, which would need CORS handling to survive
// a cross-origin move, and public/world/ belongs to in-progress 3D work.
//
// Every run writes scripts/asset-manifest.json, the tracked record of what the
// bucket holds. It exists because these images are leaving git: once they are
// no longer on disk, nothing else in the repository knows they should exist,
// and a `previewFileName` pointing at a missing object would render as a broken
// image with every check still green. The manifest is written from a listing of
// the bucket, so it records what is there rather than what this run believes it
// put there, and needs no merge with the manifest it replaces.
//
// Credentials come from .env.local at the repo root (gitignored). They are
// never read from, or written to, a tracked file.
//
//   R2_ACCOUNT_ID=...
//   R2_BUCKET=react-shadcn-assets
//   R2_ACCESS_KEY_ID=...
//   R2_SECRET_ACCESS_KEY=...
//
// Run: npm -w apps/team-t run upload:assets
//      npm -w apps/team-t run upload:assets:check
//
// --check reports what would change and exits non-zero if anything would, the
// same convention gen-flow-routes.mjs uses, and makes no writes. It has its own
// script entry because `npm run <script> -- --check` does not deliver the flag
// here (observed with and without -w; `npm run typecheck -- --version` prints
// npm's own version, so npm is eating it), which turns an intended dry run into
// a real upload. Passing it to `node scripts/upload-assets.mjs` directly works.
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs"
import { createHash } from "node:crypto"
import { join, resolve, extname } from "node:path"
import { AwsClient } from "aws4fetch"

const APP_ROOT = resolve(import.meta.dirname, "..")
const REPO_ROOT = resolve(APP_ROOT, "..", "..")
const PUBLIC_DIR = join(APP_ROOT, "public")
// Produced here, consumed by validate-team-t-app.mjs. It sits next to its only
// two users rather than in lib/team-t-app/, which is app data the bundle reads.
const MANIFEST_REL = "scripts/asset-manifest.json"
const MANIFEST_PATH = join(APP_ROOT, MANIFEST_REL)

// <public subdirectory> == <key prefix in the bucket>. Keeping them identical
// means a URL can be derived from a filename without a lookup table.
const MIRRORED_DIRS = ["game-previews", "api-page-previews"]

const CONTENT_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
}

const args = process.argv.slice(2)
const checkOnly = args.includes("--check")

/** Minimal .env parser: this needs four strings, not a dependency. */
function loadEnvLocal() {
  const path = join(REPO_ROOT, ".env.local")
  if (!existsSync(path)) return {}
  const out = {}
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    out[trimmed.slice(0, eq).trim()] = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "")
  }
  return out
}

const env = { ...loadEnvLocal(), ...process.env }
const REQUIRED = ["R2_ACCOUNT_ID", "R2_BUCKET", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"]
const missing = REQUIRED.filter((k) => !env[k])
if (missing.length > 0) {
  console.error(`upload:assets: missing ${missing.join(", ")}`)
  console.error("")
  console.error("Put them in .env.local at the repository root (it is gitignored):")
  console.error("  R2_ACCOUNT_ID=<the 32-char id in your R2 S3 endpoint>")
  console.error("  R2_BUCKET=react-shadcn-assets")
  console.error("  R2_ACCESS_KEY_ID=<R2 API token: Object Read & Write>")
  console.error("  R2_SECRET_ACCESS_KEY=<same token's secret>")
  process.exit(1)
}

const endpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
const client = new AwsClient({
  accessKeyId: env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  service: "s3",
  region: "auto",
})

/**
 * Every file under the mirrored directories, as {key, absolute path}. These
 * directories are a staging area, not an inventory: once an image is in the
 * bucket the local copy is deleted, so absent or empty is the normal state and
 * finding nothing to send is a successful run, not an error.
 */
function collect() {
  const out = []
  for (const dir of MIRRORED_DIRS) {
    const abs = join(PUBLIC_DIR, dir)
    if (!existsSync(abs)) continue
    for (const name of readdirSync(abs).sort()) {
      const file = join(abs, name)
      if (!statSync(file).isFile()) continue
      out.push({ key: `${dir}/${name}`, file })
    }
  }
  return out
}

/**
 * R2 returns the MD5 of the body as the ETag for single-part uploads, so an
 * unchanged file can be detected without downloading it. Skipping unchanged
 * objects is what makes re-running this cheap and safe.
 */
function md5(buffer) {
  return createHash("md5").update(buffer).digest("hex")
}

async function remoteEtag(key) {
  const res = await client.fetch(`${endpoint}/${env.R2_BUCKET}/${encodeURI(key)}`, { method: "HEAD" })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`HEAD ${key} failed: ${res.status} ${res.statusText}`)
  return (res.headers.get("etag") ?? "").replace(/"/g, "")
}

const XML_ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'" }
const decodeXml = (text) => text.replace(/&(?:amp|lt|gt|quot|apos);/g, (m) => XML_ENTITIES[m])
const tagOf = (xml, tag) => {
  const found = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))
  return found ? decodeXml(found[1]) : null
}

/**
 * Everything the bucket currently holds, via ListObjectsV2.
 *
 * The manifest is built from this and NOT from the local directory. Accumulating
 * "what this run uploaded" into the previous manifest would need merge rules and
 * would still only ever record intent; asking the bucket needs no merge at all
 * and records fact — including an object deleted from the dashboard, which
 * simply stops appearing.
 */
async function listBucket() {
  const objects = {}
  let token = null
  do {
    const url = new URL(`${endpoint}/${env.R2_BUCKET}`)
    url.searchParams.set("list-type", "2")
    if (token) url.searchParams.set("continuation-token", token)

    const res = await client.fetch(url)
    if (!res.ok) throw new Error(`LIST failed: ${res.status} ${res.statusText}\n${await res.text()}`)
    const xml = await res.text()

    for (const [, entry] of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const key = tagOf(entry, "Key")
      if (key === null) continue
      objects[key] = {
        bytes: Number(tagOf(entry, "Size") ?? 0),
        md5: (tagOf(entry, "ETag") ?? "").replace(/"/g, ""),
      }
    }
    // A page holds 1000 keys. Following the token matters less for 11 images
    // than for the truncated manifest a future directory would silently produce.
    token = tagOf(xml, "IsTruncated") === "true" ? tagOf(xml, "NextContinuationToken") : null
  } while (token)
  return objects
}

const files = collect()

/**
 * Canonical manifest shape: keys sorted, one field order. Both the file on disk
 * and the freshly built one go through here before they are compared, so the
 * comparison is about content and not about how the file happened to be written
 * — including its line endings, which differ between a fresh clone and a local
 * write on Windows.
 */
function manifestOf(bucket, objects) {
  const sorted = {}
  for (const key of Object.keys(objects ?? {}).sort()) {
    sorted[key] = { bytes: objects[key]?.bytes ?? null, md5: objects[key]?.md5 ?? null }
  }
  return { bucket: bucket ?? null, objects: sorted }
}

let uploaded = 0
let skipped = 0
const pending = []

for (const { key, file } of files) {
  const body = readFileSync(file)
  const local = md5(body)
  const remote = await remoteEtag(key)

  if (remote === local) {
    skipped += 1
    continue
  }

  if (checkOnly) {
    pending.push(`${remote === null ? "new    " : "changed"}  ${key}`)
    continue
  }

  const res = await client.fetch(`${endpoint}/${env.R2_BUCKET}/${encodeURI(key)}`, {
    method: "PUT",
    body,
    headers: {
      "Content-Type": CONTENT_TYPES[extname(key).toLowerCase()] ?? "application/octet-stream",
      // Deliberately not `immutable`: these filenames are stable and their
      // contents can be re-exported, so a year-long edge cache would strand a
      // corrected image behind a URL nobody can purge from here.
      "Cache-Control": "public, max-age=3600",
    },
  })
  if (!res.ok) {
    throw new Error(`PUT ${key} failed: ${res.status} ${res.statusText}\n${await res.text()}`)
  }
  console.log(`  uploaded  ${key} (${(body.length / 1024).toFixed(0)} KB)`)
  uploaded += 1
}

const manifest = manifestOf(env.R2_BUCKET, await listBucket())
const objectCount = Object.keys(manifest.objects).length
// An empty bucket would produce a manifest asserting that nothing exists, which
// every later check would then happily agree with. Under --check it is only a
// finding when nothing is staged that would have filled it.
if (objectCount === 0 && !(checkOnly && pending.length > 0)) {
  console.error(`upload:assets: ${env.R2_BUCKET} returned no objects — refusing to write a manifest`)
  console.error("that claims nothing exists. Check the bucket name and the token's permissions.")
  process.exit(1)
}

let previous = null
if (existsSync(MANIFEST_PATH)) {
  const parsed = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"))
  previous = manifestOf(parsed.bucket, parsed.objects)
}
const manifestChanged = JSON.stringify(previous) !== JSON.stringify(manifest)

if (checkOnly) {
  if (manifestChanged) pending.push(`stale    ${MANIFEST_REL}`)
  if (pending.length === 0) {
    console.log(`upload:assets --check: OK — ${MANIFEST_REL} matches the bucket's ${objectCount} object(s).`)
    process.exit(0)
  }
  console.error(`upload:assets --check: ${pending.length} item(s) differ from the bucket:\n`)
  for (const line of pending) console.error(`  ${line}`)
  console.error("\nRun: npm -w apps/team-t run upload:assets")
  process.exit(1)
}

// Written last, and only after every PUT above succeeded — a throw leaves the
// old manifest in place rather than recording objects that never landed.
writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`)

console.log(`upload:assets: ${uploaded} uploaded, ${skipped} already current, ${files.length} staged locally.`)
console.log(`upload:assets: ${MANIFEST_REL} ${manifestChanged ? "updated" : "unchanged"} — ${objectCount} object(s) in ${env.R2_BUCKET}.`)
