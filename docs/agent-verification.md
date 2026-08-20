# Agent検証とSkill配布

このrepoでは、Agentが生成した成果物の検証と、クライアント別Skillの配布を次の責務で分ける。

## Skillの正本と配布

`.agents/skills/shadcn/`を正本とし、次の2箇所は配布コピーとして扱う。

- `.claude/skills/shadcn/`
- `.hermes/skills/shadcn/`

正本を変更した後は、次を実行する。

```powershell
npm run skills:sync
npm run skills:check
```

`skills:sync`は正本から配布先を再生成する。古いファイルも削除するため、3箇所の構成を一致させられる。`skills:check`は3箇所のファイル構成、ディレクトリ構成、ファイル内容のSHA-256を比較する。CIと通常の検証では`skills:check`だけを実行し、作業ツリーを変更しない。

`dispatch`はrepo内のProject Skillとしては扱わず、`C:\agents\skills\react-shadcn-dispatch`へ退避している。repo内のshadcn配布検査には含めない。

## 検証コマンドの責務

| コマンド | 役割 | 作業ツリーを変更するか |
| --- | --- | --- |
| `npm run skills:sync` | 正本SkillをClaude／Hermesへ配布 | 変更する |
| `npm run skills:check` | Skillの完全一致を検査 | 変更しない |
| `npm run validate` | 全workspaceの契約・指示・文書・静的validatorを検査 | 原則変更しない |
| `npm run checks` | Skill検査後、各workspaceのlint・型・test・build等を実行 | 生成物を作る |
| `npm -w apps/studio run test:all` | `test:*`スクリプトを自動発見して実行 | テストによる |
| `npm -w apps/studio run eval` | 埋め込みgolden candidateを決定論的に評価 | 変更しない |
| `npm -w apps/studio run eval:fixture` | 意図的に失敗するfixtureが検出されることを確認 | 変更しない |
| `npm -w apps/studio run eval -- --candidates <dir>` | 外部Agentが生成したcase別candidateを評価 | candidateは呼び出さない |

rootの`validate`と`checks`は、workspace検証に入る前に`skills:check`を実行する。Skillの同期が崩れている場合は、先に`npm run skills:sync`を実行する。

## evalの境界

`apps/studio/eval`はgraderとgolden dataを提供するが、Agent自体は起動しない。`--candidates`は、別のAgent runnerが次の形式で出力したファイルを受け取る接続口である。

```text
<candidate-dir>/<case-id>.json
```

CIでモデルを呼び出すのではなく、Agent実行は手元で行い、生成されたcandidateだけを同じgraderへ渡す。

## 推奨する実行順

```text
npm run skills:check
        ↓
npm run validate
        ↓
npm run checks
        ↓
build / deploy
```

Skillを変更した場合だけ、最初に`npm run skills:sync`を挟む。
