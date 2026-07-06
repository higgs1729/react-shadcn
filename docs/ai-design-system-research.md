# AI-Ready Design System Research

Last reviewed: 2026-07-06

This document captures the current working model for an AI-usable design system based on shadcn/ui, registry items, Storybook, and faceted classification.

Companion files:

- `docs/ai-pattern-selection-instructions.md`: short agent instructions for selecting patterns.
- `docs/ai-design-facets.schema.json`: JSON Schema for `meta.aiDesignSystem`.

## Working Conclusion

Use shadcn/ui as the code and registry substrate, then add an AI-readable metadata layer.

The recommended stack is:

1. shadcn/ui components and official blocks for concrete React/Tailwind code.
2. A custom shadcn-compatible registry for screen and block patterns.
3. Storybook stories and manifests for component documentation, state coverage, and AI retrieval.
4. Design tokens in DTCG-compatible JSON, transformed into Tailwind v4 `@theme` variables.
5. Figma Code Connect only when Figma handoff or Figma MCP accuracy matters.
6. A layered generation pipeline:
   - flow layer: decide the user flow and emit a `FlowSpec`.
   - selection layer: resolve each flow step to screen and block registry items, then emit a `SelectionSpec`.
   - implementation layer: install dependencies, generate code, create Storybook stories, and run checks.

Do not rely on one large static instruction file as the only AI context. A short `DESIGN.md` can help with visual direction and portability, but registry metadata, Storybook manifests, tests, and lint rules should be the main production control surfaces.

## Source Strategy

Priority order:

1. Official specifications and docs: shadcn/ui, Storybook, W3C/DTCG, Tailwind, W3C WAI, Radix, Figma.
2. Mature design systems: Carbon, Material, Polaris, Primer, Spectrum/React Aria, Fluent, Atlassian.
3. Registry directory and ecosystem sources: shadcn registry directory, AI UI registries, specialized shadcn-compatible registries.
4. Articles and case studies only as supporting evidence, not as sole basis for schema decisions.

Rule for adopting a facet or pattern:

- Adopt when it is supported by at least two independent sources, or by one official source plus direct implementation need.
- Mark as `experimental` when it comes mainly from ecosystem practice or one source.
- Prefer machine-readable evidence over prose-only guidance.

## shadcn/ui Components Confirmed

Extracted from the current shadcn/ui components docs.

### Actions And Controls

- accordion
- button
- button-group
- toggle
- toggle-group
- dropdown-menu
- context-menu
- menubar
- command
- tooltip
- popover
- hover-card
- collapsible

### Forms And Input

- field
- label
- input
- input-group
- textarea
- checkbox
- radio-group
- select
- native-select
- combobox
- switch
- slider
- calendar
- date-picker
- input-otp

### Layout And Navigation

- aspect-ratio
- breadcrumb
- navigation-menu
- pagination
- resizable
- scroll-area
- separator
- sidebar
- tabs
- drawer
- sheet

### Data Display

- avatar
- badge
- card
- carousel
- chart
- data-table
- item
- kbd
- table
- typography

### Feedback, Status, And Overlays

- alert
- alert-dialog
- dialog
- empty
- progress
- skeleton
- sonner
- spinner
- toast

### AI/Conversation-Oriented Components

- attachment
- bubble
- marker
- message
- message-scroller

### Other Utility/Direction Components

- direction

## shadcn/ui Official Blocks Confirmed

Official block categories currently exposed from the blocks page:

- featured
- sidebar
- login
- signup

Official block item IDs confirmed:

- dashboard-01
- sidebar-01 through sidebar-16
- login-01 through login-05
- signup-01 through signup-05

Interpretation:

- Official shadcn blocks are good seed examples, not enough by themselves for a full 10 screen x 30 block pattern library.
- Treat `dashboard-01`, sidebar variants, login variants, and signup variants as canonical examples of registry-installable screen/block items.
- Build the larger AI pattern set as custom registry items with `meta` and `categories`.

## shadcn Registry Metadata Fit

The current `registry-item.json` schema supports:

