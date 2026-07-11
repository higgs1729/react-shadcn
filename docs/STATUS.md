# STATUS

プロジェクトの現在地。正本は git log であり、この文書はその要約キャッシュ(最新のみ)。
セッション開始時にこれを読み、最終更新以降の git log とズレていれば作業前に修復する。

## 現在地

- golden flow `dryrun-saas-ops-01`(login / overview / invoice-list)は3画面とも built。
  BuildReport `docs/examples/buildreport-dryrun-saas-ops-02.json` = verified / unresolved 0。
  invoice-list は `?state=` 配線済みで default/loading/empty/error すべて到達可能。
- パイプライン全段に検証がある: 契約スキーマ(`npm run validate`)、横断意味検証
  (`validate:pipeline`)、planned checks(lint/typecheck/story/a11y、`checks:planned`)、
  実行時・セキュリティ(smoke / deps-audit / secret-scan)、provenance(`validate:provenance`)、
  agent eval golden dataset(`npm run eval`)。`npm run validate` / `checks` = 全 pass。

## 文書構成

- `docs/contracts/` = 4契約スキーマ(immutable)。`docs/provenance/` = provenance manifest 契約。
- `docs/layers/20-selection/` = 選定手順 + canonical profiles。`30-implementation/` = 実装規約。
- `docs/examples/` = 現行 golden flow 成果物のみ(flowspec-01 / selectionspec-02 / buildreport-02 + sidecar)。
- `docs/tasks/README.md` = brief テンプレ + 共通規約(pending brief 置き場、現在は空)。
- `docs/rfcs/` = 横断改善の設計文書(なぜ・何を・成功判定)。実行 brief とは分離。
- `docs/archive/{tasks,examples,notes,rfcs}/` = 完了 brief・旧 spec・研究ノート・完了 RFC(通常は不可視)。
- `AGENTS.md` = ルート運用ルールの正本。`CLAUDE.md` は固定 `@AGENTS.md` shim(`validate:agents` でドリフト検出)。

## 次の候補(未選択)

- 新 screenType の在庫追加
- maturity 昇格レビュー(人間レビュー)
- 上流 Flow 層(brief→JTBD→FlowSpec)の自動化
- 20-selection / 30-implementation 各層専用サブエージェントの定義
  (brief 側で読むファイル一覧を渡す運用もこの時に整備)
