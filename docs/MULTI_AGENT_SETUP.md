# マルチエージェント開発環境

最終確認日: 2026-08-05

この文書は、このリポジトリを Cursor から Claude Code と Codex の両方で扱うための
ローカル環境構成、正本、保守手順を記録する。秘密情報や端末固有のランタイムパスは
リポジトリへ保存しない。

## 現在の構成

| 対象 | 確認済みの状態 |
| --- | --- |
| Cursor | Claude Code 拡張 `2.1.221`、OpenAI Codex 拡張 `26.721.30844` |
| Claude Code CLI | `2.1.214`、認証済み |
| Codex CLI | `0.146.0`、認証済み |
| mmcp | `0.6.2`、`merge` モード |
| 共通 MCP | 配信先は Claude Code・Codex・Cursor。共通サーバーは未登録 |
| GLM | 未契約・API キー未設定。`claude-glm` 起動コマンドのみ準備済み |

バージョンは固定要件ではなく、上記の日付に動作確認した値である。更新後は
「動作確認」のコマンドで再確認する。

## 正本と配信先

### ユーザー層スキル

- 正本: `$HOME/.agents/skills/<skill-name>/`
- Claude Code: `$HOME/.claude/skills/<skill-name>/` から正本へのジャンクション
- Codex: `$HOME/.agents/skills` を直接読む
- `$HOME/.codex/skills` は OpenAI の組み込み領域を含むため、リンクで置換しない

現在、`decide`、`dispatch`、`find-skills`、`lean-task-design`、`skill-map` の5件が
この構成になっている。

### プロジェクト層スキル

- Codex の正本: `.agents/skills/`
- Claude Code の配布先: `.claude/skills/`
- Hermes の配布先: `.hermes/skills/`

`.agents/skills/shadcn/`を正本とし、`npm run skills:sync`でClaude CodeとHermesへ配布する。
`npm run skills:check`は3箇所のファイル構成・ディレクトリ構成・SHA-256を比較する。
Windowsのjunctionやsymlinkをrepoに記録する方式は採用しない。

`dispatch`はrepo内のProject Skillから外し、`C:\agents\skills\react-shadcn-dispatch`へ退避している。

### 指示ファイル

- 正本: `AGENTS.md`
- Claude Code 用 shim: `CLAUDE.md`

`CLAUDE.md` は次の import だけを持つ。Windows ではシンボリックリンクよりこの形式を使う。

```markdown
@AGENTS.md
```

アプリ固有の規範は、既存の階層構造どおり各アプリの `AGENTS.md` に置く。

### ユーザー層 MCP

- 正本: `$HOME/.mmcp.json`
- 配信先: `claude-code`、`codex-cli`、`cursor`
- 適用モード: `merge`

Codex の `node_repl` は Codex アプリ内部のランタイムとネイティブパイプに依存する。
Claude Code や Cursor へ配信せず、Codex 固有設定のまま維持する。

### プロジェクト層 MCP

現在、このリポジトリにはプロジェクト固有 MCP を設定していない。空の設定ファイルも作らない。

導入する場合の正式な配置先は次のとおりで、JSON と TOML を直接リンクしない。

| 対象 | 設定ファイル |
| --- | --- |
| Claude Code | `.mcp.json` |
| Cursor | `.cursor/mcp.json` |
| Codex | `.codex/config.toml` |

プロジェクト MCP の変換・同期方法は、実際にサーバーが必要になった時点で別途決定する。

## 保守手順

### ユーザー層スキルを追加する

1. `$HOME/.agents/skills/<skill-name>/SKILL.md` を作る。
2. 同名スキルが `$HOME/.claude/skills` に存在しないことを確認する。
3. Claude Code 側にスキル単位のジャンクションを作る。

```powershell
New-Item -ItemType Junction `
  -Path "$HOME\.claude\skills\<skill-name>" `
  -Target "$HOME\.agents\skills\<skill-name>"
```

既存ディレクトリを確認せずに上書き・削除しない。

### プロジェクト層スキルを変更する

`.agents/skills` を先に変更し、Claude Code 用コピーにも同じ変更を反映する。その後、次のように
`SKILL.md` のハッシュを比較する。

```powershell
Get-FileHash .agents\skills\<skill-name>\SKILL.md
Get-FileHash .claude\skills\<skill-name>\SKILL.md
```

補助ファイルがある場合は `SKILL.md` だけでなく、スキルディレクトリ全体を比較する。

### 共通 MCP を追加する

適用前に、mmcp と配信先の設定を `$HOME/.codex-setup-backups/` 以下へ退避する。
その後、正本へサーバーを追加し、必ず `merge` モードで反映する。

```powershell
mmcp add -- <server-name> <command> <args...>
mmcp apply --mode merge
```

反映後は次を確認する。

```powershell
mmcp list
claude mcp list
codex mcp list
```

API キーやトークンを `$HOME/.mmcp.json` へ直接保存しない。認証が必要なサーバーは、
各クライアントが対応する環境変数の受け渡し方法または OAuth を確認してから追加する。

## GLM

GLM Coding Plan はまだ契約しておらず、API キーも設定していない。
`%APPDATA%\npm\claude-glm.cmd` は、将来の利用に備えた起動コマンドだけを定義している。

契約後に利用する場合も、キーを PowerShell プロファイル、Claude 設定、リポジトリへ保存しない。
そのターミナルだけにキーを設定して起動し、終了後に削除する。

```powershell
$env:Z_AI_API_KEY = Read-Host "Z.AI API key"
claude-glm
Remove-Item Env:Z_AI_API_KEY
```

契約するまではこの操作を行わない。

## 動作確認

Cursor を完全終了して再起動し、新しい PowerShell ターミナルで確認する。

```powershell
Get-Command claude, codex, mmcp, claude-glm
claude --version
codex --version
mmcp --version
claude auth status
codex login status
mmcp agents list
mmcp list
claude mcp list
codex mcp list
```

Cursor の拡張一覧では `anthropic.claude-code` と `openai.chatgpt` が有効であることを確認する。
拡張画面でログインを求められた場合だけ、本人がブラウザ認証を行う。

## バックアップと復旧

初回統合前の Claude Code ユーザースキルは、次へ退避している。

```text
$HOME/.codex-setup-backups/20260805-005609/claude-skills
```

復旧する場合は、現行リンクと正本の内容を先に比較し、対象を明示してから戻す。
バックアップを一括で上書きコピーしない。

## 禁止事項

- `mmcp apply --mode replace` を使わない
- 共有対象が空のまま、理由なく `mmcp apply` を実行しない
- `$HOME/.codex/skills` をリンクで置換しない
- `$HOME/.claude.json` を手で編集しない
- Windows で macOS 前提の `ccmcp` を使わない
- API キー、アクセストークン、認証情報をリポジトリへ保存しない
- `.mcp.json` と `.codex/config.toml` を直接リンクしない

## 参考資料

- [Codex: Build skills](https://developers.openai.com/codex/skills)
- [Codex: Model Context Protocol](https://developers.openai.com/codex/mcp)
- [Codex: Configuration reference](https://developers.openai.com/codex/config-reference)
- [Claude Code: Extend Claude with skills](https://code.claude.com/docs/en/slash-commands)
- [Claude Code: How Claude remembers your project](https://code.claude.com/docs/en/memory)
- [Claude Code: Connect to tools via MCP](https://code.claude.com/docs/en/mcp)
- [mmcp](https://github.com/koki-develop/mmcp)
- [Z.AI: Claude Code integration](https://docs.z.ai/devpack/tool/claude)
