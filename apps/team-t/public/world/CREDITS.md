<!-- encoding:UTF-8 -->
# APIアーケード アセット出典

`models/arcade/` 配下の GLB は [Kenney](https://kenney.nl/) の
**Mini Arcade 1.2**(2024-07-22、CC0)から取得した。
追加クレジット: Fleur Keijsers、Guus Vermeulen。

`models/` にはパック丸ごとではなく、店内を構成する次のファイルだけを置く。

- 構造: `floor`、`wall`、`wall-corner`、`wall-door-rotate`、`wall-window`、`column`
- 実機: `arcade-machine`、`pinball`、`claw-machine`、`air-hockey`、`basketball-game`、`dance-machine`、`gambling-machine`、`prize-wheel`、`ticket-machine`
- プレイヤー: `character-gamer`(32アニメーションクリップ内蔵)

各 GLB は `models/arcade/Textures/colormap.png` を相対参照するため、同パックの
カラーマップも同じ階層へ配置している。

## `models/furniture/`(Kenney Furniture Kit 2.0、CC0）

ロビー刷新（和風ゲームセンター化）の休憩ラウンジ用。GLTF format 版を採用。
このパックの GLB は**外部テクスチャを持たず**、マテリアルの baseColorFactor で
色を自己完結させる（`Textures/` 不要）。リポジトリ流儀に合わせ kebab-case へ改名した。

- 座席: `lounge-sofa`（←loungeSofa）、`lounge-chair-relax`（←loungeChairRelax）、`chair-modern-cushion`（←chairModernCushion）
- 卓・小物: `table-coffee`（←tableCoffee）、`side-table`（←sideTable）、`lamp-round-floor`（←lampRoundFloor）、`rug-rounded`（←rugRounded）
- 緑: `potted-plant`（←pottedPlant）、`plant-small-1`（←plantSmall1）

## `models/market/`(Kenney Mini Market 1.0、CC0）

追加クレジット: Fleur Keijsers、Guus Vermeulen。景品・軽食コーナー用。
Mini Arcade と同じく `Textures/colormap.png` を相対参照するため、同パックの
カラーマップを `models/market/Textures/` へ配置している。

- `freezer`、`shelf-boxes`、`shelf-bags`、`shopping-basket`、`display-bread`

## ライセンス

上記すべて Creative Commons Zero (CC0)
http://creativecommons.org/publicdomain/zero/1.0/

個人・教育・商用のいずれにも制限なく利用でき、クレジット表記は必須ではない。
容量上限は撤廃済み（`world/` は現在約1.1MB）。
