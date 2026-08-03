<!-- encoding:UTF-8 -->

# react-shadcn monorepo

npm workspaces。1リポジトリで複数アプリを持ち、GitHub Pages の単一サイトへ合成して配信する。
アプリ固有の規範は各アプリの `AGENTS.md` にあり、ここには書かない。

## Map(深さ1のみ。下位は各ノードの AGENTS.md を読む)

- `apps/*` — アプリ本体。各々が自分の package.json・next.config.ts・依存を持つ
- `packages/shadcn-kit` — shadcn 系アプリが共有する primitive とテーマトークン。`shadcn add` はここで実行する
- `.github/workflows/` — checks(全 workspace)と deploy-pages(各 out/ を1つの dist/ に合成)

## このディレクトリだけの約束

- ルートの package.json は workspace マニフェスト。アプリの依存をここに足さない
- `overrides` は npm の仕様上ルートでしか効かないため、依存の強制解決だけはここに書く
- 共有パッケージは特定の UI キットに依存する。`packages/ui` のような中立名を使わず、依存するキット名で命名して他キットのアプリが誤って使わないようにする
- 全 workspace 横断の実行はルートの `npm run validate` / `npm run checks` / `npm run build`。単一アプリは `npm -w apps/<name> run <script>`

## アプリと配信先

| workspace | basePath | 配信 URL | UI |
| --- | --- | --- | --- |
| `apps/portal` | `/react-shadcn` | `/react-shadcn/` | なし(自己完結 CSS) |
| `apps/studio` | `/react-shadcn/studio` | `/react-shadcn/studio/` | shadcn |
| `apps/team-t` | `/react-shadcn/team-t` | `/react-shadcn/team-t/` | shadcn |
| `apps/python-test` | `/react-shadcn/python-test` | `/react-shadcn/python-test/` | shadcn |

Storybook は studio のみが持ち、`/react-shadcn/storybook/` に合成される。

dev では各アプリを個別に起動する(`npm -w apps/<name> run dev`)。basePath は dev でも効くので
`localhost:3000/studio/` のように本番と同じ route 形になるが、アプリごとに別ポートになるため
ポータルからのアプリ間リンクは dev では解決しない。合成後の本番でのみ繋がる。

## 移行状況(2026-08-03 時点)

- 完了: Phase 1(workspaces 化)・Phase 2(`apps/team-t`)・Phase 3(`apps/portal`・`apps/python-test`)・
  Phase 4(`packages/shadcn-kit` 抽出)
- 未着手: GoldenFlow の CI ゲート解除(Phase 5)
- 残る複製は `apps/team-t/components/blocks/` の3ファイルのみ。studio の registry が
  `files[].path` で在庫 block を追跡しているため、パッケージ化すると契約が壊れる。
  GoldenFlow の凍結(Phase 5)とあわせて再検討する
