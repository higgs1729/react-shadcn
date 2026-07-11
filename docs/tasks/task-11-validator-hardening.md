# Task 11: Harden validators and add negative regression tests

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Make the repository's validation boundary fail closed for malformed schemas, unsupported documents,
and known invalid contract data while preserving all current valid artifacts.

## Context

- This task is a prerequisite for Task 08. It establishes the shared strict Ajv factory on which
  Task 08's semantic validator must be built.
- `scripts/validate-spec.mjs`, `scripts/validate-profiles.mjs`, and selection/install generators
  instantiate Ajv with relaxed settings to work around draft-07 URI handling.
- `validate-spec.mjs` silently skips unrecognized JSON files during directory scan. Current examples
  are FlowSpec, SelectionSpec, and BuildReport JSON documents.
- The JSON Schema documents in `docs/contracts/` are immutable, but validator scripts and test
  fixtures may be changed or added.

## Requirements

1. Centralize Ajv construction in a shared module that correctly registers the draft-07 meta-schema
   and referenced schemas, then use it from applicable validators and generators.
2. Enable strict validation wherever the current schemas support it. If a specific strict warning
   cannot be resolved without changing an immutable contract, fail explicitly with a documented,
   narrowly scoped compatibility exception.
3. Validate the repository's schemas themselves in a command that runs without network access.
4. Change examples scanning to fail on unrecognized JSON unless that file is in an explicit,
   documented allowlist (for example a provenance sidecar from Task 10).
5. Add automated negative fixtures for invalid JSON, additional properties, invalid enums, invalid
   schema keywords/references, and an unrecognized examples JSON file. Assert both non-zero status
   and a useful error category.
6. Keep valid existing fixtures and all existing commands compatible, except where a new explicit
   command is documented as their replacement. Expose the shared factory for Task 08 without
   implementing Task 08's cross-artifact rules here.

## Constraints

- Do not edit any file under `docs/contracts/`.
- Do not solve strict-mode errors by globally suppressing warnings or restoring `strict: false`.
- Do not make validation depend on a remote schema URL.

## Acceptance criteria

- [ ] A schema-self-validation command exits 0 for all tracked contract schemas.
- [ ] Existing `npm run validate` exits 0 and rejects an unrecognized JSON fixture in scan mode.
- [ ] The negative-fixture test suite exits 0 only if all invalid cases fail as expected.
- [ ] `npm run checks` exits 0.

## Out of scope

- Migrating contracts from JSON Schema draft-07 to a different draft.
- Changing the facet vocabulary or canonical profiles.
