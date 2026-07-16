<!-- encoding:UTF-8 -->

# Team T UI selection

- Status: review-ready
- Inputs: approved brief, JTBD, flows, data/risk, feature plan, current registry metadata, and local component source
- Selection policy: mechanical scoreは使わず、JTBD、data shape、interaction、required states、実APIを読んで判断する

## Selection result

Team T全体へそのまま適用できる既存screen patternはない。`dashboard-01`はmetric/chart/table中心、`collection-table-01`はtable/grid collection中心であり、Team Tの「階層探索＋iframe workspace」とcontent topologyが異なる。

したがって、screen patternは意図的に採用せず、`sidebar-07`のshell topologyと既存block/primitiveを材料にTeam T専用compositionを作る。

## Screen-pattern decisions

| Candidate | Decision | Reason |
| --- | --- | --- |
| `dashboard-01` | reject | metric、chart、data tableが主要領域で、API探索workspaceには不要 |
| `collection-table-01` | reject | 一覧をmainへ置く構造。Team Tはsidebar treeと大きなpreviewがprimary |
| `detail-01` | reject | record detail、activity、comment topologyが過剰 |
| `settings-admin-01` | partial adapt only | full-page admin shellは不要だが、設定のsection/navigation構造は有用 |
| custom Team T composition | select | 原型のsidebar＋header＋iframe workspaceを最も忠実に表現できる |

## Inventory decision matrix

| UI area | Asset/source | Mode | Decision |
| --- | --- | --- | --- |
| Shell topology | `sidebar-07` | adapt | data固定の`AppSidebar`は使わず、sidebar/inset/mobile sheetの構造だけ踏襲 |
| Sidebar primitives | `components/ui/sidebar.tsx` | reuse | Provider、Sidebar、Inset、Header/Content/Footer、Menu、Sub、Badge、Triggerを直接利用 |
| Category disclosure | `components/ui/collapsible.tsx` | reuse | 大分類・小分類の展開に利用 |
| Catalog search | `components/ui/input-group.tsx` | compose | Team T専用の単一検索。status selectとtable/gridを含む`filter-toolbar-01`は不採用 |
| Global quick search | `command-search-01` | deferred | Slice 1–2ではsidebar検索で十分。将来Cmd/Ctrl+Kを追加する場合にadapt |
| Header | `page-header-actions-01` topology | adapt | `SiteHeader`はtitleのみなので、coin/progress/actions slotを持つTeam T専用headerを作る |
| Welcome | Empty/Card primitives | compose | `empty-state-01`の単一CTA APIでは3探索入口＋ゲーム説明を表現できないため専用composition |
| Search empty | `empty-state-01` | reuse | 検索解除CTA付きの0件状態に適合 |
| Catalog/preview error | `error-recovery-01` | reuse | retryまたは探索へ戻る単一回復に適合 |
| Loading | `loading-skeleton-01` | reuse/adapt | catalogとpreviewの領域サイズに合わせrowsを調整 |
| API summary | Card/Badge/Button primitives | compose | `detail-overview-01`のstatus必須APIはV1方針と合わないため専用compact summary |
| API preview | native iframe + Card/Alert | new composition | loading/ready/error/missingとbase-path URLを所有するTeam T固有境界 |
| Settings | `SettingsDialog` / `SettingsPage` | adapt | 見た目とpreviewを再利用し、Team T namespace、light/dark、profile、resetへ変更 |
| Settings rows | `settings-section-01` | reuse | controlled toggle/rowとして利用可能 |
| Profile edit | Dialog/Field/Input primitives | compose | 単一入力の`modal-dialog-01`も利用可能だが文言・ID固定を避け専用dialogへ統合 |
| Game hub | `collection-grid-01` topology | adapt | cost、difficulty、reward、disabled、actionが必要で既存API不足。専用GameCard/Gridを作る |
| Game modal | Dialog primitives | compose | wide game hubとresult dialogをTeam T専用に構成 |
| Game runtime | fullscreen Dialog + iframe | new composition | load timeout、refund、message validationを所有するため固有実装 |
| Coin | Badge/Button primitives | compose | headerとgame hubで同じcontrolled表示を再利用 |
| Progress | `components/ui/progress.tsx` | reuse | value/labelをcontrolledで表示 |
| Guidance | Sonner + inline hint | compose | 初回進捗・coin獲得はtoast、常設入口はheader/sidebar。`notification-center-01`は過剰 |

