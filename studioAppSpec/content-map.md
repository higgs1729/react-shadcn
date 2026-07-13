# Content Map

## Overview

### 目的

3〜5分の閲覧者が、作品の価値、実証済み範囲、次に見る場所を理解する。

### 表示順

1. 作品名、中心メッセージ、Reviewer tour CTA
2. ScreenTypes、blockRoles、registry items、verified flows
3. brief → FlowSpec → SelectionSpec → BuildReport → UI のpipeline
4. Patterns / Studio / Quality の3入口
5. experimental、人間レビュー未実施の明示

### 禁止

- 意味のない時系列chartを置かない。
- 自動checkのpassを「完成」と表現しない。
- 件数を手入力しない。

## Patterns

### 目的

screen-patternとblock-patternを、役割・状態・maturityから探索する。

### 表示順

1. 検索、screen/block filter、ScreenType/blockRole filter
2. pattern collection
3. state coverage、maturity、verificationの要約
4. Pattern detail drawer
5. Storybook / Live demo CTA

### データ

`registry/*.json` の `meta.aiDesignSystem` と `verification.storybookStories`。

## Studio

> Current static implementation: users select one prebuilt scenario. The page visibly traces **Brief → FlowSpec → SelectionSpec → implementation preview**. It does not create contracts, UI, or AI answers at runtime.

### Current display order

1. Select a clear sample request
2. Read its brief and expected outcome
3. Inspect the corresponding prebuilt FlowSpec summary
4. Inspect the corresponding prebuilt SelectionSpec summary
5. Open the actual registered pattern in Storybook

The legacy Studio notes below are retained only as project history; they do not describe the current route and must not be read as a runtime generation or AI capability.

### Curated static examples

Studio is defined to present five curated example apps instead of claiming runtime generation:

1. Ops Pulse — `dashboard-01`
2. Member Gate — `login-03`
3. Invoice Desk — `collection-table-01`
4. Launch Board — `planning-board-01`
5. Review Docs — `document-workspace-01`

Each example exposes a consistent Brief -> FlowSpec -> SelectionSpec -> UI -> BuildReport trace. The top-level AI authors the artifacts from the current inventory. The UI does not run the golden flow or call an AI service at runtime. A BuildReport may mark a check as passed only after that check has actually completed successfully.

### Sidebar grouping

- `AI Design System`: Overview, Patterns, Studio, Quality, Case Study
- `Example Apps`: Ops Pulse, Member Gate, Invoice Desk, Launch Board, Review Docs
- Settings remains a utility action in the sidebar footer.

An Example App route remains inside `StudioLayout`. Its main content presents the independent app route in an interactive 16:9 iframe so the Studio navigation remains available while the app preview owns its own shell.

An Example App route remains inside `StudioLayout`. Its main content presents the independent app route in an interactive 16:9 iframe so the Studio navigation remains available while the app preview owns its own shell.

An Example App route remains inside `StudioLayout`. Its main content presents the independent app route in an interactive 16:9 iframe so the Studio navigation remains available while the app preview owns its own shell.

### 目的

一つのサンプルbriefが、選定・承認・実装結果へ変換される流れを体験する。

### 表示順

1. サンプルbrief
2. AI assistant CTA
3. FlowSpec要約
4. 選定されたScreenType / pattern / blocks
5. assumption / risk
6. 人間承認
7. BuildReportと生成preview
8. Selection rationale

### データ

`docs/examples/flowspec-studio-portfolio-01.json`、SelectionSpec、BuildReport。

## Quality

### 目的

品質の主張を、契約・check・provenance・coverageへ遡って確認する。

### 表示順

1. verified flows、built screens、unresolved
2. validate / lint / typecheck / build / Storybook
3. ScreenType / blockRole coverage
4. Contract Explorer
5. Provenance Trail
6. 自動検証と人間レビューの境界

### データ

BuildReport、provenance sidecar、contract schema、registry inventory。

## Case Study

### 目的

設計判断、制約、結果、現在の限界を短時間で読めるようにする。

### 表示順

1. 解決した問題
2. contract-first pipeline
3. inventory-first selection
4. screenを階層として扱う判断
5. content fitで判明した限界
6. 結果と次の改善

### 禁止

- 実装履歴を時系列で列挙しない。
- 未実装の将来機能を完成済みとして書かない。

## Transient UI content

| UI entity | 必須内容 |
| --- | --- |
| Pattern detail Drawer | pattern名、役割、構成block、状態、maturity、Storybook |
| Live demo Drawer | 実画面、default/loading/empty/error切替 |
| AI assistant Drawer | 不足条件、提案、説明ラベル、briefへ反映 |
| Flow checkpoint Dialog | 選定結果、assumption、risk、承認CTA |
| Selection rationale Drawer | 採用候補、却下候補、score内訳、選定理由 |
| Contract explorer Drawer | schema名、責務、入出力関係、実JSON |
| Provenance trail Drawer | 入力digest、registry digest、生成物、検証結果 |