- `type`: use `registry:page`, `registry:block`, `registry:component`, `registry:ui`, `registry:base`, etc.
- `registryDependencies`: use for shadcn primitives and namespaced registry items.
- `files`: installable payload.
- `cssVars`: token/theme values.
- `categories`: simple search grouping.
- `meta`: arbitrary metadata. This is where AI facets should live.
- `docs`: markdown guidance shown when installing.

Recommended shape:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "dashboard-analytics-01",
  "type": "registry:block",
  "title": "Dashboard Analytics",
  "description": "A dense SaaS dashboard with metrics, chart, and data table.",
  "categories": ["screen:dashboard", "intent:monitor", "density:high"],
  "registryDependencies": ["sidebar", "card", "chart", "data-table", "tabs", "button"],
  "files": [
    {
      "path": "registry/default/dashboard-analytics-01/page.tsx",
      "type": "registry:page",
      "target": "app/dashboard/page.tsx"
    }
  ],
  "meta": {
    "aiDesignSystem": {
      "assetKind": "screen-pattern",
      "maturity": "canonical",
      "source": "internal",
      "screenType": "dashboard",
      "userIntents": ["monitor", "analyze", "compare"],
      "dataShapes": ["time-series", "collection", "metric"],
      "interactionModels": ["read-only", "filter-sort"],
      "density": "high",
      "stateCoverage": ["default", "loading", "empty", "error"],
      "composition": {
        "requiredBlocks": [
          "app-shell-sidebar",
          "summary-metric-row",
          "chart-panel",
          "data-table-panel"
        ],
        "optionalBlocks": ["filter-toolbar"]
      },
      "evidence": {
        "sourceCount": 3,
        "confidence": "high",
        "verifiedAt": "2026-07-06"
      }
    }
  }
}
```

## Optimized Facets

Keep facets orthogonal. Do not make every tag a top-level dimension. The AI should first narrow by task and product structure, then by interaction and visual constraints.

### Core Facets

Use these on every screen/block registry item:

- `assetKind`: `screen-pattern`, `block-pattern`, `component-pattern`, `flow-pattern`, `token-pack`
- `maturity`: `canonical`, `recommended`, `community`, `experimental`, `deprecated`
- `source`: `official-shadcn`, `internal`, `community-registry`, `external-design-system`, `generated`
- `screenType`: primary page type when applicable
- `blockRole`: functional role of the block
- `userIntents`: what the user is trying to do
- `dataShapes`: kind of information being displayed or edited
- `interactionModel`: how the user interacts
- `layoutModel`: placement and structural behavior
- `density`: `low`, `medium`, `high`
- `stateCoverage`: which UI states are implemented
- `accessibility`: keyboard, focus, label, contrast, ARIA/APG, RTL/I18n notes
- `dependencies`: shadcn components, npm packages, registry dependencies
- `composition`: required, optional, and incompatible companion blocks
- `verification`: stories, tests, a11y checks, visual snapshots
- `evidence`: source count, source URLs, confidence, verified date
- `risk`: known risks, missing states, license or maintenance concerns

### Screen Types

Initial 10 screen types:

1. `auth`: login, signup, password reset, MFA.
2. `onboarding`: first-run setup, guided setup, import/connect accounts.
3. `dashboard`: summary, KPIs, monitoring, operational overview.
4. `collection`: list, table, grid, searchable resource browser.
5. `detail`: entity detail, profile, record overview, object page.
6. `create-edit`: form page, editor, configuration creation.
7. `settings-admin`: preferences, team/admin, billing settings, permissions.
8. `workflow`: stepper, approval flow, checkout-like transactional flow.
9. `report-analytics`: longer readout, charts, insights, exportable report.
10. `conversation-assistant`: AI chat, support thread, agent workspace.

Optional overlays:

- `commerce`
- `billing`
- `marketing`
- `documentation`
- `support`
- `maps-location`
- `media`
- `developer-tools`

Use overlays instead of creating too many primary screen types.

### Block Roles

Initial 30 block roles:

1. `app-shell-sidebar`
2. `app-shell-topnav`
3. `page-header-actions`
4. `breadcrumb-context`
5. `command-search`
6. `filter-toolbar`
7. `tabs-view-switcher`
8. `summary-metric-row`
9. `chart-panel`
10. `data-table-panel`
11. `collection-grid`
12. `detail-overview`
13. `form-section`
14. `settings-section`
15. `wizard-stepper`
16. `action-footer`
17. `empty-state`
18. `error-recovery`
19. `loading-skeleton`
20. `notification-center`
21. `modal-dialog`
22. `drawer-inspector`
23. `file-upload-area`
24. `activity-feed`
25. `comment-thread`
26. `ai-conversation-list`
27. `ai-prompt-composer`
28. `ai-explainability-label`
29. `pricing-plan-card`
30. `checkout-summary`

This set covers the official shadcn seed blocks plus gaps observed in Carbon patterns, enterprise systems, and AI UI registries.

### User Intents

- `authenticate`
- `onboard`
- `browse`
- `search`
- `filter`
- `compare`
- `monitor`
- `analyze`
- `create`
- `edit`
- `configure`
- `review`
- `approve`
- `purchase`
- `recover`
- `communicate`
- `delegate-to-ai`

### Data Shapes

- `none`
- `single-record`
- `collection`
- `hierarchy`
- `relational`
- `metric`
- `time-series`
- `categorical`
- `geo`
- `document`
- `media`
- `conversation`
- `transaction`
- `permission-model`

### Interaction Models

- `read-only`
- `single-action`
- `multi-action`
- `form-submit`
- `inline-edit`
- `selection-single`
- `selection-multiple`
- `filter-sort`
- `drag-drop`
- `disclosure`
- `modal-task`
- `drawer-inspection`
- `wizard`
- `streaming`
- `real-time`
- `human-in-the-loop`

### State Coverage

Every screen/block should explicitly state coverage for:

- `default`
- `loading`
- `empty`
- `error`
- `success`
- `disabled`
- `validation-error`
- `permission-denied`
- `offline`
- `overflow`
- `mobile`
- `dark-mode`
- `rtl`

Not every item must implement every state, but missing states must be visible in metadata.

## Selection Layer Contract

The selection layer no longer starts from a broad app brief. It receives an already-decided `FlowSpec` from the flow layer and emits a `SelectionSpec`.

The flow layer owns:

- product domain interpretation
- user journey design
- step ordering
- transition design
- deciding which flow exists

The selection layer owns:

- resolving each flow step to one `screenType`
- selecting one screen pattern per resolved step
- reading required block roles from the selected screen pattern
- selecting one block pattern per required role
- reporting registry dependencies as information for the implementation layer
- recording assumptions, rejected alternatives, risks, and unresolved steps

The selection layer must stop at block level. It does not select individual shadcn/ui components. Components remain registry dependencies declared by selected screen and block items.

### Input: FlowSpec

Each flow step is one screen and carries facet signals. `screenType` is intentionally not provided by the flow layer; the selection layer resolves it.

```json
{
  "flowId": "invoice-management",
  "flowArchetype": "crud",
  "steps": [
    {
      "stepId": "list",
      "order": 1,
      "userIntents": ["browse", "filter"],
      "dataShapes": ["collection"],
      "interactionModels": ["filter-sort", "selection-multiple"],
      "density": "high",
      "requiredStates": ["default", "loading", "empty", "error"],
      "accessibilityConstraints": { "keyboard": true, "apgPattern": "grid" },
      "visualTone": ["enterprise"],
      "transitions": { "onSelect": "detail" }
    }
  ]
}
```

### Per-Step Procedure

1. Resolve `screenType` by matching `userIntents`, `dataShapes`, and `interactionModels` against canonical screen profiles.
2. On a near-tie, put the step in `unresolved` with tied candidates. Do not guess.
3. Retrieve `screen-pattern` candidates by resolved `screenType`, then filter by `userIntents` and `dataShapes`.
4. Drop screen patterns with missing `registryDependencies`, declared incompatibilities, or insufficient `requiredStates`.
5. Score screen patterns from 0 to 100:
   - intent match: 25
   - data shape match: 15
   - interaction match: 15
   - state coverage: 15
   - accessibility coverage: 10
   - dependency fit: 10
   - evidence confidence: 10
6. Reject candidates below 70.
7. Read required block roles from the selected screen pattern's `composition.requiredBlocks`. Do not derive structural block roles directly from raw facets.
8. Add `composition.optionalBlocks` only when a step facet clearly calls for one, such as `filter` intent requiring `filter-toolbar`.
9. Retrieve `block-pattern` candidates by `blockRole` and score with the same rubric.
10. Reject block candidates below 70 and keep rejected alternatives for traceability.
11. Emit `SelectionSpec`; do not install dependencies, generate code, or run tests in this layer.

### Output: SelectionSpec

```json
{
  "flowId": "invoice-management",
  "screens": [
    {
      "stepId": "list",
      "resolvedScreenType": "collection",
      "screenPattern": {
        "registryItem": "collection-table-01",
        "score": 88,
        "rejected": [
          {
            "registryItem": "collection-grid-01",
            "score": 74,
            "reason": "lower density fit"
          }
        ]
      },
      "blocks": [
        {
          "blockRole": "filter-toolbar",
          "registryItem": "filter-toolbar-02",
          "score": 91
        },
        {
          "blockRole": "data-table-panel",
          "registryItem": "data-table-panel-01",
          "score": 85
        }
      ],
      "registryDependencies": ["sidebar", "table", "checkbox", "button", "input", "select"],
      "stateCoveragePlan": ["default", "loading", "empty", "error"],
      "checksPlanned": ["lint", "typecheck", "a11y", "story"],
      "assumptions": [],
      "risks": []
    }
  ],
  "unresolved": []
}
```

`checksPlanned` records which checks the implementation layer should run later. The selection layer does not run them.

### Canonical Screen Profiles

Use these profiles to resolve `screenType` from FlowSpec facets. They are intentionally heuristic; unresolved near-ties are better than forced guesses.

| screenType | strongest signals |
| --- | --- |
| `auth` | `authenticate`, `recover`; `none`, `permission-model`; `form-submit` |
| `onboarding` | `onboard`, `configure`; `single-record`, `permission-model`; `wizard`, `form-submit` |
| `dashboard` | `monitor`, `analyze`, `compare`; `metric`, `time-series`, `collection`; `read-only`, `filter-sort` |
| `collection` | `browse`, `search`, `filter`, `compare`; `collection`, `hierarchy`; `filter-sort`, `selection-single`, `selection-multiple` |
| `detail` | `browse`, `review`, `edit`; `single-record`, `relational`; `read-only`, `inline-edit`, `drawer-inspection` |
| `create-edit` | `create`, `edit`, `configure`; `single-record`, `document`; `form-submit`, `inline-edit` |
| `settings-admin` | `configure`, `review`, `approve`; `permission-model`, `single-record`; `form-submit`, `selection-multiple` |
| `workflow` | `approve`, `purchase`, `review`, `recover`; `transaction`, `single-record`; `wizard`, `human-in-the-loop` |
| `report-analytics` | `analyze`, `compare`, `review`; `metric`, `time-series`, `categorical`; `read-only`, `filter-sort` |
| `conversation-assistant` | `communicate`, `delegate-to-ai`, `review`; `conversation`, `document`; `streaming`, `human-in-the-loop` |

## Evidence And Review Loop

Use this rule in agent instructions:

```txt
Do not select a pattern from a single weak source. Prefer official registry items, internal canonical patterns, Storybook manifests, and tested examples. If only one weak source supports a choice, mark it experimental and ask for review or provide a safer canonical fallback.
```

Self-review checklist:

- Is every FlowSpec step resolved to exactly one `screenType`, or explicitly listed in `unresolved`?
- Was `screenType` resolved from `userIntents`, `dataShapes`, and `interactionModels`, not copied from upstream?
- Did required block roles come from `composition.requiredBlocks`, not direct facet inference?
- Are optional block roles justified by a clear facet signal?
- Is every selected screen and block pattern scored at 70 or higher?
- Are components left unselected, with registry dependencies listed only as information?
- Are rejected alternatives, assumptions, and unresolved near-ties recorded?
- Are all `requiredStates` covered by `stateCoveragePlan`, or listed as risks?
- Are external/community sources marked with maturity and risk?
- Is `visualTone` treated only as a tiebreaker?
- Are install/codegen/test actions deferred to the implementation layer?

## External Registry Candidates

Use these as expansion sources, not as unquestioned defaults:

- `@ai-elements`: AI-native conversation/message components.
- `@assistant-ui`: AI chat primitives and adapters.
- `@agents-ui`: AI agent interfaces.
- `@ai-blocks`: browser-side AI blocks.
- `@gaia`, `@inferencesh`, `@extend`, `@tool-ui`: assistant, agent, document, and tool-call UIs.
- `@billingsdk`: SaaS billing and subscription UI.
- `@formcn`: production form workflows.
- `@better-upload`: upload workflows.
- `@bklit`, `@evilcharts`, `@gpt-vis`: visualization gaps.
- `@mapcn`: map/location UI.
- `@clerk`, `@auth0`: auth/user-management blocks.
- `@supabase`: backend-connected blocks.
- `@bundui`, `@blocks-so`, `@beste-ui`, `@hextaui`: broader shadcn block sources.
- `@react-aria`, `@baselayer`, `@diceui`, `@intentui`: accessibility-oriented alternatives.

Adoption rule:

- Bring external items into the custom registry only after checking license, maintenance, dependencies, accessibility, and fit with local tokens.

## Sources Used

- shadcn/ui components: https://ui.shadcn.com/docs/components
- shadcn/ui blocks: https://ui.shadcn.com/blocks
- shadcn registry item schema: https://ui.shadcn.com/docs/registry/registry-item-json
- shadcn MCP docs: https://ui.shadcn.com/docs/mcp
- shadcn registry directory: https://ui.shadcn.com/docs/registry/registry-index and https://ui.shadcn.com/r/registries.json
- Storybook manifests: https://storybook.js.org/docs/ai/manifests
- Storybook MCP: https://storybook.js.org/docs/ai/mcp/overview
- DTCG token format: https://www.designtokens.org/TR/2025.10/format/
- Style Dictionary DTCG support: https://styledictionary.com/info/dtcg/
- Tailwind theme variables: https://tailwindcss.com/docs/theme
- Figma Code Connect: https://developers.figma.com/docs/code-connect/
- Carbon patterns: https://carbondesignsystem.com/patterns/overview/
- Carbon components overview: https://carbondesignsystem.com/components/overview/components/
- Carbon AI label: https://carbondesignsystem.com/components/ai-label/usage/
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- W3C ARIA APG: https://www.w3.org/WAI/ARIA/apg/
- Radix Primitives: https://www.radix-ui.com/primitives/docs/overview/introduction
- React Aria: https://react-aria.adobe.com/
- Material Design 3: https://m3.material.io/
- Shopify Polaris: https://polaris-react.shopify.com/
- GitHub Primer: https://primer.style/
- Microsoft Fluent 2: https://fluent2.microsoft.design/
- Ant Design: https://ant.design/
- Atlassian DESIGN.md / AI context findings: https://www.atlassian.com/blog/how-we-build/atlassians-design-md-is-here-what-we-learned-testing-portable-design-context-in-practice

## Current Review Result

No blocking issue found in the proposed structure.

Known caveats:

- Official shadcn blocks do not cover all desired screen and block roles.
- Community registries require quality review before adoption.
- Storybook AI features are currently documented as preview and React-focused.
- DTCG 2025.10 is stable, but Style Dictionary support for the latest 2025.10 format is still noted as in progress; use DTCG-compatible structure carefully.
- `DESIGN.md` should be treated as a portable snapshot, not the production authority.
