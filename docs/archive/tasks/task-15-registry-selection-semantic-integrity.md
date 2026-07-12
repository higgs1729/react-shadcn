# Task 15: Add registry–selection semantic integrity to the pipeline validator

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Close the gap where `validate:pipeline` only checks that a selected registry item
*exists by name*, letting semantically wrong selections pass. Add five facet-aware
cross-document invariants to the pipeline validator, plus a non-failing inventory
coverage report. Implements RFC 009.

## Context

- `scripts/validate-pipeline.mjs` is the cross-artifact semantic validator. All
  cross-document rules live here; contract schemas are immutable. It currently calls
  `loadRegistryItemNames()` which returns a `Set` of item names only (facets discarded),
  and enforces `REGISTRY_ITEM_EXISTS` (name existence) at ~line 159.
- A registry item's facets are at `meta.aiDesignSystem` in each `registry/<name>.json`.
  Relevant fields:
  - screen-pattern item: `assetKind: "screen-pattern"`, `screenType`,
    `composition.requiredBlocks` (array of blockRole), `dependencies.shadcn` (array).
  - block-pattern item: `assetKind: "block-pattern"`, `blockRole` (single),
    `dependencies.shadcn` (array).
  - Example: `registry/collection-table-01.json` (screen-pattern),
    `registry/filter-toolbar-01.json` (block-pattern).
- A SelectionSpec screen (see `docs/contracts/ai-selectionspec.schema.json`) carries:
  `resolvedScreenType`, `screenPattern.registryItem`, `blocks[]` each with
  `{ blockRole, registryItem }`, and `registryDependencies` (array of strings).
- Canonical vocabulary lives in `ai-canonical-profiles.json` (resolve via
  `readDoc('ai-canonical-profiles.json')` from `scripts/lib/paths.mjs`):
  `screenTypes` and `blockRoles` are objects; their keys are the full vocabulary
  (10 screenTypes, 30 blockRoles).
- Regression harness: `scripts/test-pipeline.mjs` (run via `npm run test:pipeline`).
  Each fixture in `scripts/fixtures/pipeline/` is a schema-valid artifact violating
  exactly one invariant; a helper `expectFailure(label, paths, invariant)` asserts the
  validator exits non-zero AND prints the invariant name. `expectPass` asserts the
  golden triple still validates. Fixtures are passed via `--flow/--selection/--build`.
- The golden triple under `docs/examples/` (`flowspec-`, `selectionspec-`,
  `buildreport-dryrun-saas-ops-01.json`) must continue to validate clean — do not edit it.

## Requirements

1. Replace the name-only registry loader in `scripts/validate-pipeline.mjs` with one
   that returns a `Map<itemName, facets>` (facets = `meta.aiDesignSystem`), keeping the
   existing malformed-file tolerance (a parse error must not mask an otherwise-valid run;
   fall back to a name-only entry with no facets rather than throwing).
2. Keep `REGISTRY_ITEM_EXISTS` behavior unchanged (still fail when a selected pattern or
   block name is absent from `registry/`).
3. Add these invariants, each reported like existing ones (naming artifact, stepId,
   invariant tag, message), never stopping after the first violation. Skip an item's
   facet-based checks only when that item is absent (already covered by
   REGISTRY_ITEM_EXISTS) or its facets failed to parse:
   - `ASSET_KIND_MATCH`: the `screenPattern.registryItem` facet `assetKind` must be
     `"screen-pattern"`; every `blocks[].registryItem` facet `assetKind` must be
     `"block-pattern"`.
   - `SCREENTYPE_MATCH`: the screenPattern facet `screenType` must equal the screen's
     `resolvedScreenType`.
   - `BLOCK_ROLE_MATCH`: for each block, the item's facet `blockRole` must equal the
     SelectionSpec `blocks[].blockRole`.
   - `REQUIRED_BLOCKS_COVERED`: every role in the screenPattern facet
     `composition.requiredBlocks` must appear among the selected `blocks[].blockRole`;
     and no blockRole may appear twice within one screen's `blocks`.
   - `DEPENDENCY_UNION`: the union of `dependencies.shadcn` across the selected
     screenPattern and blocks must all be present in the screen's `registryDependencies`.
     A missing dependency fails; extra entries in `registryDependencies` are allowed.
4. Add one single-violation fixture per new invariant under `scripts/fixtures/pipeline/`
   (derive from the golden SelectionSpec so only the tested field is wrong), and a
   matching `expectFailure(...)` call in `scripts/test-pipeline.mjs`.
5. Create `scripts/report-inventory-coverage.mjs`: read the canonical profiles and all
   `registry/*.json`, then print, for every canonical screenType and every canonical
   blockRole, how many registry items provide it (screen-patterns counted by
   `screenType`, block-patterns by `blockRole`). Mark zero-inventory entries visibly as
   a gap. It is observability only: **always exit 0**, never fail on gaps.
6. Add `package.json` scripts: `"report:coverage": "node scripts/report-inventory-coverage.mjs"`.
   Add a lightweight test `scripts/report-inventory-coverage.test.mjs` +
   `"test:coverage": "node scripts/report-inventory-coverage.test.mjs"` asserting the
   report exits 0 and its output names all canonical screenTypes and blockRoles.

## Constraints

- Do not modify any file under `docs/contracts/`, `docs/layers/20-selection/`,
  `registry/*.json`, or `components/ui/*`.
- Do not edit the golden artifacts under `docs/examples/`.
- Keep all new cross-document rules inside `scripts/validate-pipeline.mjs` (schemas stay
  immutable). Reuse the existing BOM-tolerant JSON read and reporting style already in
  that file.
- Match existing code style (Node ESM `.mjs`, no new dependencies).

## Acceptance criteria

- [ ] `npm run test:pipeline` exits 0 with the golden triple passing and every new
      invariant fixture rejected non-zero and naming its invariant tag.
- [ ] `npm run validate:pipeline` (no args) still validates the golden flow clean (exit 0).
- [ ] `npm run report:coverage` exits 0 and lists all 10 canonical screenTypes and all
      30 canonical blockRoles with their inventory counts (zeros shown as gaps).
- [ ] `npm run test:coverage` exits 0.
- [ ] `npm run validate` and `npm run checks` both exit 0.

## Out of scope

- Enforcing inventory gaps (report is non-failing by design).
- Vocabulary (enum) extension and verification write-back rules (RFC 010).
- Generalizing story-generation render adapters (P2-2).
- Any change to contract schemas or canonical profiles.
