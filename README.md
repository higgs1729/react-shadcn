<!-- encoding:UTF-8 -->

# AI Design System

アプリの brief(要件の短い記述)を、機械検証済みの実装計画と画面に変換するリポジトリです。
AI が brief → JTBD → フロー → パターン選定 → 実装 と段階的に分解し、各段階の受け渡し
(FlowSpec / SelectionSpec / BuildReport)は JSON Schema + ajv による契約で強制されます。

このシステム自体の実証として、shadcn/ui ベースのポートフォリオ作品(studioApp)を同居させています。

## 仕組み(概要)

1. **Brief** — 利用者・解決したい仕事・画面・制約を記述する
2. **FlowSpec** — 画面・ルート・ユーザーフローを契約として固定する
3. **SelectionSpec** — パターン在庫(`registry/`)から screenType と block を選定する
4. **実装 + BuildReport** — 選定どおりに構築し、実行した検証と未解決事項を報告する

各生成物には provenance sidecar(入力の digest 記録)が添えられ、改変を機械的に検出できます。

## 動かし方

```bash
npm install
npm run validate   # スキーマ・プロファイル・指示同期の検証
npm run checks     # BuildReport で使う検証スイート
npm run dev        # ローカル開発サーバー
```

## 詳細情報の在り処

- 現在の到達状態・次の作業候補: [docs/STATUS.md](docs/STATUS.md)
- リポジトリ構成の地図・エージェント運用ルール(編集禁止領域・承認境界を含む): [AGENTS.md](AGENTS.md)
