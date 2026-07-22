# APIワールド — ゲーム選択UIを3Dマップへ置き換える(委託実行計画)

ご質問は「/simplify を実行して」ではなく、このスキル(および一般のスキル)を動かすモデルと reasoning は何がいいかという設計の相談ですね。レビューは走らせず、そこに答えます。

/simplify の場合
4体のクリーンナップエージェント(reuse / simplification / efficiency / altitude)は、確定した diff を決まった観点で読む、範囲の狭い分析タスクです。探索空間が小さく正解の形も決まっているので:

推奨: Sonnet 5 / medium
4観点はそれぞれ役割が明確で、Opus を4体並べるのは過剰。medium 思考は「もっと単純な形はないか」を詰めるのにちょうどよく、low だと reuse/altitude(既存ヘルパの発見・一般化の提案)で見落としが出やすい。
適用フェーズ(dedup して直す統括)は今のメインセッション=Opus 4.8 のままでよい。ここは判断が要るので下げない。
つまり 「観点分割された fan-out は Sonnet/medium、統括と適用は上位モデル」 の組み合わせです。計画書の「A=Sonnet/medium, B=Opus/high」と同じ発想。

スキル全般の指針
タスクが要求する判断・探索の量に合わせる、が原則。迷ったら確実に解ける最低ラインから始めて、外したときだけ上げる。

タスクの性質	モデル	reasoning	例
機械的・仕様確定・答えが一意	Sonnet 5	low〜medium	アセット選別/コピー、validator、文書生成、dispatch、決まったチェックリスト実行
観点が狭い fan-out(1体1観点)	Sonnet 5	medium	/simplify の4エージェント、/code-review の個別観点
相互依存・correctness 重視・設計判断	Opus 4.8	high	契約層/ライフサイクルが絡む実装(今回の Phase B)、アーキテクチャ設計
探索空間が広く多段推論が要る	Opus 4.8	high〜xhigh	原因不明のバグ調査、未知の未知が多い設計
reasoning を上げる判断軸はモデルの賢さとは別軸で、「一発の変換/参照で終わるか(=低)」「多段の演繹や広い探索が要るか(=高)」。コストと遅延に効くので、賢さが足りないのか思考が足りないのかを切り分けて、必要な方だけ上げるのが無駄がないです。

補足: 今 Phase B のコードは書き終わり、型検査クリア・lint 修正中(kiosk と city のマテリアルを ref 化済み)まで来ています。この相談のあと、実際に /simplify のレビューを回しますか? それとも lint 残りを片付けて Phase B を締める(レビュー2待ち)方に進めますか。

## Context

`app/(team-t)` のゲーム機能は現在、サイドバーの「ゲーム」ボタン →
`TeamTGameDialog`(装飾フレーム付きダイアログ)→ 横スクロールカルーセルで9本から1本選ぶ、
という構造になっている。カルーセルは平面的なリストであり、9本を並べる以上の意味を持たない。

これを **APIワールド** —— 歩き回れる3Dのネオン電脳都市 —— に置き換える。
中央プラザを9つのアーケード筐体が取り囲み、プレイヤーはアバターを操作して
遊びたい筐体まで歩いていき、その場でゲームを起動する。

