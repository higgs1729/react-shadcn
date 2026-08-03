# Task 04: Pattern Story Generation (`scripts/gen-pattern-stories.mjs`)

Execution order: after task 03 (pages must exist for screen stories to compose).

## Objective

Create a generator that reads a SelectionSpec and produces Storybook stories for every
selected block item and screen composition, then writes the created story IDs back into
each registry item's `verification.storybookStories`. This populates the catalog's
pattern shelves (`Blocks/...`, `Patterns/...`) the same way `scripts/gen-atom-stories.mjs`
populated `Components/...`.

## Context

- Repo root: `C:\Users\tomoy\Desktop\react-shadcn`. Storybook 10 (`@storybook/nextjs-vite`)
  with addons a11y/docs/themes. Dark mode toggles via `.dark` class (`@storybook/addon-themes`).
- `.storybook/main.ts` scans ONLY `../components/**/*.stories.*` — place generated story
  files under `components/patterns/` so they are picked up without config changes.
- Prior art to imitate (read it first): `scripts/gen-atom-stories.mjs` — same style:
  a Node ESM generator, import names read from source files, `Meta`/`StoryObj` typed via
  `@storybook/nextjs-vite`, `tags: ['autodocs']`.
- Input fixture: `docs/examples/selectionspec-dryrun-01.json`. Registry items:
  `registry/<name>.json`. Docs resolve via `scripts/lib/paths.mjs` (`readDoc`).
- Sidebar taxonomy (title drives the tree):
  - Block item → `Blocks/<blockRole>/<ItemName>` (e.g. `Blocks/chart-panel/Chart Panel 01`)
  - Screen composition → `Patterns/<resolvedScreenType>/<ItemName>`
    (e.g. `Patterns/dashboard/Dashboard 01`)

## Requirements

1. Create `scripts/gen-pattern-stories.mjs`. CLI:
   `node scripts/gen-pattern-stories.mjs <path-to-selectionspec.json> [--force]`.
2. Validate the input with ajv against `readDoc('ai-selectionspec.schema.json')`
   (+ facets schema via `addSchema`), same options as `scripts/validate-spec.mjs`.
3. For each `screens[].blocks[]` entry: load `registry/<registryItem>.json`, take its
   first `files[]` entry of type `registry:component`, extract the default-exported or
   primary named component (reuse the export-extraction approach from
   `gen-atom-stories.mjs`), and write
   `components/patterns/<registryItem>.stories.tsx` rendering that component with its
   minimal required wrapper:
   - `app-shell-sidebar` blocks need `SidebarProvider` (import from
     `components/ui/sidebar.tsx`) and `layout: 'fullscreen'`.
   - `page-header-actions` blocks also need `SidebarProvider` (they use `SidebarTrigger`).
   - Chart/table/metric/form blocks render bare, `layout: 'centered'` for form/metric,
     `'padded'` for chart/table.
   - Table-like blocks that require a `data` prop import the dataset the item ships
     (e.g. `app/dashboard-01/data.json`); check the component's props by reading its file.
4. For each `screens[]` entry: write
   `components/patterns/<screenPattern.registryItem>-screen.stories.tsx` that renders the
   composed route component by importing the page component generated in task 03
   (`app/flows/<flowId>/<stepId>/page.tsx`), `layout: 'fullscreen'`.
5. States: emit one story named `Default`. For every state in the screen's
   `stateCoveragePlan` beyond `default` that the item's `meta.aiDesignSystem.stateCoverage`
   does NOT declare, add a `// TODO state not implemented in inventory: <state>` comment
   instead of a story. Never fabricate loading/empty/error renders.
6. Skip existing story files unless `--force` (same convention as gen-atom-stories).
7. Write-back: for every item that got a story, update `registry/<name>.json`
   `meta.aiDesignSystem.verification.storybookStories` with the story IDs
   (Storybook ID format: lowercased title with `/`→`-`, spaces→`-`, plus `--default`).
   Preserve all other fields byte-for-byte (read JSON, mutate, `JSON.stringify(..., 2)`).
8. Add npm script `"gen:pattern-stories": "node scripts/gen-pattern-stories.mjs"`.

## Acceptance Criteria

- [ ] `node scripts/gen-pattern-stories.mjs docs/examples/selectionspec-dryrun-01.json`
      exits 0 and creates 6 block stories + 2 screen stories under `components/patterns/`.
- [ ] `npm run build-storybook` exits 0.
- [ ] Storybook sidebar shows `Blocks/...` and `Patterns/...` sections alongside the
      existing `Components/...` tree (verify via dev server or the built manifest).
- [ ] Each affected `registry/*.json` now lists its story IDs in
      `verification.storybookStories`, and `npm run validate` still exits 0.
- [ ] Second run without `--force` creates nothing and exits 0.

## Out of Scope

- Interaction tests, a11y test assertions, visual snapshots (future check-loop work).
- Stories for unselected registry items or for states the inventory doesn't implement.
- Modifying `.storybook/*` config or `scripts/gen-atom-stories.mjs`.

## Pitfalls

- `login-form.tsx` etc. may be server-component-friendly but stories render client-side;
  if a component uses `next/navigation` hooks, wrap or skip with a clear report note.
- Story ID derivation must match Storybook's algorithm; when unsure, run
  `npm run build-storybook` and read `storybook-static/index.json` to confirm IDs before
  writing them into registry items.
- Do not reformat registry JSON beyond the one field you add (2-space indent, trailing
  newline preserved).
