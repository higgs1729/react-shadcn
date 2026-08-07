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
| `apps/portal` | `/react-shadcn` | `/react-shadcn/` | なし(自己完結 CSS) |
| `apps/studio` | `/react-shadcn/studio` | `/react-shadcn/studio/` | shadcn |
| `apps/team-t` | `/react-shadcn/team-t` | `/react-shadcn/team-t/` | shadcn |
| `apps/python-test` | `/react-shadcn/python-test` | `/react-shadcn/python-test/` | shadcn |

Storybook は studio のみが持ち、`/react-shadcn/storybook/` に合成される。

## 動かし方(dev / 本番プレビュー)

### dev サーバー

アプリごとに個別に起動する。ルートに `dev` スクリプトは無い。

```bash
npm -w apps/portal run dev        # → http://localhost:3000/
npm -w apps/studio run dev        # → http://localhost:3000/studio/
npm -w apps/team-t run dev        # → http://localhost:3000/team-t/
npm -w apps/python-test run dev   # → http://localhost:3000/python-test/
```

**dev の URL は本番と同じ route 形になるが、`portal` だけ例外**:

| workspace | dev の basePath | dev の URL |
| --- | --- | --- |
| `apps/portal` | **空** | **`localhost:3000/`** |
| `apps/studio` | `/studio` | `localhost:3000/studio/` |
| `apps/team-t` | `/team-t` | `localhost:3000/team-t/` |
| `apps/python-test` | `/python-test` | `localhost:3000/python-test/` |

`portal` はサイトのルートを所有するため `basePath = PAGES_BASE_PATH ?? ""` となり、
dev では空になる(他アプリは `${PAGES_BASE_PATH ?? ""}/<name>`)。
**`localhost:3000/portal/` は存在しない。**

- 全アプリの `dev` は `next dev` で **既定ポートは 3000**。同時に複数起動すると
  2つ目以降は 3001, 3002... へ自動でずれる。起動時のログで実ポートを確認する
- **ポータルからのアプリ間リンクは dev では解決しない。** ポート違いになるため。
  合成後の本番でのみ繋がる

### GAMEHUB(`tmp/AI_game_contest`)だけ別枠

**workspace ではない。** `vinext`(Cloudflare Workers + SSR)で動く別リポジトリ
(独立した `.git` を持つ)で、静的エクスポートできないため Pages の合成に載らない。
`tmp/` は `.gitignore` 対象。

ポータルのカードのリンクは環境で切り替わる(`apps/portal/components/landing-hub.tsx`):

| 環境 | リンク先 |
| --- | --- |
| dev | `http://localhost:3001/` |
| 本番ビルド | リポジトリのソース URL |

`NEXT_PUBLIC_GAMEHUB_URL` を設定すれば上書きできる(実デプロイ先ができたらそれを使う)。

起動:

```powershell
cd tmp\AI_game_contest
$env:WRANGLER_LOG_PATH=".wrangler/wrangler.log"; npx vinext dev -p 3001
```

⚠️ **`npm run dev` は Windows では動かない。** スクリプトが
`WRANGLER_LOG_PATH=... vinext dev` という POSIX の環境変数前置き記法で書かれており、
npm が Windows では `cmd.exe` を使うため
`'WRANGLER_LOG_PATH' は…認識されていません` で落ちる。
上のように環境変数を先に立てて `npx vinext dev` を直接呼ぶ。

⚠️ **`-p 3001` を必ず付ける。** vinext の既定は 3000 で portal と衝突し、
空きポートへ自動でずれる。ポータル側のリンクは 3001 を前提にしているため、
固定しないと導線が切れる。

### 本番(GitHub Pages)の見え方を手元で確認する

`output: "export"` の静的サイトなので、本番は Node サーバーを持たない。
`PAGES_BASE_PATH` を与えてビルドし、**その prefix の下に置いて**配信する。

```bash
PAGES_BASE_PATH=/react-shadcn npm -w apps/portal run build   # → apps/portal/out/
```

```powershell
$env:PAGES_BASE_PATH="/react-shadcn"; npm -w apps/portal run build
```

`out/` をそのまま root で配信すると、アセットが `/react-shadcn/...` を指すため 404 になる。
prefix を再現してから配信する:

```bash
mkdir -p /tmp/pages/react-shadcn && cp -r apps/portal/out/* /tmp/pages/react-shadcn/
npx serve /tmp/pages    # → http://localhost:3000/react-shadcn/
```

⚠️ **`PAGES_BASE_PATH` を付け忘れてビルドすると dev と同じ形になり、本番の確認にならない。**

### どこで実行するか

**ホスト(Windows)で実行する。** Hermes コンテナにも依存は入っているが、
**dev サーバーのポートを公開していない**ためブラウザから到達できない。
コンテナ側はビルド・型チェックの検証用と割り切る。

## 移行状況(2026-08-03 時点)

- 完了: Phase 1(workspaces 化)・Phase 2(`apps/team-t`)・Phase 3(`apps/portal`・`apps/python-test`)・
  Phase 4(`packages/shadcn-kit` 抽出)
- 未着手: GoldenFlow の CI ゲート解除(Phase 5)
- 残る複製は `apps/team-t/components/blocks/` の3ファイルのみ。studio の registry が
  `files[].path` で在庫 block を追跡しているため、パッケージ化すると契約が壊れる。
  GoldenFlow の凍結(Phase 5)とあわせて再検討する
