# AI対応デザインシステム調査

最終確認日: 2026-07-06

この文書は、shadcn/ui、registry items、Storybook、faceted classificationを土台にした、AIが利用しやすいデザインシステムの現在の設計方針をまとめる。

関連ファイル:

- `docs/ai-pattern-selection-instructions.md`: pattern selection用の短いagent指示書。
- `docs/ai-design-facets.schema.json`: `meta.aiDesignSystem` 用JSON Schema。

## 作業結論

shadcn/uiをcodeとregistryの基盤として使い、その上にAIが読めるmetadata layerを追加する。

推奨stack:

1. shadcn/ui componentsとofficial blocksを、React/Tailwindの具体的なcodeとして使う。
2. screen / block patterns用にcustom shadcn-compatible registryを作る。
3. Storybook storiesとmanifestsを、component documentation、state coverage、AI retrievalに使う。
4. design tokensはDTCG-compatible JSONで持ち、Tailwind v4の `@theme` variablesへ変換する。
5. Figma handoffやFigma MCPの精度が重要な場合だけFigma Code Connectを使う。
6. 生成pipelineをlayer化する。
   - flow layer: user flowを決定し、`FlowSpec` を出力する。
   - selection layer: 各flow stepをscreen / block registry itemsへ解決し、`SelectionSpec` を出力する。
   - implementation layer: dependenciesをinstallし、codeを生成し、Storybook storiesを作り、checksを実行する。

AI contextを1つの大きな静的指示書だけに依存させない。短い `DESIGN.md` はvisual directionやportabilityには役立つが、production control surfaceの中心はregistry metadata、Storybook manifests、tests、lint rulesにする。

## 情報源の扱い方

優先順位:

1. official specifications / docs: shadcn/ui、Storybook、W3C/DTCG、Tailwind、W3C WAI、Radix、Figma。
2. mature design systems: Carbon、Material、Polaris、Primer、Spectrum/React Aria、Fluent、Atlassian。
3. registry directory / ecosystem sources: shadcn registry directory、AI UI registries、specialized shadcn-compatible registries。
4. articles / case studiesは補助情報として使い、schema decisionの唯一の根拠にはしない。

facetやpatternを採用するルール:

- 少なくとも2つの独立した情報源で支持される、または1つのofficial sourceと明確な実装上の必要性がある場合に採用する。
- 主にecosystem practiceや単一情報源に基づく場合は `experimental` とする。
- prose-only guidanceより、machine-readable evidenceを優先する。

## 確認済みshadcn/ui components

現在のshadcn/ui components docsから抽出したもの。

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

### AI / Conversation-Oriented Components

- attachment
- bubble
- marker
- message
- message-scroller

### Other Utility / Direction Components

- direction

## 確認済みshadcn/ui official blocks

official blocks pageで確認できたcategory:

- featured
- sidebar
- login
- signup

確認済みofficial block item IDs:

- dashboard-01
- sidebar-01 through sidebar-16
- login-01 through login-05
- signup-01 through signup-05

解釈:

- official shadcn blocksは優れたseed examplesだが、10 screen x 30 block pattern libraryをそれだけで満たすには足りない。
- `dashboard-01`、sidebar variants、login variants、signup variantsは、registry-installable screen/block itemsのcanonical examplesとして扱う。
- より大きなAI pattern setは、`meta` と `categories` を持つcustom registry itemsとして作る。

## shadcn registry metadataとの適合

現在の `registry-item.json` schemaは以下をサポートしている。

- `type`: `registry:page`、`registry:block`、`registry:component`、`registry:ui`、`registry:base` など。
- `registryDependencies`: shadcn primitivesやnamespaced registry itemsを参照する。
- `files`: installable payload。
- `cssVars`: token / theme values。
- `categories`: simple search grouping。
- `meta`: 任意metadata。AI facetsはここに入れる。
- `docs`: install時に表示できるmarkdown guidance。

推奨形:

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

## 最適化したfacets

facetsは直交性を保つ。すべてのtagをtop-level dimensionにしない。AIはまずtaskとproduct structureで絞り込み、その後interactionとvisual constraintsで調整する。

### Core Facets

すべてのscreen/block registry itemに使う。

