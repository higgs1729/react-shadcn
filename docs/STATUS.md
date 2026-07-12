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
- block-pattern 棚は全充足(task-17): **30/30 blockRole 在庫**(各 role に experimental
  block-pattern を1つ、vendored primitive で合成。3ファイル/件 = component + registry +
  hand-written story)。screenType は **4/11 在庫**、空き7(conversation-assistant /
  create-edit / detail / onboarding / report-analytics / settings-admin / workflow)は
  task-16 で screen-pattern を追加(必要 block は揃済み)。
- `inbox-communication` を experimental ScreenType として追加済み。registry item
  `inbox-communication-01` は sidebar/header/filter/table の既存在庫を再利用し、
  default/loading/empty/error の Storybook story を持つ。人間レビューと実バックエンド接続は未実施。

## 文書構成

- `docs/contracts/` = 4契約スキーマ(immutable)。`docs/provenance/` = provenance manifest 契約。
- `docs/layers/20-selection/` = 選定手順 + canonical profiles。`30-implementation/` = 実装規約。
- `docs/examples/` = 現行 golden flow 成果物のみ(`<artifact>-<flowId>.json` 命名、現在は flowspec / selectionspec / buildreport-dryrun-saas-ops-01 + sidecar)。
- `docs/tasks/README.md` = brief テンプレ + 共通規約。`task-16` は ScreenType を1つ
  end-to-end で追加する再利用 brief。初回実行で `inbox-communication` を追加済み。
- `docs/rfcs/` = 横断改善の設計文書(なぜ・何を・成功判定)。実行 brief とは分離。
  active: `009`(registry–selection 意味検証 = completed)。旧 `010`(語彙拡張 + verification
  書き戻し governance)は `task-16` と AGENTS.md/30-implementation へ統合済み。
- `docs/archive/{tasks,examples,notes,rfcs}/` = 完了 brief・旧 spec・研究ノート・完了 RFC(通常は不可視)。
- `AGENTS.md` = ルート運用ルールの正本。`CLAUDE.md` は固定 `@AGENTS.md` shim(`validate:agents` でドリフト検出)。

## 次の候補(未選択)

- 次の ScreenType 候補: `document-workspace`。実行 brief = `docs/tasks/task-16`。
- maturity 昇格レビュー(人間レビュー)
- 上流 Flow 層(brief→JTBD→FlowSpec)の自動化
- 20-selection / 30-implementation 各層専用サブエージェントの定義
  (brief 側で読むファイル一覧を渡す運用もこの時に整備)

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
