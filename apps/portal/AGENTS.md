<!-- encoding:UTF-8 -->

# apps/portal

サイトの入口。目的からアプリを選ぶディレクトリで、サイトルート(`/react-shadcn/`)を占める。

## 索引

- `app/` — `page.tsx` が LandingHub を描画するだけ。`layout.tsx` はフォント変数のみ、`globals.css` は素の reset
- `components/landing-hub.tsx` — LP の実体。server component で状態を持たない
- `docs/design-direction.md` — 見た目とコンテンツ方針の正本

## このディレクトリだけの約束

- **UI キットを持ち込まない。** LandingHub は外部 import ゼロ・ユーティリティクラスゼロで、スタイルを自分の中に閉じている。Tailwind も shadcn も依存に足さない
- アプリ間リンクは素の `<a>` と `NEXT_PUBLIC_BASE_PATH` で組み立てる。Next は `<a>` の href に basePath を付けないため、リンク先は兄弟アプリの basePath を含めて自分で書く
- 状態・client hook を持たせない。設定や学習データは各アプリ側の責務
- 各アプリの URL を変えたら、ここのリンクも同じコミットで直す
