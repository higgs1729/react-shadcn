// Generates the per-step Next.js route wrappers for a flow's RESOLVED steps
// from its SelectionSpec (+ BuildReport for the resolved/unresolved split),
// writing app/(system)/flows/<flowId>/<stepId>/page.tsx for each resolved step.
//
// Convention reproduced (see app/(system)/flows/studio-portfolio-01/* and
// app/(system)/flows/dryrun-saas-ops-01/*):
//   - multi-state steps (stateCoveragePlan length > 1) are Client Components that
//     read `?state=` via useSearchParams inside a <Suspense> boundary and wrap the
//     shared app/<pattern>/<pattern>-screen.tsx (per Next.js useSearchParams docs,
//     which require a Suspense boundary around the hook);
//   - single-state steps (stateCoveragePlan === ["default"]) render the screen
//     directly as a Server Component with a fixed state prop.
// The screen module path and its exported <Name>Screen component + <Name>State
// type are resolved from the chosen screenPattern's registry item, never
// hardcoded, so registry items whose screen dir differs from their name (e.g.
// collection-table-01 -> app/collection-01/collection-screen.tsx exporting
// CollectionTableScreen + CollectionState) map correctly.
//
// Regeneration is idempotent: output is a pure function of the specs, so a file
// is only rewritten when its bytes actually change.
//
// Run: node scripts/gen-flow-routes.mjs <flowId> [--check]
//   --check exits non-zero if any route would change (no writes); for CI/idempotence.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { readDoc } from './lib/paths.mjs'
import { createContractAjv, getContractValidator, registerContractSchemas } from './lib/ajv.mjs'

const ROOT = process.cwd()

const args = process.argv.slice(2)
const check = args.includes('--check')
const flowId = args.find((a) => !a.startsWith('--'))

if (!flowId) {
  console.error('Usage: node scripts/gen-flow-routes.mjs <flowId> [--check]')
  process.exit(1)
}

/** Load + validate the SelectionSpec; validate the BuildReport shape leniently. */
function loadSpecs(id) {
  const ajv = registerContractSchemas(createContractAjv())
  const validateSelection = getContractValidator(ajv, 'ai-selectionspec.schema.json')
  const selection = readDoc(`selectionspec-${id}.json`)
  if (!validateSelection(selection)) {
    console.error(`✗ selectionspec-${id}.json: INVALID SelectionSpec`)
    for (const err of validateSelection.errors) {
      console.error(`    ${err.instancePath || '(root)'} ${err.message}`)
    }
    process.exit(1)
  }
  let build = null
  try {
    build = readDoc(`buildreport-${id}.json`)
  } catch {
    // BuildReport is only needed for the resolved/unresolved split; the
    // SelectionSpec already carries its own `unresolved` list, so a missing
    // BuildReport is not fatal.
  }
  return { selection, build }
}

/** kebab-case -> PascalCase (ai-assistant -> AiAssistant). */
function pascal(kebab) {
  return kebab
    .split('-')
    .filter(Boolean)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join('')
}

/**
 * Resolve the shared screen module for a screenPattern registry item:
 * its import path (no extension) and the exact exported <X>Screen component
 * and <X>State type names, read from the source file. The screen file path is
 * discovered from the registry item's own `files[]` and
 * `meta.aiDesignSystem.extensions.localEvidence` (the sole app-dir screen file
 * matching the `-screen.tsx` suffix) rather than derived from the item name.
 */
function resolveScreenModule(registryItem) {
  const itemPath = join(ROOT, 'registry', `${registryItem}.json`)
  const item = JSON.parse(readFileSync(itemPath, 'utf8'))
  const candidates = [
    ...(item.files ?? []).map((f) => f.path),
    ...(item.meta?.aiDesignSystem?.extensions?.localEvidence ?? []),
  ].filter((p) => typeof p === 'string')
  const screenPath = candidates.find((p) => /^app\/.*-screen\.tsx$/.test(p))
  if (!screenPath) {
    throw new Error(`${registryItem}: no app/**/*-screen.tsx file found in registry entry`)
  }
  const src = readFileSync(join(ROOT, screenPath), 'utf8')
  const comp = src.match(/export\s+function\s+(\w+Screen)\b/)
  const stateType = src.match(/export\s+type\s+(\w+State)\b/)
  if (!comp) throw new Error(`${screenPath}: no exported <Name>Screen component`)
  if (!stateType) throw new Error(`${screenPath}: no exported <Name>State type`)
  return {
    importPath: `@/${screenPath.replace(/\.tsx$/, '')}`,
    component: comp[1],
    stateType: stateType[1],
  }
}

