# Task 21: Flow-scope the provenance registry digest and harden gen-provenance CLI

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Make the provenance sidecar's registry-inventory digest **flow-scoped** — covering
only the registry items a flow's SelectionSpec references, not the whole `registry/`
directory — so that adding unrelated inventory items no longer invalidates every flow's
sidecar. Also harden the `gen-provenance` CLI so explicit mode is unambiguous. Regenerate
all sidecars and keep `validate:provenance` at exit 0.

## Context

- Provenance helpers: `scripts/lib/provenance.mjs`. `digestRegistryInventory(registryDir)`
  currently digests **every** `registry/*.json` into one digest, so any add/edit/remove
  anywhere changes it. `canonicalDigest` digests canonical (key-sorted) JSON.
  `resolveInput(nameOrPath, baseDir)` resolves inputs; with a bare basename it calls
  `docPath()` which throws `doc basename is ambiguous` when the name exists in two folders.
- Generator `scripts/gen-provenance.mjs`, validator `scripts/validate-provenance.mjs`,
  schema `docs/provenance/ai-provenance.schema.json`, tests `scripts/test-provenance.mjs`
  (`npm run test:provenance`).
- The bug this fixes: the untracked `registry/board-column-01.json` and
  `registry/planning-board-01.json` changed the whole-registry digest and staled the
  **golden** `dryrun-saas-ops-01` sidecar, so `validate:provenance` is red even though those
  items are unrelated to that flow.
- A flow's referenced registry items = the union, over `SelectionSpec.screens`, of each
  screen's `screenPattern.registryItem` and every block selection's `registryItem`.
  SelectionSpec contract: `docs/contracts/ai-selectionspec.schema.json`. Two sidecars exist:
  `docs/examples/buildreport-dryrun-saas-ops-01.provenance.json` and
  `docs/examples/buildreport-studio-portfolio-01.provenance.json`.
- `gen-provenance` explicit mode uses `opt('--flow'/'--selection'/'--build'/'--out')` with
  golden-basename fallbacks; the FlowSpec basename now exists in both `docs/examples/` and
  `docs/layers/10-upstream/`, so a bare-basename `--flow` throws.

## Requirements

1. Add a **selection-scoped** inventory digest to `scripts/lib/provenance.mjs`: a function
   that, given the registry dir and the sorted set of referenced item names (derived from a
   SelectionSpec), returns a digest entry `{ path, algorithm, digest }` over ONLY those
   items (`{name -> canonicalDigest(item)}`), plus the sorted list of referenced names so
   the validator recomputes deterministically. Keep canonical-JSON digesting. Record scoping
   in the entry (e.g. `path: "registry/ (selection-scoped)"`). A referenced item absent from
   `registry/` is a hard, fail-loud error — never a silent skip.
2. Generator and validator must compute this digest over the **same** referenced-item set:
   the generator derives it from the flow's SelectionSpec; the validator re-derives it from
   the same SelectionSpec (resolved by `flowId` beside the sidecar) and compares. Update
   `docs/provenance/ai-provenance.schema.json` (and its `$comment`) only as needed to admit
   the new entry shape; do not weaken any existing invariant or prohibited-key rule.
3. Harden `gen-provenance` explicit mode: if ANY of `--flow/--selection/--build/--out` is
   present, require ALL four (error naming the missing flags); remove golden-basename
   fallbacks in explicit mode. Resolve a bare basename that exists in multiple doc folders by
   preferring `docs/examples/` (the in-pipeline copy); a full path passed directly is honored
   as-is. Bulk mode (no flags) is unchanged EXCEPT it must never rewrite a sidecar whose
   triple it did not recompute.
4. Regenerate BOTH sidecars with the new scheme. `npm run validate:provenance` exits 0 for
   both flows — the golden red must disappear because its digest now covers only its own
   referenced items.
5. Extend `scripts/test-provenance.mjs` with regressions proving: (a) adding an UNRELATED
   registry item leaves a flow's digest unchanged; (b) editing a REFERENCED item changes it;
   (c) explicit mode with a missing flag errors; (d) an ambiguous basename resolves to
   `docs/examples/`. `npm run test:provenance` exits 0.
6. `npm run validate`, `npm run validate:pipeline`, and `npm run checks` stay exit 0.

## Constraints

- Do not edit `docs/contracts/*`, `components/ui/*`, `registry/*.json` facet values, or
  `docs/layers/20-selection/*`.
- Do not change the golden flow's `flowspec`/`selectionspec`/`buildreport` **content**; only
  its provenance sidecar is regenerated.

## Acceptance criteria

- [ ] `npm run validate:provenance` exits 0 (both flows green).
- [ ] `npm run test:provenance` exits 0 with the four new regressions.
- [ ] `npm run validate`, `npm run validate:pipeline`, `npm run checks` all exit 0.
- [ ] Report shows the before/after `registryInventory` digest entry for both sidecars.

## Out of scope

- Selection scoring, route generation, a11y work, committing.
