import fs from "node:fs"
import path from "node:path"

const projectRoot = process.cwd()
const catalogPath = path.join(projectRoot, "lib/team-t-app/catalog.json")
const assetRoot = path.join(projectRoot, "public/api-pages")
const gameAssetRoot = path.join(projectRoot, "public/games")
const gamesSourcePath = path.join(projectRoot, "lib/team-t-app/games.ts")
const recommendationPath = path.join(
  projectRoot,
  "lib/team-t-app/recommendations.ts"
)
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"))
const errors = []
const ids = new Set()
const gamesSource = fs.readFileSync(gamesSourcePath, "utf8")
const expectedGameAssets = [
  ...gamesSource.matchAll(/fileName:\s*"([^"]+\.html)"/g),
].map(([, fileName]) => fileName)

if (expectedGameAssets.length === 0) {
  errors.push("games.ts must define at least one HTML game asset")
}

if (catalog.length !== 177) {
  errors.push(`catalog must contain 177 pages; found ${catalog.length}`)
}

for (const [index, item] of catalog.entries()) {
  const label = item?.id || `entry ${index}`
  const requiredStrings = [
    "id",
    "assetPath",
    "title",
    "category",
    "description",
    "apiName",
    "icon",
  ]

  for (const field of requiredStrings) {
    if (typeof item?.[field] !== "string" || !item[field].trim()) {
      errors.push(`${label}: ${field} must be a non-empty string`)
    }
  }

  if (ids.has(item.id)) errors.push(`${label}: duplicate id`)
  ids.add(item.id)

  if (
    !Array.isArray(item.categoryPath) ||
    item.categoryPath.length === 0 ||
    item.categoryPath.some((part) => typeof part !== "string" || !part.trim())
  ) {
    errors.push(`${label}: categoryPath must contain non-empty strings`)
  }

  if (!Number.isInteger(item.apiCount) || item.apiCount < 1) {
    errors.push(`${label}: apiCount must be an integer greater than zero`)
  }

  if (
    path.isAbsolute(item.assetPath) ||
    item.assetPath.includes("..") ||
    path.extname(item.assetPath).toLowerCase() !== ".html"
  ) {
    errors.push(`${label}: assetPath must be a relative HTML path`)
    continue
  }

  const assetPath = path.resolve(assetRoot, item.assetPath)
  if (!assetPath.startsWith(`${path.resolve(assetRoot)}${path.sep}`)) {
    errors.push(`${label}: assetPath escapes the Team T asset root`)
  } else if (!fs.existsSync(assetPath)) {
    errors.push(`${label}: missing asset ${item.assetPath}`)
  }
}

const logicalApiCount = catalog.reduce(
  (total, item) =>
    total + (Number.isInteger(item.apiCount) ? item.apiCount : 0),
  0
)
if (logicalApiCount !== 200) {
  errors.push(`logical API total must be 200; found ${logicalApiCount}`)
}

const recommendationSource = fs.readFileSync(recommendationPath, "utf8")
const recommendationMatch = recommendationSource.match(
  /recommendationIds\s*=\s*\[([\s\S]*?)\]\s*as const/
)
if (!recommendationMatch) {
  errors.push("recommendationIds must be an explicit readonly list")
} else {
  const recommendationIds = [
    ...recommendationMatch[1].matchAll(/"([^"]+)"/g),
  ].map(([, id]) => id)
  const recommendationIdSet = new Set(recommendationIds)
  if (recommendationIds.length === 0) {
    errors.push("recommendationIds must contain at least one catalog ID")
  }
  if (recommendationIds.length !== recommendationIdSet.size) {
    errors.push("recommendationIds must not contain duplicates")
  }
  for (const id of recommendationIds) {
    if (!ids.has(id)) errors.push(`recommendation ID does not exist: ${id}`)
  }
}

const htmlAssets = fs
  .readdirSync(assetRoot, { recursive: true, withFileTypes: true })
  .filter(
    (entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".html")
  )
if (htmlAssets.length !== 177) {
  errors.push(
    `public asset root must contain 177 HTML files; found ${htmlAssets.length}`
  )
}

for (const fileName of expectedGameAssets) {
  const gamePath = path.join(gameAssetRoot, fileName)
  if (!fs.existsSync(gamePath)) {
    errors.push(`missing game asset ${fileName}`)
    continue
  }

  const html = fs.readFileSync(gamePath, "utf8")
  if (
    !/postMessage\s*\(\s*\{\s*type\s*:\s*['"]game:ended['"]\s*,\s*coin\s*:/m.test(
      html
    )
  ) {
    errors.push(`${fileName}: missing game:ended postMessage contract`)
  }
}

// Preview images are served from Cloudflare R2, so fs.existsSync can no longer
// answer whether they are there. scripts/asset-manifest.json is the tracked
// record of what the bucket held when upload-assets.mjs last ran; checking
// against it keeps this validator offline and deterministic. Whether those URLs
// actually answer over the network is a separate question, deliberately not
// asked here. Note this closes a hole that predates the move: previews were
// never checked at all, so a deleted image left every check green.
let previewCount = 0
const manifestPath = path.join(projectRoot, "scripts/asset-manifest.json")
if (!fs.existsSync(manifestPath)) {
  errors.push(
    "scripts/asset-manifest.json is missing; run `npm -w apps/team-t run upload:assets`"
  )
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"))
  const objects = new Set(Object.keys(manifest.objects ?? {}))
  const expectedPreviews = [
    ...[...gamesSource.matchAll(/previewFileName:\s*"([^"]+)"/g)].map(
      ([, fileName]) => `game-previews/${fileName}`
    ),
    ...catalog
      .filter((item) => item.previewFileName)
      .map((item) => `api-page-previews/${item.previewFileName}`),
  ]
  previewCount = expectedPreviews.length

  // Without this, deleting every previewFileName would make the loop below
  // iterate zero times and report success for having checked nothing.
  if (expectedPreviews.length === 0) {
    errors.push("no previewFileName is referenced anywhere; the manifest check would pass vacuously")
  }

  for (const key of expectedPreviews) {
    if (!objects.has(key)) {
      errors.push(`preview is not in the R2 manifest: ${key}`)
    }
  }

  // Orphans are reported, not failed on: an object nobody references costs
  // storage and usually means a rename left the old file behind, but deciding
  // when to delete it from the bucket is not this validator's call. Compared as
  // sets rather than counts so the message can name them, and so two catalog
  // items sharing one preview file cannot be mistaken for a missing object.
  const referenced = new Set(expectedPreviews)
  const orphans = [...objects].filter((key) => !referenced.has(key))
  if (orphans.length > 0) {
    console.log(`R2 manifest has ${orphans.length} object(s) nobody references:`)
    for (const key of orphans) console.log(`  ${key}`)
  }
}

if (errors.length > 0) {
  console.error(`Team T validation failed:\n- ${errors.join("\n- ")}`)
  process.exitCode = 1
} else {
  console.log(
    `Team T catalog validated: ${catalog.length} pages / ${logicalApiCount} APIs / ${htmlAssets.length} API assets / ${expectedGameAssets.length} game assets / ${previewCount} R2 previews / recommendations verified.`
  )
}
