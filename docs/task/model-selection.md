<!-- encoding:UTF-8 -->

# Task and reasoning level assessment

この文書は、active taskを `taskLevel` と `reasoningLevel` の2軸で0〜10評価する基準の正本。
使用モデルの算出・選択は人間が行い、この文書とtask本文ではモデルを推奨しない。

## Start

1. 共通基準で `taskLevel` と `reasoningLevel` を別々に0〜10評価する。

## taskLevel: 0–10

taskを完遂するために必要な「モデル自体の総合能力」を表す。`0` は最も軽量なモデルで十分、
`10` はそのagentで利用できる最も強いモデルが必要、という意味で使用モデルへ直接反映する。
作業時間やファイル数だけでは上げない。次の5軸を0〜2点で採点し、合計する。

| 軸 | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Task complexity | 単純な検索・置換・定型作業 | 通常の実装・debugging | アーキテクチャ・migration・新規基盤 |
| Autonomy | 手順と正解が完全指定 | 一部の手順選択が必要 | 計画、優先順位、代替案選択から必要 |
| Tool orchestration | 0〜1種類の単純操作 | 複数toolと検証の連携 | 長いtool loop、失敗回復、状態管理 |
| Context synthesis | 1〜2の直接的な入力 | 複数file・資料の統合 | リポジトリ・契約・履歴を横断して統合 |
| Output quality bar | 下書き・容易に再実行可能 | production相当の通常変更 | 高精度、整合性、回帰防止が不可欠 |

目安: `0` は定型的な事実抽出、`5` は通常のcoding task、`10` は広いcontextとtoolを使い、
自律的に設計・実装・検証まで完遂する最高難度task。機械的な大量変更は作業量が多くても
taskLevelを高くしない。

## reasoningLevel: 0–10

必要な思考の深さと推論量を表す。`0` は思考をほぼ必要とせず、`10` は利用可能な最大の
reasoning/effortが必要、という意味で思考レベルへ直接反映する。次の5軸を0〜2点で採点し、合計する。

| 軸 | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Ambiguity | 仕様と正解が明確 | 判断が一部必要 | 要件・正本・成功条件が未確定 |
| Coupling | 独立した変更 | 複数箇所の関係を追う | 契約・状態・層を横断して整合させる |
| Edge cases | 既知の正常系中心 | 複数状態や例外を検討 | 競合・security・後方互換・失敗回復が重要 |
| Evidence | 直接的な根拠が揃う | 複数資料の照合が必要 | 根拠が競合・不足し、仮説検証が必要 |
| Decision impact | 実装詳細で可逆 | API・共有設計に影響 | アーキテクチャ・不可逆migration・高リスク判断 |

目安: `0` は機械的な置換、`5` は通常のdebugging・設計判断、`10` は競合する制約下の
アーキテクチャ・security・不可逆判断。

## Scoring rules

- 2つのlevelは独立評価する。大規模でも機械的な置換は両方が低くなり得る。
- 小規模でも複雑な契約判断は `taskLevel` と `reasoningLevel` の両方が高くなり得る。
- `taskLevel` は「どれだけ作業が多いか」ではなく「どれだけ強いモデルが必要か」で決める。
- `reasoningLevel` は「どれだけ強いモデルか」ではなく「そのモデルにどれだけ深く考えさせるか」で決める。
- 各軸は根拠をtaskのContextまたは要件から説明できる値にする。情報不足を理由に自動で10にしない。
- 境界で迷う場合は高い方を採用できるが、モデルを推奨・記録しない。
- taskの要求能力や推論難度が変わった場合は両levelを再評価する。

## Required task fields

テンプレートのメタデータには、2つのlevelだけを具体値で記録する。

```yaml
taskLevel: 0..10
reasoningLevel: 0..10
```
