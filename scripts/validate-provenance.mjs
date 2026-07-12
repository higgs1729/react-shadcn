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
//   With --manifest given, validates exactly that one sidecar against the
//   golden source artifacts (or --flow/--selection/--build/--base-dir
//   overrides), as today. With none given, every flow triple discovered under
//   docs/examples/ (see scripts/lib/flows.mjs) must have a sidecar
//   (buildreport-<flowId>.provenance.json) and it is validated against that
//   flow's own artifacts; a complete triple with no sidecar fails, naming the
//   flowId. Any failure in any flow is non-zero.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createContractAjv } from './lib/ajv.mjs'
import { readDoc, docPath } from './lib/paths.mjs'
import {
  canonicalDigest,
  digestSelectionInventory,
  referencedRegistryItems,
  resolveInput,
  findProhibitedKeys,
} from './lib/provenance.mjs'
import { discoverFlows, FlowDiscoveryError } from './lib/flows.mjs'

const ROOT = process.cwd()
const argv = process.argv.slice(2)
function opt(name, fallback) {
  const i = argv.indexOf(name)
  return i !== -1 ? argv[i + 1] : fallback
}

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''))

const ajv = createContractAjv()
const validateSchema = ajv.compile(readDoc('ai-provenance.schema.json'))

/**
 * Validate one manifest file against its own source artifacts. Never exits;
 * returns { ok, flowId, messages }.
 */
function validateManifest(manifestPath, { registryDir, overrides = {}, baseDir = null }) {
  let manifest
  try {
    manifest = readJson(manifestPath)
  } catch (e) {
    return { ok: false, flowId: null, messages: [`${manifestPath}: invalid JSON (${e.message})`] }
  }

  // ---- gate 1a: schema ------------------------------------------------------
  if (!validateSchema(manifest)) {
    const details = validateSchema.errors.map((err) => `${err.instancePath || '(root)'} ${err.message}`)
    return { ok: false, flowId: manifest.flowId ?? null, messages: [`${manifestPath}: INVALID provenance manifest`, ...details] }
  }

  // ---- gate 1b: privacy (defense-in-depth over additionalProperties:false) --
  const prohibited = findProhibitedKeys(manifest)
  if (prohibited.length > 0) {
    return {
      ok: false,
      flowId: manifest.flowId,
      messages: [`${manifestPath}: prohibited sensitive key(s): ${prohibited.join(', ')}`],
    }
  }

  // ---- gate 2: digest verification against source artifacts -----------------
  const mismatches = []
  let selectionSourcePath = null
  for (const key of ['flowSpec', 'selectionSpec', 'buildReport']) {
    const entry = manifest.inputs[key]
    let sourcePath
    try {
      sourcePath = overrides[key] ? resolveInput(overrides[key]) : resolveInput(entry.path, baseDir)
    } catch (e) {
      mismatches.push(`${key} (${entry.path}): source not found (${e.message})`)
      continue
    }
    if (key === 'selectionSpec') selectionSourcePath = sourcePath
    const actual = canonicalDigest(readJson(sourcePath))
    if (actual !== entry.digest) {
      mismatches.push(`${key} (${entry.path}): recorded ${entry.digest.slice(0, 12)}… != actual ${actual.slice(0, 12)}…`)
    }
  }

  // registry inventory digest (selection-scoped): re-derive the referenced-item
  // set from this flow's OWN SelectionSpec and recompute the digest over only
  // those items, comparing to the recorded digest. A referenced item missing
  // from registry/ is a hard failure (never a silent pass).
  const recordedRegistry = manifest.inputs.registryInventory
  if (selectionSourcePath) {
    let actualRegistryDigest
    try {
      const referenced = referencedRegistryItems(readJson(selectionSourcePath))
      actualRegistryDigest = digestSelectionInventory(registryDir, referenced).digest
    } catch (e) {
      mismatches.push(`registryInventory (${recordedRegistry.path}): ${e.message}`)
    }
    if (actualRegistryDigest !== undefined && actualRegistryDigest !== recordedRegistry.digest) {
      mismatches.push(
        `registryInventory (${recordedRegistry.path}): recorded ${recordedRegistry.digest.slice(0, 12)}… != actual ${actualRegistryDigest.slice(0, 12)}…`,
      )
    }
  }

  if (mismatches.length > 0) {
    return {
      ok: false,
      flowId: manifest.flowId,
      messages: [`${manifestPath}: ${mismatches.length} digest mismatch(es)`, ...mismatches.map((m) => `[DIGEST_MISMATCH] ${m}`)],
    }
  }

  return { ok: true, flowId: manifest.flowId, messages: [] }
}

const manifestArg = opt('--manifest', null)

if (manifestArg) {
  const baseDir = opt('--base-dir', null)
  const manifestPath = existsSync(manifestArg)
    ? manifestArg
    : baseDir && existsSync(join(baseDir, manifestArg))
      ? join(baseDir, manifestArg)
      : docPath(manifestArg)

  const registryDir = opt('--registry-dir', baseDir ? join(baseDir, 'registry') : join(ROOT, 'registry'))
  const overrides = {
    flowSpec: opt('--flow', null),
    selectionSpec: opt('--selection', null),
    buildReport: opt('--build', null),
  }

  const result = validateManifest(manifestPath, { registryDir, overrides, baseDir })
  if (!result.ok) {
    for (const m of result.messages) console.error(`✗ ${m}`)
    process.exit(1)
  }
  console.log(`✓ provenance valid: ${result.flowId}`)
  console.log(`    manifest: ${manifestPath}`)
  process.exit(0)
} else {
  let discovered
  try {
    discovered = discoverFlows()
  } catch (e) {
    if (e instanceof FlowDiscoveryError) {
      console.error(`✗ flow discovery failed: ${e.message}`)
      process.exit(1)
    }
    throw e
  }
  if (discovered.length === 0) {
    console.error('✗ no flow triples discovered under docs/examples/')
    process.exit(1)
  }

  const registryDir = join(ROOT, 'registry')
  let anyFailed = false
  for (const flow of discovered) {
    if (!flow.provenancePath) {
      anyFailed = true
      console.error(`✗ flowId "${flow.flowId}": no provenance sidecar found (expected buildreport-${flow.flowId}.provenance.json). Run 'npm run gen:provenance'.`)
      continue
    }
    const overrides = {
      flowSpec: flow.flowSpecPath,
      selectionSpec: flow.selectionSpecPath,
      buildReport: flow.buildReportPath,
    }
    const result = validateManifest(flow.provenancePath, { registryDir, overrides })
    if (!result.ok) {
      anyFailed = true
      for (const m of result.messages) console.error(`✗ ${m}`)
    } else {
      console.log(`✓ provenance valid: ${result.flowId}`)
      console.log(`    manifest: ${flow.provenancePath}`)
    }
  }
  process.exit(anyFailed ? 1 : 0)
}
