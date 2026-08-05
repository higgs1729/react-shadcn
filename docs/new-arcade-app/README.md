<!-- encoding:UTF-8 -->

# Arcadeアプリ計画（プロダクト名は仮称）

- 日付: 2026-08-03
- 更新: 2026-08-04
- 状態: アプリ境界、初期ゲーム構成、workspace名、basePathを暫定確定
- workspace: `apps/arcade`
- basePath: `/react-shadcn/arcade`
- 配信URL: `/react-shadcn/arcade/`
- 補足: `arcade` はworkspace名。ユーザー向けの正式なプロダクト名は未決

## 目的

`apps/team-t` の API Arcade が持つ「3D空間を歩き、筐体からWebゲームを起動する」基盤を
再利用し、Team Tとは別の独立アプリを作る。

Team TのAPIカタログへゲームを追加する計画ではない。新アプリ自身が3Dアーケードと
収録ゲームを所有し、初期リリースでは次の2本だけを扱う。

1. 2D弾幕アクション（新規）
2. Neon Tunnel（既存資産を再利用）

## 初期プロダクト境界

```text
新アーケードアプリ
├─ 3Dアーケードロビー
│  ├─ プレイヤー移動・追従カメラ
│  ├─ 2台のゲーム筐体
│  └─ 筐体選択からゲーム起動への遷移
├─ 共通ゲームランタイム
│  ├─ ゲーム表示
│  ├─ 終了・ロビー復帰
│  └─ 読み込み失敗からの回復
└─ games
   ├─ bullet-hell
   └─ neon-tunnel
```

## Team Tから再利用する基盤

現在の参照元は次のとおり。新アプリから `apps/team-t` の内部ファイルを直接importせず、
新アプリ作成時にアプリ非依存部分を抽出するか、新アプリ側へ適応して移す。

| 能力                     | 現在の参照元                                                |
| ------------------------ | ----------------------------------------------------------- |
| 3D Canvas・カメラ・照明  | `apps/team-t/components/team-t-app/team-t-world-canvas.tsx` |
| 3D店内・アーケードモデル | `team-t-world-room.tsx`、`public/world/models/arcade/`      |
| アバター・移動           | `team-t-world-avatar.tsx`、`team-t-world-character.ts`      |
| 入力                     | `team-t-world-controls.ts`                                  |
| 筐体                     | `team-t-world-kiosk.tsx`                                    |
| マテリアル               | `team-t-world-materials.ts`                                 |
| ゲーム表示               | `team-t-game-runtime.tsx`                                   |
| 3Dアセット出典           | `apps/team-t/public/world/CREDITS.md`                       |
| Neon Tunnel              | `apps/team-t/public/games/neon-tunnel.html`                 |

## 再利用しないTeam T固有機能

- APIカタログ、APIプレビュー、検索、紹介ページ
- Team Tのコイン、コスト、報酬ループ
- Team T固有のプロフィール、設定、オンボーディング
- 現在の9本ゲーム一覧と難易度順配置
- Team Tへの帰還ゲート
- `team-t:*` のlocalStorageキー
- `game:ended` の `coin` 値を前提にした親子契約

ゲーム終了通知は新アプリ専用の最小契約として再定義する。少なくとも
「ゲームID」「終了理由」「ロビーへ戻れる状態」を扱い、コインは必須にしない。

## アプリ分離の原則

- 新アプリは独立した `apps/arcade`、`package.json`、`next.config.ts` を持つ。
- 新アプリの依存は新workspaceへ追加し、ルート `package.json` へアプリ依存を足さない。
- GitHub Pages向け静的exportを維持し、サーバーランタイムを要求しない。
- `basePath` は `/react-shadcn/arcade`、配信URLは `/react-shadcn/arcade/` とする。
- workspace作成時に、ルートの配信合成とポータル導線へこの配信先を追加する。
- Team Tのコードを壊さないよう、最初は2筐体のvertical sliceで分離境界を検証する。
- 共通化は「両アプリで同じ責務とAPIが確認できた部分」だけに限定する。

## 文書

- [bullet-hell-gameplay-visual-spec.md](bullet-hell-gameplay-visual-spec.md) — 2D弾幕アクションの確定画面とWeb実装仕様
- [arcade-lobby-map-spec.md](arcade-lobby-map-spec.md) — 再利用する3Dアーケードロビーをゾーン分割の和風ゲームセンターへ刷新する計画・ビジュアル仕様

## 次の設計ゲート

文書上で暫定確定した `apps/arcade` と `/react-shadcn/arcade` を前提に、実装開始時は次を行う。

1. 新workspaceと静的export設定を作る
2. 3Dロビーを2筐体だけで起動する
3. Neon Tunnelを起動し、終了してロビーへ戻るvertical sliceを通す
4. 共通ランタイム契約を固定する
5. 弾幕ゲームの静止構図・HUD vertical sliceへ進む

## 未決事項

- 新アプリの正式名称
- Team Tとの共通基盤を `packages/` へ抽出する時点
- ゲーム終了通知の正確な型
- ゲーム起動に通貨・アンロック・進行状態を設けるか
- Neon Tunnelを同一HTMLのまま使うか、TypeScriptへ移植するか
