# RFCs

Completed RFCs are archived in `docs/archive/rfcs/`; this directory contains active RFCs only.

このディレクトリは、横断的な改善について「なぜ変えるか」「何を変えるか」「どう成功を
判定するか」を実装前に残す場所。`docs/task/` の実行briefや `docs/STATUS.md` の短い
進捗索引とは役割を分ける。

## 使い分け

- `docs/STATUS.md`: 現在地、優先順位、RFCへのリンク。詳細を重複させない。
- `docs/rfcs/`: 問題、根拠、採用方針、対象外、検証方針を長期的に残す。
- `docs/task/`: 承認済みRFCを実装する際の、具体化済みactive task。
- `docs/tasks/`: 複数回の成功後に恒常化した、再利用可能なplaybook。
- git log: 実際に完了した変更の正本。

RFCは実装手順の逐語的な記録ではなく、将来「なぜこの仕組みがあるのか」を説明できる
程度に保つ。契約や方針を変える場合は、実装前に人間レビューを受ける。

## Status

- `proposed`: 方針候補。実装未承認。
- `accepted`: 方針採用済み。task化可能。
- `in-progress`: 対応するactive taskが `docs/task/` に存在する。
- `completed`: 検証と反映が完了した。
- `superseded`: 別RFCに置き換えられた。
- `rejected`: 採用しないと決定した。

## ライフサイクル

1. RFCを作成し、問題・根拠・対象外・受け入れ条件を記述する。
2. 人間レビュー後に `accepted` とする。
3. 一度に扱える大きさへ分割し、`docs/task/template.md` の形式でactive taskを作る。
4. 実装・検証中はRFCを `in-progress` とする。
5. 完了後は結果と検証証拠への参照を追記し、`completed` とする。RFC自体は残す。

## テンプレート

```markdown
# RFC NNN: <title>

- Status: proposed
- Priority: A | B | C
- Created: YYYY-MM-DD
- Owners: human owner / orchestrator AI
- Depends on: none | RFC NNN

## Problem
## Why now
## Decision
## Scope
## Out of scope
## Validation
## Risks and trade-offs
## References
## Outcome
```

設計判断を履歴として残す軽量ADRの考え方と、実装前に議論するRFCの用途を組み合わせた
運用である。提案と実行briefを分離することで、brief完了後も判断理由が失われない。