アセットは [kenney.nl](https://kenney.nl/assets)(CC0)から取得する。
Kenney が**構造**(建物・道路・アバター)を供給し、**ネオンの発光**は
`neon-tunnel.html` で実証済みの手続き的ジオメトリで足す、という分担にする。

### 確定した設計判断(人間の選択)

| 論点 | 決定 |
| --- | --- |
| 地形 | ネオン電脳都市。中央プラザ + 9筐体のリング配置 |
| 操作 | 三人称追従カメラ + WASD/矢印 |
| 設置場所 | ビューポート全面のオーバーレイ(装飾フレーム付きダイアログは廃止) |
| 3Dスタック | react-three-fiber + drei |
| 「API」の射程 | **世界観のみ。** `catalog.json` とは連携しない |
| フォールバック一覧 | **作る。** ただし発火条件は下記の通り reduceMotion を含まない |
| モバイル | **範囲外。** モバイル幅ではフォールバック一覧を出す |
| reduceMotion | **APIワールドは3Dを必ず出す(例外化)。** 設定は削除しない |
| 筐体配置 | 難易度順。やさしい3本がスポーン正面、時計回りに難化 |

#### reduceMotion の扱い(要点)

この設定は OS の `prefers-reduced-motion` ではなく Team T 自前の端末内設定
(`lib/team-t-app/preferences.ts:62`)であり、どのUIが読むかはこちらの裁量。
よって以下とする:

- **on でも3Dワールドは出す**(世界観優先)
- on のときは**ワールド内部の動きを減らす** — カメラ追従のラグとスウェイを切り、
  待機アニメーションと環境ドリフトを止める。移動そのものは残す
- フォールバック一覧の発火条件から reduceMotion を外す

これにより設定は死なず、かつ 3D が必ず見える。

### この変更が守らなければならないもの

`components/team-t-app/team-t-game-dialog.tsx` が実装している
**ゲーム側契約**は9本すべてが依存しており、一切変更しない。
`app/(team-t)/team-t-app/docs/game-selection.md` に正本がある。

| 契約 | 現在の実装箇所 |
| --- | --- |
| `postMessage({type:"game:ended", coin})` を受け取る | `team-t-game-dialog.tsx:109` |
| `event.origin !== window.location.origin` を拒否 | `:104` |
| `event.source !== iframe.contentWindow` を拒否 | `:105` |
| `coin` は `0`〜`maxReward` の整数、`0` は失敗 | `:110-117` |
| 10秒以内に `load` しなければ `load-error` + コイン返却 | `:92-97` |
| コインは**起動前**に減算(`onSpend`)、失敗時に返却 | `:130-136` |
| `sandbox="allow-scripts allow-same-origin allow-pointer-lock"` | `team-t-game-runtime.tsx` |

この層は `team-t-game-runtime.tsx` へ**逐語的に**切り出す。移設であって書き直しではない。

### 環境制約(調査済み)

- `next.config.ts` は `output: "export"`。サーバランタイムなし、GitHub Pages 配信
- アセットは `public/` に置き `NEXT_PUBLIC_BASE_PATH` 経由でURL生成
  (既存 `lib/team-t-app/games.ts:96` `getTeamTGameUrl` と同じ流儀)
- `public/team-t-app/` は現在 5.9MB。GLB追加は **2.5MB以内**
- React 19.2.4 / Next 16.2.6 に対し `@react-three/fiber@9.6.1`(peer: `react >=19 <19.3`)、
  `@react-three/drei@10.7.7`、`three@0.185.1` が適合することを `npm view` で確認済み
- `scripts/validate-team-t-app.mjs:15` の `expectedGameAssets` は9本目 `neon-tunnel.html`
  が漏れており、既に実態とずれている
- `public/team-t-app/game-previews/neon-tunnel.png` が未作成
  (`game-selection.md` に既知の未完了として記録あり)。フォールバック一覧で404になるため本作業で解消する

---

## フェーズ分割(委託実行)

切れ目は**推奨モデルの変化**と**人間のレビュー地点**に置いた。
同一モデルで済む範囲は分割していない。

| # | フェーズ | モデル | reasoning | 直後のゲート |
| --- | --- | --- | --- | --- |
| A | アセット調達と足場 | **Sonnet 5** | medium | ✅ レビュー1 |
| B | ワールド実装(一体) | **Opus 4.8** | high | ✅ レビュー2 |
| C | 実地検証と修正 | **Opus 4.8** | high | ✅ レビュー3 |
| D | validator・story・文書 | **Sonnet 5** | medium | ✅ 最終 |

モデル切替は A→B と C→D の2回のみ。B と C はモデルが同一で、
切れ目はモデル変化ではなく**レビュー地点**。よって reasoning は上位側(high)へ統一した。

---

### Phase A — アセット調達と足場 · Sonnet 5 / medium

**なぜ Sonnet か**: ネットワーク取得・zip展開・ファイル選別・コピー。
選別も「平屋根の中層ビル」程度の制約付きで、設計判断が発生しない。
外した場合の手戻りは直後のレビュー1で止まる。

1. `npm i three @react-three/fiber @react-three/drei` / `npm i -D @types/three`
2. Kenney から3パックを取得(すべてCC0、glTF/OBJ/FBX同梱を確認済み)

   | パック | 用途 | 取るモデル |
   | --- | --- | --- |
   | [City Kit (Commercial)](https://kenney.nl/assets/city-kit-commercial) (4.1MB zip) | 筐体の躯体・背景スカイライン | 平屋根の中層ビル 6〜8棟 |
   | [City Kit (Roads)](https://kenney.nl/assets/city-kit-roads) | プラザから各筐体への放射路 | 直線・交差・カーブ 5〜6枚 |
   | [Mini Characters](https://kenney.nl/assets/mini-characters) | アバター(リグ+アニメーション付き) | 1体 |

3. **パック丸ごとはコミットしない。** 使うGLBだけを `public/team-t-app/world/models/` へ置く
4. `public/team-t-app/world/CREDITS.md` に出典・バージョン・CC0を記録
5. サイズ計測(≤2.5MB)と、各GLBが実際に parse できることの確認

**先に確かめること**: zip展開後の glTF が `.glb` 単一か `.gltf + .bin + texture` 分割か。
分割なら読み込みパスが増えるだけで方針は変わらない。
ネットワーク取得が環境的に不可なら、そこで止めて報告する(人間が手動DLへ切替)。

**レビュー1**: 抽出したモデルのプレビューを見て採否を判断する

---

### Phase B — ワールド実装 · Opus 4.8 / high

**なぜ Opus / なぜ分割しないか**: 契約層の correctness、r3f のライフサイクル
(プレイ中は `frameloop="never"` で止めて GLB 再読込を避ける)、マテリアル上書きの見た目、
当たり判定と移動が相互に依存する。分割すると境界でこれらが噛み合わなくなる。
xhigh でなく high なのは、設計判断が本計画で固定済みで探索空間が狭いため。

#### B-1. データ層 — `lib/team-t-app/world.ts`(新規)

React に依存しない純データ(`lib/team-t-app/AGENTS.md` の約束)。

- `teamTWorldKiosks` — 9本の配置。`teamTGames` から id で導出し、ゲーム定義を二重に持たない
- `getTeamTWorldAssetUrl(fileName)` — `getTeamTGameUrl` と同型
- `TEAM_T_WORLD_PALETTE` — `neon-tunnel.html` の値を正本として共有
  (`--void:#05030a` `--amethyst:#9b6cff` `--magenta:#d84bff` `--gold:#d8bf88`)
- `WORLD_LAYOUT` — プラザ半径・リング半径・当たり判定半径・インタラクト距離(3.5)

**筐体配置(決定)**: やさしい3本をスポーン正面に置き、時計回りに
「ふつう」3本 →「むずかしい」3本 と並べる。奥へ行くほど難しくなる、という
地形の意味を持たせる。40°間隔・リング半径22の等間隔配置。

#### B-2. 契約層の逐語移設 — `team-t-game-runtime.tsx`(新規)

`team-t-game-dialog.tsx` の `GameRuntime` と postMessage/タイムアウト/返却ロジックを
**逐語的に**移す。ロジックの改善・整理は一切しない。ここだけは差分を読んで
移設であることが確認できる状態にする。

#### B-3. 3D本体 — `components/team-t-app/` へフラット配置

サブディレクトリは作らない。この階層は既にフラット+接頭辞で運用されており、
`world/` を切ると `AGENTS.md` + `CLAUDE.md` のシム対を新設する必要が出る
(ルートAGENTS.mdは「規則が繰り返し発生してから追加する」としている)。

| ファイル | 責務 |
| --- | --- |
| `team-t-world-overlay.tsx` | 全面オーバーレイ。探索・チュートリアル・スキン・briefing・playing・resultを所有。ヘッダーHUD(コイン残高・遊び方・スキン・退出)、遅延Canvas、フォールバック一覧を持つ |
| `team-t-world-canvas.tsx` | r3f `<Canvas>`。フォグ・ライティング・地面グリッド・カメラ追従 |
| `team-t-world-city.tsx` | 静的ジオメトリ。道路タイル・背景スカイライン(`<Instances>`)・中央のAPIコア |
| `team-t-world-avatar.tsx` | アバターGLB・アニメーションミキサー・移動・円形当たり判定 |
| `team-t-world-kiosk.tsx` | 筐体1基。建物GLB + 手続き的ネオン看板 + 近接検出 + drei `<Html>` ラベル |
| `team-t-world-controls.ts` | キーボード入力を ref へ集約 |

`team-t-game-dialog.tsx` は削除する。

#### B-4. 見た目 — Kenney の平坦パステルを電脳都市へ寄せる

三段構え:

1. **色調** — 読み込んだGLBを走査し `material.color` にダークな紫トーンを乗算。アトラスのUVは保つ
2. **フォグ** — `FogExp2(#05030a, 0.02)` で地平線と世界の端を消す。
   低いアンビエント + 紫のヘミスフィアライト + 金のキーライト
3. **発光は手続き的に足す** — 窓の光・看板・路面ライン・APIコアの柱は Kenney のモデルではなく
   `PlaneGeometry` + 加算合成で自前生成する。`neon-tunnel.html` が実証した方式で、
   アセットを増やさずに発光が制御できる

`game-selection.md` に記録済みの教訓を踏襲する:
**加算合成の画面で「派手にする」方向の演出は視認性を壊す。**
危険色(橙〜赤)は使わず、金 `#d8bf88` は構造(APIコア・筐体の縁)に限定する。

#### B-5. 体験のループ

1. プラザ中央にスポーン。カメラはアバター後方やや上
2. WASD/矢印で移動、Shiftでダッシュ、Spaceでジャンプ、Eでうなずく。カメラがラグ付きで追従(reduceMotion 時はラグとスウェイを切る)
3. 筐体から 3.5 以内で看板が点灯し、3D空間内のラベルにゲーム名・コスト・最大報酬
4. `Enter` / クリック → **briefing** パネル(現行 footer が持っていた説明+プレイボタン相当)
5. プレイ → `TeamTGameRuntime` を3Dの上へオーバーレイ。
   **キャンバスは unmount せず `frameloop="never"` で停止**(GLB再読込を避ける)
6. 終了 → `exploring` へ戻り、アバター足元でコイン演出

#### B-6. フォールバック一覧

同じオーバーレイ内にカード一覧を出す。既存プレビュー画像を再利用。
選択→ブリーフィング→プレイの導線は3Dと共通。**発火条件**:

- モバイル幅
- WebGL コンテキスト生成に失敗
- GLB 読み込みに失敗

(reduceMotion は含めない)

#### B-7. 配線

- `team-t-app-shell.tsx:369` の `<TeamTGameDialog>` を `<TeamTWorldOverlay>` へ差し替え。
  `coinCount`/`onSpend`/`onRefund`/`onAward` は**そのまま**。`preferences` を追加で渡す
- `team-t-sidebar.tsx:116` のボタンは維持。ラベルを「ゲーム」→「APIワールド」へ

**レビュー2**: ワールドが歩ける状態で確認

---

### Phase C — 実地検証と修正 · Opus 4.8 / high

**なぜ Opus / high か**: 見つかる不具合は r3f のライフサイクル、マテリアル合成、
契約の取りこぼしのいずれかで、B と同じ理解が要る。モデルを落とすと
「動いているように見えるが契約が壊れている」を見逃す。

1. `npm run typecheck` / `npm run lint`
2. dev サーバ起動 → `/team-t-app/` → サイドバーからワールドを開く
   - コンソールに WebGL / GLB 読み込みエラーがないこと
   - WASD入力 → 移動とカメラ追従をスクリーンショットで確認
   - 筐体へ接近 → ラベル点灯
3. **契約の実地確認** — 筐体からゲームを1本起動し、
   - 起動前にコインが減ること
   - クリア時に `game:ended` が届きコインが加算されること
   - 10秒タイムアウト時に返却されること
4. モバイル幅に変更 → フォールバック一覧が出ること
5. reduceMotion を on → **3Dが出たまま**、カメラのラグとスウェイが消えること
6. `public/team-t-app/game-previews/neon-tunnel.png` を作成
   (ネオントンネルを起動してスクリーンショットを撮る)
7. `npm run build` 後、`three` が初期チャンクに載っていないことを
   `out/_next/static/chunks/` で確認

**レビュー3**: 検証結果とスクリーンショットを確認

---

### Phase D — validator・story・文書 · Sonnet 5 / medium

**なぜ Sonnet か**: 規則が明文化済みで正解が一意。探索がない。

1. `scripts/validate-team-t-app.mjs` — `expectedGameAssets` のハードコードをやめ
   `lib/team-t-app/games.ts` から導出する形に直す(9本目の漏れを構造的に解消)。
   同じ仕組みで `world.ts` が参照する GLB の存在も検証する
2. `components/team-t-app/team-t-world-overlay.stories.tsx` —
   DOM 側の状態(フォールバック一覧・briefing・playing・読み込み中)を story にする。
   WebGL 依存の状態は story にしない
3. 文書
   - `app/(team-t)/team-t-app/docs/api-world.md` 新規(1行目 `<!-- encoding:UTF-8 -->`)。
     ワールド構造・アセット出典・見た目の設計判断・フォールバック発火条件・
     reduceMotion の例外化理由を記録
   - `docs/AGENTS.md` の索引に1行追加
   - `docs/game-selection.md` — ゲーム側契約は不変である旨と、選択UIの正本が
     `api-world.md` へ移ったことを追記。`neon-tunnel.png` 未完了項目を解消済みへ
   - `docs/architecture.md:55` の後続判断「reward、game runtimeの詳細component API」を更新
   - `components/team-t-app/AGENTS.md` の索引を更新
4. `npm run validate`

---

## トリップワイヤ

- [ ] `public/team-t-app/world/` が 2.5MB を超えたらモデル点数を削る
- [ ] ワールドを開いてから操作可能までが3秒を超えたら、ローディング表示の要否を再検討
- [ ] Kenney のアトラスと発光の合成が破綻したら、建物も手続き的ジオメトリへ倒す
      (`neon-tunnel.html` に前例あり)
- [ ] Phase B が想定の2倍に膨らんだら、筐体を9基から3基へ落として先に一周通す

---

## 店内UXの追補（2026-07-23）

- 奥壁の `API ARCADE` HTML看板は撤去し、3D空間内にブランド文字を重ねない
- 店内は発光体そのものを増やさず、環境光・半球光・紫/金の点光源で筐体と床を読める明るさにする
- 初回入場時は「移動と筐体起動」「コインと結果」の遊び方2画面に続けて「スキン選択」を表示する
- 完了状態と選択スキンは `team-t:v1:arcade-world` に端末内保存し、2回目以降は自動表示しない
- 完了後はヘッダー右上に「遊び方」と「スキン」を別々に置く。「遊び方」の再表示にはスキン選択を含めず、「スキン」からいつでも見た目だけを変更できる
- 現行のゲーマーGLBは1体だけなので、モデル形状と移動アニメーションを共有した4つの色・発光アクセントをスキンとして提供する。将来別モデルへ差し替えられるよう、スキン定義は `world.ts` に集約する
- スキン選択には選択中モデルの全身3Dプレビューを置き、待機・歩行・ダッシュ・ジャンプ・うなずきのアニメーションを切り替えられるようにする。`reduceMotion` が有効な場合だけ静止プレビューにする
- キャラクター操作は WASD/矢印で移動、Shift+移動でダッシュ、Spaceでジャンプ、Eでうなずく。Eとの競合を避けるため、筐体と帰還ゲートはEnterまたはクリックで操作する
- 画面下の常設操作ヒントは撤去し、操作説明の正本を初回チュートリアルと右上の「遊び方」に集約する
