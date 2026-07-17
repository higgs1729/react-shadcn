import fs from "node:fs"
import path from "node:path"

const projectRoot = process.cwd()
const catalogPath = path.join(projectRoot, "lib/team-t-app/catalog.json")
const assetRoot = path.join(projectRoot, "public/team-t-app/api-pages")
const gameAssetRoot = path.join(projectRoot, "public/team-t-app/games")
const recommendationPath = path.join(
  projectRoot,
  "lib/team-t-app/recommendations.ts"
)
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"))
const errors = []
const ids = new Set()
const expectedGameAssets = [
  "Tilegame.html",
  "target.html",
  "pazuru.html",
  "picross.html",
  "undertale.html",
  "burroku.html",
  "game.html",
  "syuuthingu.html",
]

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
  if (!fs.existsSync(path.join(gameAssetRoot, fileName))) {
    errors.push(`missing game asset ${fileName}`)
  }
}

if (errors.length > 0) {
  console.error(`Team T validation failed:\n- ${errors.join("\n- ")}`)
  process.exitCode = 1
} else {
  console.log(
    `Team T catalog validated: ${catalog.length} pages / ${logicalApiCount} APIs / ${htmlAssets.length} API assets / ${expectedGameAssets.length} game assets / recommendations verified.`
  )
}
