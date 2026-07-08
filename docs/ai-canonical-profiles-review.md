# ai-canonical-profiles.json レビュー報告

対象: `docs/ai-canonical-profiles.json`（version 0.1.0 / 2026-07-07 生成）
レビュー方式: ①enum全数照合 → ②相互整合（全数） → ③判別可能性 → ④意味的妥当性（外部ソース照合）
判定基準: **major** = 選定層の解決を誤らせる／同点を生む欠陥、**minor** = 品質・一貫性の改善余地、**OK** = 修正不要
本レポートは提案のみであり、プロファイル本体・フラグは一切変更していない。

---

## 1. サマリ表（40判定）

### screenType（10件）

| エントリ | 判定 | 一行理由 |
|---|---|---|
| report-analytics | **major** | facetsがdashboardのほぼ部分集合で同点必至。分離軸の追加が必要 |
| onboarding | minor | `create` intentがworkflowと同点を生む。削除推奨 |
| create-edit | minor | `configure` intentがsettings-adminと同点を生む。削除推奨 |
| dashboard | minor | `drawer-inspection`を持つのにtypicalに`drawer-inspector`が無い等の不整合 |
| auth | OK | — |
| collection | OK | — |
| detail | OK | — |
| settings-admin | OK | （create-edit側の修正で判別が確立） |
| workflow | OK | （onboarding側の修正で判別が確立） |
| conversation-assistant | OK | — |

### blockRole（30件）

| エントリ | 判定 | 一行理由 |
|---|---|---|
| app-shell-topnav | minor | 孤児role（どのscreenTypeのtypicalにも不在）。代替シェル機構が未定義 |
| command-search | minor | 孤児role。到達経路なし |
| notification-center | minor | 孤児role。到達経路なし |
| modal-dialog | minor | 孤児role。到達経路なし |
| drawer-inspector | minor | 孤児role＋dashboardのinteractionModelと不整合 |
| empty-state | minor | 状態系roleの二重管理問題（系統的所見4参照） |
| error-recovery | minor | 同上＋選定ルール「データ駆動画面はerror必須」とtypical構成が矛盾 |
| loading-skeleton | minor | 同上（report-analyticsのtypicalに不在だが逆参照あり） |
| comment-thread | minor | `streaming`は不適。人間のコメントは`real-time`が正 |
| activity-feed | minor | `time-series`は定量系列を意味し、時系列イベント列とは別概念 |
| pricing-plan-card | minor | `categorical`が不適合気味＋準孤児 |
| app-shell-sidebar | OK | — |
| page-header-actions | OK | — |
| breadcrumb-context | OK | （非対称は「typical⊂possible」として許容、系統的所見3で扱う） |
| filter-toolbar | OK | — |
| tabs-view-switcher | OK | （同上の非対称あり、許容） |
| summary-metric-row | OK | — |
| chart-panel | OK | — |
| data-table-panel | OK | — |
| collection-grid | OK | — |
| detail-overview | OK | — |
| form-section | OK | — |
| settings-section | OK | — |
| wizard-stepper | OK | — |
| action-footer | OK | — |
| file-upload-area | OK | （非対称あり、許容） |
| ai-conversation-list | OK | — |
| ai-prompt-composer | OK | — |
| ai-explainability-label | OK | — |
| checkout-summary | OK | — |

**機械的検証の結果**: 全40エントリの `userIntents` / `dataShapes` / `interactionModels` / `density` / `typicalBlockRoles` / `screenTypes` / `layoutRegion` の**全値が schema の enum に適合**（欠陥ゼロ）。相互存在チェック（typicalBlockRoles→blockRole定義、screenTypes→screenType定義）も**全数一致**。対称性チェックは方向1（screenType→blockRole）が完全対称、方向2（blockRole→screenType）に上記の非対称・孤児あり。

---

## 2. 詳細所見（major → minor）

### [major] report-analytics — dashboardとの同点リスク

**現状**:
- dashboard: intents `{monitor, analyze, compare, browse}` / shapes `{metric, time-series, collection, categorical}` / interactions `{read-only, filter-sort, drawer-inspection}`
- report-analytics: intents `{analyze, compare, review, monitor}` / shapes `{metric, time-series, categorical, collection}`（同一集合） / interactions `{read-only, filter-sort}`（dashboardの部分集合）

**問題**: 入力ステップが `{analyze, compare} × {metric, time-series} × {read-only, filter-sort}` の場合、両者が満点で一致し、選定層手順1は必ず `unresolved` 行きになる。頻出パターンなので実運用でエスカレーションが多発する。

**提案**（いずれか、推奨は両方）:
1. report-analytics から `monitor` を削除。NN/g の区別では、モニタリング（операしional）は「時間感度が高く継続更新されるデータを一瞥で判断」、分析（analytical）は「履歴データの傾向を深く探索」であり、`monitor` はdashboard側の専有シグナルにできる。
2. dashboard の interactionModels に `real-time` を追加（継続更新という本質を反映）。これで interactions でも分離できる。

