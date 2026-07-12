// Observability report: for every canonical screenType and blockRole (the
// full vocabulary in ai-canonical-profiles.json), how many registry items
// currently provide it. Screen-pattern items are counted by their
// `screenType` facet; block-pattern items by their `blockRole` facet. A
// canonical entry with zero registry items is a real gap (the selection
// layer can resolve to it but has nothing to actually pick) and is marked
// visibly, but this script never fails the build on a gap — it is purely
// informational. Enforcing gaps is out of scope (see task-15 brief).
//
// Run: node scripts/report-inventory-coverage.mjs (or npm run report:coverage)
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { readDoc } from './lib/paths.mjs'

const ROOT = process.cwd()
const REGISTRY_DIR = join(ROOT, 'registry')

const profiles = readDoc('ai-canonical-profiles.json')
const screenTypes = Object.keys(profiles.screenTypes ?? {}).sort()
const blockRoles = Object.keys(profiles.blockRoles ?? {}).sort()

let files = []
try {
  files = readdirSync(REGISTRY_DIR).filter((f) => f.endsWith('.json'))
} catch {
  // No registry directory: every canonical entry is a gap; fall through with
  // an empty inventory rather than failing (this report never fails).
}

const screenTypeCounts = new Map(screenTypes.map((s) => [s, 0]))
const blockRoleCounts = new Map(blockRoles.map((r) => [r, 0]))

for (const f of files) {
  let item
  try {
    item = JSON.parse(readFileSync(join(REGISTRY_DIR, f), 'utf8'))
  } catch {
    // A malformed registry file is out of scope for this report (the
    // registry validators own that); skip it rather than throwing so one bad
    // file never masks the rest of the inventory count.
    continue
  }
  const facets = item?.meta?.aiDesignSystem
  if (!facets) continue
  if (facets.assetKind === 'screen-pattern' && screenTypeCounts.has(facets.screenType)) {
    screenTypeCounts.set(facets.screenType, screenTypeCounts.get(facets.screenType) + 1)
  }
  if (facets.assetKind === 'block-pattern' && blockRoleCounts.has(facets.blockRole)) {
    blockRoleCounts.set(facets.blockRole, blockRoleCounts.get(facets.blockRole) + 1)
  }
}

function printSection(title, counts) {
  console.log(`\n${title} (${counts.size} canonical)`)
  let gaps = 0
  for (const [key, count] of counts) {
    if (count === 0) {
      gaps++
      console.log(`  [GAP] ${key}: 0 registry items`)
    } else {
      console.log(`        ${key}: ${count} registry item(s)`)
    }
  }
  return gaps
}

console.log('Inventory coverage report (observability only; never fails on a gap)')
const screenTypeGaps = printSection('screenTypes', screenTypeCounts)
const blockRoleGaps = printSection('blockRoles', blockRoleCounts)

console.log(
  `\n${screenTypes.length - screenTypeGaps}/${screenTypes.length} screenTypes stocked, ` +
    `${screenTypeGaps} gap(s).`,
)
console.log(
  `${blockRoles.length - blockRoleGaps}/${blockRoles.length} blockRoles stocked, ` +
    `${blockRoleGaps} gap(s).`,
)

// Always exit 0: this report is observability only, never a gate.
process.exit(0)
