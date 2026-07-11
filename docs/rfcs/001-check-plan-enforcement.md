# RFC 001: planned checksと実行checksを一致させる

- Status: in-progress
- Priority: A
- Created: 2026-07-11
- Owners: human owner / orchestrator AI
- Depends on: none

## Problem

SelectionSpecは `lint`、`typecheck`、`a11y`、`story` を計画する一方、固定runnerは
`contracts`、`lint`、`typecheck`、`build`、`storybook` を実行する。Storybookのbuild
成功は、storyの描画・interaction・accessibility成功を保証しない。現状は計画した検査を
未実行でもBuildReportを `verified` にできる。

## Why now

エージェントの自己申告ではなく、要求した検査が実際に実行されたことを機械保証するのが
handoff契約の目的である。ここが曖昧なままevalや検査を増やすと、名前だけ存在する検査が
増える。

## Decision

check IDを一元化し、runnerがSelectionSpecの `checksPlanned` を入力として全件実行する。
BuildReportの `verified` は、必要なcheckが欠落せず全てpassした場合だけ許可する。
a11yとstoryはbuildではなく、描画結果に対する実検査とする。

## Scope

- check IDと実行commandの対応表
- planned / executed checksの完全性検証
- Storybook render、interaction、axe等によるa11y検査
- check欠落時の明示的failure

## Out of scope

- 全画面の本格的なvisual regression
- 外部クラウド評価サービスの導入

## Validation

- planned checkを1件意図的に未登録にすると検証がfailする。
- a11y違反を含むfixtureがfailする。
- 全planned checksがpassした場合のみBuildReportを `verified` にできる。

## References

- [Microsoft Agent Framework: Evaluation](https://learn.microsoft.com/en-us/agent-framework/agents/evaluation)
- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)

## Outcome

未実装。
