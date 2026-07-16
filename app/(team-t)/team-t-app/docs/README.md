<!-- encoding:UTF-8 -->

# Team T app documentation

Team T アプリの設計と開発判断の入口。現時点では開発基盤だけを確定し、プロダクト内容は次の工程から順に具体化する。

## 索引

- [product-brief.md](product-brief.md) — 目的、対象ユーザー仮説、提供価値、初期範囲、成功条件
- [jtbd.md](jtbd.md) — primary job、関連job、期待成果、検証仮説
- [user-flows.md](user-flows.md) — V1の最重要フロー、ゲーム導線、例外・回復フロー
- [data-and-risk.md](data-and-risk.md) — データ正本、端末内状態、権限、外部連携、セキュリティ境界
- [feature-plan.md](feature-plan.md) — 機能分解、依存関係、vertical slice、実装優先順位
- [ui-selection.md](ui-selection.md) — 既存在庫の採否、Team T専用composition、画面構造
- [architecture.md](architecture.md) — 現在確定している配置、公開方式、依存方向、技術境界

## 開発順序

1. アプリの目的・対象ユーザー・成功条件を定義する（完了）
2. ユーザーの JTBD・課題・制約を定義する（完了）
3. 最重要ユーザーフローと例外フローを設計する（完了）
4. ドメイン、データ、権限、外部連携、主要リスクを整理する（完了）
5. フローを成立させる機能へ分解し、vertical slice の優先順位を決める（完了）
6. 画面構造を決め、既存 screen pattern / block / component を `reuse`・`adapt`・`compose`・`new` に分類する（review中）
7. 最も不確実性の高い部分をプロトタイプで確認する
8. 優先フローを UI・状態・ロジック・データ・権限・テストまで一貫して実装する
9. 検証結果を反映し、次の優先フローへ進む
10. 本番公開前に静的 export、アクセシビリティ、セキュリティ、性能、計測を確認する

各工程の文書は工程開始時に追加し、推測のまま先の設計を固定しない。
