# Task 17: Stock one block-pattern for every empty blockRole

Prerequisite: read "Shared ground rules for every executor" in `docs/tasks/README.md`
before starting. They apply to this task.

## Objective

Fill the block-pattern inventory: add exactly one new `experimental` block-pattern for
each blockRole that currently has zero registry items, composed from the already-vendored
`components/ui/*` primitives. This stocks the shelf so later screenType additions
(`docs/tasks/task-16`) have blocks to compose. `npm run report:coverage` must end at
30/30 blockRoles stocked.

This brief is delegable in batches: implement only the rows the coordinator assigns you,
complete each fully (3 files) before the next, and report per row.

## Context

- The blockRole vocabulary and each role's facets live in
  `docs/layers/20-selection/ai-canonical-profiles.json` under `blockRoles.<role>`
  (READ-ONLY — never edit it). For every item you create, copy `userIntents`,
  `dataShapes`, `interactionModels`, and `layoutModel.region` from that role's profile so
  the inventory stays consistent with the answer key.
- The canonical example of a standalone block-pattern is three files:
  1. component: `components/filter-toolbar.tsx` — presentational, fully controlled
     (props in, callbacks out), no data fetching, no routing.
  2. registry item: `registry/filter-toolbar-01.json` — mirror its
     `meta.aiDesignSystem` structure exactly, swapping values.
  3. Storybook story: `components/patterns/filter-toolbar-01.stories.tsx` — a hand-written
     stateful demo wrapper (the auto-generator emits `render: () => <Comp />` with no
     props, which will NOT compile for a props-taking component, so you must hand-write
     the story with a demo wrapper that supplies state/props).
- Read each primitive's source in `components/ui/` before using it. This repo is
  **base-ui, not Radix**: there is no `asChild` or `type="single"`. Composition is
  `render={<.../>}`. Example base-ui shapes visible in `components/filter-toolbar.tsx`:
  `ToggleGroup multiple={false} value={[v]} onValueChange={(arr)=>...}`, and `Select`
  takes an `items` prop with `onValueChange` guarded against `null`.
- Registry item JSON shape (per file): top-level `$schema`
  (`https://ui.shadcn.com/schema/registry-item.json`), `name` (= the item name below),
  `type: "registry:block"`, `title`, `description`, `categories`
  (`["block:<short>", "role:<blockRole>"]`), `registryDependencies` (the `components/ui`
  primitives the component imports, by basename), `files: [{ path:
  "components/<name>.tsx", type: "registry:component" }]`, and `meta.aiDesignSystem` with:
  `assetKind: "block-pattern"`, `maturity: "experimental"`, `source: "internal"`,
  `blockRole`, the four profile-sourced facet arrays, `density`, `stateCoverage`
  (`["default","mobile","dark-mode"]` unless the block is trivially stateless),
  `accessibility` (keyboard/focusVisible/labels true, contrastChecked false, a short
  notes string), `dependencies` (`shadcn`: same list as registryDependencies, `npm`:
  `["lucide-react"]` only if icons are used, `registries: []`), `composition`
  (`requiredBlocks: []`, `optionalBlocks: []`, `incompatibleWith: []` — see per-row notes
  for the one exception), `verification` (`storybookStories:
  ["blocks-<blockRole>-<name>--default"]`, the other four booleans false), `evidence`
  (`sourceCount`, `confidence: "low"|"medium"`, `verifiedAt: "2026-07-12"`, `sourceUrls`
  = shadcn docs URL + `file:///docs/layers/20-selection/ai-canonical-profiles.json`),
  `risk` (`level: "low"`, `missingStates: ["permission-denied","rtl"]`, a notes string),
  `extensions.localEvidence: ["components/<name>.tsx"]`.
- Story: title `Blocks/<blockRole>/<Title>`, one `Default` story, so its ID is
  `blocks-<blockRole>-<name>--default` (lowercase, non-alphanumerics → `-`). This must
  equal the `verification.storybookStories` entry.
- Component file path: `components/<name>.tsx` (use the exact item name, e.g.
  `components/breadcrumb-context-01.tsx`), so it never collides with a `components/ui/`
  primitive.
- Facet schema is enforced by `npm run validate:facets`; the profile referential check
  passes automatically because every `blockRole` below already exists in the profile.

## Block-pattern spec (one item per row; name = `<blockRole>-01`)

Copy `userIntents` / `dataShapes` / `interactionModels` / `layoutModel.region` for each
from `blockRoles.<blockRole>` in the profile. Pick `density` sensibly (state/label blocks
`low`; most others `medium`). Compose only from the listed primitives (add a primitive if
genuinely needed, but stay minimal and presentational).

