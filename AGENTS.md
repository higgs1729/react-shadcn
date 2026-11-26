<!-- encoding:UTF-8 -->

# react-shadcn monorepo

npm workspaces。1リポジトリで複数アプリを持ち、GitHub Pages の単一サイトへ合成して配信する。
アプリ固有の規範は各アプリの `AGENTS.md` にあり、ここには書かない。

## Map(深さ1のみ。下位は各ノードの AGENTS.md を読む)

- `apps/*` — アプリ本体。各々が自分の package.json・next.config.ts・依存を持つ
- `packages/shadcn-kit` — shadcn 系アプリが共有する primitive とテーマトークン。`shadcn add` はここで実行する
- `scripts/` — 全エージェント共通のフック本体。登録は各エージェントの設定側
- `.github/workflows/` — checks(全 workspace)と deploy-pages(各 out/ を1つの dist/ に合成)

## このディレクトリだけの約束

- ルートの package.json は workspace マニフェスト。アプリの依存をここに足さない
- `overrides` は npm の仕様上ルートでしか効かないため、依存の強制解決だけはここに書く
- 共有パッケージは特定の UI キットに依存する。`packages/ui` のような中立名を使わず、依存するキット名で命名して他キットのアプリが誤って使わないようにする
- 全 workspace 横断の実行はルートの `npm run validate` / `npm run checks` / `npm run build`。単一アプリは `npm -w apps/<name> run <script>`

## アプリと配信先

| workspace | basePath | 配信 URL | UI |
| --- | --- | --- | --- |
| `apps/portal` | `/react-shadcn` | `/react-shadcn/` | なし(自己完結 CSS + GSAP) |
| `apps/studio` | `/react-shadcn/studio` | `/react-shadcn/studio/` | shadcn |
| `apps/team-t` | `/react-shadcn/team-t` | `/react-shadcn/team-t/` | shadcn |
| `apps/python-test` | `/react-shadcn/python-test` | `/react-shadcn/python-test/` | shadcn |
| `apps/gamehub` | `/react-shadcn/gamehub` | `/react-shadcn/gamehub/` | Tailwind CSS |

Storybook は studio のみが持ち、`/react-shadcn/storybook/` に合成される。

`apps/portal` は上記に加えて、ポートフォリオ用に制作した架空サイト5本を
`public/sites/` に同梱し、`/react-shadcn/sites/<slug>/index.html` で配信する。
中身の正本は `portfolio/webSites/sites/` で、ここに置いてあるのは配信物である。

## 動かし方(dev / 本番プレビュー)

### dev サーバー

アプリごとに個別に起動する。ルートに `dev` スクリプトは無い。

```bash
npm -w apps/portal run dev        # → http://localhost:3000/
npm -w apps/studio run dev        # → http://localhost:3000/studio/
npm -w apps/team-t run dev        # → http://localhost:3000/team-t/
npm -w apps/python-test run dev   # → http://localhost:3000/python-test/
npm -w apps/gamehub run dev       # → http://localhost:3001/gamehub/
```

dev の URL は本番と同じ route 形になるが、`portal` だけ例外。
`portal` はサイトのルートを所有するため `basePath = PAGES_BASE_PATH ?? ""` となり、
dev では空になる(他アプリは `${PAGES_BASE_PATH ?? ""}/<name>`)。
**`localhost:3000/portal/` は存在しない。**

- portal・studio・team-t・python-test の `dev` は `next dev` で既定ポートは 3000。
  GAMEHUBだけはポータルと同時に確認できるよう `next dev -p 3001` に固定している。
  その他を同時に起動すると空きポートへずれるため、起動時のログで実ポートを確認する
- **ポータルからのアプリ間リンクは dev では解決しない。** ポート違いになるため。
  全アプリの導線が同一originで繋がるのは合成後の本番だけ
- 例外はGAMEHUBのカードで、リンク先を `apps/portal/lib/works.ts` が環境で切り替える
  (dev は `http://localhost:3001/gamehub/`、本番ビルドは `${PAGES_BASE_PATH}/gamehub/`)。
  `NEXT_PUBLIC_GAMEHUB_URL` を設定した場合だけ、明示した別URLで上書きする

### 本番(GitHub Pages)の見え方を手元で確認する

`output: "export"` の静的サイトなので、本番は Node サーバーを持たない。
`PAGES_BASE_PATH=/react-shadcn` を与えてビルドし、**その prefix の下に置いて**配信する。
`out/` をそのまま root で配信すると、アセットが `/react-shadcn/...` を指すため 404 になる。
PowerShell の手順は `docs/publishing-guide.md` の「3. 公開前のローカル確認」。Git Bash では:

```bash
PAGES_BASE_PATH=/react-shadcn npm -w apps/portal run build   # → apps/portal/out/
mkdir -p /tmp/pages/react-shadcn && cp -r apps/portal/out/* /tmp/pages/react-shadcn/
npx serve /tmp/pages    # → http://localhost:3000/react-shadcn/
```

⚠️ **`PAGES_BASE_PATH` を付け忘れてビルドすると dev と同じ形になり、本番の確認にならない。**

### GitHub Pagesへ公開する

正規の公開経路は `.github/workflows/deploy-pages.yml` だけ(`main` へのpushで検査・ビルド・合成・公開)。
各アプリの `out/` や手作業で作った `dist/` を直接Pagesへアップロードしない。
workflow の順、push の操作、push後に Actions と実URLで確かめることは `docs/publishing-guide.md` の 2・4・5。

### どこで実行するか

ローカル操作はWindowsホストの `C:\dev\react-shadcn` で実行する。
GitHub Actionsのビルド・デプロイ環境はUbuntuで、Node.js 22を使用する。

## 移行状況

<!-- 2026-08-03 時点で Phase 1(workspaces 化)・2(apps/team-t)・3(apps/portal・apps/python-test)・4(packages/shadcn-kit 抽出)が完了(apps/studio/docs/STATUS.md も 2026-08-06 に完了と記す)。2026-11-26 に Phase 5 の行と複製の行だけ残した -->
- 未着手: GoldenFlow の CI ゲート解除(Phase 5)
- 残る複製は `apps/team-t/components/blocks/` の3ファイルのみ。studio の registry が
  `files[].path` で在庫 block を追跡しているため、パッケージ化すると契約が壊れる。
  GoldenFlow の凍結(Phase 5)とあわせて再検討する

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues. See `docs/agents/issue-tracker.md`.

### Domain docs

This repository uses a single-context layout. See `docs/agents/domain.md`.
