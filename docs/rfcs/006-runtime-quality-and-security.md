# RFC 006: 実行時品質・セキュリティ検査を追加する

- Status: in-progress
- Priority: B
- Created: 2026-07-11
- Owners: human owner / orchestrator AI
- Depends on: RFC 001, RFC 003

## Problem

現在のlint、typecheck、build、Storybook buildは静的健全性をよく確認するが、ユーザー操作、
画面状態、アクセシビリティ、生成コードの脆弱性、secret、依存関係リスクを直接検証しない。

## Why now

AI生成コードは「コンパイルできる」と「要求どおり安全に動く」の差が大きい。検査を後付け
すると既存生成物の一括修正が必要になるため、在庫が小さい段階で最低限のgateを定義する。

## Decision

高価な仕組みを一度に導入せず、golden flowのbrowser smokeから始める。a11yはRFC 001で
定義した唯一のcheck ID・実装を再利用し、必要ならブラウザ上のルート網羅を拡張する。次に
dependency、secret、static security、必要なvisual regressionの順に段階導入する。

## Scope

- Playwright等による主要flowとstateのsmoke test
- RFC 001のa11y checkを再利用した、golden route上のaccessibility範囲拡張
- dependency vulnerabilityとsecret検査
- リスクに応じたstatic security analysis
- 安定した画面に限定したvisual regressionの検討

## Out of scope

- 全ブラウザ・全端末の網羅
- flakyなvisual testを初期必須gateにすること
- 自動検査だけで人間reviewを置き換えること

## Validation

- golden flowの主要操作とloading/empty/errorが自動実行される。
- 既知のa11y違反、secret fixture、危険dependencyを検知できる。
- flaky率と実行時間を記録し、必須gate化を判断できる。

## References

- [GitHub: Risks and mitigations for coding agents](https://docs.github.com/en/copilot/concepts/agents/cloud-agent/risks-and-mitigations)
- [OpenAI: A practical guide to building AI agents](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- [NIST AI RMF: Generative AI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence)

## Outcome

未実装。