| name | blockRole | primitives (`components/ui/*`) | composition |
| --- | --- | --- | --- |
| breadcrumb-context-01 | breadcrumb-context | breadcrumb | hierarchy breadcrumb trail with current page |
| tabs-view-switcher-01 | tabs-view-switcher | tabs | segmented tabs switching views of the same data |
| command-search-01 | command-search | command, dialog (or the command dialog export) | ⌘K command palette with grouped searchable items |
| empty-state-01 | empty-state | empty, button | no-data illustration + title + primary CTA |
| error-recovery-01 | error-recovery | empty (or alert), button | error/permission-denied message + retry action |
| loading-skeleton-01 | loading-skeleton | skeleton | placeholder rows/cards for a loading region |
| modal-dialog-01 | modal-dialog | dialog, button, field/input | focused confirm/edit task in a dialog |
| drawer-inspector-01 | drawer-inspector | sheet (or drawer), button, field | side panel inspecting/editing one record |
| notification-center-01 | notification-center | popover, item, badge, button | bell trigger + list of notifications with unread badge |
| action-footer-01 | action-footer | button-group, button | sticky footer primary + secondary actions (save/cancel) |
| detail-overview-01 | detail-overview | card, field (or item), separator, badge | record summary: labelled fields + status |
| collection-grid-01 | collection-grid | card, badge | responsive card/tile grid of collection items |
| settings-section-01 | settings-section | card, field, switch, label | grouped settings rows with inline toggles |
| pricing-plan-card-01 | pricing-plan-card | card, button, badge, separator | plan/tier card with features + select action |
| checkout-summary-01 | checkout-summary | card, separator, button | order line items + total + confirm |
| file-upload-area-01 | file-upload-area | attachment (read its API first), button | drag-drop / picker upload zone with file list |
| activity-feed-01 | activity-feed | item, avatar, separator | chronological activity/audit stream |
| comment-thread-01 | comment-thread | card (or message), avatar, textarea, button | threaded comments + reply composer |
| wizard-stepper-01 | wizard-stepper | separator, badge (compose a stepper) | horizontal step indicator with active/complete states |
| app-shell-topnav-01 | app-shell-topnav | navigation-menu, button | top navigation bar shell. Set `composition.incompatibleWith: ["app-shell-sidebar"]` |
| ai-conversation-list-01 | ai-conversation-list | item, scroll-area, button | list of AI chat threads with active selection |
| ai-prompt-composer-01 | ai-prompt-composer | textarea, button, input-group (attachment optional) | prompt input with send + attach controls |
| ai-explainability-label-01 | ai-explainability-label | badge, tooltip (or hover-card) | inline "AI-generated / confidence" provenance label |

## Requirements

1. For each assigned row, create exactly three files (component, registry item, story) as
   specified in Context, and nothing else.
2. Every component is presentational and controlled: props in, callbacks out, no `fetch`,
   no network, no routing, no top-level side effects. Where the block needs state to be
   demoable (most of them), the state lives in the **story's** demo wrapper, not the
   component.
3. Registry `meta.aiDesignSystem` mirrors `registry/filter-toolbar-01.json`'s structure;
   `assetKind: "block-pattern"`, `maturity: "experimental"`, and the four facet arrays
   copied from the role profile. Do not over-claim `stateCoverage`, `accessibility`, or
   `verification` beyond what the code actually does.
4. Each story's `Default` mounts without throwing and its ID matches
   `verification.storybookStories`.
5. After your batch, run and report the acceptance commands below for your files.

## Constraints

- Do not edit any existing file: no `components/ui/*`, no existing `registry/*.json`, no
  `docs/contracts/*`, no `docs/layers/20-selection/*`, no `docs/examples/*`. This task is
  purely additive.
- Do not add a new blockRole or screenType, and do not create any screen-pattern
  (`assetKind: "screen-pattern"`) — screen composition is task-16's job.
- Do not promote maturity beyond `experimental`.
- Do not add npm dependencies; `lucide-react` for icons is already available.
- One item per empty role — do not add second variants or duplicate an existing block
  (no extra sidebar/login/toolbar variants).

## Acceptance criteria

- [ ] `npm run validate:facets` exits 0 and lists each new item as valid block-pattern.
- [ ] `npm run validate` exits 0.
- [ ] `npm run lint` and `npm run typecheck` exit 0.
- [ ] `npm run build-storybook` exits 0 (all new stories compile).
- [ ] `npm run checks` exits 0.
- [ ] `npm run report:coverage` shows every assigned blockRole as stocked (goal across all
      batches: 30/30 blockRoles, 0 gaps).

## Out of scope

- Screen-patterns and new screenTypes (task-16).
- Editing profiles, contracts, or existing inventory/primitives.
- Wiring blocks into any flow, route, or SelectionSpec.
- Maturity promotion or human-review approval.
