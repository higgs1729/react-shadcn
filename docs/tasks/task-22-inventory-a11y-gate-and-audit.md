# Task 22: Add an inventory a11y gate and audit/fix existing pattern stories

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Close the latent-accessibility-defect class that surfaced downstream in Task 20: make the
storybook a11y runner a **stock-time** acceptance gate for new inventory, and audit + fix
every existing pattern story so the whole registry passes a11y today.

## Context

- The a11y check = `vitest run --project=storybook <story>` with `VITE_SB_A11Y_MODE=error`
  (see `scripts/lib/check-registry.mjs`; `.storybook/preview.tsx` reads the env). Pattern
  stories are `components/patterns/*.stories.tsx` (both screen- and block-level).
- Known defect classes found in Task 20: `components/ui/item.tsx` `ItemGroup` renders
  `role="list"`, so its children must be `role="listitem"` (a `button` or `role=separator`
  child fails `aria-required-children`); a nested `<main>` inside `SidebarInset` (itself a
  `<main>`) fails `landmark-no-duplicate-main`/`landmark-main-is-top-level`; two unnamed
  `<aside>` fail `landmark-unique`; a lone `<h3>` fails `heading-order`.
- Already fixed today (do NOT redo): `app/detail-01/detail-screen.tsx`,
  `app/conversation-assistant-01/conversation-assistant-screen.tsx`,
  `components/ai-conversation-list-01.tsx`, `components/activity-feed-01.tsx`. Audit the rest.
- Inventory briefs: `docs/tasks/task-16-add-one-screen-type.md`,
  `docs/tasks/task-18-stock-one-existing-block-role.md`,
  `docs/tasks/task-19-add-one-new-block-role.md`. Implementation regs (editable):
  `docs/layers/30-implementation/ai-implementation-instructions.md`. Layer 20 is protected.

## Requirements

1. Run the a11y runner (`VITE_SB_A11Y_MODE=error`) over EVERY
   `components/patterns/*.stories.tsx`. Enumerate every failing story with its axe rule IDs.
2. Fix each violation at its source — in the composing screen/block component or the pattern
   story, structurally (real `listitem` children, single labeled landmarks, correct heading
   order). NEVER edit `components/ui/*` or `registry` facet values. If a violation traces to
   a `components/ui/*` primitive's own markup and cannot be fixed at the call site, STOP and
   report it as an escalation instead of editing `ui/*`.
3. Add the a11y gate to inventory acceptance: append to the acceptance criteria of
   `task-16`, `task-18`, and `task-19` that the new pattern's story must pass
   `VITE_SB_A11Y_MODE=error` before completion, and add one line to
   `docs/layers/30-implementation/ai-implementation-instructions.md` making a11y pass
   mandatory at stock time (not only at flow-build time).
4. After fixes, `npm run gen:pattern-stories` may rewrite `verification.storybookStories`
   (the only sanctioned registry write). `npm run checks` and `npm run validate` stay exit 0,
   and `node scripts/run-planned-checks.mjs` over discovered flows stays `passed: true`.
5. Report every component/story edited and every story that went from failing to passing.

## Constraints

- No `components/ui/*`, no `registry` facet edits (except the gen-pattern-stories
  write-back), no `docs/contracts/*`, no `docs/layers/20-selection/*`.
- Do not re-edit today's four already-fixed files except incidentally.

## Acceptance criteria

- [ ] Every `components/patterns/*.stories.tsx` passes `VITE_SB_A11Y_MODE=error` (list the
      before/after set of failing stories).
- [ ] `task-16`/`task-18`/`task-19` and the 30-implementation doc state the a11y gate.
- [ ] `npm run checks`, `npm run validate`, `npm run validate:pipeline` exit 0;
      `run-planned-checks` reports `passed: true`.

## Out of scope

- Provenance, selection scoring, route generation, adding new inventory, committing.
