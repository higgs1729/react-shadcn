# STATUS

プロジェクトの現在地。正本は git log であり、この文書はその要約キャッシュ(最新のみ)。
手動コミット等で反映漏れがあり得る前提で運用する: orchestrator AI はセッション開始時に
これを読み、最終更新以降の git log と突き合わせ、ズレていれば作業前にまず修復する。

## 到達状態

- golden flow `dryrun-saas-ops-01` は3画面(login / overview / invoice-list)すべて built。
- BuildReport #2(`docs/examples/buildreport-dryrun-saas-ops-02.json`)= verified / unresolved: 0。
- 全計画(①task-06委任 ②検証 ③選定再実行 ④ビルド再実行)完了・コミット済み。

## 文書構成

- `docs/archive/{tasks,examples,notes}/` に完了brief(01–06, rerun-02)・旧spec・研究ノートを収容(通常は不可視)。
- `AGENTS.md` / `CLAUDE.md` = 対応エージェント別のAI運用ルール入口(Map + Do/Don't)。内容変更時は両方を同時更新する。
- `docs/rfcs/` = 改善の理由・選択肢・範囲・検証方針を残す設計文書。実行briefとは分離する。
- `docs/tasks/` = pending brief 置き場。`README.md` にライフサイクル+共通規約+briefテンプレを集約し、brief は固有部分のみ書く方式。
- `docs/examples/` = 現行 golden flow 成果物3枚のみ(flowspec-dryrun-01 / selectionspec-dryrun-02 / buildreport-dryrun-saas-ops-02)。
- `npm run validate` / `npm run checks` = 全 pass。

## 次のタスク

レビューで採用した信頼性改善。理由・範囲・完了条件はリンク先RFCを正本とし、実装着手時に
RFCから自己完結briefを `docs/tasks/` に1件ずつ作る。優先度内の順序は依存関係を表す。
RFC 001とRFC 005は相互依存しないため並行可能で、RFC 002は両方の完了後に開始する。

### 優先度 A

1. [planned checksと実行checksを一致させる](rfcs/001-check-plan-enforcement.md)
2. [validator自身を厳格化しnegative testを追加する](rfcs/005-validator-hardening.md)
3. [FlowSpec→SelectionSpec→BuildReportの意味的整合を検証する](rfcs/002-pipeline-semantic-validation.md)

### 優先度 B

4. [agent eval用golden datasetを整備する](rfcs/003-agent-eval-golden-dataset.md)
5. [成果物へprovenanceと再現性情報を持たせる](rfcs/004-provenance-and-reproducibility.md)
6. [実行時品質・セキュリティ検査を段階的に追加する](rfcs/006-runtime-quality-and-security.md)

### 優先度 C

7. [READMEとエージェント指示の情報構造を整える](rfcs/007-documentation-and-agent-instructions.md)

## 次の候補(未選択)

- 新 screenType の在庫追加
- maturity 昇格レビュー(人間レビュー)
- 上流 Flow 層(brief→JTBD→FlowSpec)の自動化
