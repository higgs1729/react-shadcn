# Re-run 02: Build the `collection` Screen into the Golden Flow

Layer: implementation (mechanical build). This is a **re-execution** of the existing
tasks 02–05 pipeline against an updated SelectionSpec — the scripts already exist and must
not be rewritten. Conventions follow tasks 02–05; task-06 has already landed the collection
inventory. Do not redesign anything; run the pipeline and integrate one new screen.

## Objective

The golden flow `dryrun-saas-ops-01` previously left its third step `invoice-list`
`unresolved` (no collection inventory). Task-06 has since stocked the registry
(`collection-table-01` screen-pattern + `filter-toolbar-01` block), and the selection layer
has been re-run, producing `docs/examples/selectionspec-dryrun-02.json` in which
`invoice-list` now resolves to `collection-table-01`. Your job: run the implementation
pipeline against that new SelectionSpec so `invoice-list` is **built**, and emit an updated
BuildReport with `status: "verified"` and `unresolved: []`.

## Context (read before acting)

- Repo root: `C:\Users\tomoy\Desktop\react-shadcn` (Next.js 16 App Router, shadcn/ui with
  purple oklch preset, **base-ui not Radix** — no `asChild`, use `render={<.../>}`;
  read `components/ui/*` when unsure). Windows; scripts are Node ESM `.mjs` using
  `spawnSync(..., { shell: true })`.
- **Input SelectionSpec**: `docs/examples/selectionspec-dryrun-02.json` (flowId
  `dryrun-saas-ops-01`; screens `login`, `overview`, `invoice-list`; `unresolved: []`).
  The `invoice-list` screen resolves to `collection-table-01` with blocks
  `sidebar-07` / `page-header-actions-01` / `filter-toolbar-01` / `data-table-panel-01`.
- **FlowSpec** (for transitions): `docs/examples/flowspec-dryrun-01.json`. Note
  `overview.transitions.onRowSelect = "invoice-list"` (previously targeted an unresolved
  step; now resolvable).
- **Pipeline scripts already exist** (built by tasks 02–05 — do NOT recreate or edit them):
  - `scripts/install-selection.mjs` (npm: `install:selection`)
  - `scripts/gen-pattern-stories.mjs` (npm: `gen:pattern-stories`)
  - `scripts/run-checks.mjs` (npm: `checks`)
  - Spec validator: `npm run validate:specs`; full contracts: `npm run validate`.
- **Task briefs** describing each step's rules (read for conventions, do not re-implement
  the scripts): `docs/layers/30-implementation/tasks/task-02-install-runner.md`,
  `task-03-page-composition.md`, `task-04-story-generation.md`, `task-05-check-loop.md`.
- **Already built for the first two screens** (leave as-is):
  `app/flows/dryrun-saas-ops-01/{login,overview}/page.tsx`, the flow index
  `app/flows/dryrun-saas-ops-01/page.tsx`, and the `components/patterns/*.stories.tsx` set.
- **Task-06 hand-authored artifacts that you MUST preserve** (do not overwrite/regenerate):
  - `app/collection-01/*` — the collection registry item's demo route (the composition
    reference for the new flow screen).
  - `components/patterns/collection-table-01-screen.stories.tsx` — title
    `Patterns/collection/Collection Table 01`, 4 stories (Default/Loading/Empty/Error),
    importing the demo screen. **A regenerated screen story would collide on this exact
    filename** — see the critical warning below.
  - `components/patterns/filter-toolbar-01.stories.tsx` — title
    `Blocks/filter-toolbar/Filter Toolbar 01`.

## ⚠️ Critical integration warning (filename collision)

`scripts/gen-pattern-stories.mjs` derives story filenames as
`components/patterns/<registryItem>-screen.stories.tsx` and `<registryItem>.stories.tsx`.
For the `invoice-list` screen these collide with task-06's hand-authored files:
`collection-table-01-screen.stories.tsx` and `filter-toolbar-01.stories.tsx`.

Therefore **run `gen:pattern-stories` WITHOUT `--force`** so existing files are skipped.
Do NOT pass `--force`: it would overwrite task-06's richer 4-state collection story (and the
filter-toolbar story) with single-`Default` generated stubs — a regression. After running,
`git diff --stat components/patterns/` must show **no changes** to those two files.

## Requirements

1. **Install (task-02, idempotent):** run
   `node scripts/install-selection.mjs docs/examples/selectionspec-dryrun-02.json --dry-run`,
   confirm zero pending installs, then run it without `--dry-run`. Everything is already
   present in this repo; it must perform zero installs and exit 0. Capture the install
   report for the BuildReport `screens[].installed` fields (all empty here).

2. **Compose the invoice-list route (task-03):** create
   `app/flows/dryrun-saas-ops-01/invoice-list/page.tsx` following task-03's Route Convention
   and Composition Rules, using `app/collection-01/collection-screen.tsx` as the composition
   reference (it is the demo for `collection-table-01`). The clean, rules-compliant approach:
   render the already-composed `CollectionTableScreen` (exported from
   `app/collection-01/collection-screen.tsx`, which is listed in `collection-table-01`'s
   `files[]`, so importing it satisfies task-03 rule 1) in its `default` state. Do not
   fabricate new datasets or edit any `components/**` or the demo route.