- `assetKind`: `screen-pattern`, `block-pattern`, `component-pattern`, `flow-pattern`, `token-pack`
- `maturity`: `canonical`, `recommended`, `community`, `experimental`, `deprecated`
- `source`: `official-shadcn`, `internal`, `community-registry`, `external-design-system`, `generated`
- `screenType`: screenに適用されるprimary page type
- `blockRole`: blockの機能的役割
- `userIntents`: ユーザーが達成しようとしていること
- `dataShapes`: 表示または編集する情報の型
- `interactionModel`: ユーザーがどう操作するか
- `layoutModel`: placementとstructural behavior
- `density`: `low`, `medium`, `high`
- `stateCoverage`: 実装済みUI states
- `accessibility`: keyboard、focus、label、contrast、ARIA/APG、RTL/I18n notes
- `dependencies`: shadcn components、npm packages、registry dependencies
- `composition`: required / optional / incompatible companion blocks
- `verification`: stories、tests、a11y checks、visual snapshots
- `evidence`: source count、source URLs、confidence、verified date
- `risk`: known risks、missing states、license / maintenance concerns

### Screen Types

初期10 screen types:

1. `auth`: login、signup、password reset、MFA。
2. `onboarding`: first-run setup、guided setup、import/connect accounts。
3. `dashboard`: summary、KPIs、monitoring、operational overview。
4. `collection`: list、table、grid、searchable resource browser。
5. `detail`: entity detail、profile、record overview、object page。
6. `create-edit`: form page、editor、configuration creation。
7. `settings-admin`: preferences、team/admin、billing settings、permissions。
8. `workflow`: stepper、approval flow、checkout-like transactional flow。
9. `report-analytics`: longer readout、charts、insights、exportable report。
10. `conversation-assistant`: AI chat、support thread、agent workspace。

Optional overlays:

- `commerce`
- `billing`
- `marketing`
- `documentation`
- `support`
- `maps-location`
- `media`
- `developer-tools`

primary screen typeを増やしすぎないために、overlaysを使う。

### Block Roles

初期30 block roles:

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

このsetはofficial shadcn seed blocksに加えて、Carbon patterns、enterprise systems、AI UI registriesで見えた不足を補う。

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

すべてのscreen/blockは以下のcoverageを明示する。

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

すべてのitemがすべてのstateを実装する必要はない。ただし未対応stateはmetadata上で見えるようにする。

## Selection Layer Contract

selection layerは広いapp briefから開始しない。すでにflow layerで決定された `FlowSpec` を受け取り、`SelectionSpec` を出力する。

flow layerの責務:

- product domain interpretation
- user journey design
- step ordering
- transition design
- どのflowが存在するかの決定

selection layerの責務:

- 各flow stepを1つの `screenType` に解決する
- 解決済みstepごとに1つのscreen patternを選ぶ
- 選ばれたscreen patternからrequired block rolesを読む
- required roleごとに1つのblock patternを選ぶ
- implementation layer向けにregistry dependenciesを情報として報告する
- assumptions、rejected alternatives、risks、unresolved stepsを記録する

selection layerはblock levelで止める。個別のshadcn/ui componentsは選定しない。componentsは、選ばれたscreen/block itemsが宣言するregistry dependenciesとして残す。

### 入力: FlowSpec

各flow stepは1画面を表し、facet signalsを持つ。`screenType` はflow layerからは入力されず、selection layerが解決する。

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

### stepごとの手順

1. `userIntents`、`dataShapes`、`interactionModels` をcanonical screen profilesに照合して `screenType` を解決する。
2. 僅差の場合は、そのstepを tied candidates とともに `unresolved` に入れる。推測しない。
3. 解決済み `screenType` で `screen-pattern` 候補を取得し、その後 `userIntents` と `dataShapes` でfilterする。
4. `registryDependencies` 不足、declared incompatibilities、`requiredStates` 不足があるscreen patternは除外する。
5. 100点満点でscreen patternを採点する。
   - intent match: 25
   - data shape match: 15
   - interaction match: 15
   - state coverage: 15
   - accessibility coverage: 10
   - dependency fit: 10
   - evidence confidence: 10
