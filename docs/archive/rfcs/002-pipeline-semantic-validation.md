# RFC 002: パイプラインの意味的整合を検証する

- Status: in-progress
- Priority: A
- Created: 2026-07-11
- Owners: human owner / orchestrator AI
- Depends on: RFC 001, RFC 005

## Problem

JSON Schemaは各成果物の形を検証できるが、FlowSpec、SelectionSpec、BuildReportをまたぐ
同一性・完全性・状態整合は保証しない。例えばstepの欠落や重複、存在しないregistry item、
fail checkを含む `verified` といった組み合わせを単体Schemaだけでは防げない。

## Why now

このリポジトリの価値はhandoffを契約強制する点にある。構文が正しいだけで意味的に壊れた
成果物を通すと、後段ほど原因の特定が難しくなる。

## Decision

既存Schemaを過度に複雑化せず、RFC 005で共通化・strict化したAjv基盤の上に、3成果物と
registryを同時に読む横断validatorを追加する。
各stepが後段で過不足なく追跡され、statusとcheck結果が矛盾しないことを検証する。

## Scope

- flowIdとstep集合の一致
- resolved / unresolvedの排他性と完全性
- registry itemと依存関係の存在
- planned checkと実行結果の対応
- screen status、全体status、check結果の状態遷移規則
- route・生成ファイルの最低限の存在確認

## Out of scope

- UI品質の主観評価
- 既存契約Schemaの全面刷新

## Validation

- 正常golden flowがpassする。
- 欠落、重複、未知registry item、不正statusのnegative fixturesがそれぞれfailする。
- エラーには対象stepと違反規則が含まれる。

## References

- [JSON Schema: Combining schemas](https://json-schema.org/understanding-json-schema/reference/combining)
- [OpenAI: A practical guide to building AI agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)

## Outcome

完了