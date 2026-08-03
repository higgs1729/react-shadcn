# Task 14: Make pipeline tooling multi-flow and unify artifact naming

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Implement RFC 008 (`docs/rfcs/008-multi-flow-pipeline-support.md`): rename the golden
artifacts to the canonical `<artifact>-<flowId>.json` convention and replace the four
pipeline scripts' hardcoded single-flow defaults with automatic discovery of every
flow triple under `docs/examples/`. This is a one-shot migration — do not leave any
intermediate state where names and script defaults disagree.

## Context

- The golden flow's `flowId` is `dryrun-saas-ops-01` (inside all three artifacts), but the
  files are named inconsistently:
  - `docs/examples/flowspec-dryrun-01.json`
  - `docs/examples/selectionspec-dryrun-02.json`
  - `docs/examples/buildreport-dryrun-saas-ops-02.json`
  - `docs/examples/buildreport-dryrun-saas-ops-02.provenance.json` (sidecar)
- Target names (derive mechanically from flowId):
  - `flowspec-dryrun-saas-ops-01.json`
  - `selectionspec-dryrun-saas-ops-01.json`
  - `buildreport-dryrun-saas-ops-01.json`
  - `buildreport-dryrun-saas-ops-01.provenance.json`
- Contract-document kind is detected by shape, not filename (see `scripts/validate-spec.mjs`):
  `steps` → FlowSpec, `flowId`+`checks` → BuildReport, `screens` → SelectionSpec. Reuse this
  convention in discovery; do not parse kinds out of filenames.
- The four scripts with hardcoded golden defaults (each documents its current default in its
  header comment): `scripts/validate-pipeline.mjs`, `scripts/run-planned-checks.mjs`,
  `scripts/gen-provenance.mjs`, `scripts/validate-provenance.mjs`. All keep their explicit-arg
  modes (`--flow/--spec/--build`, positional spec path, `--manifest`, etc.) unchanged.
- Pattern to imitate for the shared library: `scripts/lib/check-registry.mjs` — one small
  `scripts/lib/` module as the single source of truth, consumed by every runner, with a typed
  error that names exactly what is missing.
- Provenance helpers live in `scripts/lib/provenance.mjs`; sidecar generation is
  `npm run gen:provenance`, validation `npm run validate:provenance`. The sidecar records
  input basenames, so after the rename the old sidecar can no longer resolve its inputs —
  it must be deleted and regenerated, not patched by hand.
- Existing test harnesses to imitate: `scripts/test-pipeline.mjs` (spawns the validator
  against fixtures in `scripts/fixtures/pipeline/`, asserts non-zero exit and message
  content), `scripts/run-planned-checks.test.mjs`, `scripts/test-provenance.mjs`. Windows:
  `spawnSync(..., { shell: true })`, BOM-tolerant JSON reads (`.replace(/^﻿/, '')`).
- `docs/STATUS.md` currently names `buildreport-dryrun-saas-ops-02.json` and summarizes the
  examples as "flowspec-01 / selectionspec-02 / buildreport-02 + sidecar" — both must be
  updated to the new names.
- `eval/cases/*.json` are already filename-independent; leave them untouched.
- `docs/layers/20-selection/` and `docs/layers/30-implementation/` already document the
  `<artifact>-<flowId>.json` convention; no changes needed there.

## Requirements

1. Rename the four files above with `git mv` to the target names.
2. Add `scripts/lib/flows.mjs` exporting a discovery function that scans a directory
   (default `docs/examples/`) for contract JSON documents (skip `*.provenance.json`),
   classifies each by shape, groups them by the `flowId` field read from the document,
   and returns one `{ flowId, flowSpecPath, selectionSpecPath, buildReportPath,
   provenancePath|null }` entry per flow.
3. Discovery is fail-loud, via a dedicated error class (imitate `UnsupportedCheckError`):
   - a flowId whose triple is incomplete (any of the three contract docs missing) throws,
     naming the flowId and which artifact kinds are missing;
   - a contract document whose filename is not exactly `<artifact>-<flowId>.json` for its
     kind and flowId throws, naming the file and the expected name (this enforces the RFC
     naming convention mechanically);
   - two documents of the same kind for the same flowId throw as duplicates.
4. Replace the no-arg defaults of the four scripts with discovery:
   - `validate-pipeline.mjs`: no args → validate every discovered triple; any failure in
     any flow exits non-zero. Explicit `--flow/--spec/--build` still validates exactly one
     triple as today.
   - `run-planned-checks.mjs`: no spec arg → run planned checks for every discovered
     flow's SelectionSpec (keep the existing per-command dedupe across screens AND flows);
     the emitted report gains the flowId per entry. Explicit spec arg unchanged.
   - `gen-provenance.mjs`: no input args → generate/regenerate the sidecar for every
     discovered triple (output next to each BuildReport as
     `buildreport-<flowId>.provenance.json`). Explicit args unchanged.
   - `validate-provenance.mjs`: no args → for every discovered triple, require its sidecar
     to exist and validate it; a complete triple with no sidecar fails naming the flowId.
     Explicit `--manifest` unchanged.
5. Regenerate the golden sidecar via `npm run gen:provenance` after the rename (delete the
   old sidecar file as part of the `git mv`/regeneration; do not hand-edit digests).
6. Add negative-case tests for discovery (new fixtures under `scripts/fixtures/flows/`):
   an incomplete triple fails naming the flowId and missing kinds; a misnamed file fails
   naming the expected filename; a directory with two complete triples returns both
   (proving multi-flow discovery) — drive the multi-flow case through the discovery
   function or `validate-pipeline.mjs` against the fixture directory, whichever is
   simpler, and wire the new tests into an existing `test:*` script or a new
   `npm run test:flows`.
7. Update `docs/STATUS.md`'s two stale filename references to the new names.

## Constraints

- One-shot migration: after your changes, no file, script default, or doc may still
  reference the old filenames (`flowspec-dryrun-01`, `selectionspec-dryrun-02`,
  `buildreport-dryrun-saas-ops-02`) outside `docs/archive/` (which you must not touch).
- Do not change any contract schema, the provenance schema/format, or
  `scripts/lib/provenance.mjs` digest semantics.
- Do not rename or change the CLI flags of any npm script; only their no-arg behavior
  changes.
- Do not edit `eval/` or `e2e/`.
- Do not commit; leave changes in the working tree.

## Acceptance criteria

- [ ] `npm run validate` exits 0.
- [ ] `npm run validate:pipeline` (no args) exits 0 and its output names flowId
      `dryrun-saas-ops-01`.
- [ ] `npm run validate:provenance` (no args) exits 0 against the regenerated sidecar.
- [ ] `npm run checks:planned` (no args) exits 0 and its report covers the golden flow's
      screens.
- [ ] `npm run eval` exits 0 (7/7 cases — proves the rename didn't break eval).
- [ ] The new discovery tests pass, including: incomplete-triple failure names the flowId
      and missing kinds; two-triple fixture discovers both flows.
- [ ] `npm run test:validators`, `npm run test:pipeline`, `npm run test:planned-checks`,
      `npm run test:provenance` all exit 0.
- [ ] `git grep -l "flowspec-dryrun-01\|selectionspec-dryrun-02\|buildreport-dryrun-saas-ops-02" -- ':!docs/archive'`
      returns nothing.

## Out of scope

- Upstream flow-layer automation, provenance format changes, eval dataset changes,
  `docs/archive/` contents, adding a real second flow (the two-triple proof uses fixtures).
