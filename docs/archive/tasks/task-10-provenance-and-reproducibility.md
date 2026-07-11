# Task 10: Record provenance and reproducibility metadata

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Make generated flow artifacts traceable to their inputs and execution environment without storing
secrets, user data, or model reasoning. Distinguish code failures from environment failures so a
later executor can make a safe retry decision.

## Context

- Start only after Task 08 is complete. It supplies the stable artifact relationships that the
  provenance record must identify.
- Current BuildReport contains `flowId`, a date, screens, checks, iterations, status, and unresolved
  items, but no source digests or runtime information.
- `docs/contracts/*` cannot be changed. Add a separate, versioned provenance manifest and validator
  rather than extending BuildReport Schema.
- The golden source files are the three `docs/examples/*dryrun*` artifacts and `registry/*.json`.

## Requirements

1. Define a machine-readable sidecar manifest format and a deterministic generator/validator.
   The format must include: format version, flowId, created timestamp, git commit if available,
   Node/npm/OS runtime, hashes of FlowSpec, SelectionSpec, BuildReport, and registry inventory,
   generator/instruction revision when supplied, and check duration/status.
2. Add a bounded failure classification (`code`, `environment`, `dependency`, `policy`) plus a
   retryable boolean. Do not encode failures only as an opaque string.
3. Generate a provenance sidecar for the current golden BuildReport and verify its digests against
   the checked-in input artifacts.
4. Ensure the manifest contains no credentials, environment-variable values, raw prompts, user
   data, or chain-of-thought. Document this rule beside the format.
5. Add package scripts for generation and validation, and a regression test that changes one copied
   input artifact and proves validation fails with the mismatched digest named.

## Constraints

- Do not edit `docs/contracts/*`, existing example contract documents, registry facet values, or
  selection instructions.
- Use cryptographic hashes available in Node; do not fetch external services.
- If git metadata is unavailable, record an explicit `unavailable` value rather than failing a
  local run.

## Acceptance criteria

- [ ] The provenance validator exits 0 for the golden sidecar and its source artifacts.
- [ ] Its negative-fixture test exits 0 only when a changed input is rejected.
- [ ] The sidecar includes every required field and no prohibited sensitive field.
- [ ] `npm run validate` and `npm run checks` exit 0.

## Out of scope

- Persisting model reasoning or user prompts.
- A hosted trace store or telemetry backend.
