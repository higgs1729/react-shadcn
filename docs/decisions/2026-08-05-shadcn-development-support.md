# 決定: shadcn Webアプリ開発支援機能を工程別に採用する

- 日付: 2026-08-05
- 格付け: 可逆 × 影響度 中
- 確信度: 高 — 採用する機能の役割は明確だが、外部Skillの更新とプロジェクトMCPの同期方式は今後変わりうる

## 背景と問い

`react-shadcn` モノレポは、Next.js 16、React 19、Tailwind CSS v4、shadcn/ui、
共有パッケージ `@react-shadcn/shadcn-kit`、Storybook、Vitest、Playwright、
アクセシビリティ検査、GitHub Pages向け配信をすでに備えている。

今回の問いは、新しい包括的な開発基盤へ置き換えるかではなく、既存資産とリポジトリ固有規約を
維持したまま、次の不足を工程別の小さな機能で補えるかである。

- shadcnのBase UI固有API、CLI、Registryを正確に扱う
- Reactコンポーネントの内部設計を改善する
- 完成したUIのUXとアクセシビリティを監査する
- 既存のStorybook、Vitest、Playwrightによる検証につなげる

SkillとMCPの配置・正本・同期・秘密情報の扱いは、
[マルチエージェント開発環境](../MULTI_AGENT_SETUP.md) に従う。

## 決定

包括的なWebアプリ開発プラグインへ置き換えず、公式shadcn Skill、shadcn MCP、
Vercel Composition Patterns、Web Design Guidelinesを工程別に採用する。
既存のProduct Design、Figma、Storybook、Vitest、Playwright、リポジトリ固有checksを
引き続き実装・検証の本体とする。

外部Skillはこのリポジトリに限定した**プロジェクト層Skill**として管理する。
採用決定と実際の導入は分離し、この記録だけではSkillやMCPをインストールしない。

### 採用する機能と責務

| 工程 | 採用機能 | 責務 |
| --- | --- | --- |
| 要件・画面構成 | 通常のCodex、Product Design | 要件整理、画面構成、UX検討 |
| デザイン連携 | Product Design、Figma | デザイン探索、Design to Code、Code Connect |
| React設計 | Vercel Composition Patterns | Compound Components、状態配置、Provider責務、明示的Variant |
| shadcn実装 | 公式shadcn Skill | プロジェクト認識、Base別API、CLI、コンポジション、テーマ |
| Registry操作 | shadcn MCP | 検索、閲覧、依存確認、追加、外部・Private Registry利用 |
| UI監査 | Web Design Guidelines | UX、セマンティクス、キーボード、フォーカス、状態表現、レスポンシブ |
| コンポーネント検証 | Storybook、Vitest | 表示状態、interaction、アクセシビリティ、回帰 |
| 画面検証 | Playwright、Codexブラウザ操作 | 実ブラウザ操作、主要フロー、コンソールエラー、回帰 |
| 最終検証 | リポジトリ既存コマンド | `validate`、`checks`、`build` |

### 運用優先順位

指示が競合する場合は次の順序で解決する。

1. ユーザーの明示的な指示
2. 対象ディレクトリの `AGENTS.md`
3. 公式shadcn Skill
4. Vercel Composition Patterns
5. Web Design Guidelines
6. 一般的なベストプラクティス

Web Design Guidelinesは監査・助言用途に限定し、指摘を根拠にした自動修正は行わない。
指摘がリポジトリ固有ルールや製品要件と競合する場合は採用しない。

### 導入・管理方針

- プロジェクト層Skillの正本を `.agents/skills/<skill-name>/` に置く。
- Claude Code用コピーを `.claude/skills/<skill-name>/` に置き、内容とハッシュを同期する。
- Skill導入時は上流URL、取得したrevision、取得日を記録し、更新は差分レビュー後に行う。
- 公式shadcn Skillは `shadcn/ui` 一括ではなく、必要な `shadcn` Skillだけを導入する。
  このリポジトリはすでにBase UIのため、`migrate-radix-to-base` は導入しない。
- `npx skills add` の自動配置先を正本とみなさない。配置結果を確認し、
  `MULTI_AGENT_SETUP.md` が定める正本と配信先へ反映する。
- shadcn MCPはプロジェクト層MCPとして扱い、対象cwdを
  `packages/shadcn-kit` に明示する。
- shadcn MCPの実設定は `.mcp.json`、`.cursor/mcp.json`、`.codex/config.toml` の
  変換・同期方法を決めてから行う。JSONとTOMLを直接リンクしない。
- Registryからの追加は、原則として `view`、`--dry-run`、`--diff` のいずれかで
  内容と書き込み先を確認してから行う。

### 維持するリポジトリ固有ルール

- `shadcn add` は `packages/shadcn-kit` を対象にする。
- 共有primitiveは `@react-shadcn/shadcn-kit` から利用する。
- 保護対象のprimitiveを不用意に直接編集しない。
- Base UIにRadix固有APIを持ち込まない。
- アプリ固有規約は各アプリの `AGENTS.md` に従う。
- 全workspaceの変更後は、必要な個別検証に加えてルートの
  `npm run validate`、`npm run checks`、`npm run build` を影響範囲に応じて実行する。