## Proposed component tree

```text
TeamTApp
└─ SidebarProvider
   ├─ TeamTSidebar
   │  ├─ TeamTBrand
   │  ├─ TeamTCatalogSearch
   │  ├─ TeamTRecommendationTree
   │  ├─ TeamTCategoryTree
   │  └─ TeamTSidebarFooter
   │     ├─ TeamTGameEntry
   │     └─ TeamTProfileEntry
   └─ SidebarInset
      ├─ TeamTHeader
      │  ├─ SidebarTrigger
      │  ├─ TeamTCoinStatus
      │  ├─ TeamTExplorationProgress
      │  └─ TeamTSettingsTrigger
      └─ TeamTWorkspace
         ├─ TeamTWelcome
         ├─ TeamTApiSummary
         └─ TeamTApiPreview

Overlays
├─ TeamTSettingsDialog
├─ TeamTGameDialog
├─ TeamTGameRuntimeDialog
└─ TeamTGameResultDialog
```

## Slice 1 exact selection

Slice 1では以下だけを使用・作成する。

### Reuse directly

- Sidebar primitives
- Collapsible primitives
- InputGroup primitives
- Button、Badge、Card、Separator、ScrollArea
- `EmptyState01`
- `ErrorRecovery01`
- `LoadingSkeleton01`

### Create under `components/team-t-app/`

- `team-t-app-shell.tsx`
- `team-t-sidebar.tsx`
- `catalog-search.tsx`
- `catalog-tree.tsx`
- `team-t-header.tsx`
- `team-t-welcome.tsx`
- `api-summary.tsx`
- `api-preview.tsx`

### Keep out of Slice 1

- recommendationsの完全実装
- settings/profile
- reward/coin persistence
- game hub/runtime
- command palette

## Responsive behavior

- Desktop: `Sidebar variant="inset"`、catalog treeを常設し、workspaceをカード状insetとして表示
- Narrow/mobile: Sidebar primitiveのSheetを使い、API選択後に閉じる
- Headerは常にsidebar triggerを持つ
- Previewは使用可能な高さを占有し、狭い画面でもiframeを横スクロールの原因にしない
- Settings/gameはdesktopでwide dialog、mobileでほぼfullscreenにする
- category treeはsidebar内だけをscrollし、brand/search/footerを固定する

## Accessibility requirements

- category/recommendationの開閉はbutton＋`aria-expanded`
- 選択APIは`aria-current`またはactive stateを持つ
- 検索結果件数と0件をstatusとして通知する
- iframe titleにAPI名を含める
- mobile選択後はpreview headingまたはsummaryへfocusを移す
- coin獲得toastだけに依存せず、header表示も更新する
- progressにlabelと現在値を持たせ、学習達成度とは読ませない
- dialogはBase UIのfocus trap、title、descriptionを利用する
- game resultを色だけで区別しない

## State-to-component mapping

| State | UI |
| --- | --- |
| unselected | `TeamTWelcome` |
| searching/filtered | sidebar tree + result count |
| search empty | `EmptyState01` |
| catalog invalid | `ErrorRecovery01` |
| preview loading | `LoadingSkeleton01`またはpreview skeleton |
| preview ready | `TeamTApiSummary` + iframe |
| preview missing/error | `ErrorRecovery01` |
| reward progress | header `Progress` |
| reward earned | Sonner toast + coin badge update |
| insufficient coins | inline game-hub message + disabled action |
| game load failure | error result + refunded coin state |

## Intentional new components

新規componentは「在庫不足」ではなく、Team T固有のcompositionとstate ownershipに限定する。

- Catalog tree: 177ページの階層、検索展開、selection、mobile closeを所有
- API preview: base path、iframe lifecycle、hash selection、click observationを所有
- Reward controller: namespaced storage、progress、coin transitionを所有
- Game runtime: spend/refund、iframe lifecycle、trusted message validationを所有

これらをregistryへ追加しない。別アプリで反復利用が実証された場合だけ後日stock taskを検討する。

## Human decisions required

実装準備へ進む前に以下を確認する。

1. 既存screen patternを採用せず、sidebar primitivesを使ったTeam T専用workspace compositionでよいか
2. `filter-toolbar-01`を使わず、単一検索＋sidebar category treeを専用実装してよいか
3. 設定は既存`SettingsDialog/SettingsPage`の見た目をadaptし、ゲームhubは`collection-grid-01`を直接使わず専用card gridにしてよいか
