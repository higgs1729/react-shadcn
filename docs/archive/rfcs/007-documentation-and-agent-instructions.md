# RFC 007: READMEとエージェント指示の情報構造を整える

- Status: completed
- Priority: C
- Created: 2026-07-11
- Owners: human owner / orchestrator AI
- Depends on: none

## Problem

ルートREADMEはNext.jsテンプレートの説明が中心で、プロジェクトの目的、pipeline、quick start、
人間承認境界を伝えない。`AGENTS.md` と `CLAUDE.md` は対応範囲を広げる一方、手動二重管理に
よるドリフトの可能性がある。

## Why now

新しい人間やエージェントが正しい入口を見つけられないと、優れた契約があっても誤った順序で
作業する。指示を増やしすぎることも当面のtaskから注意をそらすため、入口と詳細を分ける。

## Decision

READMEを人間向けの短い入口にし、目的、architecture、quick start、検証、承認境界、詳細文書
へのリンクを置く。エージェント指示は短い共通正本から生成または整合検査し、必要性が出た
場合だけpath-specific instructionsへ分割する。

## Scope

- READMEのプロジェクト固有化
- AGENTS/CLAUDEの正本または同期検査方針
- Mapとcommandの重複削減
- path-specific instructions導入基準

## Out of scope

- 今すぐ全directoryへAGENTS.mdを配置すること
- 利用する全AI製品専用の長大な指示を手書きすること

## Validation

- 新規参加者がREADMEだけで目的と最初の検証commandを説明できる。
- AGENTS.mdとCLAUDE.mdの意味的な差分をCIまたは生成処理で検知できる。
- ルート指示が実装詳細で肥大化しない。

## References

- [GitHub: Customize Copilot for your project](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-copilot-overview)
- [GitHub: Support for different types of custom instructions](https://docs.github.com/en/copilot/reference/custom-instructions-support)
- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)

## Outcome

Task 13完了（コミット `c432b56`）。

- READMEをプロジェクト固有の入口に刷新し、purpose / pipeline / repository map / quick start / golden flow / validation / human approval boundariesを明記。
- `AGENTS.md` をroot agent rulesの正本、`CLAUDE.md` を固定 `@AGENTS.md` shimとする方式を採用。
- `scripts/check-agent-instructions.mjs` と `npm run validate:agents` を追加し、`npm run validate` に組み込んだ。
- path-specific instructionsは、root-level noiseを減らす反復的・具体的ルールが出た時点で採用する方針にした。
