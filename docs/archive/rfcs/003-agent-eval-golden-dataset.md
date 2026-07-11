# RFC 003: agent eval用golden datasetを整備する

- Status: in-progress
- Priority: B
- Created: 2026-07-11
- Owners: human owner / orchestrator AI
- Depends on: RFC 002

## Problem

現在のgolden flowはend-to-endの成功例として有効だが、選定閾値、near-tie、在庫不足、
禁止変更などの失敗境界を回帰検査できない。promptやmodel、scoring変更による品質変化を
継続的に比較する基準もない。

## Why now

エージェントは複数stepとtool callを経るため、最終JSONのSchema適合だけでは正しい過程を
評価できない。変更前のbaselineを今作る方が、在庫と上流自動化が増えた後より安価である。

## Decision

成功例と失敗例を含む小さなeval datasetを作り、決定論的graderを優先する。必要な主観評価
だけを別graderへ分け、単一のLLM judgeを正解源にしない。

## Scope

- 明確な一位、閾値未満、near-tie、依存不足、required state不足のfixtures
- 期待candidate、rejection、unresolved reason、tool/check結果のgrader
- 禁止領域が変更されていないことのgrader
- 同一入力の再現性と変更前後比較

## Out of scope

- 大規模な本番traffic replay
- LLM judgeだけによる合否判定

## Validation

- 各主要な選定分岐に最低1件のpositive/negative caseがある。
- 意図的なscoring退行をdatasetが検知する。
- datasetとgraderを単一commandで実行できる。

## References

- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [Google agents-cli evaluation workflow](https://google.github.io/agents-cli/cli/)
- [Microsoft Agent Framework: Evaluation](https://learn.microsoft.com/en-us/agent-framework/agents/evaluation)

## Outcome

完了
