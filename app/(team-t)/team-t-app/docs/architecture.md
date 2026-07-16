<!-- encoding:UTF-8 -->

# Architecture

## 現在地

Team T アプリは、既存の `react-shadcn` Next.js アプリ内に独立した作品 route として構築する。プロダクト要件、job、flow、データ境界、実装順序は各承認済み文書を正本とする。画面構造と既存在庫の採否は `ui-selection.md` でreview中。

## 配置

```text
app/(team-t)/team-t-app/  route、layout、Page composition
components/team-t-app/    Team T 専用 UI
lib/team-t-app/           データ、型、純粋な業務ロジック
```

デザインシステム在庫は `components/ui/`、`components/blocks/`、registry metadata を参照する。Team T 固有の変更を共有在庫へ直接混ぜない。

## 依存方向

```text
route composition
  -> Team T UI
     -> Team T data / domain logic
     -> shared UI primitives and selected inventory
```

`lib/team-t-app/` は route component に依存しない。Team T 専用 UI を共有在庫として扱わず、反復利用が実証された場合だけ別taskで registry 化を判断する。

## 公開・実行環境

- GitHub Pages 上の `/react-shadcn/team-t-app/` として既存サイトと同時に公開する
- Next.js の `output: "export"` に従う静的サイトとする
- Server Actions、request依存のRoute Handler、cookiesを使うサーバー認証など、Next.js server runtime を必要とする機能はこの公開環境では利用しない
- ブラウザから外部サービスを利用する場合、秘密情報をクライアントへ含めない方式を別途設計する

## 現行デザインシステムの利用境界

- candidate scoring は候補探索の補助であり、選定の自動決定にはしない
- 既存 pattern は見た目だけでなく、JTBD、データ形状、主操作、必要状態、アクセシビリティで評価する
- 現行 FlowSpec / SelectionSpec / BuildReport は自然に表現できる route-level screen の検討と検証に限って利用する
- Drawer / Dialog やアプリ全体構造を、現行の flat step 契約へ無理に合わせない

## 未決事項

- `ui-selection.md` に記載した専用shell composition、設定の再利用境界、preview構造の人間承認
- 主要なユーザーフロー
- データの正本と永続化方式
- 認証・認可の要否
- 外部サービスとの連携
- route map と画面 composition
- GitHub Pages の静的境界を超える場合のホスティング方針
