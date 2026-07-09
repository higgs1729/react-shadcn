# Task 06: Collection Inventory (`collection-table-01` screen pattern + `filter-toolbar-01` block)

Layer: pattern-registry inventory (feeds the selection layer). Conventions follow tasks 01-05.
Execution order: standalone; requires tasks 01-05 outputs to exist (they do).

## Objective

Stock the registry so a `collection` screen can be resolved: build one new block component
(filter toolbar), one demo composition route with full state coverage, and two registry
items. This removes the only `unresolved` step (`invoice-list`) from the golden flow.
All design decisions are fixed below — implement, do not redesign.

## Context

- Repo root: `C:\Users\tomoy\Desktop\react-shadcn` (Next.js App Router + shadcn/ui,
  purple oklch theme, Windows).
- Existing prior art to imitate (read before writing code):
  - `components/data-table.tsx` — table block (its toolbar section shows Select/ToggleGroup usage)
  - `components/site-header.tsx` — flat block component style
  - `app/dashboard-01/page.tsx` — screen-pattern demo route convention
  - `registry/data-table-panel-01.json`, `registry/dashboard-01.json` — registry item shape
- **base-ui, not Radix**: this project's `components/ui/*` wrap `@base-ui/react`.
  There is NO `asChild`; composition uses the `render={<... />}` prop. There is no
  `type="single"` on group primitives. When unsure about a prop, read the component
  source in `components/ui/` — never assume Radix API.
- Contracts: `npm run validate` must stay green. Canonical role profile for
  `filter-toolbar` (in `docs/layers/20-selection/ai-canonical-profiles.json`):
  intents `[filter, search, compare]`, shapes `[collection, categorical]`,
  interactions `[filter-sort]`, region `header`. Item facets must stay consistent with
  it (role-fit scoring direction: item facets ⊆ role profile).

## Deliverable 1: `components/filter-toolbar.tsx`

A presentational, controlled filter toolbar. Client component (`"use client"`).

Props (exact contract):

```ts
interface FilterToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  status: string                       // "all" | domain values
  onStatusChange: (value: string) => void
  statusOptions: { value: string; label: string }[]
  view: "table" | "grid"
  onViewChange: (view: "table" | "grid") => void
}
```

Composition (left to right): search input (`InputGroup` + `InputGroupInput` from
`components/ui/input-group.tsx`, with a search icon via `lucide-react`), status filter
(`Select` family from `components/ui/select.tsx`), spacer, view switcher (`ToggleGroup` /
`ToggleGroupItem` from `components/ui/toggle-group.tsx`, values `"table"`/`"grid"`,
icon-only items with `aria-label`). Wrap in a `flex items-center gap-2` container.
Tailwind only, no new CSS. Keyboard operability comes from the primitives; add
`aria-label` on the search input and both toggle items.

## Deliverable 2: `app/collection-01/` demo route

- `app/collection-01/data.json`: 15 invoice rows:
  `{ "id": "INV-1001", "customer": "...", "amount": 1234.5, "status": "paid" | "pending" | "overdue", "date": "2026-06-01" }`.
  Vary statuses and dates; plain fictional company names.
- `app/collection-01/page.tsx`: composition skeleton in dashboard-01 style:
  `SidebarProvider > AppSidebar (reuse existing components/app-sidebar.tsx) + SidebarInset >
  SiteHeader > main`: `FilterToolbar` above a data table of the invoices.
  The table may reuse `components/data-table.tsx` if its props fit; if its column schema
  is hard-wired to dashboard data, instead build the table inline with
  `components/ui/table.tsx` + `checkbox` for row selection (keep it simple; sorting via
  column header click is NOT required — filter/search/status wiring IS).
- **State coverage (this is the point of the pattern)** — the page reads
  `?state=loading|empty|error` from `useSearchParams` (or a client toggle) and renders:
  - `loading`: 5 skeleton rows (`components/ui/skeleton.tsx`) in the table body
  - `empty`: `Empty`/`EmptyHeader`/`EmptyTitle`/`EmptyDescription` from
    `components/ui/empty.tsx` with a "Clear filters" action button
  - `error`: `Alert` (destructive) from `components/ui/alert.tsx` with a retry `Button`
  - default: the interactive table; search filters by customer/id, status select filters
    rows, view toggle switches table ↔ simple card grid (`components/ui/card.tsx`)

## Deliverable 3: registry items

`registry/filter-toolbar-01.json` — `type: registry:block`,
`registryDependencies: ["input-group", "select", "toggle-group", "button"]`,
`files: [components/filter-toolbar.tsx]`, meta.aiDesignSystem:

