// select:candidates — deterministic decision-support for the 20-selection layer.
//
// Given a FlowSpec (path or docs/ basename), PRECOMPUTES, for every step, the
// scores the model needs to make its selection judgments per
// docs/layers/20-selection/ai-pattern-selection-instructions.md:
//   • candidate screenTypes with scores (doc step 1),
//   • screen-pattern candidates for the top screenType with scores + eligibility
//     (doc step 2),
//   • per-required-role block candidates with role-fit scores (doc step 4).
//
// It is OBSERVATION-ONLY decision support, not a gate: it never resolves ties,
// never picks a winner, and always exits 0. The scoring arithmetic lives in
// scripts/lib/selection-scoring.mjs (weights/thresholds cited there); registry
// facets are read via scripts/lib/registry.mjs (meta.aiDesignSystem).
//
// Run: node scripts/select-candidates.mjs [<flowspec path|basename>]
//   Defaults to flowspec-dryrun-saas-ops-01.json. Emits machine-readable JSON on
//   stdout.
import { existsSync, readFileSync } from 'node:fs'
import { docPath, readDoc } from './lib/paths.mjs'
import { loadRegistryFacets, screenPatternsFor, blockPatternsFor } from './lib/registry.mjs'
import {
  scoreAllScreenTypes,
  scoreScreenType,
  scoreScreenPattern,
  isScreenPatternEligible,
  scoreBlockRoleFit,
  round2,
  REJECT_THRESHOLD,
  NEAR_TIE_MARGIN,
} from './lib/selection-scoring.mjs'

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''))

function resolveFlowSpec(arg) {
  const raw = arg ?? 'flowspec-dryrun-saas-ops-01.json'
  return existsSync(raw) ? raw : docPath(raw)
}

function main() {
  const flowPath = resolveFlowSpec(process.argv[2])
  const flow = readJson(flowPath)
  const profiles = readDoc('ai-canonical-profiles.json')
  const screenTypeProfiles = profiles.screenTypes
  const blockRoleProfiles = profiles.blockRoles
  const registry = loadRegistryFacets()

  const steps = (flow.steps ?? []).map((step) => {
    // Doc step 1: score every canonical screen profile.
    const screenTypeCandidates = scoreAllScreenTypes(step, screenTypeProfiles)
    const topScore = screenTypeCandidates[0]?.score ?? 0
    const nearTie = screenTypeCandidates.filter((c) => topScore - c.score < NEAR_TIE_MARGIN)
    const topScreenType = screenTypeCandidates[0]?.screenType ?? null

    // Doc step 2: score screen-pattern items for the top screenType.
    const screenPatternCandidates = screenPatternsFor(registry, topScreenType)
      .map(([registryItem, facets]) => {
        const { eligible, missingStates } = isScreenPatternEligible(step, facets)
        return {
          registryItem,
          score: scoreScreenPattern(step, facets),
          eligible,
          missingStates,
          aboveThreshold: scoreScreenPattern(step, facets) >= REJECT_THRESHOLD,
        }
      })
      .sort((a, b) => b.score - a.score)

    // Doc step 3+4: required roles come from the top eligible pattern's
    // composition.requiredBlocks (structural, never raw facets). Precompute
    // block role-fit candidates for each required role.
    const topPattern = screenPatternCandidates.find((c) => c.eligible) ?? screenPatternCandidates[0]
    const topPatternFacets = topPattern ? registry.get(topPattern.registryItem) : null
    const requiredRoles = topPatternFacets?.composition?.requiredBlocks ?? []
    const blockCandidatesByRole = requiredRoles.map((role) => {
      const roleProfile = blockRoleProfiles[role]
      const candidates = roleProfile
        ? blockPatternsFor(registry, role)
            .map(([registryItem, facets]) => {
              const score = scoreBlockRoleFit(step, facets, roleProfile)
              return { registryItem, score, aboveThreshold: score >= REJECT_THRESHOLD }
            })
            .sort((a, b) => b.score - a.score)
        : []
      return { blockRole: role, candidates }
    })

    return {
      stepId: step.stepId,
      screenTypeCandidates,
      topScreenType,
      nearTie: nearTie.length > 1 ? nearTie.map((c) => c.screenType) : [],
      screenPatternCandidates,
      requiredRolesFrom: topPattern?.registryItem ?? null,
      blockCandidatesByRole,
    }
  })

  const output = {
    flowId: flow.flowId,
    flowSpecPath: flowPath,
    rejectThreshold: REJECT_THRESHOLD,
    nearTieMargin: NEAR_TIE_MARGIN,
    note: 'Decision support only: scores precomputed per ai-pattern-selection-instructions.md. The model owns screenType resolution, tie-breaking, rejected alternatives, assumptions, and self-review.',
    steps,
  }
  process.stdout.write(JSON.stringify(output, null, 2) + '\n')
  process.exit(0)
}

main()
