# AI Design System

shadcn/ui 上で、AI がアプリを brief→JTBD→flow→選定→実装 に機械分解するリポジトリ。
全 handoff は JSON Schema + ajv で契約強制。

## Map

- `docs/contracts/` — 契約スキーマ(FlowSpec / SelectionSpec / BuildReport / facets / profiles)
- `docs/layers/20-selection/` — screenType・block 選定の手順書 + canonical profiles
- `docs/layers/30-implementation/` — 実装規約
- `docs/tasks/` — 下位AI委任 brief 置き場(pending のみ)
- `docs/examples/` — 現行 golden flow の成果物(最新のみ)
- `registry/*.json` — pattern 在庫(facets は `meta.aiDesignSystem`)

## Do

- 変更後は `npm run validate` と `npm run checks` を exit 0 に保つ
- コンポーネント API に迷ったら `components/ui/` のソースを読む(base-ui。合成は `render={<.../>}`)
- 下位AIへの委任: `docs/tasks/README.md` のテンプレから自己完結 brief を生成し、そのファイル1枚だけを渡す(完了・検証後は `docs/archive/tasks/` へ移動)
- コミット・push は毎回ユーザーの明示承認を得る

## Don't

- `docs/archive/` を読まない・参照しない(明示指示があるときのみ)
- 編集禁止: `components/ui/*` 本体(stories は可)・`docs/contracts/*`・`docs/layers/20-selection/*`・既存 registry の facet 値
- Radix API を書かない(`asChild` / `type="single"` は存在しない — base-ui)
- maturity を experimental→canonical に昇格しない(人間レビュー専用)
