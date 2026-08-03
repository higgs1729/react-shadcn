# Task 24: Generate per-step flow route wrappers from the SelectionSpec

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Generate the per-step Next.js route wrappers for a flow's resolved steps from its
SelectionSpec/BuildReport instead of hand-writing near-identical `page.tsx` files, cutting
implementation-layer effort. Generated routes must match the existing hand-written
convention and be idempotent.

## Context

- Routes live at `app/flows/<flowId>/<stepId>/page.tsx`. Convention (see today's
  `app/flows/studio-portfolio-01/*` and the golden `app/flows/dryrun-saas-ops-01/*`):
  multi-state steps wrap the shared `app/<pattern>-01/<pattern>-screen.tsx` with `?state=`
  + `Suspense`; single-state steps render the screen directly as a Server Component. The
  screen component and its state prop come from the SelectionSpec's chosen `screenPattern`
  per step.
- Read the relevant Next.js guide under `node_modules/next/dist/docs/` before generating
  routes.
- Precedent for "generated, not hand-authored": `scripts/gen-pattern-stories.mjs`.
- Only RESOLVED steps get routes; `unresolved` steps get none.
- Coordinator has already added npm scripts `gen:flow-routes` and `test:flow-routes`.

## Requirements

1. Add `scripts/gen-flow-routes.mjs` that reads a flow's SelectionSpec (+ BuildReport for the
   resolved/unresolved split) and writes `app/flows/<flowId>/<stepId>/page.tsx` for each
   RESOLVED step using the established wrapper convention, mapping each step to its
   `screenPattern`'s screen component and required state prop. Re-running must produce
   byte-identical files (idempotent).
2. Prove it against `studio-portfolio-01`: regenerating its 16 routes yields files
   functionally identical to the current hand-written ones (same screen import, same state
   wiring). Report any diff and justify it; if the generator's output is a strict improvement,
   keep the generated version and note the change.
3. Add `scripts/gen-flow-routes.test.mjs` asserting generation is idempotent, that a route is
   produced for every resolved step, and none for any `unresolved` step. `npm run
   test:flow-routes` exits 0.
4. Adopt it: update `.claude/agents/pipeline-implementation.md` so WP-B runs `gen:flow-routes`
   for resolved steps instead of hand-writing each `page.tsx` (it still generates stories and
   runs checks). Add a note there that whole-repo `build`/`build-storybook` is run once by the
   coordinator, not per-subagent, to avoid concurrent `next build` lock contention.
5. The regenerated studio routes keep `run-planned-checks` at `passed: true` and
   `npm run checks` exit 0.

## Constraints

- Do not edit `components/ui/*`, `registry` facet values, `docs/contracts/*`, or
  `docs/layers/20-selection/*`. Do not change screen-component behavior. Generated routes
  must not hand-build the app shell (global nav, root routes, i18n).

## Acceptance criteria

- [ ] `npm run gen:flow-routes -- studio-portfolio-01` regenerates its routes idempotently,
      functionally identical to the current set.
- [ ] `npm run test:flow-routes` exits 0.
- [ ] `.claude/agents/pipeline-implementation.md` instructs using the generator + the
      centralized-checks note.
- [ ] `npm run checks`, `npm run validate`, `npm run validate:pipeline` exit 0;
      `run-planned-checks` reports `passed: true`.

## Out of scope

- Provenance, selection scoring, a11y, new flows, committing.
