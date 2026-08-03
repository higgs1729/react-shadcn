# Task 23: Extract deterministic selection scoring into a script

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Move the deterministic parts of the 20-selection procedure — facet matching and score
computation against the canonical profiles — into a Node script, so selection executors
compute candidate scores mechanically instead of by hand. The script must faithfully
implement the authoritative doc; it must not change scoring weights, thresholds, or
tie-breaking.

## Context

- Authoritative, PROTECTED procedure: `docs/layers/20-selection/ai-pattern-selection-instructions.md`
  (scoring formula, thresholds, tie-breaking, per-step procedure). READ-ONLY — implement it,
  do not edit it.
- Inputs: a FlowSpec step's facets, the canonical profiles
  `docs/layers/20-selection/ai-canonical-profiles.json`, and registry items' facets at
  `meta.aiDesignSystem`. Facet vocabulary: `docs/contracts/ai-design-facets.schema.json`.
- Precedent: `scripts/validate-pipeline.mjs` already reads registry facets in a script for
  semantic checks — mirror its registry-reading approach and put shared readers in
  `scripts/lib/`.
- The AI still owns the judgment: resolving each step's `screenType`, tie-breaking equal
  scores, recording rejected alternatives and assumptions, and the self-review loop. The
  script only PRECOMPUTES scores to feed those judgments.
- Golden SelectionSpecs to check against: `docs/examples/selectionspec-dryrun-saas-ops-01.json`
  and `docs/examples/selectionspec-studio-portfolio-01.json` (they record per-candidate
  scores). Coordinator has already added npm scripts `select:candidates` and
  `test:select-candidates`.

## Requirements

1. Add `scripts/select-candidates.mjs` (+ shared readers in `scripts/lib/` as needed) that,
   given a FlowSpec (path or basename), outputs for each step: candidate `screenType`s with
   scores, chosen-pattern candidates per `screenType` with scores, and per-required-role
   block candidates with scores — computed by the doc's formula. Output machine-readable
   JSON; observation-only (always exit 0; it is decision support, not a gate).
2. The scoring MUST match the doc exactly. Cite the doc section for each weight/threshold in
   a header comment. Do not invent weights; where the doc is ambiguous, mirror what
   `validate-pipeline.mjs` and the existing golden SelectionSpecs already encode, and record
   the assumption in the report.
3. Add `scripts/select-candidates.test.mjs` asserting the script reproduces the scores
   recorded in BOTH golden SelectionSpecs (within the doc's rounding). Document any deviation
   the doc leaves genuinely underspecified rather than hard-coding to pass. `npm run
   test:select-candidates` exits 0.
4. Adopt it: update `.claude/agents/pipeline-selection.md` so WP-A runs `select:candidates`
   first and uses its scores, reserving the model for judgment (screenType resolution,
   tie-break, assumptions, self-review). Do not change what the selection layer DECIDES —
   only how scores are obtained.
5. `npm run validate`, `npm run validate:pipeline`, `npm run checks` stay exit 0.

## Constraints

- Never edit `docs/layers/20-selection/*` (instructions or profiles), `docs/contracts/*`, or
  `registry` facet values. A discrepancy between the script and the doc is a script bug, not
  a license to change the doc.

## Acceptance criteria

- [ ] `npm run select:candidates -- <flowspec>` emits per-step scored candidates; exit 0.
- [ ] `npm run test:select-candidates` reproduces both golden SelectionSpecs' scores; exit 0.
- [ ] `.claude/agents/pipeline-selection.md` instructs running the script.
- [ ] `npm run validate`, `npm run validate:pipeline`, `npm run checks` exit 0.

## Out of scope

- Changing selection decisions/thresholds, route generation, provenance, a11y, committing.
