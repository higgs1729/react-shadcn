<!-- encoding:UTF-8 -->

# components/

UI 実体。所属が一目で分かるよう、直下にはディレクトリのみを置く(共有基盤の単発ファイルを除く)。

## 索引

- `ui/` — shadcn/base-ui 基盤。**本体は編集禁止**
- `blocks/` — デザインシステムの在庫 block 実体。registry の `files[].path` から参照される
- `patterns/` — `gen-pattern-stories.mjs` が生成する story(検証記録)
- `studio-portfolio/` — 作品(studioApp)専用 UI
- `team-t-app/` — Team T アプリ専用 UI
- `a11y-fixtures/` — a11y ゲートの既知違反 fixture
- `theme-provider.tsx`・`resizable-sidebar-rail.tsx` — 共有基盤の単発ファイル

## このディレクトリだけの約束

- `blocks/` のファイルを移動・改名するときは registry のパス・localEvidence・provenance sidecar の再生成まで一体で行う
- 在庫に属する新規 block は `blocks/` に置き、registry item を同時に作る。作品専用 UI は `studio-portfolio/` へ
