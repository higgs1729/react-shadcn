'''
encoding:"UTF-8"
'''

# STATUS

プロジェクトの現在地。正本は git log であり、この文書はその要約キャッシュ(最新のみ)。
セッション開始時にこれを読み、最終更新以降の git log とズレていれば作業前に修復する。

## 現在地

- golden flow `dryrun-saas-ops-01`(login / overview / invoice-list)は3画面とも built。
  BuildReport `docs/examples/buildreport-dryrun-saas-ops-01.json` = verified / unresolved 0。
  invoice-list は `?state=` 配線済みで default/loading/empty/error すべて到達可能。
- パイプライン全段に検証がある: 契約スキーマ(`npm run validate`)、横断意味検証
  (`validate:pipeline`)、planned checks(lint/typecheck/story/a11y、`checks:planned`)、
  実行時・セキュリティ(smoke / deps-audit / secret-scan)、provenance(`validate:provenance`)、
  agent eval golden dataset(`npm run eval`)。`npm run validate` / `checks` = 全 pass。
- 検証系は複数フロー対応済み(RFC 008): 引数なし実行は `docs/examples/` の三つ組を全数
  自動発見(`scripts/lib/flows.mjs`、三つ組欠落・命名不一致は fail-loud)。
- `validate:pipeline` は registry facet を読む意味検証を持つ(RFC 009): 名前存在
  (`REGISTRY_ITEM_EXISTS`)に加え、assetKind/screenType/blockRole/requiredBlocks/依存 union の
  5不変条件。在庫充足は `npm run report:coverage`(観測のみ・exit 0)で可視化。
- block-pattern 棚は全充足: **32/32 blockRole 在庫**(各 role に experimental
  block-pattern を1つ、vendored primitive で合成。3ファイル/件 = component + registry +
  hand-written story)。screenType は **12/12 在庫**、gap 0(全 screenType に experimental
  screen-pattern が1つ以上)。`npm run report:coverage` = 12/12・32/32。
- task-16 を7画面分連続実行し、`detail` / `onboarding` / `create-edit` / `workflow` /
  `conversation-assistant` / `report-analytics` / `settings-admin` の experimental
  screen-pattern を新規追加。各 registry item は既存 canonical profile の typicalBlockRoles を
  既存在庫の block-pattern で合成し、default/loading/empty/error の hand-written Storybook story を
  持つ。enum・profile は既に canonical で存在していたため語彙は不変(facets schema の diff 無し)。
  回帰は `scripts/test-screentype-inventory.mjs <type>`(enum 存在・profile・role 対称・在庫充足の
  positive 5 + SCREENTYPE_MATCH negative 1)を7 type 分 `npm run test:<type>` で追加。
  form-section が必要な onboarding/create-edit/workflow/settings-admin は、唯一の在庫
  `form-section-login-01` が login 専用で汎用フォームに不適合のため、同じ shadcn Field primitive で
  本文を合成(新 block 在庫は作らず、inventory-first は既存在庫充足で満たす)。人間レビューと
  実バックエンド接続は未実施。
- 既知メモ: 共有 block `file-upload-area-01` は「Browse files」ボタンが `Button render={<label/>}`
  で Base UI の nativeButton dev 警告を1件出す(描画は正常・例外ではない)。既存の
  `document-workspace-01` でも同一で発生する先行事象で、`file-upload-area` を使う
  onboarding/create-edit にも現れる。修正は共有 block の変更を伴うため別タスク。
- `inbox-communication` を experimental ScreenType として追加済み。registry item
  `inbox-communication-01` は sidebar/header/filter/conversation triage/comment thread を合成し、
  default/loading/empty/error の Storybook story を持つ。人間レビューと実バックエンド接続は未実施。
