// Validates FlowSpec / SelectionSpec / BuildReport documents against their JSON Schema
// contracts. Type is auto-detected: `steps` -> FlowSpec, `checks` -> BuildReport,
// `screens` -> SelectionSpec.
//
// Run: npm run validate:spec -- <file.json> [more.json ...]
//      npm run validate:specs   (validates everything under docs/examples/)
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { readDoc } from './lib/paths.mjs'

const ROOT = process.cwd()
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))

// validateSchema: false — schemas declare draft-07 via https:// which ajv
// registers under http:// only.
const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false })
addFormats(ajv)
ajv.addSchema(readDoc('ai-design-facets.schema.json'))
const validateFlow = ajv.compile(readDoc('ai-flowspec.schema.json'))
const validateSelection = ajv.compile(readDoc('ai-selectionspec.schema.json'))
const validateBuildReport = ajv.compile(readDoc('ai-buildreport.schema.json'))

let targets = process.argv.slice(2)
if (targets.length === 0) {
  const dir = join(ROOT, 'docs', 'examples')
  targets = existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => join(dir, f))
    : []
}
if (targets.length === 0) {
  console.error('No spec files given and docs/examples/ is empty.')
  process.exit(1)
}

let failed = 0
for (const t of targets) {
  let doc
  try {
    doc = readJson(t)
  } catch (e) {
    console.error(`✗ ${t}: invalid JSON (${e.message})`)
    failed++
    continue
  }
  const kind = doc.steps ? 'FlowSpec' : doc.checks ? 'BuildReport' : doc.screens ? 'SelectionSpec' : null
  if (!kind) {
    console.error(`✗ ${t}: neither FlowSpec (steps), BuildReport (checks), nor SelectionSpec (screens)`)
    failed++
    continue
  }
  const validate =
    kind === 'FlowSpec' ? validateFlow : kind === 'BuildReport' ? validateBuildReport : validateSelection
  if (validate(doc)) {
    console.log(`✓ ${t}: valid ${kind}`)
  } else {
    failed++
    console.error(`✗ ${t}: INVALID ${kind}`)
    for (const err of validate.errors) {
      console.error(`    ${err.instancePath || '(root)'} ${err.message}`)
    }
  }
}
process.exit(failed > 0 ? 1 : 0)
