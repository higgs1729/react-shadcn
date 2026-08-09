# 公開・ビルド運用ガイド

最終更新: 2026-08-09

## 1. 公開先の整理

このリポジトリには、役割の異なる2つの公開先があります。

| 公開先 | 役割 | 公開内容 | URL | 更新契機 |
| --- | --- | --- | --- | --- |
| GitHub Pages | 一般公開の正規サイト | ポータル、全アプリ、Storybook | <https://higgs1729.github.io/react-shadcn/> | `master` へのpush |
| OpenAI Sites | ポータルの副系公開先 | `apps/portal` のみ | <https://higgs1729-apps.tomoharu1008.chatgpt.site> | Sitesへの明示的な保存・デプロイ |

原則として、全アプリを利用者へ届ける正規公開先はGitHub Pagesです。OpenAI Sitesはポータル単体を共有・確認するための副系として扱います。ポータルを変更した場合は、GitHub Pagesを必ず更新し、Sitesも同じ状態にそろえる必要がある場合だけ追加で更新します。

> OpenAI Sitesの閲覧範囲はデプロイとは別設定です。現在の設定を広げる場合は、対象を明示してから変更してください。

## 2. GitHub Pagesの構成

GitHub Actionsの [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml) が、各アプリの静的exportを1つの配信物へまとめます。

| 内容 | ソース | 公開パス |
| --- | --- | --- |
| アプリ一覧ポータル | `apps/portal` | `/react-shadcn/` |
| AI Design System Studio | `apps/studio` | `/react-shadcn/studio/` |
| Team T API Lab | `apps/team-t` | `/react-shadcn/team-t/` |
| データ分析試験 模擬問題集 | `apps/python-test` | `/react-shadcn/python-test/` |
| GAMEHUB | `apps/gamehub` | `/react-shadcn/gamehub/` |
| Storybook | `apps/studio` | `/react-shadcn/storybook/` |

Pages向けビルドでは `PAGES_BASE_PATH=/react-shadcn` が必須です。各Next.jsアプリはこの値を `basePath` と `assetPrefix` に使うため、設定せずに作った成果物をPagesへ配置すると、リンクや `_next` 配下のアセットが壊れます。

### 自動デプロイの流れ

1. `master` へpushする。
2. `deploy-pages` ワークフローが依存関係を `npm ci` で復元する。
3. Studioのcontracts・lint・typecheckと、Team Tのvalidateを実行する。
4. 全workspaceを `PAGES_BASE_PATH=/react-shadcn` で静的ビルドする。
5. Storybookをビルドする。
6. ポータルの `out/` を配信ルートへ置き、他アプリの `out/` を各サブディレクトリへ統合する。
7. GitHub Pagesへデプロイする。

## 3. GitHub Pagesの更新手順

PowerShellでリポジトリルートから実行します。

```powershell
npm ci
$env:PAGES_BASE_PATH = "/react-shadcn"
npm run build --workspaces --if-present
npm -w apps/studio run build-storybook
Remove-Item Env:PAGES_BASE_PATH
```

全体ビルドの前に、CIと同じ検査も実行する場合は次を追加します。

```powershell
npm -w apps/studio run checks -- --only contracts,lint,typecheck
npm -w apps/team-t run validate
```

問題がなければ変更をcommitし、`master`へpushします。

```powershell
git push origin master
```

push後はGitHub Actionsの `deploy-pages` が成功したことを確認し、少なくともポータルと変更対象アプリを本番URLで開いて確認します。アプリ内リンク、画像、CSS、直接URLの再読み込みも確認対象です。

### ポータルだけをPages条件で確認する場合

```powershell
$env:PAGES_BASE_PATH = "/react-shadcn"
npm -w apps/portal run build
Remove-Item Env:PAGES_BASE_PATH
```

出力先は `apps/portal/out/` です。この成果物は `/react-shadcn/` 配下で配信される前提なので、ローカルの `/` 直下へそのまま置いて確認しないでください。

## 4. OpenAI Sitesの更新手順

Sites向けはポータルだけをビルドします。`build:sites` は通常の静的exportを行った後、Sitesが受け取る `dist/client` と `dist/server` の構成へ変換します。

```powershell
npm -w apps/portal run build:sites
```

その後、CodexのSites公開フローで次を行います。

1. `apps/portal/.openai/hosting.json` にひもづく既存プロジェクトへソースを保存する。
2. `dist/` をデプロイする。
3. デプロイ完了後、SitesのURLを開いて表示を確認する。

Sites向けビルドでは `PAGES_BASE_PATH` を設定しません。Sitesはドメインのルートでポータルを配信するためです。

## 5. 二重公開で迷わないための判断表

| 変更内容 | GitHub Pages | OpenAI Sites |
| --- | --- | --- |
| ポータルのUI・文章・画像 | 必須 | 両方を同じ状態にする場合のみ更新 |
| Studio、Team T、問題集、GAMEHUB | 必須 | 不要（Sitesの公開対象外） |
| Storybook | 必須 | 不要 |
| Sites固有の変換処理 | Pagesへの影響を確認 | 必須 |

リリース完了の基準は「commitした」ではなく、「対象の公開先で最新表示を確認した」です。

## 6. 差分・事故防止チェックリスト

- `git status --short` で意図しないファイルが混ざっていない。
- GitHub Pages向けビルドでは `PAGES_BASE_PATH=/react-shadcn` を設定した。
- Sites向けビルドでは `PAGES_BASE_PATH` を設定していない。
- ポータルから5アプリへのリンクが正しい公開パスを指している。
- 変更対象の画像と `_next` アセットが404になっていない。
- GitHub Actionsの `deploy-pages` が成功している。
- Sitesも更新した場合は、Sitesの公開URLでも最新表示を確認した。
- 閲覧範囲の変更を、コンテンツのデプロイと同時に暗黙で行っていない。

## 7. ロールバック

GitHub Pagesは、問題のあるcommitを `git revert` し、そのrevert commitを `master`へpushします。履歴を書き換える操作は行いません。

OpenAI Sitesは、Sites側に保存済みの直前の正常バージョンを再デプロイします。どちらも、ロールバック後に実URLで表示を確認します。
