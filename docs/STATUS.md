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
- `CLAUDE.md` = AI運用ルールの単一入口(Map + Do/Don't)。
- `docs/tasks/` = pending brief 置き場。`README.md` にライフサイクル+共通規約+briefテンプレを集約し、brief は固有部分のみ書く方式。
- `docs/examples/` = 現行 golden flow 成果物3枚のみ(flowspec-dryrun-01 / selectionspec-dryrun-02 / buildreport-dryrun-saas-ops-02)。
- `npm run validate` / `npm run checks` = 全 pass。

## 次の候補(未着手・未選択)

- 新 screenType の在庫追加
- maturity 昇格レビュー(人間レビュー)
- 上流 Flow 層(brief→JTBD→FlowSpec)の自動化