- `document-body-editor` を experimental blockRole として追加(task-19、候補
  `document-workspace--document-body-editor` を消費 = implemented)。registry item
  `document-body-editor-01` は Textarea/Field/Attachment 等の primitive で本文編集面を合成。
  既存 screenType `detail` / `create-edit` の optionalBlockRoles に対称追加済み。
- `document-workspace` を experimental ScreenType として追加(task-16 再実行)。registry item
  `document-workspace-01` は page-header/breadcrumb/document-body-editor/comment-thread/
  file-upload の既存在庫を再利用し、default/loading/empty/error の Storybook story を持つ。
  detail との差は「本文の inline 編集が主目的」、create-edit との差は「離散フォーム項目でなく
  自由記述キャンバス」。人間レビューと実バックエンド接続は未実施。
- Task 21 を完了。`stateCoverage` は ScreenType 共通の必須マトリクスではなく、各
  screen-pattern が実装・Storybookで証明済みの状態在庫である。選定の状態ゲートは
  **FlowSpec.step.requiredStates のみ**で、screenType / dataShapes / interactionModels /
  data-driven の一般則から追加状態を推論しない。`npm run test:screen-states` は全12
  ScreenTypeの在庫、合法enum、宣言済み user/interaction state のStorybook export、及び
  FlowSpecが在庫にない状態を要求したときの `STATE_COVERAGE_MATCH` 負例を検証する。
  FlowSpecが直接要求したため dashboard-01 に loading/empty/error、
  document-workspace-01 に validation-error（関連する文書タイトルのfield error）を追加し、
  各状態を実ブラウザのStorybook/a11yで検証した。共有file-upload-areaは、Document Workspaceの
  a11y検証で判明したネスト操作要素を解消済み。maturity昇格なし。
- `studio-portfolio-01` のSelectionSpec未出力ドライ評価（現在の `requiredStates` のみ）:
  **resolved 11 / unresolved 0**。
  `overview→dashboard-01`、`pattern-library→collection-table-01`、
  `pattern-detail→report-analytics-01`、`live-demo→dashboard-01`、
  `quality-report→report-analytics-01`、`case-study→report-analytics-01`、
  `studio-composer→document-workspace-01`、`ai-assistant→conversation-assistant-01`、
  `flow-checkpoint→workflow-01`、`result-report→report-analytics-01`、
  `orientation→onboarding-01`。とくに pattern-detail / case-study が report-analytics に
  解決されるのは現行facet重みの結果であり、望む画面意図と違う場合は状態方針ではなく上流FlowSpec
  またはcanonical profileの別タスクで調整する。

## 文書構成

- `docs/contracts/` = 4契約スキーマ(immutable)。`docs/provenance/` = provenance manifest 契約。
- `docs/layers/10-upstream/` = 上流 FlowSpec の単独置き場(選定前の入力契約のみ)。
  **`validate:spec` の scan モードと flow 三つ組発見(`scripts/lib/flows.mjs`)は `docs/examples/`
  しかスキャンしない**ため、ここのファイルは `npm run validate`(scan)の自動検証対象外。
  検証は必ず明示ファイル指定で回す:
  `npm run validate:spec -- docs/layers/10-upstream/<file>.json`。
  例: `flowspec-studio-portfolio-01.json`(本体アプリの1本化 FlowSpec、schema 検証 pass 済み)。
- `docs/layers/20-selection/` = 選定手順 + canonical profiles。`30-implementation/` = 実装規約。
- `docs/examples/` = 現行 golden flow 成果物のみ(`<artifact>-<flowId>.json` 命名、現在は flowspec / selectionspec / buildreport-dryrun-saas-ops-01 + sidecar)。
- `docs/tasks/README.md` = brief テンプレ + 共通規約。追加作業は3分割:
  `task-16` = ScreenTypeのみ、`task-18` = 既存blockRoleの在庫1件、`task-19` =
  新blockRole語彙+在庫1件。Task 16で判明した新role需要は
  `docs/block-role-candidates.json` に proposed としてhandoffする。
