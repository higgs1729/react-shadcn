<!-- encoding:UTF-8 -->
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI Design System

shadcn/ui 上で、AI がアプリを brief→JTBD→flow→選定→実装 に機械分解するリポジトリ。
全 handoff は JSON Schema + ajv で契約強制。

## Map(深さ1のみ。下位は各ノードの AGENTS.md を読む)

- `docs/` — 契約・手順書・現在地・委任 brief。詳細は `docs/AGENTS.md`
- `registry/*.json` — pattern 在庫(facets は `meta.aiDesignSystem`)
- `app/` — route(システム/作品を route group で分離)。境界は `app/AGENTS.md`
- `components/` — UI 実体(基盤/在庫/story/作品)。内訳は `components/AGENTS.md`
- `lib/` — 作品データ(`studio-portfolio/`)と共通 util

## Instruction Sync

- ルート指示を変更したら `npm run validate:agents` を実行する。シムがズレていると差分付きで失敗する。
- パス別の指示ファイルは、そのディレクトリに「ルートに置くとノイズになる具体的な規則」が繰り返し発生してから追加する。

## 文書の規律

- どのディレクトリも「①階層の役割 ②直下の子の1行索引 ③その階層だけの約束」のみを書く(深さ1原則)。孫の詳細は書かない
- 手順の詳細はこのファイルに書かない。読む場所の近く(`docs/AGENTS.md` 配下の各ノード等)に置き、パスで参照する
- サブディレクトリの規則は `AGENTS.md` + `CLAUDE.md`(シム)のペアで持つ。

## Do

- Stop hook が `npm run validate`を実行するので実行は不要
- `npm run checks` は BuildReport 検証時に手動実行
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