## 前提(これが崩れたら結論も変わる)

- 既存のモノレポ、共有shadcnパッケージ、GitHub Pages配信を維持する。
- 公式shadcn SkillとMCPが、現在のshadcn CLIおよびBase UIを継続してサポートする。
- Vercelの2つのSkillを助言として使い、リポジトリ規約より上位に置かない。
- Storybook、Vitest、Playwrightで必要な品質検証を実装できる。
- 複数エージェント向けのSkill複製とMCP設定を、許容できる保守コストで同期できる。

## 却下した選択肢

| 選択肢 | 却下理由 | どういう状況ならこちらが勝つか |
| --- | --- | --- |
| 現状維持で外部Skill・MCPを追加しない | Base UIとRadixの混同、Registry探索、UI監査の精度を個別プロンプトへ依存させる | 外部Skillの保守コストや供給網リスクが実益を上回った場合 |
| Build Web Appsを導入する | 既存の設計・実装・検証・配信構成と責務が大きく重複する | 新規リポジトリをゼロから構築する、または現在の開発手順を包括的に置き換える場合 |
| Webapp Testing Skillを導入する | 既存Playwright環境とCodexブラウザ操作で代替できる | サーバー起動を含む共通テスト手順が不足し、既存スクリプトの保守よりSkill利用が安くなった場合 |
| Skillをすべてユーザー層へ導入する | 他プロジェクトへの不要な発火と、チームで再現できない個人環境依存を増やす | 複数リポジトリで同一ポリシーを運用し、共通更新の方が明確に安くなった場合 |
| shadcn関連だけ採用しVercelの2 Skillを見送る | shadcnの利用精度は上がるが、React内部設計と完成UI監査の空白が残る | 外部指示の競合やレビュー量が多く、開発速度を継続的に落とす場合 |
| 導入を延期して調査だけ続ける | 主要候補の役割と既存機能との重複は判明しており、追加調査のオプション価値が小さい | MCP設定同期の設計を含め、導入を担当できる保守者が不在の場合 |

## プレモータムで出た主要リスク

- **Skill同士の指示が競合して実装が不安定になる。**
  優先順位を固定し、外部Skillをプロジェクト層に限定する。
- **外部Skillが更新され、同じ依頼でも監査結果や実装方針が変わる。**
  上流revisionを記録し、更新を通常のコード変更として差分レビューする。
- **MCPがモノレポ直下を対象にして、誤った場所へファイルを追加する。**
  cwdを `packages/shadcn-kit` に固定し、書き込み前に `view`、`--dry-run`、`--diff` を使う。
- **Claude Code、Codex、Cursorの設定がずれて、一部の環境だけ動く。**
  プロジェクトMCPの同期方法を先に決め、3クライアントで接続確認するまで導入完了としない。
- **監査Skillの指摘を無批判に適用し、製品要件や既存デザインを壊す。**
  指摘は証拠として扱い、自動修正せず、対象画面の要件とスクリーンショットで判断する。
- **導入した機能が使われず、Skillの複製と更新だけが残る。**
  一定期間の利用記録と検出した問題を確認し、実益がなければ削除する。

## トリップワイヤ(見直し条件)

- [ ] 外部Skillの指示が `AGENTS.md` と繰り返し競合する
- [ ] Skill更新の同期・レビューが、得られる改善より重い状態が2回以上続く
- [ ] shadcn MCPが誤ったworkspaceまたは保護対象primitiveへ書き込む
- [ ] 3クライアントのMCP設定差分を安全に管理できない
- [ ] Storybook・Playwrightで捕捉できない回帰が続き、専用Testing Skillの方が有利になる
- [ ] 新規アプリの立ち上げが増え、Build Web Appsによる標準化の便益が重複コストを上回る
- [ ] VercelまたはSitesへ配信先を変更する
- [ ] 定期見直し: 2026-11-05 にこの記録を再読する

## 導入完了の条件

採用決定とは別に、次を満たした時点で導入完了とする。

1. 3つのプロジェクト層Skillを取得・レビューし、`.agents/skills` と `.claude/skills` の
   ディレクトリ全体のハッシュが一致する。
2. 各Skillの上流URL、revision、取得日を記録する。
3. shadcn MCPのクロスクライアント同期方法を決定し、秘密情報を含めず設定する。
4. MCPが `packages/shadcn-kit` を認識し、検索・閲覧を行えることを3クライアントで確認する。
5. テスト用コンポーネントに対し、書き込み前確認を経て追加できることを確認する。
6. 既存の `validate`、`checks`、`build` が成功する。

## 参考

- [shadcn Skills](https://ui.shadcn.com/docs/skills)
- [shadcn MCP Server](https://ui.shadcn.com/docs/mcp)
- [shadcn CLI](https://ui.shadcn.com/docs/cli)
- [Vercel Composition Patterns](https://www.skills.sh/vercel-labs/agent-skills/vercel-composition-patterns)
- [Vercel Web Design Guidelines](https://www.skills.sh/vercel-labs/agent-skills/web-design-guidelines)
