# Task 05: Check Runner (`scripts/run-checks.mjs`) and Fix-Loop Execution

Execution order: after tasks 01-04 (it verifies their combined output).

## Objective

Create a pure reporter script that runs the verification suite and emits check results in
the exact shape of the BuildReport `checks[]` array (task 01 schema), then execute one
full implementation-layer verification pass on the dry-run flow, applying the fix-loop
policy, and emit the final `BuildReport`.

## Context

- Repo root: `C:\Users\tomoy\Desktop\react-shadcn` (Windows; Node ESM `.mjs`,
  `spawnSync` with `shell: true`).
- The check suite is the existing npm scripts — do not invent new checks:

  | name | command |
  |---|---|
  | contracts | `npm run validate` |
  | lint | `npm run lint` |
  | typecheck | `npm run typecheck` |
  | build | `npm run build` |
  | storybook | `npm run build-storybook` |

- Fix-loop policy (defined in
  `docs/layers/30-implementation/ai-implementation-instructions.md`): on failure, fix only
  files created by tasks 03/04 (`app/flows/**`, `components/patterns/**`); never edit
  `components/ui/*`, `registry/*.json` facet values, or `docs/contracts/*`. Max 3
  iterations, then stop with `status: "failed"` or `"partial"`.
- BuildReport contract: `docs/contracts/ai-buildreport.schema.json`; validate with
  `npm run validate:spec -- <file>`.

## Requirements

1. Create `scripts/run-checks.mjs`. CLI: `node scripts/run-checks.mjs [--out <file.json>]
   [--only <name,name>]`.
2. Run the five checks from the table, in that order, each via
   `spawnSync('npm', ['run', <script>], { shell: true, encoding: 'utf8' })`. A check
   passes iff exit code 0.
3. Fail fast is OFF: always run all checks (a later check's failure list is valuable),
   EXCEPT skip `build`/`storybook` if `typecheck` failed (their output would be noise);
   mark skipped checks as `status: "fail"` with `command` suffixed `" (skipped)"`.
4. Output JSON: `{ "checks": [{ "name", "command", "status" }], "passed": bool }` to
   stdout (and `--out`). On failure include the last 40 lines of the failing command's
   combined output under a `log` key per failed check (the schema allows extra keys?
   it does NOT — put logs in a separate sibling file `<out>.log.txt`, keep the JSON
   contract-clean).
5. `--only` runs a subset (comma-separated names) for fast iteration inside the fix loop.
6. Add npm script `"checks": "node scripts/run-checks.mjs"`.
7. Then execute the verification pass for the dry-run flow:
   1. Run `npm run checks -- --out docs/examples/checks-latest.json`.
   2. If any check fails, apply the fix-loop policy above (max 3 iterations), rerunning
      failed checks with `--only` and finishing with one full run.
   3. Assemble `docs/examples/buildreport-dryrun-saas-ops-01.json`: `flowId` from the
      SelectionSpec, `screens[]` from task 03's routes/files + task 04's story IDs +
      task 02's install report, `checks` from the final full run, `iterations` = number
      of full check runs, `unresolved: ["invoice-list"]`, `status` per policy.
   4. Validate: `npm run validate:spec -- docs/examples/buildreport-dryrun-saas-ops-01.json`.
8. `docs/examples/checks-latest.json` is a scratch artifact: add it to `.gitignore`
   (single line `docs/examples/checks-latest.json`).

## Acceptance Criteria

- [ ] `npm run checks` exits 0 on a clean tree and prints contract-shaped JSON with five
      `pass` entries.
- [ ] Deliberately break a generated file (e.g. add `const x: string = 1` to a task-03
      page), run `npm run checks`: typecheck fails, build/storybook marked skipped,
      exit code 1, log file written. Revert the break.
- [ ] `npm run checks -- --only lint,typecheck` runs exactly two checks.
- [ ] `docs/examples/buildreport-dryrun-saas-ops-01.json` exists, passes
      `npm run validate:specs`, and its `status` is `"verified"`.
- [ ] `npm run validate` exits 0.

## Out of Scope

- Adding new check types (a11y test runner, visual regression, interaction tests — future
  work once Storybook Test is introduced).
- Auto-fixing anything inside the script itself: the script only reports; fixing is the
  executor's job under the fix-loop policy.
- CI wiring (GitHub Actions) — separate task.

## Pitfalls

- `npm run` on Windows requires `shell: true` in `spawnSync`.
- `next build` and `storybook build` are slow; respect `--only` during iteration but the
  FINAL BuildReport `checks` must come from a full five-check run.
- Do not let log excerpts leak into the BuildReport JSON — the schema is
  `additionalProperties: false` and `npm run validate:specs` will reject it.
