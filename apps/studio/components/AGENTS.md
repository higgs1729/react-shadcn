<!-- encoding:UTF-8 -->

# components/

studio の UI 実体。所属が一目で分かるよう、直下にはディレクトリのみを置く。
shadcn の primitive はここには無く、`packages/shadcn-kit` から import する。

## 索引

- `blocks/` — デザインシステムの在庫 block 実体。registry の `files[].path` から参照される
- `patterns/` — `gen-pattern-stories.mjs` が生成する story(検証記録)
- `studio-portfolio/` — 作品(studioApp)専用 UI
- `a11y-fixtures/` — a11y ゲートの既知違反 fixture

## このディレクトリだけの約束

- `blocks/` のファイルを移動・改名するときは registry のパス・localEvidence・provenance sidecar の再生成まで一体で行う
- 在庫に属する新規 block は `blocks/` に置き、registry item を同時に作る。作品専用 UI は `studio-portfolio/` へ
- primitive は `@react-shadcn/shadcn-kit/ui/*` から取る。`blocks/` に primitive の複製を作らない
