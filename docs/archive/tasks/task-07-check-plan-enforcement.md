# Task 07: Enforce planned checks in the verification runner

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Make the checks declared for a selected screen executable and auditable. A check planned in
`SelectionSpec.screens[].checksPlanned` must either run and be reported, or make verification
fail; a Storybook build alone must not be described as an accessibility or interaction check.

## Context

- `scripts/run-checks.mjs` currently runs five fixed checks: contracts, lint, typecheck, build,
  and Storybook build.
- `docs/examples/selectionspec-dryrun-02.json` plans `lint`, `typecheck`, `a11y`, and `story`
  for each screen. The selected screen routes live under `app/flows/dryrun-saas-ops-01/`.
- `package.json` includes Storybook 10 and `@storybook/addon-a11y`, but no command currently
  executes rendered-story accessibility or interaction assertions.
- `docs/contracts/*` and `docs/layers/20-selection/*` are immutable. Do not change a contract
  schema to complete this task; use executable scripts and existing fields instead.

## Requirements

1. Define one documented mapping from planned check IDs (`lint`, `typecheck`, `a11y`, `story`)
   to executable commands. Reject unknown IDs rather than silently ignoring them.
2. Extend the runner, or add a focused runner it invokes, so it accepts a SelectionSpec path and
   executes every planned check for its resolved screens. Keep the existing no-argument full
   repository suite usable.
3. Add a real rendered-story accessibility check and a real story render/interaction check.
   Select the smallest supported Storybook 10-compatible approach after inspecting the installed
   configuration; do not treat `build-storybook` as either check.
4. Emit each executed check with its planned ID, command, status, and failure output in the same
   machine-readable style as `scripts/run-checks.mjs`. A missing or unsupported planned check is
   a failure.
5. Add a deterministic automated regression case proving that an unsupported planned check fails
   and that the dry-run SelectionSpec executes all of its planned checks.
6. Update `package.json` scripts and the relevant implementation documentation so an executor can
   run the new suite without guessing commands.

## Constraints

- Do not weaken or rename existing `checksPlanned` values in the golden SelectionSpec.
- Do not claim `verified` semantics in JSON Schema; cross-artifact status rules belong to Task 08.
- Do not add a cloud service, require credentials, or modify registry facet values.
- Keep the test deterministic in CI and Windows; record any tool limitation rather than masking it.

## Acceptance criteria

- [ ] `npm run validate` exits 0.
- [ ] `npm run checks` exits 0 and retains contracts, lint, typecheck, build, and Storybook build.
- [ ] A documented command runs every planned check in
  `docs/examples/selectionspec-dryrun-02.json`, including separate `a11y` and `story` results,
  and exits 0.
- [ ] A regression command using an unknown planned check exits non-zero with an error naming the
  unknown ID.
- [ ] The changed documentation identifies the distinction between Storybook build and rendered
  story checks.

## Out of scope

- Visual snapshot comparison.
- Browser coverage across every device and browser engine.
- Changing FlowSpec, SelectionSpec, or BuildReport schemas.
