<!-- encoding:UTF-8 -->

# apps/team-t

Team T API Lab。公開 API を探してその場で試す開発者向けカタログ。
静的 export で GitHub Pages の `/react-shadcn/team-t/` 以下に公開する。

## 索引

- `app/` — route。`page.tsx` が入口、`layout.tsx` が root layout と OGP メタ
- `components/` — UI。`team-t-app/` がアプリ固有、`blocks/` は studio の在庫 block の複製
- `lib/` — `team-t-app/` にカタログ・ゲーム・報酬・3D world のデータと純粋ロジック
- `public/` — 177 の API 紹介ページ、9 本のゲーム HTML、画像アセット(preview 画像は R2 にあり、ここには無い)
- `docs/` — 目的・アーキテクチャ・設計判断の正本
- `scripts/` — カタログとアセットの整合検証(`npm run validate`)と、R2 への preview 画像アップロード(`npm run upload:assets`)

## このディレクトリだけの約束

- アプリ固有 UI は `components/team-t-app/`、データ・型・業務ロジックは `lib/team-t-app/` に置く
- アセット URL は `NEXT_PUBLIC_BASE_PATH` を前置して組み立てる。`public/` 直下の構造がそのまま URL になるため、`public/games/x.html` は `${basePath}/games/x.html`
- 例外は preview 画像のみ。`game-previews/` と `api-page-previews/` は Cloudflare R2 から配信し、`lib/team-t-app/asset-base.ts` の `ASSET_BASE_URL` を前置する。この2ディレクトリは `.gitignore` 済みの staging で、新しい preview を置いたら `npm run upload:assets` を実行する(在庫は `scripts/asset-manifest.json`、検証は `npm run validate`)
- primitive は `@react-shadcn/shadcn-kit/ui/*` から取る。`components/blocks/` だけは studio の在庫 block の複製で、registry 管理下にあるため集約していない
- 新しい route や大きな構造判断より先に、対応する決定を `docs/` の現在地へ反映する
- GitHub Pages の静的 export 境界を守り、サーバー実行が必要な機能は代替を決めるまで実装しない
- 最初から全画面を作らず、優先ユーザーフローごとに UI・データ・状態・検証を通した vertical slice を完成させる

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
