# Task 12: Add phased runtime-quality and security checks

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Add the first reliable runtime and security verification gates for generated UI flows. Begin with
the golden flow and deterministic checks; do not introduce broad, flaky coverage as a required gate.

## Context

- Start only after Task 07 and Task 09 are complete. Task 07 provides planned-check execution and
  Task 09 provides stable cases for checking regressions.
- The golden UI routes are `app/flows/dryrun-saas-ops-01/login/`, `overview/`, and `invoice-list/`.
  Their expected states are described by `docs/examples/flowspec-dryrun-01.json`.
- Existing checks cover contracts, lint, typecheck, Next build, and Storybook build. No browser E2E,
  rendered accessibility gate, dependency audit, or secret scan is currently a repository command.
- Package installation may be necessary. Inspect current lockfile and tooling before selecting a
  supported test runner; pin additions through the existing package manager.

## Requirements

1. Add a browser smoke suite for the three golden routes that asserts successful navigation and
   a visible route-specific landmark or heading. Include loading, empty, and error state coverage
   for invoice-list if those states are implemented; otherwise emit a precise pending assertion and
   document the missing implementation.
2. Reuse the single rendered-output `a11y` check ID and implementation introduced by Task 07; do
   not create a second a11y runner, check ID, or duplicate violation fixture. Extend its coverage
   to the golden browser routes where that adds value, and assert the existing known violation is
   still detected.
3. Add local, credential-free dependency vulnerability and secret-scanning commands. Define their
   baseline behavior and make detected high-severity/new-secret findings fail the command.
4. Register every new check with the Task 07 check-ID mechanism and document whether it is required
   immediately or observational until its stability target is met.
5. Record runtime, flaky-test, and false-positive trade-offs in the implementation documentation;
   do not add visual regression as a mandatory gate in this task.

## Constraints

- Do not modify registry facets, contract schemas, or `components/ui/*`.
- Do not upload source, secrets, screenshots, or telemetry to external services.
- Do not silently skip a missing browser binary or security tool; report a classified environment
  failure with setup guidance.

## Acceptance criteria

- [ ] A documented local command runs browser smoke tests for all three golden routes and exits 0.
- [ ] The documented Task 07 accessibility command runs for the relevant golden routes and still
  detects its existing known violation.
- [ ] Documented dependency and secret scan commands exit 0 on the repository baseline.
- [ ] All newly required checks are represented in the check-plan mapping.
- [ ] `npm run validate` and `npm run checks` exit 0.

## Out of scope

- Full cross-browser matrix, production monitoring, or hosted security services.
- Mandatory visual snapshot regression testing.
