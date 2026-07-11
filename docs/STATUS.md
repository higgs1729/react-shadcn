# STATUS

プロジェクトの現在地。正本は git log であり、この文書はその要約キャッシュ(最新のみ)。
手動コミット等で反映漏れがあり得る前提で運用する: orchestrator AI はセッション開始時に
これを読み、最終更新以降の git log と突き合わせ、ズレていれば作業前にまず修復する。

## 到達状態

- Task 07: planned check enforcement completed — every declared check now runs through one registry; browser-rendered story/a11y checks and their Playwright setup are documented; the golden SelectionSpec passes all 12 planned checks.

- golden flow `dryrun-saas-ops-01` は3画面(login / overview / invoice-list)すべて built。
- BuildReport #2(`docs/examples/buildreport-dryrun-saas-ops-02.json`)= verified / unresolved: 0。
- 全計画(①task-06委任 ②検証 ③選定再実行 ④ビルド再実行)完了・コミット済み。
- Task 13（README・エージェント指示の整備）完了。README刷新、`AGENTS.md` 正本化、
  `npm run validate:agents` をコミット `c432b56` で導入済み。
- Task 11（validator堅牢化）完了。strictな共通Ajv基盤、schema自己検証、fail-closed scan、
  negative regression testsを導入済み。

## 文書構成

- `docs/archive/{tasks,examples,notes}/` に完了brief(01–06, rerun-02)・旧spec・研究ノートを収容(通常は不可視)。
- `AGENTS.md` = ルートAI運用ルールの正本。`CLAUDE.md` は固定 `@AGENTS.md` shim とし、`npm run validate:agents` でドリフト検出する。
- `docs/rfcs/` = 改善の理由・選択肢・範囲・検証方針を残す設計文書。実行briefとは分離する。
- `docs/tasks/` = pending brief 置き場。`README.md` にライフサイクル+共通規約+briefテンプレを集約し、brief は固有部分のみ書く方式。
- `docs/examples/` = 現行 golden flow 成果物3枚のみ(flowspec-dryrun-01 / selectionspec-dryrun-02 / buildreport-dryrun-saas-ops-02)。
- `npm run validate` / `npm run checks` = 全 pass。

## 次のタスク

レビューで採用した信頼性改善。理由・範囲・完了条件はリンク先RFCを正本とし、実装着手時に
RFCから自己完結briefを `docs/tasks/` に1件ずつ作る。優先度内の順序は依存関係を表す。
RFC 005は完了済み。RFC 002はRFC 001の完了後に開始する。

### 優先度 A

1. [FlowSpec→SelectionSpec→BuildReportの意味的整合を検証する](rfcs/002-pipeline-semantic-validation.md)

### 優先度 B

4. [agent eval用golden datasetを整備する](rfcs/003-agent-eval-golden-dataset.md)
5. [成果物へprovenanceと再現性情報を持たせる](rfcs/004-provenance-and-reproducibility.md)
6. [実行時品質・セキュリティ検査を段階的に追加する](rfcs/006-runtime-quality-and-security.md)

## 次の候補(未選択)

- 新 screenType の在庫追加
- maturity 昇格レビュー(人間レビュー)
- 上流 Flow 層(brief→JTBD→FlowSpec)の自動化
