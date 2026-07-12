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
//   scripts/lib/paths.mjs. Passing any of the three validates exactly that one
//   triple (missing ones fall back to the golden dryrun-saas-ops-01 artifacts).
//   With none given, every flow triple discovered under docs/examples/ (see
//   scripts/lib/flows.mjs) is validated; any failure in any flow is non-zero.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { docPath } from './lib/paths.mjs'
import { createContractAjv, getContractValidator, registerContractSchemas } from './lib/ajv.mjs'
import { KNOWN_CHECK_IDS } from './lib/check-registry.mjs'
import { discoverFlows, FlowDiscoveryError } from './lib/flows.mjs'

const ROOT = process.cwd()

// ---- argument resolution -------------------------------------------------
const argv = process.argv.slice(2)
function flagValue(name, fallbackBasename) {
  const i = argv.indexOf(name)
  const raw = i !== -1 ? argv[i + 1] : fallbackBasename
  // A filesystem path wins; otherwise resolve as a docs/ basename.
  return existsSync(raw) ? raw : docPath(raw)
}
const hasExplicitArgs = argv.includes('--flow') || argv.includes('--selection') || argv.includes('--build')

// BOM-tolerant, like scripts/validate-spec.mjs.
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''))

// ---- registry inventory (offline) ----------------------------------------
// Returns a Map<itemName, facets> where facets is the item's
// `meta.aiDesignSystem` object (or null when unavailable). A missing name
// field is skipped, matching the prior name-only loader's behavior; only a
// JSON parse error falls back to a name-only entry (facets: null) so a
// malformed registry file never masks an otherwise-valid selection (the
// registry validators own malformed-file diagnostics, not this one).
function loadRegistryItems() {
  const dir = join(ROOT, 'registry')
  const items = new Map()
  if (!existsSync(dir)) return items
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue
    try {
      const item = JSON.parse(readFileSync(join(dir, file), 'utf8'))
      if (item && typeof item.name === 'string') {
        items.set(item.name, item.meta?.aiDesignSystem ?? null)
      }
    } catch {
      items.set(file.replace(/\.json$/, ''), null)
    }
  }
  return items
}

// ---- schema gate ---------------------------------------------------------
const ajv = registerContractSchemas(createContractAjv())
const validators = {
  FlowSpec: getContractValidator(ajv, 'ai-flowspec.schema.json'),
  SelectionSpec: getContractValidator(ajv, 'ai-selectionspec.schema.json'),
  BuildReport: getContractValidator(ajv, 'ai-buildreport.schema.json'),
}

const registryItems = loadRegistryItems()

