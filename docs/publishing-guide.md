# GitHub Pages 公開・ビルドガイド

最終更新: 2026-08-09

## 1. 公開先と公開パス

一般公開の正規サイトはGitHub Pagesです。

- 公開URL: <https://higgs1729.github.io/react-shadcn/>
- 公開元ブランチ: `main`
- 自動公開workflow: [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml)

| 内容 | workspace | 公開パス |
| --- | --- | --- |
| アプリ一覧ポータル | `apps/portal` | `/react-shadcn/` |
| AI Design System Studio | `apps/studio` | `/react-shadcn/studio/` |
| Team T API Lab | `apps/team-t` | `/react-shadcn/team-t/` |
| データ分析試験 模擬問題集 | `apps/python-test` | `/react-shadcn/python-test/` |
| GAMEHUB | `apps/gamehub` | `/react-shadcn/gamehub/` |
| Storybook | `apps/studio` | `/react-shadcn/storybook/` |

## 2. 自動公開の仕組み

`main`へのpushを契機に、GitHub Actionsが次の順で処理します。

1. Node.js 22を準備し、`npm ci` で依存関係を復元する。
2. Studioのcontracts・lint・typecheckを実行する。
3. Team Tのvalidateを実行する。
4. `PAGES_BASE_PATH=/react-shadcn` の状態で全workspaceを静的exportする。
5. StudioのStorybookをビルドする。
6. ポータルの `out/` を配信ルートへ置き、他アプリを各サブディレクトリへ合成する。
7. `_next/` をそのまま配信するため `.nojekyll` を加え、GitHub Pagesへデプロイする。

Pages向けビルドでは `PAGES_BASE_PATH=/react-shadcn` が必須です。各Next.jsアプリがこの値を `basePath` と `assetPrefix` に使うため、未設定の成果物をPagesへ置くとリンクやアセットが壊れます。

## 3. 公開前のローカル確認

PowerShellでリポジトリルート `C:\dev\react-shadcn` から実行します。

```powershell
npm ci
$env:PAGES_BASE_PATH = "/react-shadcn"
npm -w apps/studio run checks -- --only contracts,lint,typecheck
npm -w apps/team-t run validate
npm run build --workspaces --if-present
npm -w apps/studio run build-storybook
Remove-Item Env:PAGES_BASE_PATH
```

ポータルだけをPages条件で確認する場合は次のとおりです。

```powershell
$env:PAGES_BASE_PATH = "/react-shadcn"
npm -w apps/portal run build
Remove-Item Env:PAGES_BASE_PATH
```

出力先は `apps/portal/out/` です。アセットURLは `/react-shadcn/` を前提にするため、`out/` をサーバーのルートへ直接置くと正しい本番確認になりません。

## 4. 公開手順

意図した変更だけが含まれていることを確認し、commit後に `main`へpushします。

```powershell
git status --short
git push origin main
```

手動で `out/` や `dist/` をPagesへアップロードしません。push後の公開処理は `deploy-pages` workflowに任せます。

## 5. 公開後の確認

1. GitHub Actionsの `deploy-pages` を開く。
2. `build` と `deploy` が両方成功していることを確認する。
3. <https://higgs1729.github.io/react-shadcn/> を開く。
4. ポータルから変更対象アプリへ遷移する。
5. 画像、CSS、`_next` アセットに404がないことを確認する。
6. 変更対象アプリのURLを直接開き、再読み込みしても表示できることを確認する。

リリース完了の基準は「commitした」ではなく、「Actionsが成功し、GitHub Pagesの実URLで最新表示を確認した」です。

## 6. ロールバック

問題のあるcommitを `git revert` し、revert commitを `main`へpushします。履歴を書き換える操作は行いません。再度 `deploy-pages` が成功し、本番表示が戻ったことを確認します。
