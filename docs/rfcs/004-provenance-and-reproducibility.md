# RFC 004: provenanceと再現性情報を持たせる

- Status: in-progress
- Priority: B
- Created: 2026-07-11
- Owners: human owner / orchestrator AI
- Depends on: RFC 002

## Problem

成果物から、どの契約・入力・registry・git状態・実行環境で生成されたかを機械的に再現
できない。環境制限による失敗とコード不具合も同じ `fail` になり、監査や再試行判断が難しい。

## Why now

成果物とevalが増えるほど、同じflowIdでも生成条件が異なる。provenanceなしでは比較結果の
意味が薄れ、古い成果物を現行在庫の結果と誤認しやすい。

## Decision

必要最小限のversion・digest・git・runtime・generator情報を成果物または付随manifestへ
記録する。失敗はcode、environment、dependency、policy等に分類する。秘密情報や生の
prompt内容は保存しない。

## Scope

- contract/generator version
- FlowSpec、SelectionSpec、registryのdigest
- git commit、Node/npm、OS、実行日時・所要時間
- model/instruction revisionを利用する場合の識別子
- failure kindと再試行可能性

## Out of scope

- chain-of-thoughtの保存
- credential、個人情報、生promptの無条件保存

## Validation

- BuildReportから入力revisionを一意に追跡できる。
- 同一条件での再実行かどうかを自動比較できる。
- 環境failureとcode failureを区別できる。

## References

- [NIST AI RMF: Generative AI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence)
- [Microsoft Agent Framework: Observability](https://learn.microsoft.com/en-us/agent-framework/agents/observability)

## Outcome

未実装。
