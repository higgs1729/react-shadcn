<!-- encoding:UTF-8 -->

# react-shadcn monorepo

npm workspaces。1リポジトリで複数アプリを持ち、GitHub Pages の単一サイトへ合成して配信する。
アプリ固有の規範は各アプリの `AGENTS.md` にあり、ここには書かない。

## Map(深さ1のみ。下位は各ノードの AGENTS.md を読む)

- `apps/*` — アプリ本体。各々が自分の package.json・next.config.ts・依存を持つ
- `packages/*` — アプリ間で共有するパッケージ。UI キットはキット名で分ける(`shadcn-kit` 等)
- `.github/workflows/` — checks(全 workspace)と deploy-pages(各 out/ を1つの dist/ に合成)

## このディレクトリだけの約束

- ルートの package.json は workspace マニフェスト。アプリの依存をここに足さない
- `overrides` は npm の仕様上ルートでしか効かないため、依存の強制解決だけはここに書く
- 共有パッケージは特定の UI キットに依存する。`packages/ui` のような中立名を使わず、依存するキット名で命名して他キットのアプリが誤って使わないようにする
- 全 workspace 横断の実行はルートの `npm run validate` / `npm run checks` / `npm run build`。単一アプリは `npm -w apps/<name> run <script>`

## 移行状況(2026-08-03 時点)

モノレポ化は進行中。現在 `apps/studio` が LP・Studio・Team T・Python Test の全 route を保持している。
`apps/team-t` / `apps/portal` / `apps/python-test` への分割と `packages/shadcn-kit` の抽出は未着手。
