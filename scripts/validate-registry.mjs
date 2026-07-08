// Validates every registry item under registry/ against the AI design-system contract:
//  1. Every *.json item must carry meta.aiDesignSystem (the AI metadata layer is mandatory).
//  2. meta.aiDesignSystem is validated with ajv against docs/ai-design-facets.schema.json.
//  3. Referential checks against docs/ai-canonical-profiles.json:
//     - screenType (if present) exists as a canonical screenType profile
//     - blockRole / blockRoles / composition.* roles exist as canonical blockRole profiles
// Run: npm run validate:registry  (exit 1 on any failure; passing with 0 items is allowed)
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const ROOT = process.cwd()
const REGISTRY_DIR = join(ROOT, 'registry')
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))

const facetsSchema = readJson(join(ROOT, 'docs', 'ai-design-facets.schema.json'))
const profiles = readJson(join(ROOT, 'docs', 'ai-canonical-profiles.json'))
const screenTypeKeys = new Set(Object.keys(profiles.screenTypes))
const blockRoleKeys = new Set(Object.keys(profiles.blockRoles))

// validateSchema: false — the schema declares its draft-07 meta-schema with an
// https:// URL, which ajv only registers under http://.
const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false })
addFormats(ajv)
const validateFacets = ajv.compile(facetsSchema)

const errors = []
let itemCount = 0

if (existsSync(REGISTRY_DIR)) {
  const files = readdirSync(REGISTRY_DIR, { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.json'))
  for (const rel of files) {
    const path = join(REGISTRY_DIR, rel)
    let item
    try {
      item = readJson(path)
    } catch (e) {
      errors.push(`${rel}: invalid JSON (${e.message})`)
      continue
    }
    // The registry index (registry.json) lists items; only item files are validated.
    if (!item.type || !String(item.type).startsWith('registry:')) continue
    itemCount++
    const meta = item.meta?.aiDesignSystem
    if (!meta) {
      errors.push(`${rel}: missing meta.aiDesignSystem (AI metadata layer is mandatory)`)
      continue
    }
    if (!validateFacets(meta)) {
      for (const e of validateFacets.errors) {
        errors.push(`${rel}: meta.aiDesignSystem${e.instancePath} ${e.message}`)
      }
    }
    if (meta.screenType && !screenTypeKeys.has(meta.screenType)) {
      errors.push(`${rel}: screenType "${meta.screenType}" has no canonical profile`)
    }
    const roles = [
      ...(meta.blockRole ? [meta.blockRole] : []),
      ...(meta.blockRoles ?? []),
      ...(meta.composition?.requiredBlocks ?? []),
      ...(meta.composition?.optionalBlocks ?? []),
    ]
    for (const r of roles) {
      if (!blockRoleKeys.has(r)) {
        errors.push(`${rel}: blockRole "${r}" has no canonical profile`)
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`registry: ${errors.length} problem(s) across ${itemCount} item(s)`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
console.log(`registry: OK (${itemCount} item(s) validated against meta.aiDesignSystem contract)`)