/** Validate one FlowSpec/SelectionSpec/BuildReport triple. Never exits. */
function validateTriple(flowPath, selectionPath, buildPath) {
  const violations = []
  function fail(artifact, stepId, invariant, message) {
    violations.push({ artifact, stepId, invariant, message })
  }

  function loadArtifact(kind, path) {
    let doc
    try {
      doc = readJson(path)
    } catch (e) {
      fail(kind, null, 'SCHEMA', `${path}: invalid JSON (${e.message})`)
      return null
    }
    const validate = validators[kind]
    if (!validate(doc)) {
      const details = validate.errors.map((err) => `${err.instancePath || '(root)'} ${err.message}`).join('; ')
      fail(kind, null, 'SCHEMA', `${path}: INVALID ${kind} (fix single-document schema errors first): ${details}`)
      return null
    }
    return doc
  }

  const flow = loadArtifact('FlowSpec', flowPath)
  const selection = loadArtifact('SelectionSpec', selectionPath)
  const build = loadArtifact('BuildReport', buildPath)
  if (!flow || !selection || !build) {
    return { ok: false, violations, flowId: build?.flowId ?? flow?.flowId ?? null }
  }

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

  // ---- facet-aware registry-selection semantic invariants (RFC 009) -------
  // A selected registry item can exist by name yet be the wrong *kind* of
  // thing for its slot: a block-pattern used as a screen pattern, a role
  // mismatch, missing required composition, or an undeclared dependency. All
  // five checks below are skipped for an item that's absent from the
  // registry (REGISTRY_ITEM_EXISTS already reports that) or whose facets
  // failed to parse/are missing (facets === null).
  for (const screen of selection.screens) {
    const patternName = screen.screenPattern?.registryItem
    const patternFacets = registryItems.has(patternName) ? registryItems.get(patternName) : undefined
    const hasPatternFacets = patternFacets != null

    if (hasPatternFacets) {
      // ASSET_KIND_MATCH (screen pattern side): the selected screen pattern
      // must actually be a screen-pattern item, not a block-pattern.
      if (patternFacets.assetKind !== 'screen-pattern') {
        fail(
          'SelectionSpec',
          screen.stepId,
          'ASSET_KIND_MATCH',
          `screen pattern "${patternName}" has assetKind "${patternFacets.assetKind}" (expected "screen-pattern")`,
        )
      }
      // SCREENTYPE_MATCH: the pattern's declared screenType must agree with
      // what the selection layer resolved for this screen.
      if (patternFacets.screenType !== screen.resolvedScreenType) {
        fail(
          'SelectionSpec',
          screen.stepId,
          'SCREENTYPE_MATCH',
          `screen pattern "${patternName}" screenType "${patternFacets.screenType}" != resolvedScreenType "${screen.resolvedScreenType}"`,
        )
      }
    }

    const blocks = screen.blocks ?? []
    const blockFacetsList = blocks.map((block) => ({
      block,
      facets: registryItems.has(block.registryItem) ? registryItems.get(block.registryItem) : undefined,
    }))

    for (const { block, facets } of blockFacetsList) {
      if (facets == null) continue
      // ASSET_KIND_MATCH (block side): every selected block must actually be
      // a block-pattern item, not a screen-pattern.
      if (facets.assetKind !== 'block-pattern') {
        fail(
          'SelectionSpec',
          screen.stepId,
          'ASSET_KIND_MATCH',
          `block "${block.registryItem}" (role ${block.blockRole}) has assetKind "${facets.assetKind}" (expected "block-pattern")`,
        )
      }
      // BLOCK_ROLE_MATCH: the item's declared blockRole must match the role
      // the SelectionSpec assigned it to.
      if (facets.blockRole !== block.blockRole) {
        fail(
          'SelectionSpec',
          screen.stepId,
          'BLOCK_ROLE_MATCH',
          `block "${block.registryItem}" facet blockRole "${facets.blockRole}" != selected role "${block.blockRole}"`,
        )
      }
    }

    // REQUIRED_BLOCKS_COVERED: no blockRole selected twice, and every role the
    // screen pattern's composition.requiredBlocks demands is present.
    const roleCounts = new Map()
    for (const block of blocks) {
      roleCounts.set(block.blockRole, (roleCounts.get(block.blockRole) ?? 0) + 1)
    }
    for (const [role, count] of roleCounts) {
      if (count > 1) {
        fail(
          'SelectionSpec',
          screen.stepId,
          'REQUIRED_BLOCKS_COVERED',
          `blockRole "${role}" is selected ${count} times (expected at most once)`,
        )
      }
    }
    if (hasPatternFacets) {
      const requiredBlocks = patternFacets.composition?.requiredBlocks ?? []
      for (const role of requiredBlocks) {
        if (!roleCounts.has(role)) {
          fail(
            'SelectionSpec',
            screen.stepId,
            'REQUIRED_BLOCKS_COVERED',
            `required block role "${role}" (from screen pattern "${patternName}") is not among selected blocks`,
          )
        }
      }
    }

    // DEPENDENCY_UNION: the union of dependencies.shadcn across the selected
    // screen pattern and blocks must all be present in registryDependencies.
    // Extra entries in registryDependencies are allowed.
    const depUnion = new Set()
    if (hasPatternFacets) {
      for (const dep of patternFacets.dependencies?.shadcn ?? []) depUnion.add(dep)
    }
    for (const { facets } of blockFacetsList) {
      if (facets == null) continue
      for (const dep of facets.dependencies?.shadcn ?? []) depUnion.add(dep)
    }
    const declaredDeps = new Set(screen.registryDependencies ?? [])
    for (const dep of depUnion) {
      if (!declaredDeps.has(dep)) {
        fail(
          'SelectionSpec',
          screen.stepId,
          'DEPENDENCY_UNION',
          `dependency "${dep}" (required by the selected pattern/blocks) is missing from registryDependencies`,
        )
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

  return { ok: violations.length === 0, violations, flowId: flow.flowId }
}

// ---- triples to validate ---------------------------------------------------
let triples
if (hasExplicitArgs) {
  triples = [
    {
      flowPath: flagValue('--flow', 'flowspec-dryrun-saas-ops-01.json'),
      selectionPath: flagValue('--selection', 'selectionspec-dryrun-saas-ops-01.json'),
      buildPath: flagValue('--build', 'buildreport-dryrun-saas-ops-01.json'),
    },
  ]
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
  triples = discovered.map((f) => ({
    flowPath: f.flowSpecPath,
    selectionPath: f.selectionSpecPath,
    buildPath: f.buildReportPath,
  }))
}

// ---- report ----------------------------------------------------------------
let anyFailed = false
for (const { flowPath, selectionPath, buildPath } of triples) {
  const result = validateTriple(flowPath, selectionPath, buildPath)
  if (result.ok) {
    console.log(`✓ pipeline valid: ${result.flowId}`)
    console.log(`    FlowSpec:      ${flowPath}`)
    console.log(`    SelectionSpec: ${selectionPath}`)
    console.log(`    BuildReport:   ${buildPath}`)
  } else {
    anyFailed = true
    console.error(`✗ pipeline INVALID: ${result.flowId ?? '(unknown flowId)'}: ${result.violations.length} violation(s)`)
    for (const v of result.violations) {
      const where = v.stepId ? ` step "${v.stepId}"` : ''
      console.error(`    [${v.invariant}] ${v.artifact}${where}: ${v.message}`)
    }
  }
}

process.exit(anyFailed ? 1 : 0)
