# Task 03: Page Composition (SelectionSpec → Next.js routes)

Execution order: after tasks 01 and 02.

## Objective

Turn each resolved screen of a SelectionSpec into a working Next.js App Router route that
composes the selected block components. This is the only implementation-layer task with
residual judgment; the rules below remove as much of it as possible. For the fixture
SelectionSpec this produces two routes: a login screen and a dashboard screen.

## Context

- Repo root: `C:\Users\tomoy\Desktop\react-shadcn` (Next.js App Router, `app/` directory,
  shadcn/ui with the purple oklch preset in `app/globals.css`).
- Input: `docs/examples/selectionspec-dryrun-01.json` (flowId `dryrun-saas-ops-01`,
  screens `login` and `overview`, unresolved `invoice-list`).
- Each selected registry item (`registry/<name>.json`) lists its component files under
  `files[]`; those files already exist in the repo. Reference compositions you may read
  for wiring (do NOT edit them): `app/dashboard-01/page.tsx` (dashboard-01 skeleton),
  `app/login/page.tsx` (login-03 page), `app/dashboard/page.tsx` (sidebar-07 demo page).
- The FlowSpec (`docs/examples/flowspec-dryrun-01.json`) carries `transitions` per step;
  use it to wire navigation between the generated routes.

## Route Convention (fixed — do not invent another)

- Route per screen: `app/flows/<flowId>/<stepId>/page.tsx`
  (e.g. `app/flows/dryrun-saas-ops-01/overview/page.tsx`).
- A flow index at `app/flows/<flowId>/page.tsx` that renders a simple list of `<Link>`s
  to each step route in `order` (use `components/ui/button.tsx` variant="link" or plain
  Links; nothing fancy).
- Unresolved steps get NO route.

## Composition Rules

1. A generated `page.tsx` may import ONLY from:
   - files listed in the selected items' `files[]` (the block components),
   - `components/ui/*` primitives that appear in the selected items'
     `registryDependencies`,
   - `next/link`, `react`, and the flow's own sibling routes (for hrefs).
   Importing anything else is a defect.
2. Compose in the order the blocks appear in the SelectionSpec `blocks[]` array, inside
   the structure the screen pattern's reference page demonstrates (e.g. dashboard-01:
   SidebarProvider > AppSidebar variant + SidebarInset > SiteHeader > main content stack).
   Copy the wiring approach of the reference page; do not redesign it.
3. Map FlowSpec `transitions` to navigation: `login.onSuccess: "overview"` → the login
   form's submit button becomes a `<Link>` (or `router.push`) to
   `/flows/dryrun-saas-ops-01/overview`. A transition targeting an unresolved step links
   to the flow index instead, with a `{/* TODO: unresolved step */}` comment.
4. Keep shadcn ownership style: server components by default, `"use client"` only when
   the file uses hooks/handlers. Tailwind classes only; no inline styles, no new CSS files.
5. Static sample data: if a block needs data (e.g. data-table), import the JSON the item
   already ships (`app/dashboard-01/data.json`). Do not fabricate new datasets.
6. Do not modify any existing component. If a block does not fit, stop and report — do
   not patch `components/**`.

## Acceptance Criteria

- [ ] `npm run build` exits 0.
- [ ] `npm run lint` and `npm run typecheck` exit 0.
- [ ] Routes exist: `/flows/dryrun-saas-ops-01` (index), `/flows/dryrun-saas-ops-01/login`,
      `/flows/dryrun-saas-ops-01/overview`. No route for `invoice-list`.
- [ ] `grep`-check: generated pages import only allowed modules (rule 1).
- [ ] Login page navigates to overview per the transition; overview renders sidebar,
      header, metric cards, chart, and table (verify with `npm run dev` + browser, or the
      project's preview tooling).
- [ ] Report the created file list — it becomes `screens[].filesCreated` and
      `screens[].route` in the BuildReport (task 01).

## Out of Scope

- Auth logic, data fetching, state management (visual composition only).
- Loading/empty/error states (tracked as inventory work; note them in the report's
  `checkFailures`/risks passthrough, do not implement).
- Story generation (task 04) and check running (task 05).

## Pitfalls

- `app/dashboard-01/page.tsx` and `app/dashboard/page.tsx` both exist and look similar;
  the dashboard-01 skeleton is the composition reference, the other is sidebar-07's demo.
- `SidebarProvider`/`SidebarInset` are required wrappers for the sidebar shell; copying
  the metric/chart/table blocks without the provider will crash at render.
- Next.js App Router requires `page.tsx` (lowercase) exactly; on Windows check casing.
