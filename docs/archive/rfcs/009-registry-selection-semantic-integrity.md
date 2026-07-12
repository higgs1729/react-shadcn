# RFC 009: Registry–selection semantic integrity

- Status: completed
- Priority: A
- Created: 2026-07-12
- Owners: human owner / orchestrator AI
- Depends on: RFC 002 (pipeline semantic validation)

## Problem

`validate:pipeline` の `REGISTRY_ITEM_EXISTS` は、SelectionSpec が指す registry item
が**名前として存在するか**だけを確認する(`scripts/validate-pipeline.mjs` の
`loadRegistryItemNames` は item 名の Set しか作らず、facet を捨てている)。その結果、
schema 的に妥当なまま次の誤りがパイプラインを通過する:

- block-pattern を `screenPattern` として選ぶ(assetKind 不一致)。
- 別 screenType の screen-pattern を選ぶ(`resolvedScreenType` と facet `screenType` が不一致)。
- `blockRole: "filter-toolbar"` に `chart-panel-01` を割り当てる(block の facet blockRole と不一致)。
- screen pattern の `composition.requiredBlocks` を満たさない / 同一 role を重複選択する。
- item が要求する shadcn 依存が SelectionSpec の `registryDependencies` に欠ける(install 破綻)。

加えて、canonical profile(10 screenType / 30 blockRole)に対し registry の在庫は
片方向(requiredBlocks→在庫)しか検証されておらず、大半の語彙が在庫ゼロであることが
どこにも可視化されていない。選定時に初めて starvation が判明する。

## Why now

在庫拡張(次候補「新 screenType 在庫追加」「maturity 昇格」)に着手すると、選定の
組み合わせ空間が広がり、上記の誤選択が現実的になる。「契約強制」の看板を在庫拡張の
前に実体化しておく必要がある。必要なデータは両側に揃っており(SelectionSpec は
`resolvedScreenType` / `screenPattern.registryItem` / `blocks[].blockRole` /
`registryDependencies`、registry facet は `assetKind` / `screenType` / `blockRole` /
`composition.requiredBlocks` / `dependencies.shadcn`)、追加の入力なくオフラインで
機械検証できる。

## Decision

1. `validate:pipeline` に、facet を実際に読んで突き合わせる意味検証を追加する。
   スキーマは immutable のまま、新ルールはすべて `scripts/validate-pipeline.mjs` に置く。
   - **ASSET_KIND_MATCH**: `screenPattern.registryItem` の facet `assetKind` は
     `screen-pattern`、`blocks[].registryItem` の facet `assetKind` は `block-pattern`。
   - **SCREENTYPE_MATCH**: screenPattern facet の `screenType` が screen の
     `resolvedScreenType` と一致する。
   - **BLOCK_ROLE_MATCH**: 各 block について、その item の facet `blockRole` が
     SelectionSpec の `blocks[].blockRole` と一致する。
   - **REQUIRED_BLOCKS_COVERED**: screenPattern facet の `composition.requiredBlocks`
     の各 role が、選択された blocks の role 集合で充足される。かつ blocks 内で
     同一 role が重複しない。
   - **DEPENDENCY_UNION**: 選択された全 item の facet `dependencies.shadcn` の和集合が、
     screen の `registryDependencies` にすべて含まれる(欠落は fail。宣言側の余剰は許容)。
2. 在庫充足の**可観測性**を追加する。`scripts/report-inventory-coverage.mjs` を新設し、
   canonical profile の全 screenType / blockRole に対する registry 在庫数を表で出力する。
   在庫ゼロは「意図的な欠品(GAP)」として可視化するが、**失敗にはしない**(exit 0 の
   観測ツール。gate ではない)。`npm run report:coverage` で呼べるようにする。

## Scope

- `scripts/validate-pipeline.mjs`: facet を読む item ローダへ差し替え、上記5不変条件を追加。
- `scripts/test-pipeline.mjs` + `scripts/fixtures/pipeline/`: 新不変条件ごとに、単一違反の
  fixture と「非ゼロ終了 + 不変条件名」を期待する回帰テストを追加。
- `scripts/report-inventory-coverage.mjs`(新規)+ `package.json` の `report:coverage`。
- 軽量テスト(coverage レポートが全 canonical 語彙を列挙し exit 0 する)。

## Out of scope

- 契約スキーマ(`docs/contracts/*`)や canonical profiles の変更。
- 在庫欠品を**強制**すること(本 RFC は観測のみ。gate 化は将来判断)。
- 語彙(enum)拡張の手順 → `docs/tasks/task-16`(旧 RFC 010、統合済み)。
- registry facet 書き戻しの規約整合 → AGENTS.md / 30-implementation(旧 RFC 010、反映済み)。
- story 生成の render adapter 汎用化(P2-2)→ STATUS.md メモ、在庫追加時に相乗り。

## Validation

- `npm run test:pipeline` が新不変条件の fixture をすべて非ゼロで拒否する。
- 現行 golden triple は引き続き `npm run validate:pipeline` を pass。
- `npm run report:coverage` が exit 0 で、10 screenType / 30 blockRole すべてと
  各在庫数(0 を含む)を出力する。
- `npm run validate` / `npm run checks` を exit 0 に保つ。

## Risks and trade-offs

- DEPENDENCY_UNION を「欠落のみ fail・余剰は許容」に留めることで、最小構成で optional を
  省いた正当な SelectionSpec を誤検出しない。厳密な等値検証は将来必要になれば別途。
- facet を読むことで validate-pipeline の registry 依存が増えるが、既に registry を
  スキャンしているため新たな結合ではない。

## References

- `scripts/validate-pipeline.mjs`(`REGISTRY_ITEM_EXISTS`, `loadRegistryItemNames`)
- `scripts/validate-facets.mjs`(片方向の requiredBlocks→在庫検証)
- `docs/contracts/ai-selectionspec.schema.json` / `ai-design-facets.schema.json`
- 実行 brief: `docs/tasks/task-15-registry-selection-semantic-integrity.md`

## Outcome

task-15 として実装・完了(2026-07-12)。

- `scripts/validate-pipeline.mjs`: `loadRegistryItems()`(`Map<name, facets>`)へ差し替え、
  5不変条件 `ASSET_KIND_MATCH` / `SCREENTYPE_MATCH` / `BLOCK_ROLE_MATCH` /
  `REQUIRED_BLOCKS_COVERED` / `DEPENDENCY_UNION` を追加。item 欠落・facet 欠落は skip。
- `scripts/test-pipeline.mjs` + `scripts/fixtures/pipeline/`: 不変条件ごとに単一違反 fixture と
  回帰テストを追加(asset-kind fixture は BLOCK_ROLE_MATCH も付随的に検出する旨を fixture の
  `$comment` に明記)。
- `scripts/report-inventory-coverage.mjs`(新規)+ `npm run report:coverage` /
  `test:coverage`。exit 0 の観測ツール。
- 独立再検証(orchestrator): `test:pipeline` / `test:coverage` / `validate:pipeline` /
  `validate` / `checks` すべて exit 0。coverage 実測 = **3/10 screenType・7/30 blockRole 在庫**
  (残りは意図的な GAP として可視化)。
- brief は `docs/archive/tasks/task-15-registry-selection-semantic-integrity.md` へ移動。
