# RFC 008: Multi-flow pipeline support and artifact naming convention

- Status: completed
- Priority: A
- Created: 2026-07-11
- Owners: human owner / orchestrator AI
- Depends on: none

## Problem

パイプライン検証系のうち4本が「golden flow が1本しかない」前提のデフォルトをハードコードしている:

| スクリプト | 単一フロー前提 |
| --- | --- |
| `scripts/validate-pipeline.mjs` | 3成果物のデフォルトが golden のファイル名固定 |
| `scripts/run-planned-checks.mjs` | 引数なしは `selectionspec-dryrun-02.json` 固定(`npm run checks:planned` は永遠に golden しか見ない) |
| `scripts/gen-provenance.mjs` | 入力・出力とも golden 固定 |
| `scripts/validate-provenance.mjs` | golden sidecar 固定 |

2本目のフローを追加した瞬間、これらの引数なし実行は新フローを検証しない。exit 0 のまま
検証漏れが起きる(fail-loud ではなく silent-partial)のが本質的な問題である。

さらに前提となる成果物ファイルの命名が不統一: flowId は `dryrun-saas-ops-01` なのに、
ファイルは `flowspec-dryrun-01` / `selectionspec-dryrun-02` / `buildreport-dryrun-saas-ops-02`
と3様(末尾番号は dry-run 反復回数)。flowId からファイル名を機械的に導出できないため、
複数フローの自動発見が実装できない。

## Why now

「次の候補」である新 screenType 在庫追加・上流 Flow 層自動化は、いずれも2本目以降の
フローを生む。その前にこの前提を直さないと、追加されたフローが検証網の外に置かれる。
また層別指示書(20-selection / 30-implementation)には既に `<artifact>-<flowId>.json` の
命名を明記しており、現実との矛盾が固定化する前に解消する。

## Decision

**命名規約: 固定名 `<artifact>-<flowId>.json`、examples は flowId ごとに各契約1枚(最新のみ)。**

- 反復(同じフローの再実行)は上書き。履歴は git が持つ(STATUS.md と同じ
  「正本は git log、ファイルは最新キャッシュ」原則を examples にも適用する)。
- 並置したい変種(選定方針の A/B 比較など)は別の実験であり、別 flowId を切る。
  ファイル名にバージョン番号を持ち込まない。
- 過去実行の追跡は provenance sidecar(git hash + 内容 digest)と git history が担う。
  ファイル名バージョニングは git の履歴管理の重複実装であり、採用しない。

**自動発見: 引数なし実行は docs/examples/ を走査し、flowId ごとの三つ組
(flowspec-X / selectionspec-X / buildreport-X)をすべて検証する。**

- 4スクリプト共通の三つ組発見ロジックを `scripts/lib/` に1本置き、各スクリプトは
  それを使う(check-registry と同じ single-source-of-truth 方式)。
- 三つ組が欠けている flowId(例: selectionspec だけある)は fail-loud。部分的な
  パイプラインを黙って skip しない。
- 明示引数(`--flow/--spec/--build` やファイルパス指定)は現行どおり残す。
  引数ありは単一対象、引数なしは全数、という一貫則にする。

## Scope

- golden 3枚を `<artifact>-dryrun-saas-ops-01.json` へリネームし、provenance sidecar を
  `npm run gen:provenance` で再生成する(sidecar は旧 basename を記録しているため、
  リネームだけでは `validate:provenance` が解決不能で fail する — 移行手順に含める)。
- 上記4スクリプトのデフォルトを三つ組自動発見に置換。
- 三つ組発見の共有ライブラリ追加と、その否定ケース(欠けた三つ組が fail する)のテスト。
- 旧ファイル名に言及している文書の更新(STATUS.md ほか)。

## Out of scope

- 上流 Flow 層(brief→JTBD→FlowSpec)の自動化。
- provenance フォーマット自体の拡張(RFC 004 の方針どおり凍結)。
- `docs/archive/` 内の旧ファイル名参照の書き換え(archive は凍結)。
- eval データセットの拡充。

## Validation

- 引数なしの `validate:pipeline` / `checks:planned` / `validate:provenance` が
  examples 内の全フローを列挙・検証し、exit 0。
- 三つ組が欠けたフィクスチャに対して fail-loud すること(欠落 flowId が出力に載る)。
- リネーム+sidecar 再生成後、`npm run validate` / `checks` / `validate:provenance` /
  `npm run eval` すべて exit 0。
- 2本目のダミーフロー(または fixture)を置いたとき、引数なし実行が両方を検証する
  ことをテストで示す。

## Risks and trade-offs

- 上書き運用は「直前の実行結果」をファイルとして並置できない。意図的な採用であり、
  比較は `git diff`、保全は archive への手動移動で行う。
- リネームは provenance sidecar と文書参照を同時に壊すため、移行はワンショットの
  ブリーフ1枚で完結させる(部分適用の中間状態を作らない)。
- 全数検証は実行時間が伸びる。planned checks はコマンド dedupe 済みであり、
  現規模(数フロー)では許容。

## References

- `docs/layers/20-selection/ai-pattern-selection-instructions.md`(出力命名の明記箇所)
- `docs/layers/30-implementation/ai-implementation-instructions.md`(BuildReport Emission / sidecar 再生成ルール)
- `scripts/lib/check-registry.mjs`(single-source-of-truth の先行例)
- RFC 004(provenance 凍結方針)

## Outcome

2026-07-12 完了(brief: task-14、実装: executor AI、検証: orchestrator が全受け入れ基準を独立再実行)。

- golden 3成果物+sidecar を `<artifact>-dryrun-saas-ops-01.json` へリネーム、sidecar は再生成。
- `scripts/lib/flows.mjs`(`discoverFlows` + `FlowDiscoveryError`)を追加。shape 分類は
  validate-spec と同規約。命名不一致・三つ組欠落・重複はすべて fail-loud。
- 4スクリプト(validate-pipeline / run-planned-checks / gen-provenance / validate-provenance)の
  引数なし実行を全フロー自動発見に置換。明示引数モードは不変。planned checks はフロー横断で
  コマンド dedupe、結果に flowId を付与。
- 否定ケーステスト `npm run test:flows`(fixtures: `scripts/fixtures/flows/`)を追加。
  二三つ組 fixture で複数フロー発見を実証。
- 検証: validate / validate:pipeline / validate:provenance / checks:planned / eval(7/7)/
  test:{flows,validators,pipeline,planned-checks,provenance} すべて exit 0。
  旧ファイル名の `git grep`(archive 除外)= 0件。