6. 70点未満を拒否する。
7. 選ばれたscreen patternの `composition.requiredBlocks` からrequired block rolesを読む。structural block rolesをraw facetsから直接導出しない。
8. `filter` intentが `filter-toolbar` を明確に要求するような場合だけ `composition.optionalBlocks` を追加する。
9. `blockRole` で `block-pattern` 候補を取得し、同じrubricで採点する。
10. 70点未満のblock候補を拒否し、traceabilityのためrejected alternativesを保持する。
11. `SelectionSpec` を出力する。このlayerではdependencies install、code生成、test実行を行わない。

### 出力: SelectionSpec

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

`checksPlanned` は、implementation layerが後で実行すべきchecksを記録する。このselection layerでは実行しない。

### Canonical Screen Profiles

FlowSpec facetsから `screenType` を解決するために使うprofile。これはheuristicであり、無理な推測よりもunresolved near-tieのほうがよい。

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

agent instructionでは次のルールを使う。

```txt
Do not select a pattern from a single weak source. Prefer official registry items, internal canonical patterns, Storybook manifests, and tested examples. If only one weak source supports a choice, mark it experimental and ask for review or provide a safer canonical fallback.
```

セルフレビューchecklist:

- すべてのFlowSpec stepが1つの `screenType` に解決されているか、または明示的に `unresolved` に入っているか。
- `screenType` はupstreamからcopyされたのではなく、`userIntents`、`dataShapes`、`interactionModels` から解決されたか。
- required block rolesはdirect facet inferenceではなく、`composition.requiredBlocks` から来ているか。
- optional block rolesは明確なfacet signalで正当化されているか。
- 選定されたscreen / block patternはすべて70点以上か。
- componentsは選定せず、registry dependenciesが情報として列挙されているだけか。
- rejected alternatives、assumptions、unresolved near-tiesが記録されているか。
- すべての `requiredStates` が `stateCoveragePlan` でcoverされているか、またはrisksに記録されているか。
- external/community sourcesにmaturityとriskが付いているか。
- `visualTone` はtie breakerとしてのみ扱われているか。
- install / codegen / test actionsはimplementation layerに遅延されているか。

セルフレビューが失敗した場合は、その `SelectionSpec` をemitしない。失敗項目を内部的に列挙し、candidateの再取得、score再計算、block roleの読み直し、assumptions / risks / rejected alternativesの追記によって修正する。その後、セルフレビューを最初から再実行する。すべてのcheckが成功するまで改善とレビューを繰り返す。このselection layer内で修正不能な候補不足、解消不能なtie、依存関係不足は該当stepを `unresolved` に移して理由を記録し、再レビューする。

## External Registry Candidates

これらは拡張sourceとして使う。無条件のdefaultにはしない。

- `@ai-elements`: AI-native conversation/message components。
- `@assistant-ui`: AI chat primitives and adapters。
- `@agents-ui`: AI agent interfaces。
- `@ai-blocks`: browser-side AI blocks。
- `@gaia`, `@inferencesh`, `@extend`, `@tool-ui`: assistant、agent、document、tool-call UIs。
- `@billingsdk`: SaaS billing and subscription UI。
- `@formcn`: production form workflows。
- `@better-upload`: upload workflows。
- `@bklit`, `@evilcharts`, `@gpt-vis`: visualization gaps。
- `@mapcn`: map/location UI。
- `@clerk`, `@auth0`: auth/user-management blocks。
- `@supabase`: backend-connected blocks。
- `@bundui`, `@blocks-so`, `@beste-ui`, `@hextaui`: broader shadcn block sources。
- `@react-aria`, `@baselayer`, `@diceui`, `@intentui`: accessibility-oriented alternatives。

採用ルール:

- external itemsをcustom registryへ取り込むのは、license、maintenance、dependencies、accessibility、local tokensとの適合を確認した後にする。

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

## 現在のレビュー結果

提案構造にblocking issueは見つかっていない。

既知の注意点:

- official shadcn blocksだけでは、必要なscreen / block rolesすべてをcoverできない。
- community registriesは採用前にquality reviewが必要。
- Storybook AI featuresは、現時点ではpreviewかつReact-focusedとして文書化されている。
- DTCG 2025.10はstableだが、Style Dictionaryの最新2025.10 format supportはin progressとされているため、DTCG-compatible structureは慎重に使う。
- `DESIGN.md` はportable snapshotとして扱い、production authorityにはしない。
