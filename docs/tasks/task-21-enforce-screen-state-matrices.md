# Task 21: Normalize and prove ScreenType state inventory

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Make state coverage a machine-readable, evidence-backed capability of the screen-pattern
inventory. A screen-pattern may claim a state only when its composed implementation and
Storybook evidence can actually render it.

This task deliberately does **not** define a required baseline per ScreenType. The FlowSpec
is the sole authority for the states needed in a particular product flow.

## Context

- A FlowSpec declares the states needed by a particular step in `requiredStates`.
- A screen-pattern declares its implemented states in
  `meta.aiDesignSystem.stateCoverage` and evidence in
  `meta.aiDesignSystem.verification.storybookStories`.
- `docs/layers/20-selection/ai-pattern-selection-instructions.md` currently drops a screen
  pattern with insufficient `requiredStates` coverage, and separately requires
  `empty`/`loading`/`error`/`permission-denied` coverage for data-driven screens.
- The current selection instructions also contain a prose-only rule requiring four states for
  all data-driven screens. That rule conflicts with FlowSpec ownership of requirements and
  must be removed.
- Existing screen-pattern inventory covers all 12 canonical ScreenTypes. It is experimental;
  this task must not promote maturity.
- `task-20-run-selection-and-implementation.md` must derive its resolved/unresolved result
  from the target FlowSpec's `requiredStates`, not from a generic ScreenType policy.

## State-inventory model

Keep the existing `meta.aiDesignSystem.stateCoverage` as the single inventory declaration.
Its values use the existing `state` enum in `ai-design-facets.schema.json`. Document this
taxonomy in the selection and implementation instructions:

```text
ScreenType inventory
├─ user states: default, loading, empty, error, permission-denied
├─ interaction states: validation-error, disabled, success
└─ environment variants: mobile, dark-mode, rtl
```

There is no implicit state requirement based on ScreenType, `dataShapes`, or
`interactionModels`. A selection candidate is eligible exactly when its `stateCoverage`
contains every value in the current FlowSpec step's `requiredStates`. An absent state is a
truthful inventory gap, not a reason to edit the FlowSpec or overstate a pattern's coverage.

Do not introduce new enum values such as `streaming` or `conflict` in this task. Streaming is
already represented by `interactionModels`; conflict handling remains future vocabulary work.

## Requirements

1. Add the taxonomy above to the selection and implementation instructions. State explicitly
   that it classifies inventory capability; it does not add mandatory states to a ScreenType.
2. Update `docs/layers/20-selection/ai-pattern-selection-instructions.md` so selection uses
   **only** `FlowSpec.steps[].requiredStates` as its state gate. A candidate lacking any of
   those values in `stateCoverage` is rejected or the step becomes `unresolved`. Remove the
   duplicated prose-only data-driven state rule.
3. Preserve the existing state enum and canonical profile shape. Do not add `stateMatrix`,
   `required`, `recommended`, or variant requirements to canonical profiles or contracts.
4. Add a deterministic state-inventory regression script and package command. It must verify
   that every ScreenType has at least one stocked screen-pattern; all declared
   `stateCoverage` values are legal enum values; each declared user or interaction state has
   a corresponding renderable Storybook state; and a negative fixture proves that a
   SelectionSpec/FlowSpec pair fails when the flow requests a state the candidate lacks.
5. Audit every current screen-pattern's `stateCoverage`, `verification.storybookStories`, and
   `risk.missingStates`. Correct inaccurate declarations, but do not add missing states merely
   to satisfy a generic matrix. Implement a new state only where the existing metadata already
   claims it or where a named FlowSpec requires it.
6. For every state implemented or corrected by this task, add or extend browser-backed
   Storybook coverage. Error/empty/permission states retain a labelled recovery or exit action
   where meaningful; validation-error states expose an associated field error; disabled
   states use a semantically disabled control.
7. Run a dry selection assessment for `studio-portfolio-01` using its current
   `requiredStates`. Name the expected resolved/unresolved steps and the missing inventory
   state for every unresolved step. Do not write a SelectionSpec or begin Task 20.
8. Update `docs/STATUS.md` only after all checks pass. Record the inventory-only state policy,
   any corrected evidence, and the current `studio-portfolio-01` assessment.

## Explicit protected-file authorization

The human owner explicitly authorizes state-inventory-related edits in this task to the
normally protected files below. This exception is narrow: change only selection behavior and
truthful state metadata required by this brief.

- `docs/layers/20-selection/ai-pattern-selection-instructions.md`
- Existing registry `meta.aiDesignSystem.stateCoverage`, `verification.storybookStories`, and
  `risk.missingStates` fields

`docs/contracts/*`, `docs/layers/20-selection/ai-canonical-profiles.json`, and
`components/ui/*` remain read-only. Do not modify any other protected field, alter facet
vocabulary, promote maturity, or modify unrelated registry metadata.

## Acceptance criteria

- [ ] The state-inventory regression command exits 0 for all 12 ScreenTypes and its negative
      fixture exits non-zero with a precise missing-state message.
- [ ] No selection requirement is inferred from ScreenType; the selection instructions use
      only the FlowSpec step's `requiredStates` for state eligibility.
- [ ] Every declared user or interaction state in a screen-pattern's `stateCoverage` has a
      renderable Storybook story, and every unimplemented state remains absent from coverage
      and present in `risk.missingStates` where applicable.
- [ ] `npm run validate`, `npm run checks`, and `npm run report:coverage` exit 0.
- [ ] Browser-backed story/a11y checks for the changed screen stories exit 0.
- [ ] `npm run validate:spec -- docs/layers/10-upstream/flowspec-studio-portfolio-01.json`
      exits 0.
- [ ] A documented dry selection assessment for `studio-portfolio-01` identifies the
      expected resolved/unresolved steps from its own `requiredStates`, without writing a
      SelectionSpec or beginning Task 20.
- [ ] `docs/STATUS.md` reflects the completed state-inventory work and no maturity value was
      promoted.

## Out of scope

- Running Task 20 or emitting a `docs/examples/` FlowSpec/SelectionSpec/BuildReport triple.
- Building the Studio portfolio shell, global navigation, root routes, i18n, or a backend.
- Adding state-enum vocabulary for streaming, conflict, cancelled, rate-limited, or stale data.
- Adding state requirements to canonical profiles or inferring them from ScreenType.
- Claiming inventory states before implementation evidence exists.
- Committing or pushing changes.
