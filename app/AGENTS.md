<!-- encoding:UTF-8 -->

# app/

Next.js route。route group でシステムと作品を分離しており、URL にグループ名は現れない。

## 索引

- `(system)/` — デザインシステム側。在庫 screen 実体(`*-01/`)・golden flow demo(`login/`・`dashboard/`・`flows/`)・`example-previews/`
- `(studio)/` — 作品(studioApp)側。ポートフォリオの Page 群
- `(team-t)/` — Team T アプリ側。ポートフォリオ本体から独立した route と専用文書
- `page.tsx`・`orientation/` — `page.tsx` は全アプリのランディング(ハブ。`components/landing-hub.tsx`)で各アプリへ分岐。`orientation/` は作品(studioApp)のイントロ
- `layout.tsx`・`globals.css` — 全体共有

## このディレクトリだけの約束

- `(system)/` の screen 実体は registry(`files[].path`・`localEvidence`)から参照される。移動・改名時は registry のパスと provenance sidecar の再生成まで一体で行う
- 新しい route を追加するときは、どちらの group に属するかを最初に決める。直下に裸のディレクトリを増やさない
