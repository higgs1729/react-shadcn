// Validates FlowSpec / SelectionSpec / BuildReport documents against their JSON Schema
// contracts. Type is auto-detected: `steps` -> FlowSpec, `checks` -> BuildReport,
// `screens` -> SelectionSpec.
//
// Run: npm run validate:spec -- <file.json> [more.json ...]
//      npm run validate:spec    (no args: validates everything under docs/examples/)
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createContractAjv, getContractValidator, registerContractSchemas } from './lib/ajv.mjs'

const ROOT = process.cwd()
// BOM-tolerant: files written by Windows tools may carry a UTF-8 BOM.
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''))

// validateSchema: false — schemas declare draft-07 via https:// which ajv
// registers under http:// only.
const ajv = registerContractSchemas(createContractAjv())
const validateFlow = getContractValidator(ajv, 'ai-flowspec.schema.json')
const validateSelection = getContractValidator(ajv, 'ai-selectionspec.schema.json')
const validateBuildReport = getContractValidator(ajv, 'ai-buildreport.schema.json')

let targets = process.argv.slice(2)
// Scan mode is fail-closed. Add a filename here only for a documented,
// non-contract sidecar format (for example a future provenance sidecar).
const EXAMPLE_JSON_ALLOWLIST = new Set(['buildreport-dryrun-saas-ops-02.provenance.json'])
// In directory-scan mode, JSON files that are not contract documents (e.g. the
// run-checks scratch output {checks, passed}) are skipped instead of failing;
// explicitly passed files are always validated strictly.
const scanMode = targets.length === 0
if (scanMode) {
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
  // BuildReport requires flowId as well, so the run-checks scratch output
  // ({checks, passed} without flowId) is not misclassified.
  const kind = doc.steps
    ? 'FlowSpec'
    : doc.checks && doc.flowId
      ? 'BuildReport'
      : doc.screens
        ? 'SelectionSpec'
        : null
  if (!kind) {
    if (scanMode && EXAMPLE_JSON_ALLOWLIST.has(t.split(/[\\/]/).pop())) {
      console.log(`- ${t}: allowlisted non-contract JSON`)
      continue
    }
    console.error(`✗ ${t}: neither FlowSpec (steps), BuildReport (flowId+checks), nor SelectionSpec (screens)`)
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
