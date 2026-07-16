<!-- encoding:UTF-8 -->

# Team T app docs

Team T アプリについて現在合意されている事実と判断を、実装の近くで管理する。

## 索引

- `README.md` — 文書の入口、開発順序、各文書の現在地
- `architecture.md` — 配置・実行環境・依存方向など、現在確定しているアーキテクチャ
- `product-brief.md` — 目的、対象ユーザー、提供価値、V1境界、成功条件
- `jtbd.md` — primary job、supporting job、reward-loop job
- `user-flows.md` — V1の正常系、例外、回復、状態
- `data-and-risk.md` — データ正本、権限、外部連携、信頼境界
- `feature-plan.md` — 機能分解、vertical slice、実装順序
- `ui-selection.md` — 既存在庫のreuse/adapt/compose/new判断とUI構造

## このディレクトリだけの約束

- 将来案を確定事項として書かず、未決事項は明示する
- 同じ事実を複数文書で正本化せず、詳細は正本へのリンクで参照する
- brief、JTBD、flow、データ・権限、delivery の文書は、その段階を開始するときに追加する
- 実装変更で記述が古くなる場合は、同じ変更で正本を更新する
