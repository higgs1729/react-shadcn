// Cross-artifact (pipeline) semantic validator for the AI design system.
//
// The single-document validators (scripts/validate-spec.mjs) prove each of a
// FlowSpec / SelectionSpec / BuildReport is individually schema-valid. They do
// NOT catch invalid *combinations*: a SelectionSpec that drops a FlowSpec step,
// a BuildReport whose flowId disagrees with its inputs, a selected registry
// item that does not exist, a `verified` report that still carries a failed
// check, and so on. This validator enforces those cross-document invariants.
//
// It reuses Task 11's strict shared Ajv factory (scripts/lib/ajv.mjs) to first
// confirm each artifact is schema-valid, then runs deterministic, offline,
// non-repairing invariant checks. Every independent violation is reported
// (naming artifact, stepId, and invariant); it never stops after the first.
// Schemas are treated as immutable — all cross-document rules live here.
//
// Run: node scripts/validate-pipeline.mjs
//        [--flow <path|basename>] [--selection <path|basename>] [--build <path|basename>]
//   Each argument is a filesystem path, or a docs/ basename resolved via
//   scripts/lib/paths.mjs. All three default to the current golden artifacts.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { docPath } from './lib/paths.mjs'
import { createContractAjv, getContractValidator, registerContractSchemas } from './lib/ajv.mjs'
import { KNOWN_CHECK_IDS } from './lib/check-registry.mjs'

const ROOT = process.cwd()

// ---- argument resolution -------------------------------------------------
const argv = process.argv.slice(2)
function flagValue(name, fallbackBasename) {
  const i = argv.indexOf(name)
  const raw = i !== -1 ? argv[i + 1] : fallbackBasename
  // A filesystem path wins; otherwise resolve as a docs/ basename.
  return existsSync(raw) ? raw : docPath(raw)
}
const flowPath = flagValue('--flow', 'flowspec-dryrun-01.json')
const selectionPath = flagValue('--selection', 'selectionspec-dryrun-02.json')
const buildPath = flagValue('--build', 'buildreport-dryrun-saas-ops-02.json')

// BOM-tolerant, like scripts/validate-spec.mjs.
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''))

// ---- registry inventory (offline) ----------------------------------------
function loadRegistryItemNames() {
  const dir = join(ROOT, 'registry')
  const names = new Set()
  if (!existsSync(dir)) return names
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue
    try {
      const item = JSON.parse(readFileSync(join(dir, file), 'utf8'))
      if (item && typeof item.name === 'string') names.add(item.name)
    } catch {
      // A malformed registry file is out of scope for this validator; the
      // registry validators own that. Fall back to the filename stem so a
      // parse error here never masks an otherwise-valid selection.
      names.add(file.replace(/\.json$/, ''))
    }
  }
  return names
}

// ---- schema gate ---------------------------------------------------------
const ajv = registerContractSchemas(createContractAjv())
const validators = {
  FlowSpec: getContractValidator(ajv, 'ai-flowspec.schema.json'),
  SelectionSpec: getContractValidator(ajv, 'ai-selectionspec.schema.json'),
  BuildReport: getContractValidator(ajv, 'ai-buildreport.schema.json'),
}

const violations = []
/** Record one independent violation. */
function fail(artifact, stepId, invariant, message) {
  violations.push({ artifact, stepId, invariant, message })
}

function loadArtifact(kind, path) {
  let doc
  try {
    doc = readJson(path)
  } catch (e) {
    console.error(`✗ ${path}: invalid JSON (${e.message})`)
    process.exit(1)
  }
  const validate = validators[kind]
  if (!validate(doc)) {
    console.error(`✗ ${path}: INVALID ${kind} (fix single-document schema errors before pipeline validation)`)
    for (const err of validate.errors) {
      console.error(`    ${err.instancePath || '(root)'} ${err.message}`)
    }
    process.exit(1)
  }
  return doc
}

