<!-- encoding:UTF-8 -->

# apps/team-t

Team T API Lab。公開 API を探してその場で試す開発者向けカタログ。
静的 export で GitHub Pages の `/react-shadcn/team-t/` 以下に公開する。

## 索引

- `app/` — route。`page.tsx` が入口、`layout.tsx` が root layout と OGP メタ
- `components/` — UI。`team-t-app/` がアプリ固有、`blocks/` は studio の在庫 block の複製
- `lib/` — `team-t-app/` にカタログ・ゲーム・報酬・3D world のデータと純粋ロジック
- `public/` — 177 の API 紹介ページ、9 本のゲーム HTML、画像アセット
- `docs/` — 目的・アーキテクチャ・設計判断の正本
- `scripts/` — カタログとアセットの整合検証(`npm run validate`)

## このディレクトリだけの約束

- アプリ固有 UI は `components/team-t-app/`、データ・型・業務ロジックは `lib/team-t-app/` に置く
- アセット URL は `NEXT_PUBLIC_BASE_PATH` を前置して組み立てる。`public/` 直下の構造がそのまま URL になるため、`public/games/x.html` は `${basePath}/games/x.html`
- primitive は `@react-shadcn/shadcn-kit/ui/*` から取る。`components/blocks/` だけは studio の在庫 block の複製で、registry 管理下にあるため集約していない
- 新しい route や大きな構造判断より先に、対応する決定を `docs/` の現在地へ反映する
- GitHub Pages の静的 export 境界を守り、サーバー実行が必要な機能は代替を決めるまで実装しない
- 最初から全画面を作らず、優先ユーザーフローごとに UI・データ・状態・検証を通した vertical slice を完成させる
