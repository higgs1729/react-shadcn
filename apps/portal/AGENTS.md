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
- `components/axis-figure.tsx` — (今は Hero で使っていない)ヒーローの座標系(SVG + GSAP)。3D が出たときは完成形で置いて隠れ、2D に戻ったときだけ動く <!-- 2026-11-26 から Hero で使っていない -->
- `components/hero-world.tsx` — ヒーローの背景。デモリールの頭(世界→オーブの突進→殺陣)を Hero 用に描き直した約 12.8 秒の輪(`public/hero/hero-world*.mp4|webp`)。止め絵を先に出し、映像が回ったら重ねる。描き方は `docs/design-direction.md` の「ヒーローの背景(世界)」 <!-- 本人 2026-11-26 -->
- `components/hero-scene.tsx` / `lib/hero-three.ts` — (今は Hero で使っていない。部品は残す)ヒーローの 3D 版(three)と読み込み画面の進み具合。形は SVG から読み、数値を持たない。短冊の前の面に `public/hero/hero-reel*.mp4`(14 列のアトラス)を貼る。図と 3 行の字は磨いた鋼。字形は `public/hero/hero-text.json` で、文言を変えたら `scripts/build-hero-font.py` を打ち直す <!-- 2026-11-26 から Hero で使っていない -->
- `public/hero/` — ヒーローの映像(背景の世界と 3D の短冊)。3D の映像を R2 に置かないのは、R2 が CORS の見出しを返さず WebGL のテクスチャに使えないため。作り方と素材は `docs/design-direction.md` の「ヒーローの 3D」 <!-- R2 の CORS は 2026-11-23 に curl で確認 -->
- `components/gravity-field.tsx` — 暗転帯の波紋(Canvas 2D)
- `components/portal-motion.tsx` — 出現とタイプ表示。React の外から class と textContent を触る
- `lib/works.ts` — 一覧の正本(ピックアップ5・アプリ4・サイト5)。href は basePath から組む
- `lib/asset-base.ts` — R2 で配信する画像の公開URL基点。`apps/team-t/lib/team-t-app/asset-base.ts` と同じバケット・公開URL
- `scripts/upload-assets.mjs` — 画像を R2 へアップロード(`npm run upload:assets` / `upload:assets:check`)。核は共有モジュール `scripts/r2-assets.mjs`(リポジトリルート、team-t と共有)
- `public/portal-previews/` — 08 の画像18枚の staging。R2 送信後は git に乗らない(`.gitignore` 済み)
- `public/sites/` — 架空サイト5本の配信物(正本の場所はルートの `AGENTS.md`)
- `docs/design-direction.md` — 見た目とコンテンツ方針の正本

## このディレクトリだけの約束

- **UI キットを持ち込まない。** Tailwind も shadcn も依存に足さない。
  依存は Next・React と、演出に使う GSAP、ヒーローの 3D に使う three だけ。three は `lib/hero-three.ts` だけが読み、動的 import で遅延させる
- **演出は隔離する。** 動くのはヒーローの座標系と暗転帯の重力場、それに出現とタイプ表示だけ。
  文書側の部品を動かさない(08 の規律。理由は `docs/design-direction.md`)
- **3D は試せる環境だけ。**(今は 3D を外していて、`app/layout.tsx` は hero-3d を付けない。戻すときの約束として残す) `app/layout.tsx` の head のスクリプトが、WebGL2 があるときだけ html に `hero-3d` を付ける(three r163 以降は WebGL2 必須。動きを減らす設定でも 3D を出す)。付かなければ three も映像も読まず、今までの 2D が出る。8 秒で読み込み(three・止め絵・字形)が揃わなければ 2D に戻す。短冊は止め絵(`public/hero/hero-reel-poster.webp`)で先に出し、映像が回りだしたら差し替える。映像を待たない(iOS は低電力モードや preload の無視で映像が回らないことがある)
  <!-- 3D を外したのは 2026-11-26。動きを減らす設定でも 3D を出すのは本人 2026-11-23、映像を待たないのは本人 2026-11-25 -->
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