const flow = loadArtifact('FlowSpec', flowPath)
const selection = loadArtifact('SelectionSpec', selectionPath)
const build = loadArtifact('BuildReport', buildPath)

const registryItems = loadRegistryItemNames()

// ---- invariants ----------------------------------------------------------

// FLOW_ID_MATCH: all three artifacts describe the same flow.
if (selection.flowId !== flow.flowId) {
  fail('SelectionSpec', null, 'FLOW_ID_MATCH', `flowId "${selection.flowId}" != FlowSpec flowId "${flow.flowId}"`)
}
if (build.flowId !== flow.flowId) {
  fail('BuildReport', null, 'FLOW_ID_MATCH', `flowId "${build.flowId}" != FlowSpec flowId "${flow.flowId}"`)
}

const flowStepIds = flow.steps.map((s) => s.stepId)
const flowStepSet = new Set(flowStepIds)

const selectionScreenIds = selection.screens.map((s) => s.stepId)
const selectionUnresolvedIds = (selection.unresolved ?? []).map((u) => u.stepId)
const downstreamIds = [...selectionScreenIds, ...selectionUnresolvedIds]

// STEP_UNIQUE: no stepId appears twice across the SelectionSpec (screens +
// unresolved), and none appears twice among BuildReport screens.
function reportDuplicates(artifact, ids) {
  const seen = new Set()
  const dupes = new Set()
  for (const id of ids) {
    if (seen.has(id)) dupes.add(id)
    seen.add(id)
  }
  for (const id of dupes) {
    fail(artifact, id, 'STEP_UNIQUE', `stepId "${id}" appears more than once in ${artifact}`)
  }
}
reportDuplicates('SelectionSpec', downstreamIds)
reportDuplicates('BuildReport', build.screens.map((s) => s.stepId))

// STEP_COVERAGE: every FlowSpec step appears exactly once downstream (as a
// resolved screen or an unresolved item).
const downstreamCounts = new Map()
for (const id of downstreamIds) downstreamCounts.set(id, (downstreamCounts.get(id) ?? 0) + 1)
for (const id of flowStepIds) {
  const count = downstreamCounts.get(id) ?? 0
  if (count === 0) {
    fail('SelectionSpec', id, 'STEP_COVERAGE', `FlowSpec step "${id}" is neither a resolved screen nor an unresolved item`)
  } else if (count > 1) {
    fail('SelectionSpec', id, 'STEP_COVERAGE', `FlowSpec step "${id}" appears ${count} times downstream (expected exactly once)`)
  }
}

// STEP_UNKNOWN: no downstream stepId that is not a FlowSpec step.
for (const id of new Set(downstreamIds)) {
  if (!flowStepSet.has(id)) {
    fail('SelectionSpec', id, 'STEP_UNKNOWN', `stepId "${id}" is not a FlowSpec step`)
  }
}

// REGISTRY_ITEM_EXISTS: every selected screen pattern and block must exist in
// registry/.
for (const screen of selection.screens) {
  const pattern = screen.screenPattern?.registryItem
  if (pattern && !registryItems.has(pattern)) {
    fail('SelectionSpec', screen.stepId, 'REGISTRY_ITEM_EXISTS', `screen pattern "${pattern}" is not in registry/`)
  }
  for (const block of screen.blocks ?? []) {
    if (block.registryItem && !registryItems.has(block.registryItem)) {
      fail('SelectionSpec', screen.stepId, 'REGISTRY_ITEM_EXISTS', `block "${block.registryItem}" (role ${block.blockRole}) is not in registry/`)
    }
  }
}

// PLANNED_CHECK_KNOWN: every planned check id maps to a runnable check via
// Task 07's check-registry; an unmapped id is a check that can never be honored.
for (const screen of selection.screens) {
  for (const checkId of screen.checksPlanned ?? []) {
    if (!KNOWN_CHECK_IDS.includes(checkId)) {
      fail('SelectionSpec', screen.stepId, 'PLANNED_CHECK_KNOWN', `planned check "${checkId}" is unmapped (known: ${KNOWN_CHECK_IDS.join(', ')})`)
    }
  }
}