- `docs/rfcs/` = 横断改善の設計文書(なぜ・何を・成功判定)。実行 brief とは分離。
  active: `009`(registry–selection 意味検証 = completed)。旧 `010`(語彙拡張 + verification
  書き戻し governance)は `task-16` と AGENTS.md/30-implementation へ統合済み。
- `docs/archive/{tasks,examples,notes,rfcs}/` = 完了 brief・旧 spec・研究ノート・完了 RFC(通常は不可視)。
- `AGENTS.md` = ルート運用ルールの正本。`CLAUDE.md` は固定 `@AGENTS.md` shim(`validate:agents` でドリフト検出)。

## 進行中タスク

- ScreenType追加優先順位テーブル:

| 順位 | ScreenType候補 | 状態・先行条件 | 理由 |
| --- | --- | --- | --- |
| 1 | `inbox-communication` | 追加済み | Task 16の初回実行とbrief分離の検証に使用。 |
| 2 | `document-workspace` | 追加済み | 本文編集の中核 role が不在 → task-19 で `document-body-editor` を先行追加し、task-16 再実行で完了。 |
| 3 | `planning-board` | 新blockRole候補を先に評価(候補 `planning-board--board-column` を台帳へ登録済み) | board / column / card操作を既存collection roleへ押し込むと意味が弱くなりやすい。 |
| 4 | `spatial-explorer` | map系blockRole追加を先に評価 | `geo` dataShapeはあるが、地図を担う専用blockRoleがない。 |
| 5 | `calendar-scheduler` | calendar系blockRole追加を先に評価 | 日・週・月表示と時間枠操作を表す専用blockRoleがない。 |
| 6 | `operations-console` | dashboard / workflowとの差を先に精査 | 既存型との重複が大きく、独立ScreenTypeにする根拠確認が必要。 |

各候補はTask 16のBlockRole前提ゲートから開始する。既存roleの在庫不足はTask 18、
新roleが必要なら候補台帳へ登録してTask 19を先行し、完了後にTask 16を再実行する。

- アプリの本体の作成
  - 資料は`docs/archive/personal/tomoy/AI-Design-System-Studio.md`
    - 例外措置としてこのタスクにかかわっている間のみはこのファイルのみReadとEditを許可する

## 次の候補(未選択)

- maturity 昇格レビュー(人間レビュー)
- 上流 Flow 層(brief→JTBD→FlowSpec)の自動化
- 20-selection / 30-implementation 各層専用サブエージェントの定義
  (brief 側で読むファイル一覧を渡す運用もこの時に整備)
- blockRole全体の実装状況ビュー: enum/profile/registry/component/story/state/checksを
  role単位で一覧化する。31/31在庫後の品質差を可視化する構想として保持し、今回は未着手。

## 小粒の改善メモ(急がない・機会があれば相乗り)

- `validate:pipeline` / `gen:provenance` の明示引数モードは欠けたフラグが golden に
  フォールバックする。多フロー運用では「明示モードは3フラグ全部必須」に変える方が素直
  (混成事故は FLOW_ID_MATCH / provenance digest 照合で最終検出されるため急がない)。
- `run-eval.mjs` の `FORBIDDEN_PATH_PREFIXES` は AGENTS.md 編集禁止リストの複製。
  editedPaths の git diff 突合強化(サブエージェント定義時)に合わせて見直す。
- BOM-strip `readJson` が検証スクリプト5本に重複。どれかを触る機会に lib へ寄せる。
- (P2-2) `gen-pattern-stories.mjs` の block story 生成が手書き `ROLE_CONFIG` 依存で、
  未対応 role は props 無し render・data-table は特定 fixture 直結。props 必須の新 block を
  足すと story がコンパイル不能になりうる。render adapter / fixture 参照を registry 側の
  機械可読情報に持たせる方向。次候補「新 screenType 在庫追加」で新 block を作る時に相乗り。
