# RFC 010: Vocabulary extension & verification write-back governance

- Status: proposed
- Priority: B
- Created: 2026-07-12
- Owners: human owner / orchestrator AI
- Depends on: none

このRFCは方針(手順)の明文化であり、コード実装を伴わない。`accepted` 化と、
canonical 文書(AGENTS.md / 30-implementation)への反映は人間レビューを要する。

## Problem

**(A) 語彙拡張の経路が未定義。** screenType / blockRole の語彙は
`docs/contracts/ai-design-facets.schema.json` の enum に閉じており、canonical profiles は
`docs/layers/20-selection/` にある。AGENTS.md は両ディレクトリの編集を全面禁止している。
そのため enum に**存在しない**新語彙を導入する経路が、通常の実装フローには無い。
(補足: enum に既にあり在庫ゼロの screenType へ registry item を足すだけなら、禁止
ファイルに触れず通常フローで可能。実行不能なのは enum 自体を増やす場合のみ。)

**(B) verification 書き戻しが編集禁止ルールと矛盾。** 実装手順の step 3
(`gen-pattern-stories.mjs`)は生成した story ID を registry item の
`meta.aiDesignSystem.verification.storybookStories` に書き戻す。一方 AGENTS.md は
「既存 registry の facet 値」編集を無条件で禁止し、30-implementation の Fix Loop Policy も
`registry/*.json` facet 編集を禁止している。ツールが暗黙の例外になっており、規約と実装が
食い違っている。

## Why now

在庫拡張の前に、(A)「語彙を増やす正規手順」と (B)「どの registry 書き込みが許されるか」を
明文化しておかないと、拡張作業ごとに場当たりの判断が生まれ、編集禁止ルールの信頼性が
損なわれる。

## Decision

### (A) Vocabulary extension procedure(人間承認付きの別枠)

enum を超える新 screenType / blockRole の導入は、通常の実装フローの**外**にある特権操作
として扱い、次を1回の変更で束ねる:

1. 提案(本RFCと同形式)で、新語彙の名前・定義・想定在庫・既存語彙との非重複を記述。
2. 人間承認を得る。
3. 一括更新(順序固定): (a) `ai-design-facets.schema.json` の enum、
   (b) `ai-canonical-profiles.json` の対応プロファイル、(c) 検証 fixture、
   (d) 最低1件の registry 在庫。部分適用のまま止めない。
4. `npm run validate`(schemas / profiles / facets / spec)を exit 0 に戻す。
5. RFC 009 の `report:coverage` で新語彙が在庫付きで現れることを確認。

この操作に限り、編集禁止(contracts / 20-selection)の例外を人間承認とセットで認める。

### (B) Verification write-back exception

`verification.storybookStories` は**機械生成される検証記録**であり、人手で編集する
facet 値とは区別する。次を明文化する:

- 許可: `gen-pattern-stories.mjs` による `verification.storybookStories` への追記
  (パイプライン step 3 の生成過程)。
- 禁止のまま: それ以外の facet 値の手編集、および Fix Loop 中の一切の facet 編集。

canonical 文書への反映(人間承認後):

- AGENTS.md「編集禁止」節に「(生成ツールによる `verification` 記録の書き戻しを除く)」を追記。
- `docs/layers/30-implementation/ai-implementation-instructions.md` の Fix Loop Policy に、
  この例外が **step 3 の生成であって Fix Loop ではない**点を1行補足。

将来的な代替案(採用しない): verification を facet 外の生成 manifest に分離。分離は
より厳密だが、参照箇所(validate-facets の verification 検査、item の自己記述性)が増える
ため、現時点では例外明文化の方が費用対効果が高い。

## Scope

- 本RFCに (A)(B) の手順・規約文言を残す(明文化そのもの)。
- 承認後の反映対象: AGENTS.md、`docs/layers/30-implementation/ai-implementation-instructions.md`。
  反映は `npm run validate:agents` で shim ドリフトを確認する(CLAUDE.md は `@AGENTS.md` shim)。

## Out of scope

- 実際の新語彙の追加(本RFCは手順のみ)。
- verification の manifest 分離(代替案として却下)。
- registry–selection の意味検証 → RFC 009。

## Validation

- 手順(A)(B)がレビュー可能な形で本RFCに存在する。
- 承認後に AGENTS.md / 30-implementation へ反映した場合、`npm run validate:agents` が
  同期を報告し、`npm run validate` が exit 0。

## Risks and trade-offs

- (A) を人間承認必須にすることで語彙拡張のスループットは落ちるが、契約の凍結という
  設計意図(語彙の安定 = 選定の再現性)を守る側に倒す。
- (B) の例外明文化は「facet は基本 immutable」という原則を弱めうるため、例外の対象を
  `verification` 記録に限定し、対象を最小化する。

## References

- `AGENTS.md`(編集禁止節)/ `docs/layers/30-implementation/ai-implementation-instructions.md:16`
- `docs/contracts/ai-design-facets.schema.json`(screenType / blockRole enum)
- `scripts/gen-pattern-stories.mjs`(verification 書き戻し)

## Outcome

(承認・反映後に追記)
