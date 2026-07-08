// Validates meta.aiDesignSystem of every registry/*.json against
// docs/ai-design-facets.schema.json. Exits non-zero on any violation so this
// can later gate CI (the "machine contract" enforcement).
//
// Run: npm run validate:facets
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const ROOT = process.cwd()
const SCHEMA_PATH = join(ROOT, 'docs', 'ai-design-facets.schema.json')
const REGISTRY_DIR = join(ROOT, 'registry')

const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf8'))
// The schema declares draft-07 with an https:// $schema URI; ajv registers the
// draft-07 meta-schema under http://, so drop the key rather than edit the file.
delete schema.$schema
const ajv = new Ajv({ allErrors: true })
addFormats(ajv)
const validate = ajv.compile(schema)

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

let failed = 0
for (const f of files) {
  const item = JSON.parse(readFileSync(join(REGISTRY_DIR, f), 'utf8'))
  const facets = item?.meta?.aiDesignSystem
  if (!facets) {
    console.error(`✗ ${f}: missing meta.aiDesignSystem`)
    failed++
    continue
  }
  if (validate(facets)) {
    console.log(`✓ ${f}: valid (${facets.assetKind}, maturity=${facets.maturity})`)
  } else {
    failed++
    console.error(`✗ ${f}: INVALID`)
    for (const err of validate.errors) {
      console.error(`    ${err.instancePath || '(root)'} ${err.message}`)
    }
  }
}

console.log(`\n${files.length - failed}/${files.length} registry items valid.`)
process.exit(failed > 0 ? 1 : 0)
