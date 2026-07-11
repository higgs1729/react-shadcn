# Task 08: Add cross-artifact pipeline validation

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Add a deterministic validator for the semantic relationships among a FlowSpec, SelectionSpec,
BuildReport, and referenced registry inventory. The validator must catch invalid combinations that
are individually valid JSON Schema documents.

## Context

- Complete Task 07 and Task 11 before starting. Task 07 supplies the planned-to-executed check
  mapping; Task 11 supplies the strict shared Ajv factory that this validator must reuse.
- The current golden artifacts are `docs/examples/flowspec-dryrun-01.json`,
  `docs/examples/selectionspec-dryrun-02.json`, and
  `docs/examples/buildreport-dryrun-saas-ops-02.json`.
- Individual validation is implemented by `scripts/validate-spec.mjs`, `scripts/validate-facets.mjs`,
  and `scripts/validate-profiles.mjs`; registry source files are under `registry/`.
- `docs/contracts/*` is immutable. Express cross-document rules in a new script, not by modifying
  the JSON Schemas.

## Requirements

1. Add a Node ESM command that reuses Task 11's shared Ajv factory, accepts explicit FlowSpec,
   SelectionSpec, and BuildReport paths, and exits non-zero on semantic violations. Document the
   command in `package.json`.
2. Validate equal `flowId` values; ensure every FlowSpec step appears exactly once as either a
   SelectionSpec screen or SelectionSpec unresolved item; ensure no unknown or duplicated step ID
   appears downstream.
3. Validate that selected screen patterns and blocks exist in `registry/`, and that BuildReport
   screens correspond exactly to resolved SelectionSpec screens with matching step IDs and routes.
4. Validate status/check consistency without modifying schemas: `verified` requires no failing or
   missing planned check; failed/skipped screens cannot be represented as successful built output;
   unresolved step IDs are carried forward correctly.
5. Produce precise errors naming the artifact, step ID, and violated invariant. Do not stop after
   the first independent violation.
6. Add executable positive and negative fixtures or tests. Cover at least a mismatched flowId,
   a missing step, a duplicate step, an unknown registry item, and a verified report containing a
   failed check.

## Constraints

- Do not edit files in `docs/contracts/`, `docs/layers/20-selection/`, or registry facet values.
- Do not infer missing data or repair artifacts in the validator.
- Keep the validator deterministic and free of network access.

## Acceptance criteria

- [ ] `npm run validate` exits 0.
- [ ] The new pipeline-validation command exits 0 for the three current golden artifacts.
- [ ] The automated negative-fixture command exits 0 only when every listed invalid case is
  rejected with its expected invariant name.
- [ ] `npm run checks` exits 0.

## Out of scope

- UI rendering, visual quality, or LLM-judge evaluation.
- Replacing existing single-document validators.
