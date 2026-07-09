# Task 01: BuildReport Contract and Implementation-Layer Orchestrator Doc

Execution order: this task is first. Tasks 02-05 depend on the contract defined here.

## Objective

Create the machine contract (`BuildReport` JSON Schema) and the orchestrator instruction
document for the implementation layer. The implementation layer consumes a validated
`SelectionSpec` and produces working code, stories, and check results, reported as a
`BuildReport`. This task creates only the schema and the instruction document — no
runtime code.

## Context

- Repo root: `C:\Users\tomoy\Desktop\react-shadcn` (Next.js App Router + shadcn/ui, Windows).
- Existing contracts live in `docs/contracts/` and are validated with ajv
  (`npm run validate`). Both use JSON Schema draft-07 with
  `"$schema": "https://json-schema.org/draft-07/schema#"`.
- Scripts resolve docs by unique basename via `scripts/lib/paths.mjs` (`readDoc`, `docPath`).
  Never hardcode `docs/` subfolder paths in scripts.
- Reference input: `docs/examples/selectionspec-dryrun-01.json` (a real SelectionSpec).
- Layer docs follow the style of `docs/layers/20-selection/ai-pattern-selection-instructions.md`
  (English, procedure-first, no scope narration).

## Requirements

1. Create `docs/contracts/ai-buildreport.schema.json` with `$id`
   `https://example.local/schemas/ai-buildreport.schema.json`. Top level: `type: object`,
   `additionalProperties: false`, required `["flowId", "generatedAt", "screens", "checks", "iterations", "status"]`, properties:
   - `$comment`: string (optional)
   - `flowId`: string, minLength 1
   - `generatedAt`: string, format `date`
   - `screens`: array of screen results, each `additionalProperties: false`, required
     `["stepId", "route", "status", "filesCreated", "storiesCreated"]`:
     - `stepId`: string
     - `route`: string (e.g. `/flows/dryrun-saas-ops-01/overview`)
     - `status`: enum `["built", "failed", "skipped"]`
     - `filesCreated`: array of string (repo-relative paths), uniqueItems
     - `storiesCreated`: array of string (story IDs like `patterns-dashboard-dashboard-01--default`), uniqueItems
     - `installed`: optional object `{ "shadcn": string[], "npm": string[] }`, both uniqueItems, additionalProperties false
     - `checkFailures`: optional array of string
   - `checks`: array, each `additionalProperties: false`, required `["name", "command", "status"]`:
     - `name`: string; `command`: string; `status`: enum `["pass", "fail"]`;
       `attempts`: optional integer minimum 1
   - `iterations`: integer, minimum 1 (how many fix loops ran)
   - `status`: enum `["verified", "partial", "failed"]`
   - `unresolved`: optional array of string (stepIds passed through from SelectionSpec)
2. Extend `scripts/validate-spec.mjs` to also validate BuildReport documents. Detection
   order (a document has exactly one type): has `steps` → FlowSpec; has `checks` →
   BuildReport; has `screens` → SelectionSpec. Load the new schema with
   `readDoc('ai-buildreport.schema.json')` and compile it like the existing two.
3. Create `docs/layers/30-implementation/ai-implementation-instructions.md` — the
   orchestrator document. Content, in this order:
   - One-paragraph statement: input is a `SelectionSpec` that passes
     `npm run validate:spec -- <file>`; output is a `BuildReport` that passes the same
     command; screens listed in the SelectionSpec's `unresolved` are copied to the
     BuildReport's `unresolved` and never built.
   - Pipeline: (1) install registry items (`node scripts/install-selection.mjs <spec>`),
     (2) compose pages (task 03 conventions), (3) generate stories
     (`node scripts/gen-pattern-stories.mjs <spec>`), (4) run checks
     (`node scripts/run-checks.mjs`), referencing the four task docs in this folder by
     filename.
   - Fix loop policy: if any check fails, fix only files created in steps 2-3 of this
     pipeline (never edit `components/ui/*`, `registry/*.json` facets, or `docs/contracts/*`),
     then rerun the checks. Maximum 3 iterations; if still failing, set BuildReport
     `status: "failed"` (or `"partial"` if at least one screen is `built` and all checks
     that touch it pass) and stop.
   - BuildReport emission: write to `docs/examples/buildreport-<flowId>.json` and validate
     with `npm run validate:spec -- <path>`.
4. Do not modify any other file.

## Acceptance Criteria

- [ ] `node scripts/validate-spec.mjs docs/examples/flowspec-dryrun-01.json docs/examples/selectionspec-dryrun-01.json` still passes.
- [ ] A hand-written minimal BuildReport sample (create
      `docs/examples/buildreport-sample.json` with one built screen and five passing
      checks) passes `npm run validate:specs`.
- [ ] `npm run validate` exits 0.
- [ ] `docs/layers/30-implementation/ai-implementation-instructions.md` exists and
      references task-02..05 docs and the three scripts by exact filename.

## Out of Scope

- Writing `install-selection.mjs`, `gen-pattern-stories.mjs`, `run-checks.mjs`
  (tasks 02, 04, 05).
- Composing any page. Modifying the SelectionSpec/FlowSpec schemas.

## Pitfalls

- ajv is constructed with `validateSchema: false` in existing scripts because the schemas
  declare the draft-07 meta-schema with an `https://` URL. Keep that option.
- `npm run validate:specs` scans `docs/examples/*.json` non-recursively; files in
  `docs/examples/archive/` are intentionally ignored. Do not "fix" that.
- Windows repo: scripts are Node ESM `.mjs`, cross-platform (`node:path` join, no bash).
