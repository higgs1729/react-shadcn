// Deterministic selection scoring — a faithful, offline implementation of the
// scoring arithmetic in docs/layers/20-selection/ai-pattern-selection-instructions.md
// (the "doc"). This module ONLY precomputes scores; screenType resolution,
// tie-breaking, rejected-alternative recording, and the self-review loop remain
// the model's judgment (doc "Procedure Per Step" step 1 tie-break, and
// "Self-Review Before Emitting"). Weights, thresholds, and tie-breaks are the
// doc's; none are invented here.
//
// ── Weight / threshold citations ────────────────────────────────────────────
// 1. screenType resolution (doc step 1):
//      score(step,S) = 40*C_intent + 20*C_shape + 15*C_interaction + 25*C_stage
//      C_x = |step.x ∩ S.x| / |step.x|  (coverage of the STEP's facets by the
//      profile). "If the step omits an axis, redistribute its points
//      proportionally across the other axes" — implemented by scaling the
//      present axes' weights up to sum to 100. Near-tie (<8) tie-breaking is the
//      model's job, not this module's.
// 2. screen-pattern scoring (doc step 2):
//      Intent 25 / DataShape 15 / Interaction 15 / State 15 / A11y 10 /
//      Dependency 10 / Evidence 10 (reject below 70). Intent/DataShape/
//      Interaction/State use STEP-relative coverage |step.x ∩ item.x| / |step.x|
//      (per the golden $comment: "|step.x ∩ item.x|/|step.x| as specified").
// 3. block role-fit scoring (doc step 4):
//      intents 25*K_intent + dataShapes 15*K_shape + interactions 15*K_interaction
//      (consistency coverage K_x = |item.x ∩ roleProfile.x| / |item.x|), plus
//      step-driven: required-state coverage 15, accessibility 10, dependency fit
//      10, evidence 10 (reject below 70).
//
// ── Documented assumptions where the doc is underspecified ───────────────────
// (mirrors what validate-pipeline.mjs and BOTH golden SelectionSpecs encode):
//  A. Evidence tier → points: confidence high=10, medium=5, low=0. This scale is
//     stated verbatim in selectionspec-dryrun-saas-ops-01.json (high=10, medium=5)
//     and selectionspec-studio-portfolio-01.json (low-confidence → evidence=0).
//  B. Block-level State (15) is NOT penalized for a step's non-'default'
//     requiredStates: both golden specs record that loading/empty/error are
//     rendered at the screen-pattern COMPOSITION level (skeleton/empty/alert
//     regions), so a block that renders 'default' scores the full 15. Eligibility
//     for those states is gated at the screen-pattern level (doc step 2 drop
//     rule / State-inventory model), not re-penalized per block.
//  C. Dependency fit (10) is full when the item declares dependencies; doc step 2
//     only *drops* items with MISSING registryDependencies, so a present-deps
//     item earns the full 10. No golden item is deps-missing.
//  D. Accessibility (10) = coverage of the step's truthy accessibilityConstraints
//     keys by the item's accessibility facet (all-satisfied → 10). The doc names
//     the weight but not the sub-formula; coverage matches every golden score.
export const REJECT_THRESHOLD = 70
export const NEAR_TIE_MARGIN = 8

const EVIDENCE_POINTS = { high: 10, medium: 5, low: 0 }

const asArray = (x) => (Array.isArray(x) ? x : [])
const intersectionSize = (a, b) => {
  const setB = new Set(b)
  let n = 0
  for (const v of new Set(a)) if (setB.has(v)) n++
  return n
}
/** Coverage |base ∩ other| / |base|; an empty base contributes no signal (0). */
const coverage = (base, other) => {
  const b = asArray(base)
  if (b.length === 0) return 0
  return intersectionSize(b, other) / b.length
}
/** Round to 2 decimals, matching the golden SelectionSpecs' recorded precision. */
export const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100

function evidencePoints(facets) {
  return EVIDENCE_POINTS[facets?.evidence?.confidence] ?? 0
}

function dependencyPoints(facets) {
  // Doc step 2 drops items with MISSING registryDependencies; a present-deps
  // item earns the full 10 (assumption C).
  const deps = facets?.dependencies?.shadcn
  return Array.isArray(deps) && deps.length > 0 ? 10 : 0
}

