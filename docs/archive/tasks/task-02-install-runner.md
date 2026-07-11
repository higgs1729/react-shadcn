# Task 02: Install Runner (`scripts/install-selection.mjs`)

Execution order: after task 01. Independent of tasks 03-05.

## Objective

Create a deterministic script that reads a SelectionSpec, resolves every selected registry
item's dependencies, installs whatever is missing, and emits a machine-readable install
report. No AI judgment at runtime: the script either finds everything it needs or exits
non-zero with a precise error.

## Context

- Repo root: `C:\Users\tomoy\Desktop\react-shadcn` (Windows; script must be cross-platform
  Node ESM `.mjs`, no bash-isms).
- Registry items live at `registry/<name>.json` (shadcn registry-item format with
  `meta.aiDesignSystem`). Their component code is ALREADY in the repo (the registry
  currently describes installed code); a fresh machine may still miss shadcn primitives
  or npm packages, which is what this script repairs.
- shadcn primitives are files at `components/ui/<dep>.tsx`.
- Docs are resolved by basename via `scripts/lib/paths.mjs` (`readDoc('...')`).
- Fixture input: `docs/examples/selectionspec-dryrun-01.json`.
- Existing validation pattern to copy from: `scripts/validate-spec.mjs` (ajv setup with
  `{ allErrors: true, strict: false, validateSchema: false }` + `ajv-formats`).

## Requirements

1. Create `scripts/install-selection.mjs`. CLI: `node scripts/install-selection.mjs
   <path-to-selectionspec.json> [--dry-run] [--out <report.json>]`.
2. On start, validate the input against `readDoc('ai-selectionspec.schema.json')` (with
   `readDoc('ai-design-facets.schema.json')` added via `ajv.addSchema`). Invalid → print
   ajv errors, exit 1.
3. Collect the selected item set: for every entry in `screens[]`, take
   `screenPattern.registryItem` plus every `blocks[].registryItem`. Deduplicate.
   Ignore `unresolved` entries entirely.
4. For each selected item, load `registry/<name>.json`. Missing file → error listing the
   item name, exit 1 (do not skip).
5. Verify item payloads: every `files[].path` in each item must exist on disk. Missing →
   collect into the report under `missingFiles` and exit 1 after processing all items
   (report everything at once, not first-failure).
6. Resolve shadcn dependencies: union of all items' top-level `registryDependencies`.
   A dep `X` is installed iff `components/ui/X.tsx` exists. For each missing dep run
   `npx shadcn@latest add <X> --yes` via `spawnSync` with `{ shell: true, stdio: 'inherit' }`
   (shell:true is required on Windows). Non-zero exit → script exits 1.
7. Resolve npm dependencies: union of all items' `meta.aiDesignSystem.dependencies.npm`.
   A dep is installed iff it appears in `package.json` `dependencies` or `devDependencies`
   (read the file; do not shell out to `npm ls`). Install missing ones with a single
   `npm install <a> <b> ...` via `spawnSync` shell:true.
8. `--dry-run`: perform every check but execute no install commands; report what WOULD run.
9. Emit a JSON report (stdout, and to `--out` path if given):
   `{ "selectionSpec": <path>, "items": [names], "shadcn": { "present": [], "installed": [] },
   "npm": { "present": [], "installed": [] }, "missingFiles": [], "dryRun": bool }`.
   The `installed` arrays feed the BuildReport `screens[].installed` field (task 01 schema).
10. Idempotency: running twice in a row must perform zero installs on the second run.
11. Add npm script: `"install:selection": "node scripts/install-selection.mjs"`.

## Acceptance Criteria

- [ ] `node scripts/install-selection.mjs docs/examples/selectionspec-dryrun-01.json --dry-run`
      exits 0 and reports zero pending installs (everything already present in this repo).
- [ ] Same command without `--dry-run` exits 0 and performs no installs (idempotent on
      this repo).
- [ ] Feeding it a JSON file that is not a valid SelectionSpec exits 1 with ajv errors.
- [ ] Temporarily renaming `registry/chart-panel-01.json` and running the script exits 1
      naming `chart-panel-01` (restore the file afterwards).
- [ ] `npm run validate` still exits 0 (you changed no contracts).

## Out of Scope

- Generating pages or stories. Editing registry items. Uninstalling anything.
- Resolving external registry URLs (`dependencies.registries` values are local item names
  today; treat unknown ones as errors).

## Pitfalls

- Do not parse `npx shadcn add` output; trust exit codes only.
- `spawnSync` without `shell: true` cannot find `npx`/`npm` on Windows.
- Keep the script silent about what it does NOT do; the report is the interface.
