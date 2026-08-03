# Task 09: Build a deterministic agent-evaluation golden dataset

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Create a small, versioned evaluation dataset that detects regressions in the selection workflow.
It must grade output behavior and safety boundaries, not merely whether produced JSON parses.

## Context

- Start only after Task 08 is complete; reuse its cross-artifact validator where appropriate.
- Current selection behavior is described in `docs/layers/20-selection/ai-pattern-selection-instructions.md`.
  That file is immutable; the dataset tests its behavior rather than changing it.
- The current representative artifacts are the three files in `docs/examples/` for
  `dryrun-saas-ops-01`. Registry inventory is under `registry/`.
- No model runtime is installed in this repository. The first dataset therefore evaluates supplied
  candidate outputs deterministically; it must be usable later by an agent runner without changing
  its case format.

## Requirements

1. Add a tracked eval directory with a concise README specifying case format, grader behavior, and
   how to add a case without modifying an existing expected result.
2. Add cases for: a clear winner, below-threshold candidate, near tie, missing dependency,
   inadequate required-state coverage, and a forbidden-edit attempt. Each case must state the
   expected selected candidate or `unresolved` reason.
3. Implement a Node ESM eval runner that accepts a dataset/candidate-output path, reports per-case
   pass/fail with stable case IDs, and exits non-zero when any case fails.
4. Grade deterministic facts: resolved/unresolved status, selected and rejected candidate IDs,
   required reason text/category, check-plan completeness, and prohibited path changes. Do not use
   an LLM as the sole grader.
5. Include an immutable baseline case sourced from the current golden flow, with input provenance
   recorded in the case metadata.
6. Add at least one intentional failing fixture and a test that proves the runner detects it.

## Constraints

- Do not add network calls, model credentials, or hosted evaluation services.
- Do not modify existing registry facets, contracts, or selection instructions.
- Keep case inputs small and human-reviewable; do not duplicate whole repository files unnecessarily.

## Acceptance criteria

- [ ] A documented `npm` command runs all positive eval cases and exits 0.
- [ ] A documented command with the failing fixture exits non-zero and names the failing case ID.
- [ ] The dataset contains all six required boundary classes and the golden baseline case.
- [ ] `npm run validate` and `npm run checks` exit 0.

## Out of scope

- Calling an LLM to generate candidates.
- Production traffic replay or a cloud evaluation dashboard.