/** Render a single-state (Server Component) route. */
function singleStateRoute({ stepId, mod, state, id }) {
  const page = `${pascal(stepId)}Page`
  return `import { ${mod.component} } from "${mod.importPath}"

// ${stepId}'s stateCoveragePlan is [default] only (selectionspec-${id}.json);
// no \`?state=\` switching is planned for this step.
export default function ${page}() {
  return <${mod.component} state="${state}" />
}
`
}

/** Render a multi-state (Client Component + Suspense + ?state=) route. */
function multiStateRoute({ stepId, mod, states }) {
  const name = pascal(stepId)
  const quoted = states.map((s) => `"${s}"`).join(', ')
  const comment = states.join(', ')
  const fallback = states.includes('loading') ? 'loading' : 'default'
  return `"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { ${mod.component}, type ${mod.stateType} } from "${mod.importPath}"

// ${stepId}'s stateCoveragePlan is [${comment}], reachable via \`?state=\`.
const STATES: readonly ${mod.stateType}[] = [${quoted}]

function resolveState(raw: string | null): ${mod.stateType} {
  return STATES.includes(raw as ${mod.stateType}) ? (raw as ${mod.stateType}) : "default"
}

function ${name}StateReader() {
  const state = resolveState(useSearchParams().get("state"))
  return <${mod.component} state={state} />
}

export default function ${name}Page() {
  return (
    <React.Suspense fallback={<${mod.component} state="${fallback}" />}>
      <${name}StateReader />
    </React.Suspense>
  )
}
`
}

function routeSource({ stepId, screenPattern, stateCoveragePlan, id }) {
  const mod = resolveScreenModule(screenPattern.registryItem)
  const states = stateCoveragePlan ?? ['default']
  const singleState = states.length === 1
  return singleState
    ? singleStateRoute({ stepId, mod, state: states[0], id })
    : multiStateRoute({ stepId, mod, states })
}

const { selection, build } = loadSpecs(flowId)

// A step is RESOLVED iff it has a chosen screenPattern in the SelectionSpec and
// is not listed as unresolved by either the SelectionSpec or the BuildReport.
const unresolvedIds = new Set([
  ...(selection.unresolved ?? []).map((u) => u.stepId ?? u),
  ...((build?.unresolved ?? []).map((u) => u.stepId ?? u)),
])

const resolvedScreens = (selection.screens ?? []).filter(
  (s) => s.screenPattern?.registryItem && !unresolvedIds.has(s.stepId),
)

let written = 0
let unchanged = 0
const changed = []

for (const screen of resolvedScreens) {
  const source = routeSource({
    stepId: screen.stepId,
    screenPattern: screen.screenPattern,
    stateCoveragePlan: screen.stateCoveragePlan,
    id: flowId,
  })
  const dir = join(ROOT, 'app', '(system)', 'flows', flowId, screen.stepId)
  const outPath = join(dir, 'page.tsx')
  const prior = existsSync(outPath) ? readFileSync(outPath, 'utf8') : null
  if (prior === source) {
    unchanged++
    continue
  }
  changed.push(`app/(system)/flows/${flowId}/${screen.stepId}/page.tsx`)
  if (!check) {
    mkdirSync(dir, { recursive: true })
    writeFileSync(outPath, source)
    written++
  }
}

console.log(
  `Flow ${flowId}: ${resolvedScreens.length} resolved step(s), ` +
    `${unresolvedIds.size} unresolved (no route).`,
)

if (check) {
  if (changed.length) {
    console.error(`✗ ${changed.length} route(s) would change:`)
    for (const c of changed) console.error(`    ${c}`)
    process.exit(1)
  }
  console.log('✓ All routes up to date (idempotent).')
} else {
  console.log(`Wrote ${written} route file(s), ${unchanged} already up to date.`)
}