// BUILD_SCREEN_MATCH: BuildReport screens must correspond exactly to the
// SelectionSpec's resolved screens, with matching step IDs and routes.
const resolvedSet = new Set(selectionScreenIds)
const buildStepIds = build.screens.map((s) => s.stepId)
const buildSet = new Set(buildStepIds)
for (const id of resolvedSet) {
  if (!buildSet.has(id)) {
    fail('BuildReport', id, 'BUILD_SCREEN_MATCH', `resolved SelectionSpec screen "${id}" has no BuildReport screen`)
  }
}
for (const screen of build.screens) {
  if (!resolvedSet.has(screen.stepId)) {
    fail('BuildReport', screen.stepId, 'BUILD_SCREEN_MATCH', `BuildReport screen "${screen.stepId}" is not a resolved SelectionSpec screen`)
    continue
  }
  const expectedRoute = `/flows/${flow.flowId}/${screen.stepId}`
  if (screen.route !== expectedRoute) {
    fail('BuildReport', screen.stepId, 'BUILD_SCREEN_MATCH', `route "${screen.route}" != expected "${expectedRoute}"`)
  }
}

// BUILD_NOT_UNRESOLVED: an unresolved step must never surface as a built screen.
const unresolvedSet = new Set(selectionUnresolvedIds)
for (const screen of build.screens) {
  if (unresolvedSet.has(screen.stepId) && screen.status === 'built') {
    fail('BuildReport', screen.stepId, 'BUILD_NOT_UNRESOLVED', `unresolved step "${screen.stepId}" is reported as built`)
  }
}

// UNRESOLVED_CARRIED: SelectionSpec unresolved step IDs are carried forward to
// the BuildReport unresolved list, exactly.
const buildUnresolvedSet = new Set(build.unresolved ?? [])
for (const id of unresolvedSet) {
  if (!buildUnresolvedSet.has(id)) {
    fail('BuildReport', id, 'UNRESOLVED_CARRIED', `unresolved step "${id}" was not carried forward to the BuildReport`)
  }
}
for (const id of buildUnresolvedSet) {
  if (!unresolvedSet.has(id)) {
    fail('BuildReport', id, 'UNRESOLVED_CARRIED', `BuildReport lists unresolved step "${id}" that the SelectionSpec did not`)
  }
}

// VERIFIED_CHECKS_PASS: a `verified` report may not carry a failing check, and
// every one of its screens must actually be built (a failed/skipped screen may
// not be represented as successful, verified output).
if (build.status === 'verified') {
  for (const check of build.checks ?? []) {
    if (check.status === 'fail') {
      fail('BuildReport', null, 'VERIFIED_CHECKS_PASS', `status is "verified" but check "${check.name}" failed`)
    }
  }
  for (const screen of build.screens) {
    if (screen.status !== 'built') {
      fail('BuildReport', screen.stepId, 'VERIFIED_CHECKS_PASS', `status is "verified" but screen "${screen.stepId}" status is "${screen.status}"`)
    }
  }
}

// ---- report --------------------------------------------------------------
if (violations.length === 0) {
  console.log(`✓ pipeline valid: ${flow.flowId}`)
  console.log(`    FlowSpec:     ${flowPath}`)
  console.log(`    SelectionSpec: ${selectionPath}`)
  console.log(`    BuildReport:  ${buildPath}`)
  process.exit(0)
}

console.error(`✗ pipeline INVALID: ${violations.length} violation(s)`)
for (const v of violations) {
  const where = v.stepId ? ` step "${v.stepId}"` : ''
  console.error(`    [${v.invariant}] ${v.artifact}${where}: ${v.message}`)
}
process.exit(1)