**根拠**: NN/g はダッシュボードを「最小の操作・認知処理で速く消費される情報」と定義し、運用型（時間敏感・継続更新）と分析型（履歴・傾向探索）を明確に区別している。（[NN/g: Dashboards: Making Charts and Graphs Easier to Understand](https://www.nngroup.com/articles/dashboards-preattentive/)）

### [minor] onboarding — `create` が workflow と同点を生む

**現状**: onboarding intents `{onboard, configure, create}`、workflow intents `{approve, review, purchase, create}`。両者とも interactions に `wizard, form-submit`、shapes に `single-record` を持つ。
**問題**: 入力 `{create} × {single-record} × {wizard}` で完全同点。
**提案**: onboarding から `create` を削除（`onboard` と `configure` で意図は十分表現できる。初回設定で何かを「作る」のは onboard の内包）。workflow 側の `transaction` shape が残りの分離軸として機能する。

### [minor] create-edit — `configure` が settings-admin と同点を生む

**現状**: create-edit intents `{create, edit, configure}`、settings-admin intents `{configure, edit, approve, review}`。両者とも `single-record` × `form-submit` × `inline-edit` を共有。
**問題**: 入力 `{configure} × {single-record} × {form-submit}` で完全同点。
**提案**: create-edit から `configure` を削除し、`configure` を settings-admin / onboarding の専有シグナルにする。「新規レコードの作成・既存の編集」は `create` / `edit` で過不足なく表現できる。

### [minor] dashboard — typical構成の内部不整合

**現状**: interactionModels に `drawer-inspection` を宣言しながら、typicalBlockRoles に `drawer-inspector` が無い。また選定ルールは「データ駆動画面は empty / loading / error / permission-denied 必須」と定めるが、dashboard の typical には `empty-state` / `loading-skeleton` / `error-recovery` がいずれも無い（collection には empty/loading がある）。さらに `empty-state`・`activity-feed`・`error-recovery`・`drawer-inspector` は screenTypes 側で dashboard を挙げており、非対称。
**提案**: (a) `drawer-inspector` を dashboard の typical か optional に追加、(b) 状態系roleの扱いを系統的所見4の決定に従って統一（どちらの機構で担保するか決めてから typical を修正）。

### [minor] 孤児role群 — app-shell-topnav / command-search / notification-center / modal-dialog / drawer-inspector

**現状**: この5roleはどの screenType の typicalBlockRoles にも登場しない。
**問題**: 選定層はパターンの `composition.requiredBlocks` から役割を読むため、正準プロファイル経由ではこれらの role に到達する既定経路が存在しない。定義しただけで使われない「死に語彙」になる恐れ。
**提案**: プロファイルに `optionalBlockRoles` フィールドを追加し、例えば dashboard/collection に `command-search`・`notification-center`・`drawer-inspector` を、collection/detail に `modal-dialog` を optional として掲載する。`app-shell-topnav` は系統的所見3（代替シェル機構）で扱う。

### [minor] comment-thread — `streaming` は不適

**現状**: interactionModels `{form-submit, streaming}`。
**問題**: `streaming` はAIのトークン逐次出力を想定した語彙（conversation-assistant 系で使用）。人間同士のコメントスレッドの性質は「他者の投稿が随時反映される」= `real-time`。
**提案**: `streaming` → `real-time` に置換。

### [minor] activity-feed — `time-series` の誤用気味

**現状**: dataShapes `{collection, time-series}`。
**問題**: schema の `time-series` は chart-panel 等が使う定量的時系列を想定。アクティビティフィードは「時刻順に並んだイベントのコレクション」であり `collection` で足りる。`time-series` を残すと、チャート向けデータを持つステップがフィードにマッチする誤選定リスクがある。
**提案**: `time-series` を削除し `collection` のみとする。

### [minor] pricing-plan-card — `categorical` の適合が弱い

**現状**: dataShapes `{categorical}`。
**問題**: プラン集合は「少数の選択肢レコードの集まり」であり、意味的には `collection`（小規模）が近い。`categorical` はチャートの分類軸を想定した語彙。
**提案**: `collection` に置換、または併記。commerce系はスキーマ上 overlay 扱いなので優先度は低い。

### [minor] error-recovery / empty-state / loading-skeleton — 状態系roleの整合

**現状**: `error-recovery` の screenTypes は `{auth, collection, detail, dashboard}` だが typical に含めるのは auth のみ。`loading-skeleton` は report-analytics を挙げるが report-analytics の typical に無い。
**問題**: 選定ルール「データ駆動画面は empty/loading/error/permission-denied 必須」との突き合わせで、役割ベース（block）で担保するのか状態ベース（stateCoveragePlan）で担保するのか曖昧。現状は二重管理。
**提案**: 系統的所見4を先に決定し、その決定に合わせて typical への追加または screenTypes の削減を行う。参考: Carbon は empty state / loading を独立コンポーネントではなく**パターン**（他コンポーネントに適用する状態指針）として扱っており、「ページの主要リソースには教育的アプローチ、二次リソースには簡素な empty state」という粒度の使い分けを推奨している。（[Carbon: Empty states pattern](https://carbondesignsystem.com/patterns/empty-states-pattern/)）

---

## 3. 判別可能性の総括（要件3）

| ペア | 同点リスク | 分離策 |
|---|---|---|
| dashboard ↔ report-analytics | **高**（shapes同一・interactions包含） | `monitor` の専有化＋`real-time` 追加（上記major） |
| onboarding ↔ workflow | 中（`create`×`wizard`×`single-record`） | onboarding から `create` 削除 |
| create-edit ↔ settings-admin | 中（`configure`×`form-submit`×`single-record`） | create-edit から `configure` 削除 |
| collection ↔ dashboard | 低 | `metric`/`time-series` の有無で既に分離。`browse` 単独入力時のみ注意 |
| detail ↔ create-edit | 低 | `read-only` 主体 vs `form-submit` 主体で分離済み |

上記3修正を入れると、全ペアが「少なくとも1つの専有facet」を持つ状態になり、手順1の決定性が大きく向上する。

---

## 4. 系統的改善（構造レベル）

1. **`maturity: "draft"` が schema enum に存在しない**（enum は canonical / recommended / community / experimental / deprecated）。プロファイルは別文書とはいえ語彙を借用しており、契約の一貫性が崩れる。→ `experimental` を使うか、schema の enum に `draft` を追加提案するかのどちらかに統一する。
2. **screenType解決のスコアリング式が未定義**。選定指示書の 0-100 ルーブリックは手順2以降（pattern選定）用であり、手順1「best match を選ぶ」の計算方法（重み付き一致率か Jaccard か、facet間の優先順位）がどこにも書かれていない。同点判定の閾値（"near-tie" の定義）も未定義。→ 指示書に「intents 一致 > dataShapes 一致 > interactions 一致の辞書式比較」等の決定的な式を1つ明記する。
3. **代替シェル機構の欠如**。`app-shell-topnav` が到達不能（孤児）。typicalBlockRoles は「既定構成」しか表現できない。→ プロファイルに `alternativeShells`（または `optionalBlockRoles`）を追加し、「シェルは sidebar が既定、topnav は浅いナビ構造のとき代替」等のタイブレーク注記を持たせる。
4. **状態系role（empty-state / error-recovery / loading-skeleton）と `stateCoverage` の二重機構**。同じ関心が blockRole と state の両方で表現されており、選定層がどちらを義務として扱うか不定。→ 推奨: 「ページ全体を占める状態（初回empty、致命error）は blockRole として選定」「block内部の状態（テーブルのloading等）は stateCoveragePlan で担保」と役割分担を docs に明文化する。
5. **プロファイル自体のJSON Schema が無い**。`reviewed` / `maturity` / `layoutRegion` などプロファイル固有フィールドの型・必須性が未検証（既知の「穴3」の拡張）。なお `layoutRegion` は facets schema の `layoutModel.region` と同じ enum を使っているが**フィールド名が異なる**。→ `ai-canonical-profiles.schema.json` を作り CI（ajv）で検証、`layoutRegion` → `layoutModel.region` へ命名統一。
6. **`typicalBlockRoles` の意味論の明文化**。方向2の非対称（breadcrumb-context 等）は「typical ⊂ possible」と解釈すれば健全だが、その解釈がファイルの `$comment` に書かれていない。→ 「typical=既定合成、screenTypes=許容範囲」と冒頭コメントに明記。

---

## 5. 使用したスキル・情報源

- プラグインスキルは未使用（本タスクはメタデータ監査であり、監査基準は選定層契約 `ai-pattern-selection-instructions.md`・facets schema・下記外部ソースから直接導出した。design:design-system スキルはコード実装の監査向けのため対象外と判断）。
- 機械的検証は本文書内で全数実施（サンプリングなし）。

### Sources

- [Nielsen Norman Group — Dashboards: Making Charts and Graphs Easier to Understand](https://www.nngroup.com/articles/dashboards-preattentive/) （dashboard=一瞥消費・運用/分析の区別）
- [Carbon Design System — Empty states pattern](https://carbondesignsystem.com/patterns/empty-states-pattern/) （empty state をパターンとして扱う指針）
- [Carbon Design System — Loading pattern](https://carbon-website-git-fork-aagonzales-dialog-pattern.carbon-design-system.vercel.app/patterns/loading-pattern) （skeleton=初回ロードの1-3秒、知覚パフォーマンス）
- `docs/ai-design-facets.schema.json`（enum 正）
- `docs/ai-pattern-selection-instructions.md`（選定層契約）