- assetKind `block-pattern`, maturity `experimental`, source `internal`
- blockRole `filter-toolbar`, userIntents `["filter", "search"]`,
  dataShapes `["collection", "categorical"]`, interactionModels `["filter-sort"]`,
  layoutModel `{ "region": "header" }`, density `medium`
- stateCoverage `["default", "mobile", "dark-mode"]`
- evidence: sourceCount 2, confidence `medium`, verifiedAt = completion date,
  sourceUrls: shadcn docs + this repo's canonical profiles doc
- composition: requiredBlocks `[]`, optionalBlocks `[]`, incompatibleWith `[]`

`registry/collection-table-01.json` — `type: registry:block`, files: the page, data.json
(and filter-toolbar via registries dep), meta.aiDesignSystem:

- assetKind `screen-pattern`, maturity `experimental`, source `internal`
- screenType `collection`, jobMapStages `["locate"]`
- blockRoles `["app-shell-sidebar", "page-header-actions", "filter-toolbar", "data-table-panel"]`
- userIntents `["browse", "search", "filter"]`, dataShapes `["collection"]`,
  interactionModels `["filter-sort", "selection-multiple", "disclosure"]`, density `high`
- **stateCoverage `["default", "loading", "empty", "error", "mobile", "dark-mode"]`**
  (all four data states are implemented in Deliverable 2 — do not declare states you
  did not implement)
- layoutModel `{ "shell": "sidebar", "region": "full-page", "responsive": ["mobile", "desktop"] }`
- composition: requiredBlocks = the four blockRoles above; optionalBlocks
  `["tabs-view-switcher", "collection-grid", "empty-state", "loading-skeleton", "drawer-inspector", "modal-dialog"]`;
  incompatibleWith `["app-shell-topnav"]`
- dependencies.registries: `["sidebar-07", "page-header-actions-01", "filter-toolbar-01", "data-table-panel-01"]`
- risk: level `low`, missingStates `["permission-denied", "rtl"]`, note that data is a
  static JSON sample

## Deliverable 4: stories

1. Run `node scripts/gen-pattern-stories.mjs` is NOT applicable (it consumes a
   SelectionSpec). Author stories by hand in the gen-pattern-stories style:
   - `components/patterns/filter-toolbar-01.stories.tsx` — title
     `Blocks/filter-toolbar/Filter Toolbar 01`, one `Default` story with local
     `useState` wiring for the controlled props.
   - `components/patterns/collection-table-01-screen.stories.tsx` — title
     `Patterns/collection/Collection Table 01`, `layout: 'fullscreen'`, stories:
     `Default`, `Loading`, `Empty`, `Error` (render the page component with the state
     forced; if `useSearchParams` blocks Storybook rendering, lift the state into a
     component prop with the searchParam as fallback — the page keeps working in Next).
2. Write the story IDs into both registry items' `verification.storybookStories`.

## Acceptance Criteria

- [ ] `npm run checks` exits 0 (contracts / lint / typecheck / build / storybook).
- [ ] `npm run validate` exits 0 — in particular validate:facets passes the
      inventory-first check for `collection-table-01` (all four requiredBlocks stocked).
- [ ] `/collection-01` renders in `npm run dev`: search narrows rows, status select
      filters, view toggle switches table/grid, and `?state=loading|empty|error` shows
      the three non-default states.
- [ ] Storybook shows `Blocks/filter-toolbar/...` (1 story) and
      `Patterns/collection/...` (4 stories).
- [ ] No edits to `components/ui/*`, existing registry item facet values,
      `docs/contracts/*`, or `docs/layers/20-selection/*`.

## Out of Scope

- Selection-layer re-run and SelectionSpec/BuildReport updates (a follow-up task will
  re-run the flow once this inventory lands).
- Sorting, pagination, server data, drawer-inspector, permission-denied/rtl states.
- Promoting maturity beyond `experimental` (human review does that).

## Pitfalls

- base-ui: no `asChild` (use `render={...}`), no `type="single"` on ToggleGroup
  (single-select is the default); check `components/ui/toggle-group.tsx` source.
- `useSearchParams` requires a `<Suspense>` boundary in Next App Router builds — either
  wrap it or use the prop-with-fallback approach from Deliverable 4.
- Story IDs must match Storybook's derivation; confirm via `storybook-static/index.json`
  after `npm run build-storybook` before writing them into registry items.
- Registry JSON: 2-space indent, keep field order of existing items, trailing newline.
