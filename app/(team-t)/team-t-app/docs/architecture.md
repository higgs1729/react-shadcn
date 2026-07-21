<!-- encoding:UTF-8 -->

# Architecture

## 現在地

Team T アプリは、既存の `react-shadcn` Next.js アプリ内に独立した作品 route として構築する。プロダクト要件、job、flow、データ境界、実装順序は各承認済み文書を正本とする。画面構造と既存在庫の採否は、承認済みの `ui-selection.md` を正本とする。

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

## 実装済み境界

- Slice 1–2 は専用shell composition、型付きcatalog、明示IDのおすすめ、同一originの紹介HTML asset、URL hashによる選択復元で構成する
- `public/` assetはNext.jsの`assetPrefix`対象外のため、`/team-t-app/` routeからの相対URLを専用helperで生成する
- Slice 3 の端末内プロフィールと表示設定(theme・accent・枠線・動きを減らす)は `team-t:v1:preferences` と `team-t:v1:profile` だけを操作する。保存不可・不正データ時は既定値で継続し、ルートのnext-themes storageや認証状態には触れない
- 見た目は ミッドナイトトロフィールーム(既定) / ダーク / ライト の3themeをユーザーが選べる。ミッドナイトは配色固定でaccent変更不可、light/darkのみ5色accentが効く(2026-07-21、`ui-selection.md` Human decisions #6)
- theme・accent・枠線・reduce motion は `<html>` の `data-team-t-theme` 属性(と `.dark` クラス、accentのinline custom property)へ適用する。共有 `components/ui/sidebar.tsx` がモバイルsidebarをSheetポータルで描画し className も渡さないため、ラッパーdivスコープではポータルへ変数が届かない。`<html>` はルートのnext-themesと共有するので、mount時の状態を控えてunmountで復元する(`components/team-t-app/use-team-t-appearance.ts`)
- サーバー認証、永続backend、外部APIの事前稼働保証はV1境界に含めない

## 後続判断

- reward、game runtimeの詳細component API
- GitHub Pages の静的境界を超える機能が必要になった場合のbackendとホスティング