3. **Wire the transition (task-03 rule 3):** in
   `app/flows/dryrun-saas-ops-01/overview/page.tsx`, the comment
   `{/* transition: overview.onRowSelect -> invoice-list (unresolved) */}` now targets a
   resolved step. Update it to reference the real route
   `/flows/dryrun-saas-ops-01/invoice-list` (remove "unresolved"). A full row-click handler
   is out of scope; updating the transition annotation is sufficient, but if a trivial
   `<Link>` affordance fits the existing structure without redesign, you may add it.

4. **Update the flow index (task-03):** add a third `<Link>` to
   `app/flows/dryrun-saas-ops-01/page.tsx` — `3. invoice-list` →
   `/flows/dryrun-saas-ops-01/invoice-list`, following the existing markup exactly.

5. **Stories (task-04, NO --force):** run
   `node scripts/gen-pattern-stories.mjs docs/examples/selectionspec-dryrun-02.json`.
   The `invoice-list` blocks (`sidebar-07`, `page-header-actions-01`, `data-table-panel-01`)
   already have `components/patterns/*.stories.tsx` from the overview screen, and
   `filter-toolbar-01` + `collection-table-01-screen` stories exist from task-06 — so this
   run should create **no new files** and skip all existing ones. Verify no unintended
   changes: `git diff registry/` must not clobber the `verification.storybookStories` arrays
   of `collection-table-01` (4 IDs) or `filter-toolbar-01` (1 ID); if the generator rewrote
   them, restore those fields. `npm run validate` must still exit 0.

6. **Check loop + BuildReport (task-05):** run `npm run checks` (full five-check run:
   contracts, lint, typecheck, build, storybook). If any check fails, apply the task-05
   fix-loop policy (fix only `app/flows/**` and `components/patterns/**`; max 3 iterations).
   Then assemble a **new** BuildReport at
   `docs/examples/buildreport-dryrun-saas-ops-02.json`:
   - `flowId` from the SelectionSpec (`dryrun-saas-ops-01`).
   - `screens[]` = the two existing built screens (`login`, `overview`) **plus** a new
     `invoice-list` entry: `route: "/flows/dryrun-saas-ops-01/invoice-list"`,
     `status: "built"`, `filesCreated` = the invoice-list route file (+ any files you
     actually created), `storiesCreated` = the reused collection/block story IDs that cover
     it (e.g. `patterns-collection-collection-table-01--default` and the four state IDs;
     `blocks-filter-toolbar-filter-toolbar-01--default`), `installed: { shadcn: [], npm: [] }`.
   - `checks` from the final full run; `iterations` = number of full check runs.
   - `unresolved: []`.
   - `status: "verified"`.
   - Validate: `npm run validate:specs` (the BuildReport must pass; the schema is
     `additionalProperties: false`, so keep logs out of the JSON).
   Leave the original `docs/examples/buildreport-dryrun-saas-ops-01.json` unchanged (it is
   the historical example of the unresolved outcome).

## Acceptance Criteria

- [ ] `npm run validate` exits 0.
- [ ] `npm run checks` exits 0 (all five checks pass).
- [ ] Routes exist: `/flows/dryrun-saas-ops-01/invoice-list` renders the collection screen
      (sidebar + header + filter toolbar + table); flow index lists all three steps.
- [ ] `git diff` shows task-06's `app/collection-01/*`,
      `components/patterns/collection-table-01-screen.stories.tsx`, and
      `components/patterns/filter-toolbar-01.stories.tsx` **unchanged**.
- [ ] `docs/examples/buildreport-dryrun-saas-ops-02.json` exists, passes
      `npm run validate:specs`, has `status: "verified"`, `unresolved: []`, and an
      `invoice-list` screen entry with `status: "built"`.
- [ ] `docs/examples/buildreport-dryrun-saas-ops-01.json` is unchanged.

## Constraints

- Do NOT edit: `components/ui/*` bodies, existing `registry/*.json` facet values,
  `docs/contracts/*`, anything under `docs/layers/20-selection/*`, the pipeline scripts
  (`scripts/install-selection.mjs`, `gen-pattern-stories.mjs`, `run-checks.mjs`), or
  task-06's demo route and hand-authored stories.
- Do NOT pass `--force` to `gen:pattern-stories`.
- Do NOT modify the `login`/`overview` routes except the one-line transition annotation in
  step 3.
- `docs/examples/checks-latest.json` is a gitignored scratch artifact; do not commit it.
- Do not commit anything unless separately instructed; finish by reporting files
  created/changed, commands run with exit codes, and any requirement you could not satisfy.

## Out of Scope

- Rewriting or "improving" the pipeline scripts or task briefs.
- Sorting/pagination/server data/permission-denied/rtl and any full row-click navigation
  behavior beyond the transition annotation.
- Promoting inventory maturity `experimental → canonical`.
- The upstream selection layer (already done — `selectionspec-dryrun-02.json` is your input).

## Assumptions (correct before running if wrong)

- The BuildReport is emitted as a **new** file `buildreport-dryrun-saas-ops-02.json`,
  preserving `...-01.json` as the historical unresolved example (mirrors how
  `selectionspec-dryrun-02.json` was added alongside `...-01.json`).
- The invoice-list flow route renders the existing composed `CollectionTableScreen` demo
  component rather than re-composing the four blocks inline, since that component is a
  `files[]` member of `collection-table-01` and already encodes the correct composition.
- Reusing task-06's existing collection/filter-toolbar story IDs to cover `invoice-list` in
  the BuildReport is acceptable (no new flow-route screen story is generated, avoiding the
  filename collision).
