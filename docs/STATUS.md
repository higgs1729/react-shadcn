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
- Task 08（pipeline意味検証）完了。`scripts/validate-pipeline.mjs` が FlowSpec×SelectionSpec×
  BuildReport×registry の横断不変条件を強制（`npm run validate:pipeline` / `test:pipeline`）。
- Task 09（agent eval golden dataset）完了。`eval/`（6境界クラス+golden baseline）と
  決定論グレーダ `scripts/run-eval.mjs`（`npm run eval` / `eval:fixture` / `test:eval`）。
- Task 10（provenance/再現性）完了。BuildReport とは別の独立 manifest
  `docs/provenance/ai-provenance.schema.json` + sidecar 生成/検証（`npm run gen:provenance` /
  `validate:provenance` / `test:provenance`）。digest照合とfailure分類(code|environment|dependency|policy)。

## 文書構成

- `docs/archive/{tasks,examples,notes}/` に完了brief(01–13)・旧spec・研究ノートを収容(通常は不可視)。
- `AGENTS.md` = ルートAI運用ルールの正本。`CLAUDE.md` は固定 `@AGENTS.md` shim とし、`npm run validate:agents` でドリフト検出する。
- `docs/rfcs/` = 改善の理由・選択肢・範囲・検証方針を残す設計文書。実行briefとは分離する。
- `docs/tasks/` = pending brief 置き場。`README.md` にライフサイクル+共通規約+briefテンプレを集約し、brief は固有部分のみ書く方式。
- `docs/examples/` = 現行 golden flow 成果物3枚のみ(flowspec-dryrun-01 / selectionspec-dryrun-02 / buildreport-dryrun-saas-ops-02)。
- `npm run validate` / `npm run checks` = 全 pass。

## 次のタスク

レビューで採用した信頼性改善。理由・範囲・完了条件はリンク先RFCを正本とし、実装着手時に
RFCから自己完結briefを `docs/tasks/` に1件ずつ作る。RFC 002/003/004/005 は完了済み。

### 残り

- [実行時品質・セキュリティ検査を段階的に追加する](rfcs/006-runtime-quality-and-security.md)
  — brief は `docs/tasks/task-12-runtime-quality-and-security.md`（pending、次の着手候補）。

## 次の候補(未選択)

- 新 screenType の在庫追加
- maturity 昇格レビュー(人間レビュー)
- 上流 Flow 層(brief→JTBD→FlowSpec)の自動化
