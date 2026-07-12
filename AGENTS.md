<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI Design System

shadcn/ui 上で、AI がアプリを brief→JTBD→flow→選定→実装 に機械分解するリポジトリ。
全 handoff は JSON Schema + ajv で契約強制。

## Map

- `docs/STATUS.md` — 現在地(到達状態・次の実装候補)。正本は git log、これはその要約キャッシュ
- `docs/contracts/` — 契約スキーマ(FlowSpec / SelectionSpec / BuildReport / facets / profiles)
- `docs/layers/20-selection/` — screenType・block 選定の手順書 + canonical profiles
- `docs/layers/30-implementation/` — 実装規約
- `docs/tasks/` — 下位AI委任 brief 置き場(pending のみ)
- `docs/examples/` — 現行 golden flow の成果物(最新のみ)
- `registry/*.json` — pattern 在庫(facets は `meta.aiDesignSystem`)

## Instruction Sync

- `AGENTS.md` is the canonical shared source for root agent rules.
- `CLAUDE.md` must stay as the fixed `@AGENTS.md` shim; edit this file for rule changes.
- Run `npm run validate:agents` after changing root instructions. It fails with a focused diff if the shim drifts.
- Add path-specific instruction files only after a directory has repeated, concrete rules that would reduce root-level noise.

## Do

- 変更後は `npm run validate` と `npm run checks` を exit 0 に保つ
- コンポーネント API に迷ったら `components/ui/` のソースを読む(base-ui。合成は `render={<.../>}`)
- 下位AIへの委任: `docs/tasks/README.md` のテンプレから自己完結 brief を生成し、そのファイル1枚だけを渡す(完了・検証後は `docs/archive/tasks/` へ移動)
- コミット・push は毎回ユーザーの明示承認を得る
- セッション開始時: `docs/STATUS.md` を読み、その最終更新以降の `git log` と突き合わせ、ズレていれば作業前にまず STATUS.md を修復する。コミット時も最新化(最新のみ、履歴は git)

## Don't

- `docs/archive/` を読まない・参照しない(明示指示があるときのみ)
- 編集禁止: `components/ui/*` 本体(stories は可)・`docs/contracts/*`・`docs/layers/20-selection/*`・既存 registry の facet 値
  - 例外1(語彙拡張): screenType / blockRole の enum・canonical profiles の追加は、`docs/tasks/task-16-add-one-screen-type.md` の brief を握った**最上位 AI の自己判断で可**(下位AIは保護ファイルに read-only)。既存値の変更・削除は不可。人間は事前承認せず定期監査する。
  - 例外2(生成物): `gen-pattern-stories.mjs` による registry の `verification.storybookStories` 書き戻し。これは生成された検証記録であり facet 手編集ではない。
- Radix API を書かない(`asChild` / `type="single"` は存在しない — base-ui)
- maturity を experimental→canonical に昇格しない(人間レビュー専用)
