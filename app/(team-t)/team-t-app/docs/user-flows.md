<!-- encoding:UTF-8 -->

# Team T V1 user flows

- Status: approved
- Based on: approved `product-brief.md` and `jtbd.md`
- Scope: V1の操作順序と回復経路。route map、UI component選定、データschemaは次工程で確定する

## Flow priorities

| Priority | Flow | User value |
| --- | --- | --- |
| P0 | APIを発見して紹介ページを開く | 関心に合うAPIへ短時間で到達する |
| P0 | APIの用途・利用状態を理解して試す | 制約を含めて利用可否を判断する |
| P1 | 選択状態を共有・復元する | 授業やチームで同じAPIを参照する |
| P1 | 進捗・コインに気付きゲームを遊ぶ | 探索の区切りと次の探索動機を得る |
| P2 | 外観・端末内プロフィールを調整する | 同じ端末で快適な表示を維持する |

## F0: First visit and orientation

### Trigger

ユーザーがTeam Tアプリの入口を開く。

### Main flow

1. アプリ名と「Web APIを探して、その場で試せる」ことを確認する
2. `177紹介ページ / 200 API` の規模を確認する
3. 検索、カテゴリ、おすすめの3つの探索入口を確認する
4. ゲーム入口、所持コイン、API操作で進捗が増えることを簡潔に確認する
5. 検索・カテゴリ・おすすめのいずれかを選ぶ

### Requirements

- 説明を読まなくても、探索入口の優先順位が視覚的に分かる
- ゲームは初回から発見できるが、API探索のprimary CTAより強くしない
- ゲーム説明はdismiss可能な補助表示または常設の短い説明とし、操作を遮断しない
- 端末内プロフィールをログイン済みアカウントのように表示しない

## F1: Discover an API

### Entry A: Search

1. キーワードを入力する
2. title、API名、説明、カテゴリに一致する候補を見る
3. 候補を1件選択する

### Entry B: Browse categories

1. 大分類を開く
2. 必要なら小分類を開く
3. 項目名と件数から候補を1件選ぶ

### Entry C: Recommendations

1. おすすめ一覧を開く
2. カテゴリ別の推薦候補を見る
3. 候補を1件選ぶ

### Result

- 選択したAPI紹介ページを表示する
- サイドバーの選択状態と共有状態を更新する
- mobileでは選択後にナビゲーションを閉じ、previewへフォーカスを移す

### Empty and recovery

- 検索結果0件: 入力を保持し、検索解除とカテゴリ探索を提示する
- 大分類に項目がない: 空の分類を表示せず、データ不整合として検証で検出する
- おすすめ読込失敗: 通常の検索・カテゴリは利用可能なままにする

## F2: Understand and try an API

### Main flow

1. API名、用途、カテゴリを確認する
2. 紹介ページ内の主要操作を行う
3. レスポンス、生成結果、または失敗理由を見る
4. このAPIを使うか、別の候補へ移るか判断する

### V1 presentation

- 既存の紹介HTMLをiframeで再利用する
- app shell側に、紹介HTMLとは独立したAPI概要を置く
- iframe titleは選択APIを識別できる値にする
- 外部API障害をアプリ全体のerrorにしない

### Error and recovery

- API key required: キーを公開コードへ保存しない注意と、設定方法またはsampleを示す
- CORS restricted: ブラウザ制約であることを示し、公式資料・sample・将来proxyの境界を案内する
- External failure: retry、別API、公式ページのいずれかを提示する
- Missing template: previewを開かず、カタログ不整合として明示する
- iframe blocked or crashed: app shellを維持し、別候補へ戻れるようにする

## F3: Share and restore an API selection

### Main flow

1. APIを選ぶ
2. 選択IDをURLへ反映する
3. URLを共有または保存する
4. 同じURLを開く
5. 同じAPIが選択され、必要なカテゴリ文脈とpreviewが復元される

### V1 decision

- 静的exportと既存資産との互換性を優先し、選択状態は `#<apiId>` を第一候補とする
- 不明なIDや削除済みIDは入口へ戻し、「該当APIが見つからない」と通常探索を提示する
- 検索語や開閉カテゴリはURLへ含めず、共有対象をAPI選択に限定する

## F4: Discover and use the game reward loop

### Discovery points

1. 初回: 常設ゲーム入口、所持コイン、短い仕組み説明を見る
2. 初回進捗増加: 「あと何回でコイン」の文脈通知からゲーム用途を知る
3. コイン獲得: 獲得通知からゲーム一覧を開ける

### Main flow

1. ゲーム入口を開く
2. 所持コイン、各ゲームの消費、難易度、報酬を見る
3. 残高内のゲームを選ぶ
4. コイン消費を確認してゲームを開始する
5. クリアまたはゲームオーバー結果を見る
6. API探索へ戻る、またはゲーム一覧へ戻る

### V1 progress policy

- iframe内の対象操作クリックごとに既存と同じ割合で進捗を増やす
- 進捗は「探索進捗」または「コインまでの進捗」と表示し、API習熟度・理解度・成功率とは呼ばない
- 同じ操作の連打を技術的に完全防止する対応はV1では行わない
- 将来、APIごとの意味ある完了イベントへ置き換えられる境界を残す

### Recovery

- コイン不足: APIを試してコインを得る導線を提示する
- プレイ中断: 消費済みコインは戻らないことを開始前に示す
- 不正または想定外のgame message: 結果と報酬を反映せず、ゲーム一覧へ安全に戻す
- game load failure: 開始時に消費したコインを自動返却し、結果を明示する

## F5: Adjust local preferences

### Main flow

1. 設定を開く
2. ライト・ダークとアクセントを選ぶ
3. 必要なら端末内プロフィールの表示名を設定する
4. 同じブラウザで設定が復元される
5. リセットするとTeam Tが所有する保存キーだけを初期化する

### Requirements

- 「端末内プロフィール」「このブラウザに保存」と明示し、認証と表現しない
- `localStorage.clear()` は使わない
- 旧原型の既知アクセント値は安全な既定値へ移行する
- Team T以外の同一originデータを変更・削除しない

## Cross-flow state inventory

| Area | Required states |
| --- | --- |
| Catalog | default, searching, filtered, empty, invalid-data |
| Recommendations | default, loading, empty, error |
| Preview | unselected, loading, ready, constrained, error, missing |
| Reward | initial, progressing, earned, insufficient-coins |
| Game | list, loading, playing, cleared, failed, interrupted, load-error |
| Settings | default, changed, persisted, reset |

## First vertical slice

最初の実装単位は以下に限定する。

```text
アプリ入口
→ カタログ読込
→ 検索またはカテゴリで候補を探す
→ 1件を選ぶ
→ 既存HTMLをiframe表示
→ #apiIdを更新・復元
→ empty / missing / preview errorから回復する
```

コイン・ゲーム・設定・端末内プロフィールは次のsliceとし、最初のsliceの成立を妨げない。

## Human decisions

2026-07-16に以下を承認済み。

1. 初期画面は特定APIを自動選択せず、探索入口とゲームの短い案内を示すwelcome状態とする
2. V1の共有状態は原型と同じ `#apiId` を維持する
3. ゲーム読込に失敗した場合、開始時に消費したコインを自動返却する
