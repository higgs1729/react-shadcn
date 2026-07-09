// Validates meta.aiDesignSystem of every registry/*.json against
// docs/ai-design-facets.schema.json. Exits non-zero on any violation so this
// can later gate CI (the "machine contract" enforcement).
//
// Run: npm run validate:facets
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { readDoc } from './lib/paths.mjs'

const ROOT = process.cwd()
const REGISTRY_DIR = join(ROOT, 'registry')

const schema = readDoc('ai-design-facets.schema.json')
// The schema declares draft-07 with an https:// $schema URI; ajv registers the
// draft-07 meta-schema under http://, so drop the key rather than edit the file.
delete schema.$schema
const ajv = new Ajv({ allErrors: true })
addFormats(ajv)
const validate = ajv.compile(schema)

// Canonical profiles are the answer key: every screenType/blockRole an item
// claims must exist there, or the selection layer can never retrieve the item.
const profiles = readDoc('ai-canonical-profiles.json')
const screenTypeKeys = new Set(Object.keys(profiles.screenTypes))
const blockRoleKeys = new Set(Object.keys(profiles.blockRoles))

function referentialErrors(facets) {
  const errs = []
  if (facets.screenType && !screenTypeKeys.has(facets.screenType)) {
    errs.push(`screenType "${facets.screenType}" has no canonical profile`)
  }
  const roles = [
    ...(facets.blockRole ? [facets.blockRole] : []),
    ...(facets.blockRoles ?? []),
    ...(facets.composition?.requiredBlocks ?? []),
    ...(facets.composition?.optionalBlocks ?? []),
  ]
  for (const r of roles) {
    if (!blockRoleKeys.has(r)) errs.push(`blockRole "${r}" has no canonical profile`)
  }
  return errs
}

let files
try {
  files = readdirSync(REGISTRY_DIR).filter((f) => f.endsWith('.json'))
} catch {
  console.error(`No registry directory found at ${REGISTRY_DIR}`)
  process.exit(1)
}

if (files.length === 0) {
  console.error('No registry items found to validate.')
  process.exit(1)
}

// Inventory-first policy: collect which blockRoles have standalone block-pattern
// items, so screen-pattern requiredBlocks can be checked against real inventory.
const items = files.map((f) => ({
  f,
  item: JSON.parse(readFileSync(join(REGISTRY_DIR, f), 'utf8')),
}))
const stockedRoles = new Set(
  items
    .map(({ item }) => item?.meta?.aiDesignSystem)
    .filter((m) => m?.assetKind === 'block-pattern' && m.blockRole)
    .map((m) => m.blockRole),
)

let failed = 0
for (const f of files) {
  const item = JSON.parse(readFileSync(join(REGISTRY_DIR, f), 'utf8'))
  const facets = item?.meta?.aiDesignSystem
  if (!facets) {
    console.error(`✗ ${f}: missing meta.aiDesignSystem`)
    failed++
    continue
  }
  const schemaOk = validate(facets)
  const refErrs = referentialErrors(facets)
  // Inventory-first: a screen pattern's required roles must each be stocked as
  // a standalone block-pattern item, or step 4 of the selection layer starves.
  if (facets.assetKind === 'screen-pattern') {
    for (const r of facets.composition?.requiredBlocks ?? []) {
      if (!stockedRoles.has(r)) {
        refErrs.push(`requiredBlocks "${r}" has no standalone block-pattern item in the registry`)
      }
    }
  }
  if (schemaOk && refErrs.length === 0) {
    console.log(`✓ ${f}: valid (${facets.assetKind}, maturity=${facets.maturity})`)
  } else {
    failed++
    console.error(`✗ ${f}: INVALID`)
    if (!schemaOk) {
      for (const err of validate.errors) {
        console.error(`    ${err.instancePath || '(root)'} ${err.message}`)
      }
    }
    for (const e of refErrs) console.error(`    ${e}`)
  }
}

console.log(`\n${files.length - failed}/${files.length} registry items valid.`)
process.exit(failed > 0 ? 1 : 0)
