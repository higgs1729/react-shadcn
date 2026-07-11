# RFC 005: validator自身を厳格化する

- Status: completed
- Priority: A
- Created: 2026-07-11
- Owners: human owner / orchestrator AI
- Depends on: none

## Problem

一部validatorはAjvの `strict: false` と `validateSchema: false` を使い、directory scan時は
契約と認識できないJSONをskipする。現在のSchema URI差を回避できる一方、Schema自体の
誤記や想定外ファイルを見逃す余地がある。validatorのnegative testも独立していない。

## Why now

全handoffがvalidatorを信頼境界にしているため、validatorのfalse positiveは個々の生成ミス
より影響範囲が大きい。横断validator（RFC 002）より先に共通Ajv基盤を固めることで、後から
各validatorを作り直すことを避ける。

## Decision

draft-07 meta-schemaを正しく登録し、strict validationを目標にする。validatorの共通Ajv
factoryとnegative fixturesを用意し、未知JSONを黙って成功扱いしない。このfactoryはRFC 002
の横断validatorも利用する基盤とする。

## Scope

- Schema自身のvalidation
- Ajv設定の共通化とstrict化
- malformed JSON、未知document、境界値、追加propertyのnegative tests
- scan対象とskip方針の明文化

## Out of scope

- JSON Schema draftの即時移行
- 契約語彙の全面変更

## Validation

- 全Schemaがmeta-schema検証をpassする。
- 各negative fixtureが期待した規則でfailする。
- examples内の未知JSONが明示的な許可なしに成功扱いされない。

## References

- [Ajv strict mode](https://ajv.js.org/strict-mode.html)
- [JSON Schema specification](https://json-schema.org/specification)

## Outcome

Task 11完了。

- `scripts/lib/ajv.mjs` にdraft-07 HTTPS meta-schemaを登録するstrictな共通Ajv factoryを追加。
- 契約利用スクリプトを共通factoryへ移行し、`npm run validate:schemas` を追加。
- examples scanをfail-closedにし、非契約JSONは明示的allowlistなしに失敗するよう変更。
- `npm run test:validators` とnegative fixturesで、invalid JSON、追加property、enum、schema keyword、
  schema reference、未知examples JSONを回帰検証する。