function accessibilityPoints(step, facets) {
  // Assumption D: coverage of the step's truthy a11y constraints by the item.
  const constraints = step?.accessibilityConstraints ?? {}
  const requiredKeys = Object.keys(constraints).filter((k) => constraints[k] === true)
  if (requiredKeys.length === 0) return 10
  const acc = facets?.accessibility ?? {}
  const covered = requiredKeys.filter((k) => acc[k] === true).length
  return 10 * (covered / requiredKeys.length)
}

// ── 1. screenType resolution (doc step 1) ────────────────────────────────────
const SCREENTYPE_AXES = [
  { key: 'userIntents', weight: 40 },
  { key: 'dataShapes', weight: 20 },
  { key: 'interactionModels', weight: 15 },
  { key: 'jobMapStages', weight: 25 },
]

/** score(step, profile) for one canonical screen profile. Returns a number. */
export function scoreScreenType(step, profile) {
  const present = SCREENTYPE_AXES.filter((a) => asArray(step[a.key]).length > 0)
  if (present.length === 0) return 0
  const presentWeight = present.reduce((s, a) => s + a.weight, 0)
  // Redistribute omitted axes' points proportionally across the present axes by
  // scaling present weights up to sum to 100 (doc step 1).
  const scale = 100 / presentWeight
  let score = 0
  for (const axis of present) {
    const c = coverage(step[axis.key], profile[axis.key])
    score += axis.weight * scale * c
  }
  return score
}

/** Score every canonical profile; returns [{screenType, score}] sorted desc. */
export function scoreAllScreenTypes(step, screenTypeProfiles) {
  const rows = Object.entries(screenTypeProfiles).map(([screenType, profile]) => ({
    screenType,
    score: round2(scoreScreenType(step, profile)),
  }))
  rows.sort((a, b) => b.score - a.score)
  return rows
}

// ── 2. screen-pattern scoring (doc step 2) ───────────────────────────────────
/** Score one screen-pattern registry item against a FlowSpec step. */
export function scoreScreenPattern(step, itemFacets) {
  const intent = 25 * coverage(step.userIntents, itemFacets.userIntents)
  const shape = 15 * coverage(step.dataShapes, itemFacets.dataShapes)
  const interaction = 15 * coverage(step.interactionModels, itemFacets.interactionModels)
  // State: |step.requiredStates ∩ item.stateCoverage| / |step.requiredStates|.
  // Full when the item is eligible (covers every required state); eligibility is
  // gated by isScreenPatternEligible below (doc step 2 drop rule).
  const state = 15 * coverage(step.requiredStates, itemFacets.stateCoverage)
  const a11y = accessibilityPoints(step, itemFacets)
  const dependency = dependencyPoints(itemFacets)
  const evidence = evidencePoints(itemFacets)
  return round2(intent + shape + interaction + state + a11y + dependency + evidence)
}

/**
 * Doc step 2 drop rule: a screen pattern is ineligible if any FlowSpec
 * requiredStates value is absent from its stateCoverage (State-inventory model).
 */
export function isScreenPatternEligible(step, itemFacets) {
  const required = asArray(step.requiredStates)
  const covered = new Set(asArray(itemFacets.stateCoverage))
  const missingStates = required.filter((s) => !covered.has(s))
  return { eligible: missingStates.length === 0, missingStates }
}

// ── 3. block role-fit scoring (doc step 4) ───────────────────────────────────
/**
 * Role-fit score for one block-pattern item. Content axes are scored against the
 * ROLE's canonical profile (a block's vocation is its role, not the page intent),
 * using consistency coverage K_x = |item.x ∩ roleProfile.x| / |item.x|. State,
 * a11y, dependency, evidence are step-driven (assumptions B–D).
 */
export function scoreBlockRoleFit(step, itemFacets, roleProfile) {
  const intent = 25 * coverage(itemFacets.userIntents, roleProfile.userIntents)
  const shape = 15 * coverage(itemFacets.dataShapes, roleProfile.dataShapes)
  const interaction = 15 * coverage(itemFacets.interactionModels, roleProfile.interactionModels)
  // State (15): block-level state is not penalized for composition-level states
  // (assumption B). A block that renders 'default' earns the full 15.
  const coversDefault = asArray(itemFacets.stateCoverage).includes('default')
  const state = coversDefault ? 15 : 0
  const a11y = accessibilityPoints(step, itemFacets)
  const dependency = dependencyPoints(itemFacets)
  const evidence = evidencePoints(itemFacets)
  return round2(intent + shape + interaction + state + a11y + dependency + evidence)
}
