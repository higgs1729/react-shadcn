<!-- encoding:UTF-8 -->

# apps/portal

サイトの入口。目的からアプリを選ぶディレクトリで、サイトルート(`/react-shadcn/`)を占める。

## 索引

- `app/` — `page.tsx` が LandingHub を描画するだけ。`layout.tsx` はフォント変数のみ、`globals.css` は素の reset
- `components/landing-hub.tsx` — LP の実体。server component で状態を持たない
- `components/json-list.tsx` — JSON オブジェクト風の一覧「枠」。波括弧・区切り線・入れ子・右ペイン展開・detail レイアウトでのドリルダウンだけを持ち、中身は ReactNode で受け取る。唯一の client component
- `lib/asset-base.ts` — R2 で配信する代表画面(preview)の公開URL基点。`apps/team-t/lib/team-t-app/asset-base.ts` と同じバケット・公開URL
- `scripts/upload-assets.mjs` — 代表画面を R2 へアップロード(`npm run upload:assets` / `upload:assets:check`)。核は共有モジュール `scripts/r2-assets.mjs`(リポジトリルート、team-t と共有)
- `public/app-previews/` — 代表画面の staging。R2 送信後は git に乗らない(`.gitignore` 済み)
- `docs/design-direction.md` — 見た目とコンテンツ方針の正本

## このディレクトリだけの約束

- **UI キットを持ち込まない。** LandingHub は外部 import ゼロ・ユーティリティクラスゼロで、スタイルを自分の中に閉じている。Tailwind も shadcn も依存に足さない
- アプリ間リンクは素の `<a>` と `NEXT_PUBLIC_BASE_PATH` で組み立てる。Next は `<a>` の href に basePath を付けないため、リンク先は兄弟アプリの basePath を含めて自分で書く
- **アプリのデータや設定を状態として持たせない。** 設定や学習データは各アプリ側の責務。
  例外は `json-list.tsx` の表示状態(入れ子の開閉・右ペインの選択・ドリルダウン)だけで、
  これは枠の内部に閉じている。`landing-hub.tsx` は server component のまま保つ
- アプリ一覧の代表画面(preview)は Cloudflare R2 配信。`public/app-previews/` に置いて
  `npm run upload:assets` を実行すると `scripts/asset-manifest.json` に記録される
- 各アプリの URL を変えたら、ここのリンクも同じコミットで直す

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
