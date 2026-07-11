// Deterministic, offline validator for a provenance sidecar manifest
// (docs/provenance/ai-provenance.schema.json). Two gates, both must pass:
//   1. SCHEMA — the manifest is structurally valid for the versioned format,
//      and carries no prohibited (secret/prompt/user-data/reasoning) key.
//   2. DIGEST — every recorded input digest still matches the current content
//      of its source artifact. A changed input is rejected non-zero, naming the
//      mismatched digest, so a later executor can trust the trace or investigate.
//
// It never repairs, never fetches anything, and never compares runtime/git to
// the current host (those are recorded facts, not reproducibility invariants).
//
// Run: node scripts/validate-provenance.mjs
//        [--manifest <path|basename>]
//        [--flow <path>] [--selection <path>] [--build <path>]
//        [--registry-dir <dir>] [--base-dir <dir>]
//   Defaults to the golden sidecar and the golden source artifacts. --base-dir
//   resolves every input basename from one directory (used by the regression
//   test against copied/mutated inputs).
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createContractAjv } from './lib/ajv.mjs'
import { readDoc, docPath } from './lib/paths.mjs'
import {
  canonicalDigest,
  digestRegistryInventory,
  resolveInput,
  findProhibitedKeys,
} from './lib/provenance.mjs'

const ROOT = process.cwd()
const argv = process.argv.slice(2)
function opt(name, fallback) {
  const i = argv.indexOf(name)
  return i !== -1 ? argv[i + 1] : fallback
}

const baseDir = opt('--base-dir', null)
const manifestArg = opt('--manifest', 'buildreport-dryrun-saas-ops-02.provenance.json')
const manifestPath = existsSync(manifestArg)
  ? manifestArg
  : baseDir && existsSync(join(baseDir, manifestArg))
    ? join(baseDir, manifestArg)
    : docPath(manifestArg)

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''))

let manifest
try {
  manifest = readJson(manifestPath)
} catch (e) {
  console.error(`✗ ${manifestPath}: invalid JSON (${e.message})`)
  process.exit(1)
}

// ---- gate 1a: schema ------------------------------------------------------
const ajv = createContractAjv()
const validate = ajv.compile(readDoc('ai-provenance.schema.json'))
if (!validate(manifest)) {
  console.error(`✗ ${manifestPath}: INVALID provenance manifest`)
  for (const err of validate.errors) console.error(`    ${err.instancePath || '(root)'} ${err.message}`)
  process.exit(1)
}

// ---- gate 1b: privacy (defense-in-depth over additionalProperties:false) --
const prohibited = findProhibitedKeys(manifest)
if (prohibited.length > 0) {
  console.error(`✗ ${manifestPath}: prohibited sensitive key(s): ${prohibited.join(', ')}`)
  process.exit(1)
}

// ---- gate 2: digest verification against source artifacts -----------------
const registryDir = opt('--registry-dir', baseDir ? join(baseDir, 'registry') : join(ROOT, 'registry'))
const overrides = {
  flowSpec: opt('--flow', null),
  selectionSpec: opt('--selection', null),
  buildReport: opt('--build', null),
}

const mismatches = []
for (const key of ['flowSpec', 'selectionSpec', 'buildReport']) {
  const entry = manifest.inputs[key]
  let sourcePath
  try {
    sourcePath = overrides[key] ? resolveInput(overrides[key]) : resolveInput(entry.path, baseDir)
  } catch (e) {
    mismatches.push(`${key} (${entry.path}): source not found (${e.message})`)
    continue
  }
  const actual = canonicalDigest(readJson(sourcePath))
  if (actual !== entry.digest) {
    mismatches.push(`${key} (${entry.path}): recorded ${entry.digest.slice(0, 12)}… != actual ${actual.slice(0, 12)}…`)
  }
}

// registry inventory digest
const actualRegistry = digestRegistryInventory(registryDir).digest
if (actualRegistry !== manifest.inputs.registryInventory.digest) {
  mismatches.push(
    `registryInventory (registry/): recorded ${manifest.inputs.registryInventory.digest.slice(0, 12)}… != actual ${actualRegistry.slice(0, 12)}…`,
  )
}

if (mismatches.length > 0) {
  console.error(`✗ ${manifestPath}: ${mismatches.length} digest mismatch(es)`)
  for (const m of mismatches) console.error(`    [DIGEST_MISMATCH] ${m}`)
  process.exit(1)
}

console.log(`✓ provenance valid: ${manifest.flowId}`)
console.log(`    manifest: ${manifestPath}`)
console.log(`    git:      ${manifest.git.commit}`)
console.log(`    inputs:   flowSpec/selectionSpec/buildReport/registryInventory digests match`)
process.exit(0)
