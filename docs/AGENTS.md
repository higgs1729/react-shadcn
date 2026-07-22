<!-- encoding:UTF-8 -->

# docs/

このディレクトリの文書を読む前に、必要なノードだけを開く。深い知識は各ノードの中にあり、ここでは扱わない。

## 索引

- `STATUS.md` — 現在地の要約キャッシュ。正本は git log
- `contracts/` — FlowSpec / SelectionSpec / BuildReport / facets / profiles の JSON Schema
- `layers/` — 3層の手順書(10-upstream / 20-selection[編集禁止] / 30-implementation)
- `task/` — 別executorへ渡す横断的な実行brief
- `tasks/` — 恒常化されたタスク：下位AI委任 brief
- `examples/` — 現行 golden flow の成果物(最新のみ)
- `provenance/` — provenance sidecar のスキーマと運用
- `apps/` — app ごとの文書。studioApp の spec 正本と Example App 成果物、portal(トップ LP)のデザイン方針
- `case-study/` — ポートフォリオのケーススタディ文書
- `rfcs/` — 意思決定の経緯記録
- `block-role-candidates.json` — 新設 blockRole の active candidate(実装済みは `archive/` へ)
- `archive/` — 完了・失効した文書。明示指示があるときのみ参照

## このディレクトリだけの約束

- `examples/` は flow ID ごとの三つ組(FlowSpec・SelectionSpec・BuildReport)のみを最新状態で保持する。古い版は `git log` を正本とし、ここには置かない
- 新たにtaskを作る場合は`task/`を参照して作成する
- `tasks/` に置くものは`task/`で繰り返し使用したタスクである
