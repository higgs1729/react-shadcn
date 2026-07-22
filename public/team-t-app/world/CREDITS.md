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
カラーマップも同じ階層へ配置している。GLB とテクスチャを含む `world/` 全体は
約1.0MBで、2.5MB上限内に収まる。

ライセンス: Creative Commons Zero (CC0)
http://creativecommons.org/publicdomain/zero/1.0/

個人・教育・商用のいずれにも制限なく利用でき、クレジット表記は必須ではない。
