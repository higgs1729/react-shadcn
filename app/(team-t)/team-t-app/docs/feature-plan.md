<!-- encoding:UTF-8 -->

# Team T feature decomposition and delivery plan

- Status: approved
- Based on: approved product brief, JTBD, user flows, and data/risk boundary
- Delivery principle: 画面単位ではなく、ユーザー価値が動作するvertical slice単位で実装する

## Capability map

| Capability | User value | Priority | Depends on |
| --- | --- | --- | --- |
| Catalog foundation | 177ページ・200 APIを一貫して参照できる | P0 | static assets |
| App shell | desktop/mobileで探索を開始できる | P0 | shared UI |
| Discovery | 検索・カテゴリ・おすすめから候補を見つける | P0 | catalog, shell |
| API preview | 紹介HTMLを開いて試す | P0 | catalog, assets |
| Share/restore | 選択APIを共有・復元する | P0 | discovery, preview |
| Recovery | 空結果・不明ID・asset失敗から戻る | P0 | discovery, preview |
| Preferences | 表示を端末内で調整・復元する | P1 | shell, storage |
| Reward progress | API操作から進捗・コインを得る | P1 | preview, storage |
| Game hub | ゲームを発見・選択する | P1 | reward, game assets |
| Game runtime | 消費・結果・返却を安全に処理する | P1 | game hub, message validation |
| Local profile | 端末内表示名を設定する | P2 | preferences storage |
| Catalog checks | 177/200とasset整合を守る | P0 | typed catalog |
| App introduction | 初回ユーザーがWelcomeから紹介ツアーで主要APIを掴める | P1 | catalog, shell |

## Feature boundaries

### Catalog foundation

- 原型の177 catalog entryを型付きTypeScript dataへ変換
- `apiCount`合計200を維持
- category/categoryPath、description、apiName、officialUrl、iconを移行
- 205 HTMLのうちcatalog参照中177件だけを初期asset移行対象とする
- 未登録28 HTMLはV1移行対象へ自動追加しない
- recommendationsはbasename照合ではなくcatalog IDの明示リストへ変換

### App shell and discovery

- Team T専用layout
- responsive sidebar/drawer
- welcome state
- search input
- recommendations tree
- category tree
- result countとempty recovery
- keyboard navigationとfocus management

### API preview and sharing

- 選択APIの概要
- iframe URL helper
- loading/ready/error/missing状態
- `#apiId`の更新・初期復元・hashchange追従
- 不明IDからwelcome/探索への回復
- mobile選択後のdrawer closeとpreview focus

### Preferences and local profile

- theme: light/dark
- accent: approved palette
- 端末内プロフィール表示名
- namespaced storage migration/reset
- storage unavailable/invalid JSON fallback
- 「ログイン」「アカウント」表現を使用しない

### App introduction

- welcomeの「このアプリの紹介を見る →」から紹介タブを開く
- 紹介タブは常に1枚。既に開いていれば新規作成せずそのタブへ戻る
- 5ページ×(メイン1+サブ2)=15 APIを送る。対応の正本は`lib/team-t-app/intro-tour.ts`
- 各ページのメインAPIの「デモを見る →」で新規APIタブを開いて遷移する
- おすすめリストは`zyouku`・`useless`・`utyu`を追加、`time`・`ohuzake`を削除(15→16件)。正本は`lib/team-t-app/recommendations.ts`

### Reward and game

- 初期5 coins
- iframe内対象クリックで20% progress
- 100%で1 coin、progress reset
- 常設ゲーム入口、初回進捗通知、coin獲得通知
- 8ゲーム一覧、cost、difficulty、reward
- game iframe起動
- source/origin/schema/range/once検証
- load failure/timeout時の一度だけ返却
- 正常ロード後の中断は返却なし
- 結果からAPI探索へ戻る導線

## Vertical slices

### Slice 1 — Find and open one API

```text
typed catalog
→ app shell
→ welcome
→ search/category
→ select
→ iframe preview
→ #apiId restore
→ empty/missing/error recovery
```

Done when:

- 177 entryとlogical total 200が機械検証される
- desktop/mobileで1件を探して開ける
- GitHub Pages base path上でassetとhash restoreが動く
- game、preferences、profileに依存しない

