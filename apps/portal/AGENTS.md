<!-- encoding:UTF-8 -->

# apps/portal

サイトの入口。制作物をまとめた1ページの LP で、サイトルート(`/react-shadcn/`)を占める。

見た目と作りの正本は `portfolio/webSites/sites/08-portal-axis/`(素の HTML/CSS/JS)。
ここはその移植で、セレクタ名・文言・数値を向こうと同じに保っている。
**片方だけ直さない。** 直すときは両方を同じ意図で直す。

## 索引

- `app/page.tsx` — `PortalLanding` を描画するだけ。`app/layout.tsx` は metadata と、
  出現演出を有効にする `js-anim` のインラインスクリプト
- `app/globals.css` — 08 の `style.css` をそのまま持ってきたもの。ページのスタイルはここ一箇所
- `components/portal-landing.tsx` — ページ全体のマークアップ。server component で状態を持たない
- `components/works-tabs.tsx` — 3タブと、その下の3パネル(ピックアップ・アプリ・サイト)
- `components/pick-stack.tsx` — 重ねた3枚の画像。押すと順番が入れ替わる
- `components/portal-nav.tsx` / `mail-link.tsx` — ナビの開閉と現在地、メールアドレスの組み立て
- `components/axis-figure.tsx` — ヒーローの座標系(SVG + GSAP)。`components/gravity-field.tsx` — 暗転帯の波紋(Canvas 2D)
- `components/portal-motion.tsx` — 出現とタイプ表示。React の外から class と textContent を触る
- `lib/works.ts` — 一覧の正本(ピックアップ3・アプリ4・サイト5)。href は basePath から組む
- `lib/asset-base.ts` — R2 で配信する画像の公開URL基点。`apps/team-t/lib/team-t-app/asset-base.ts` と同じバケット・公開URL
- `scripts/upload-assets.mjs` — 画像を R2 へアップロード(`npm run upload:assets` / `upload:assets:check`)。核は共有モジュール `scripts/r2-assets.mjs`(リポジトリルート、team-t と共有)
- `public/portal-previews/` — 08 の画像18枚の staging。R2 送信後は git に乗らない(`.gitignore` 済み)
- `public/sites/` — 架空サイト5本の配信物。正本は `portfolio/webSites/sites/`
- `docs/design-direction.md` — 見た目とコンテンツ方針の正本

## このディレクトリだけの約束

- **UI キットを持ち込まない。** Tailwind も shadcn も依存に足さない。
  依存は Next・React と、演出に使う GSAP だけ
- **演出は隔離する。** 動くのはヒーローの座標系と暗転帯の重力場、それに出現とタイプ表示だけ。
  文書側の部品を動かさない(08 の規律。理由は `docs/design-direction.md`)
- **JS が無い・動きを減らす設定でも、図と文字が完成形で出ること。**
  `axis-figure.tsx` の `settle()` と保険タイマー、`pick-stack.tsx` の初期状態を消さない
- アプリ間リンクは素の `<a>` と `NEXT_PUBLIC_BASE_PATH` で組み立てる。Next は `<a>` の href に basePath を付けないため、リンク先は兄弟アプリの basePath を含めて自分で書く
- `public/sites/` へのリンクは `.../index.html` まで書く。`public/` はルーティングの対象外で、
  `next dev` はディレクトリに index.html を返さない(GitHub Pages は返す)
- **アプリのデータや設定を状態として持たせない。** 設定や学習データは各アプリ側の責務。
  状態を持つのはタブの選択と重ねの順番だけで、どちらもその部品の中に閉じている
- 各アプリの URL を変えたら、ここのリンクも同じコミットで直す

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
