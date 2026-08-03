<!-- encoding:UTF-8 -->

# packages/shadcn-kit

shadcn/ui(base-ui、style `base-vega`)の primitive とテーマトークンを、
shadcn を使うアプリで共有するパッケージ。**このパッケージ自体が shadcn プロジェクト**で、
`shadcn add` はここで実行する。

## 索引

- `components/ui/` — primitive 本体と、同居する atom story。**本体は編集禁止**
- `components/` — `theme-provider.tsx`(next-themes ラッパ)・`resizable-sidebar-rail.tsx`
- `lib/` — `utils.ts`(`cn`)・`sidebar-width.ts`
- `hooks/` — `use-mobile.ts`
- `styles/base.css` — Tailwind の取り込み、テーマトークン、base レイヤー、走査対象の宣言
- `components.json` — shadcn CLI の設定。`tailwind.css` は `styles/base.css`

## このディレクトリだけの約束

- **パッケージ内の import は相対パスで書く。`@/` を使わない。** `@/` は消費側アプリの
  tsconfig で解決されるため、パッケージ内で使うとアプリから解決できなくなる。
  `shadcn add` が生成するコードは `@/components/ui/...` を吐くので、追加後に
  相対パス(`./x`・`../../lib/utils`)へ直す
- `styles/base.css` にアプリ固有のトークンを書かない。アプリ側の `globals.css` が
  この CSS を `@import` したうえで自分のトークンを足す
- Tailwind v4 は CSS を読むアプリのディレクトリしか走査しないため、`base.css` 末尾の
  `@source "../components"` でキット側を走査対象に入れている。コンポーネントの置き場所を
  変えるときはこの宣言も直す
- 消費側アプリは `next.config.ts` の `transpilePackages` にこのパッケージを入れる
  (TypeScript ソースのまま配布しているため)
- atom story は `apps/studio` の `gen-atom-stories.mjs` が生成し、コンポーネントと同居する。
  Storybook は studio 側が glob で拾う