### Slice 2 — Complete discovery

```text
recommendations
→ full category tree
→ search across metadata
→ selection/focus polish
→ direct-link recovery
```

Done when:

- 原型の3探索入口が揃う
- 0件、recommendation error、不明hashから回復できる
- keyboardとmobile drawerの主要操作が通る

### Slice 3 — Personalize locally

```text
settings dialog
→ light/dark
→ accent
→ local profile
→ persistence
→ isolated reset
```

Done when:

- `team-t:v1:*`以外を変更しない
- reloadで復元する
- localStorage不能でもSlice 1–2が壊れない

### Slice 4 — Earn rewards

```text
preview click observation
→ progress
→ first-progress guidance
→ coin earned
→ game CTA
→ persistence
```

Done when:

- click progressを習熟度と表現しない
- gameを使わずAPI探索を続けられる
- 初回ユーザーがcoin用途を把握できる

### Slice 5 — Play games safely

```text
game hub
→ spend
→ iframe load
→ validate result message
→ reward/result
→ API discovery return
```

Done when:

- 8ゲームを起動できる
- forged/duplicate/out-of-range messageを拒否する
- load失敗時は一度だけ返却する
- 正常ロード後の中断は返却しない

### Slice 6 — Production hardening

```text
static export
→ base-path browser test
→ accessibility
→ responsive
→ performance
→ external failure recovery
→ content disclosure
```

Done when:

- GitHub Pages相当のexport成果物でcore flowが通る
- app shellに重大なa11y違反がない
- 外部API失敗がshellを停止させない
- 177ページ・200 APIの掲載数を正しく表示する

### Slice 7 — App introduction tour

```text
recommendations diff
→ intro data (intro-tour.ts)
→ welcome CTA
→ window kind: intro
→ TeamTIntro paging
→ demo open to API window
→ story coverage
```

Done when:

- welcomeから紹介タブを開き、Page1〜5を送れる
- 各ページのメインAPIから新規APIタブへ遷移できる
- おすすめリスト16件と紹介15 APIの対応が`intro-tour.ts`と一致する

実装順序の実績: 1〜4(データとボタン) → 5(ウィンドウ種別) → 6(紹介ビュー) → 7(デモ遷移) → 8(story)

## Dependencies and sequencing

```text
Slice 1
├─ Slice 2
│  ├─ Slice 3
│  └─ Slice 4
│     └─ Slice 5
└─ Slice 6 consumes all completed slices
```

- Slice 3と4はSlice 2完了後に独立して進められる
- Slice 5はreward stateとgame asset境界が必要なためSlice 4の後
- production hardeningは各sliceでも部分実施し、最後に全体確認する

## V1 completion boundary

V1公開に必須:

- Slice 1、2、3、4、5、6
- 177紹介ページ・200 API
- 8ゲーム
- desktop/mobile
- theme/accent/local profile
- hash sharing
- click progressとcoin loop

V1公開後へ延期:

- 全APIの個別live監査
- 意味あるAPI操作イベントによる進捗
- server authentication
- cross-device sync
- 既存HTMLの全面React化
- 未登録28 HTMLの追加判断

## Existing design-system usage target

次工程のUI選定で以下を候補にし、実装前に実sourceとfacetを確認する。

| Area | Candidate inventory use |
| --- | --- |
| Shell | sidebar/app-shell patternをadapt |
| Search/category | filter-toolbarとsidebar primitivesをcompose |
| Welcome/empty/error | empty-state blockをadapt |
| API overview | detail-overview blockをadapt |
| Settings | settings-admin/settings-sectionをadapt |
| Game hub | collection-gridをcompose |
| Coin/progress | badge/progress/card primitivesをcompose |

screen patternの自動選定は行わず、JTBD、data shape、interaction、statesを基準に人間+AIで判断する。

## Human decisions

2026-07-16に以下を承認済み。

1. Slice 1→6の順序とし、V1に8ゲームまで含める
2. 初期asset移行はcatalog参照中の177 HTMLに限定し、未登録28 HTMLは後日分類する
3. recommendationsを原型のファイル名照合から、catalog IDの明示リストへ変更する
