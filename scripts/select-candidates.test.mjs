// Reproduction test for scripts/lib/selection-scoring.mjs: the deterministic
// scorer must reproduce the scores recorded in BOTH golden SelectionSpecs
// (docs/examples/selectionspec-dryrun-saas-ops-01.json and
// selectionspec-studio-portfolio-01.json), within the doc's 2-decimal rounding.
//
// For each golden screen it re-derives, from the FlowSpec step + canonical
// profiles + registry facets, the recorded screenTypeScore (doc step 1), the
// chosen screen-pattern score (doc step 2), and every block's role-fit score
// (doc step 4), and asserts equality. A mismatch is a scorer bug, not a reason
// to edit the golden files or the doc.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { readDoc } from './lib/paths.mjs'
import { loadRegistryFacets } from './lib/registry.mjs'
import {
  scoreScreenType,
  scoreScreenPattern,
  scoreBlockRoleFit,
  round2,
} from './lib/selection-scoring.mjs'

const CASES = [
  { selection: 'selectionspec-dryrun-saas-ops-01.json', flow: 'flowspec-dryrun-saas-ops-01.json' },
  { selection: 'selectionspec-studio-portfolio-01.json', flow: 'flowspec-studio-portfolio-01.json' },
]

const profiles = readDoc('ai-canonical-profiles.json')
const screenTypeProfiles = profiles.screenTypes
const blockRoleProfiles = profiles.blockRoles
const registry = loadRegistryFacets()

// The golden SelectionSpecs live in docs/examples/ and were produced against the
// co-located FlowSpec there; that basename is also present under
// docs/layers/10-upstream/, so resolve the FlowSpec from docs/examples/ directly
// rather than by (ambiguous) basename.
const EXAMPLES = join(process.cwd(), 'docs', 'examples')
const readExample = (name) => JSON.parse(readFileSync(join(EXAMPLES, name), 'utf8').replace(/^﻿/, ''))

const failures = []
let checks = 0

function expect(label, actual, expected) {
  checks++
  if (round2(actual) !== round2(expected)) {
    failures.push(`${label}: computed ${round2(actual)} != recorded ${expected}`)
  }
}

for (const { selection, flow } of CASES) {
  const spec = readExample(selection)
  const flowSpec = readExample(flow)
  const stepsById = new Map(flowSpec.steps.map((s) => [s.stepId, s]))

  for (const screen of spec.screens) {
    const step = stepsById.get(screen.stepId)
    if (!step) {
      failures.push(`${selection} ${screen.stepId}: no matching FlowSpec step`)
      continue
    }
    const tag = `${selection} step "${screen.stepId}"`

    // 1. screenType score (doc step 1).
    if (typeof screen.screenTypeScore === 'number') {
      const profile = screenTypeProfiles[screen.resolvedScreenType]
      if (!profile) {
        failures.push(`${tag}: unknown resolvedScreenType "${screen.resolvedScreenType}"`)
      } else {
        expect(`${tag} screenTypeScore(${screen.resolvedScreenType})`, scoreScreenType(step, profile), screen.screenTypeScore)
      }
    }

    // 2. screen-pattern score (doc step 2).
    const patternItem = screen.screenPattern?.registryItem
    const patternFacets = registry.get(patternItem)
    if (patternFacets == null) {
      failures.push(`${tag}: screen pattern "${patternItem}" missing from registry facets`)
    } else if (typeof screen.screenPattern.score === 'number') {
      expect(`${tag} screenPattern(${patternItem})`, scoreScreenPattern(step, patternFacets), screen.screenPattern.score)
    }

    // 3. block role-fit scores (doc step 4).
    for (const block of screen.blocks ?? []) {
      const facets = registry.get(block.registryItem)
      const roleProfile = blockRoleProfiles[block.blockRole]
      if (facets == null) {
        failures.push(`${tag}: block "${block.registryItem}" missing from registry facets`)
      } else if (!roleProfile) {
        failures.push(`${tag}: unknown blockRole "${block.blockRole}"`)
      } else if (typeof block.score === 'number') {
        expect(`${tag} block ${block.blockRole}(${block.registryItem})`, scoreBlockRoleFit(step, facets, roleProfile), block.score)
      }
    }
  }
}

if (failures.length > 0) {
  console.error(`✗ selection-scoring reproduction FAILED: ${failures.length}/${checks} check(s) mismatched`)
  for (const f of failures) console.error(`    ${f}`)
  process.exit(1)
}
console.log(`✓ selection-scoring reproduces both golden SelectionSpecs (${checks} score checks across ${CASES.length} flows)`)
process.exit(0)
