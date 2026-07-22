<!-- encoding:UTF-8 -->

# Portal (`/`) デザイン方針

このリポジトリには複数アプリ(studioApp / Team T / neon-tunnel 等)がある。その**最上位の入り口**が `/` のポータル LP。実体は `components/landing-hub.tsx`(server component・自己完結ダーク)。この文書は**見た目の art-direction 正本**で、別セッションが同じ言語で再現・拡張できるようにする。何を載せるか(コンテンツ/機能スコープ)は別途 `content-plan.md` で計画する。

## North Star

**「おしゃれだけど AI っぽくない」= デザインスタジオ級のエディトリアルな作り込み。**
効果を盛ることが目的ではない。参考は Awwwards の "digital studio / portfolio" 系(ユーザーがダーク+ライトのモックアップを提示)。

## 却下された方向(2026-07-23・回帰禁止)

初稿は「ネオンアーケード全部盛り」(SELECT APP、虹色グラデ見出し、aurora、Tron 床、走査線、点滅ステータス、技術名マーキー、カーソル追従グロー、3D チルト)。→ **「AI が作った感マシマシ」として明確に却下**。ゲーム(`public/team-t-app/games/neon-tunnel.html`)ならネオン全部盛りは正解だが、**LP/ポートフォリオ面では真逆の洗練が正解**。

## やること(Do)

- **左寄せエディトリアル**。中央寄せヒーローにしない。余白をたっぷり取る。
- **巨大で自信のある display type**。見出しは **solid + outline のミックス**(例: 「Ideas,」solid /「built into」outline /「tools.」solid)。outline は `-webkit-text-stroke`。
- **アクセントは一色に絞る**(indigo→cyan グラデ)。使うのは CTA・少数のドット・モチーフの1要素だけ。
- **極細ヘアライン幾何**。手描き感のある線画モチーフ(軌道楕円・ノード・グリッド・同心リング)。1px ストローク。
- **mono の索引・カテゴリラベル**(`01 / AI DESIGN SYSTEM`、`SELECTED APPS`、`03 PROJECTS`)。ラベルは構造上意味のあるものだけ。飾りの座標・年号・eyebrow は載せない(下記「却下」参照)。
- **区切りはヘアライン**。カードは 1px gap を線色地に敷いてグリッド罫線に見せる。
- インタラクションは **CSS のみ・控えめ**(hover で矢印が少し動く / 罫線が accent 2 に灯る / ボタンが浮く程度)。

## 避けること(AI tell・Don't)

虹色グラデ見出し / 走査線 / グロー過多 / 点滅ステータス / 技術名マーキー / カーソル追従グロー / 過剰な 3D チルト。**どれも「AI 製」と即バレする。**

## トークン(現行実装値)

| 用途 | 値 |
|---|---|
| bg / panel | `#0a0d15` / `#0e1220` |
| fg / muted / faint | `#edeff5` / `#7c8497` / `#545c70` |
| line / line-strong | `rgba(255,255,255,.08)` / `rgba(255,255,255,.16)` |
| accent(indigo/cyan) | `#6b76ff` / `#34d6e8`(グラデ `120deg`) |
| 見出し | `--font-sans`(Inter)/ weight 800 / `letter-spacing:-0.045em` / outline は stroke `1.6px` @ fg60% |
| ラベル | `--font-mono`(Geist Mono)/ 大文字 / 広いトラッキング |
| 版面 | `max-width:90rem` 中央寄せコンテナ / hero art は `≥960px` / cards は `≥720px` で3列 |

背景の白漏れ対策: `.lp::before` を `position:fixed; inset:0; z-index:-1` の暗色レイヤーにし、ライトテーマでも白が覗かない(ページはダーク固定)。

## ブランド(暫定・1語で変更可)

- ワードマーク: **higgs1729**(テキストのみ。アイコン/グラデ角丸マークは付けない)
- 見出し: `Ideas, built into tools.` / About: `Useful things, beautifully made.`
- ダーク基調に固定(参考の一番リッチな方を採用)。将来ライト版 or ライト/ダーク両対応にする余地あり。

### 2026-07-23 に撤去したもの(飾り要素の間引き・再追加しない)

ユーザー判断で以下を削除。**display type と作品カードに一点集中**させるため、装飾的なラベルは載せない。

- eyebrow(`● INDEPENDENT DIGITAL STUDIO` / `● ABOUT` の `lp-tick` 付きラベル)
- ナビの `PORTAL / 2026`、メタ行・footer の東京座標 `35.6762°N 139.6503°E`
- ヒーローのリード文(「日々の小さな違和感…入口です。」)
- ブランドのアイコン(`竹内` を入れたグラデ角丸マーク)
- ヒーローアート内の文字ラベル(`BUILD ∞` / `CURIOUS BY DESIGN` フレーム)。アートは軌道ヘアライン + ダイヤ幾何のみで、文字は持たせない。

## 構成(セクション順)

sticky nav(brand・Apps/About/Contact)→ hero(左に見出し + CTA、右に軌道アート)→ `SELECTED APPS` メタ行(件数のみ)→ アプリカード群 → About(大見出し + 説明文)→ footer(brand・リンクのみ)。

## アプリの対応付け(実アプリ・リンク先)

| # | カテゴリ | タイトル | href | モチーフ |
|---|---|---|---|---|
| 01 | AI DESIGN SYSTEM | Studio | `/overview/` | nodes(ノード線画) |
| 02 | WEB API CATALOG | Team T | `/team-t-app/` | grid(カタログ格子) |
| 03 | 3D ARCADE | Neon Tunnel | `/team-t-app/games/neon-tunnel.html` | rings(同心リング) |

クロスアプリ遷移は素の `<a>` + `NEXT_PUBLIC_BASE_PATH` prefix(route は trailing slash、ゲームは静的 html)。GitHub Pages の basePath を尊重する。

## スコープの線引き

この洗練モードは **LP/ポートフォリオ面**の正解。ゲーム/アーケード面は従来どおり "装飾マシマシ"(ただし世界観統一・基準色一色固定)。業務デザインシステム側(`components/` 在庫 block 等)は抑制的・規律的に保つ。
