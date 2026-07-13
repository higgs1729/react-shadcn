# Screen Architecture

## URL state

## Window navigation

- `AppHeader` is an in-app window strip: primary pages occupy tabs, and selecting a tab restores its recorded route.
- The Overview Studio/Case Study/selected-page CTAs, Studio preview/detail CTAs, and the Case Study Quality CTA open a new tab. Primary navigation changes the current tab.
- A ChildRoute retains its parent tab and renders its title followed by page-local context (for example, `Quality › Coverage matrix`); Case Study has no page-local breadcrumb.

## Settings

- `Settings` opens as a wide desktop Dialog from the sidebar footer, using `settings-admin-01` and `settings-section-01`; `/settings` remains a direct-link fallback.
- Appearance controls apply theme through the shared theme provider and accent through document tokens; non-sensitive preferences persist locally in the browser.

- `panel` opens the named Drawer or Dialog on its owning Page; `pattern` selects its Pattern detail.
- `state=default|loading|empty|error` is a verification-only Page state, retained in the URL so it can be checked by direct link.

## 階層

```text
First visit
└─ `/` → Orientation → `/overview`

StudioLayout
├─ AppHeader
├─ Sidebar
│  └─ PrimaryNavigation
├─ MainContent
│  └─ RouteOutlet
│     ├─ Page
│     │  ├─ PageHeader
│     │  ├─ Section
│     │  └─ TabPanel
│     └─ ChildRoute
│        └─ Page
└─ TransientUI
   ├─ Drawer
   ├─ Dialog
   └─ Popover
```

## 設計判断

### StudioLayout

- `sidebar-07` uses a desktop resizable rail (208–384 px; drag or Arrow keys) and keeps the active item distinct from hover with a muted primary surface and leading indicator.

- `StudioLayout` は複数regionを持つ共有layoutであり、AppHeaderとSidebarを直列にネストする意味ではない。
- SidebarとAppHeaderはPageを切り替えても維持する。
- Sidebarは `sidebar-07`、AppHeaderは `page-header-actions-01` を基礎にする。
- AppHeaderはアプリ共通操作、PageHeaderはPage固有の見出しとCTAを担う。
- PrimaryNavigationにはStudio用navigation dataを渡す。
- mobileではSidebarをDrawerとして開く。
- 下部固定ナビは使わない。

### Page

- `/` は初回導入の `Orientation` を表示し、完了・skip操作は `/overview` へ進む。
- PrimaryNavigationに直接表示するPageは5つだけにする。
- Pageの切替はPrimaryNavigationで行う。
- 各Pageは一つの主要JTBDだけを持つ。

| route         | Page       | 主要JTBD                                       | composition                            |
| ------------- | ---------- | ---------------------------------------------- | -------------------------------------- |
| `/overview`   | Overview   | 作品の価値と実証範囲を理解する                 | app固有 `studio-overview-01`           |
| `/patterns`   | Patterns   | UI在庫を探索する                               | `collection-table-01`をcontent binding |
| `/studio`     | Studio     | 選択式サンプルのbriefから実装previewまでを辿る | app固有 `studio-scenario-runner-01`    |
| `/quality`    | Quality    | 品質主張を検証する                             | `report-analytics-01`をcontent binding |
| `/case-study` | Case Study | 設計判断と結果を読む                           | app固有 `studio-case-study-01`         |

### ChildRoute / TabPanel

- ChildRouteはPage内部の描画部品ではない。親routeのlayoutが持つRouteOutletへ子Pageを描画する。
- browser back、reload、deep-linkが必要な状態はChildRouteにする。
- URLを変えず同じPage内の表示だけを切り替える場合はTabPanelにする。
- Studioのresult / preview、QualityのcoverageはChildRouteにする。
- ChildRouteへ移動してもStudioLayoutとPrimaryNavigationの選択は維持する。

### Drawer / Dialog / Popover

- 親Pageの文脈を残す必要がある詳細・比較・確認に使う。
- Drawerは参照・比較、Dialogは承認、Popoverは小さな補助操作に使う。
- Studioは外部AIや実行時生成を行わず、事前作成済みのFlowSpec / SelectionSpecを明示する。
- query parameterでdeep-link可能にする。静的exportでServer Componentの`searchParams`は使わず、client側で読む。

## FlowSpec stepの配置

| stepId              | context     | 正式なUI entity | 表示形式           |
| ------------------- | ----------- | --------------- | ------------------ |
| `orientation`       | first visit | Page            | entry route        |
| `overview`          | Overview    | Page            | primary route      |
| `pattern-library`   | Patterns    | Page            | primary route      |
| `pattern-detail`    | Patterns    | Drawer          | inspector          |
| `live-demo`         | Patterns    | Drawer          | preview            |
| `studio-composer`   | Studio      | Page            | scenario selector  |
| `result-report`     | Studio      | ChildRoute      | result Page        |
| `generated-preview` | Studio      | ChildRoute      | preview Page       |
| `quality-report`    | Quality     | Page            | primary route      |
| `coverage-matrix`   | Quality     | ChildRoute      | coverage Page      |
| `contract-explorer` | Quality     | Drawer          | document inspector |
| `provenance-trail`  | Quality     | Drawer          | audit inspector    |
| `case-study`        | Case Study  | Page            | primary route      |

## Composition policy

- `reuse-selected`: selected screen-patternのrequired blocksと領域構造を維持し、props/dataだけを差し替える。
- `compose-existing-blocks`: content fitが成立しないとき、既存blockからapp固有screen compositionを作る。
- `override`には元の選定、変更先、理由を `studio-app-spec.json` に必ず記録する。
- patternを使わなくなったのにBuildReportをverifiedのまま扱わない。app固有compositionは別のportfolio verification対象にする。
