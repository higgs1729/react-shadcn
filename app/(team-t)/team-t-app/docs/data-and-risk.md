<!-- encoding:UTF-8 -->

# Team T data, permissions, integrations, and risks

- Status: approved
- Based on: approved `product-brief.md`, `jtbd.md`, and `user-flows.md`
- Runtime: GitHub Pages static export under `/react-shadcn/team-t-app/`

## Data ownership

| Data | Source of truth | Runtime | Persistence |
| --- | --- | --- | --- |
| API catalog | Team Tの型付きcatalog data | build output | repository |
| API紹介コンテンツ | 移行した既存HTML assets | iframe | repository |
| Recommendations | catalog item IDの明示リスト | build output | repository |
| Selected API | URL hash `#apiId` | browser | URL |
| Search/category expansion | React UI state | browser | session only |
| Theme/accent/profile | Team T namespaced preferences | browser | localStorage |
| Coins/progress/game result | Team T namespaced reward state | browser | localStorage |
| External API response | third-party API | iframe memory | 原則保存しない |

## Catalog model

原型の `frontend/js/catalog.js` を実行時のglobal scriptとして直接利用せず、Next.jsからimportできる型付きデータへ移行する。V1の最小項目は以下。

```ts
type ApiCatalogItem = {
  id: string
  assetPath: string
  title: string
  category: string
  categoryPath: string[]
  description: string
  apiName: string
  officialUrl?: string
  icon: string
  apiCount: number
  notes?: string
}
```

### Catalog invariants

- `id` は177紹介ページの中で一意
- `assetPath` はTeam T公開asset内の実在HTMLを指す
- `apiCount` は1以上で、合計200を維持する
- category pathは1要素以上
- 原型でカタログ登録済みの177ページ・200 APIはV1の信頼済み掲載対象として全件移行する
- V1開始前の200 API個別疎通確認とavailability分類は要求しない
- 28件の未登録HTMLは自動追加せず、重複・廃止・保留・新規候補へ分類後に判断する

## Asset placement proposal

既存HTMLとゲームをReact componentへ一括変換せず、V1では静的assetとして次へ移行する。

```text
public/team-t-app/api-pages/<category>/<file>.html
public/team-t-app/games/<file>.html
```

GitHub Pagesのbase pathを考慮し、asset URLは文字列連結を各componentへ散らさず、Team T専用のURL helperから生成する。

## Browser-owned state

### Key namespace

Team Tが所有するlocalStorage keyだけを操作する。

```text
team-t:v1:preferences
team-t:v1:profile
team-t:v1:reward
team-t:v1:onboarding
```

- `localStorage.clear()`は禁止
- resetは上記namespaceだけを削除する
- JSON parse失敗、未知のtheme/accent、旧形式は安全な既定値へ戻す
- localStorage利用不能でもcore API探索は動作する
- profile、coin、progressはこのブラウザだけの状態であり、認証済み資産とは表現しない

## Permissions and account boundary

V1には認証・認可されたユーザーを存在させない。全ユーザーが同じ公開カタログと紹介assetを閲覧できる。

- Spring Boot form login、H2、JPA UserはGitHub Pages版へ移植しない
- URL parameterをログイン証明として受け入れない
- 「ログイン」「ログアウト」「アカウント」の表現は使わず、「端末内プロフィール」「このブラウザに保存」「プロフィールを消去」とする
- profileは表示名など低リスクな任意設定だけを持ち、メールアドレス、パスワード、API keyを保存しない
- 将来認証を追加する場合は別backendと脅威モデルを持つ独立判断とする

## External integration boundary

### External API calls

- API呼び出しは既存紹介HTML内のbrowser fetchを当面維持する
- 秘密鍵が必要なAPIをclient codeへ埋め込まない
- ユーザーが一時入力するAPI keyをrepository、URL、localStorage、consoleへ保存しない
- rate limit、CORS、サービス停止をアプリ本体の障害と分離する
- responseに含まれる外部HTMLを未検証のまま`innerHTML`へ渡さない

### Official links

- 外部公式URLであることを示し、同じタブのアプリ状態を不意に失わせない
- 新しいタブを使う場合は `noopener noreferrer` を付ける

## Iframe trust boundary

既存紹介HTMLとゲームHTMLは同じrepositoryにあるが、独立したJavaScriptを実行するため、React UI componentより広い権限を持つ実行コードとして扱う。

### V1 boundary

- repositoryへ取り込んだassetだけをcatalogから参照し、任意URLをiframe `src`へ渡さない
- `assetPath`はallowlist dataからのみ解決し、hashや検索入力から直接pathを作らない
- iframeから親画面の認証情報や秘密情報へアクセスさせない。V1にはそのような情報を置かない
- click-based progressのため同一origin DOMの観測が必要となる。したがってV1の紹介HTMLは「信頼済みrepository code」としてレビュー対象に含める
- 将来sandboxでoriginを分離する場合は、progressを`postMessage`による明示イベントへ置き換える
- iframeの読み込み失敗は親shellで回復可能にする

### Game messages

`game:ended` は次をすべて満たす場合だけ受理する。

- 現在playing状態である
- `event.source` が現在のgame iframeの`contentWindow`と一致する
- `event.origin` が現在のアプリoriginと一致する
- `coin` が有限の整数で、そのゲームに許可された0〜最大報酬の範囲内
- 同一プレイで一度だけ処理する

game iframeのload errorまたは開始タイムアウトでは、消費したコインを一度だけ返却する。ユーザーが正常ロード後に自分で中断した場合は返却しない。

## V1 trust and availability policy

- 原型のカタログ登録済みページは、Team Tが管理する信頼済みrepository assetとして扱う
- 177ページ・200 APIをすべて掲載し、個別の事前疎通確認やavailability badgeはV1の開始条件にしない
- 「信頼済み」は掲載assetの出所と実行許可を指し、外部APIの現在の稼働、CORS、rate limit、応答内容を保証する表現には使わない
- 各紹介ページが持つ既存のsample fallbackや注意事項は維持する
- 実行時に外部APIが失敗してもapp shellを維持し、再試行または別API選択へ戻れるようにする
- 個別availability metadataと定期監査はV1公開後の改善候補とする

## Threats and mitigations

| Risk | Impact | V1 mitigation |
| --- | --- | --- |
| path injection | 任意asset読込 | catalog allowlistからのみURL生成 |
| malicious/stale template script | parent data操作 | 秘密情報を置かず、assetをrepository code review対象にする |
| forged game reward | coin不正増加 | source/origin/schema/range/once検証 |
| localStorage collision | portfolio側データ消失 | `team-t:v1:*` namespace、clear禁止 |
| exposed API key | credential漏洩 | build/runtime保存禁止、必要なら一時memoryのみ |
| external API drift | 誤情報・失敗 | 稼働保証を表示せず、実行時失敗から通常探索へ回復する |
| unsafe external response | XSS | text rendering優先、sanitizationなしのinnerHTML禁止 |
| iframe failure | core flow停止 | shell維持、error表示、別候補へ回復 |
| excessive choices | 初学者が迷う | 検索・階層・おすすめ、全件平坦表示を避ける |
| reward dominates learning | 目的逸脱 | game任意、API探索をprimary、進捗を習熟度と呼ばない |

## Validation boundaries

### Deterministic

- catalog schema
- duplicate ID
- missing asset
- category path
- logical API total 200
- recommendation ID existence
- game file existence
- localStorage key allowlist

### Browser verification

- hash restore
- search/filter/empty recovery
- iframe ready/error
- mobile drawer behavior
- preferences persistence/reset isolation
- game load refund
- forged message rejection

### Human review

- description quality
- 掲載assetの信頼境界と外部APIの稼働保証を混同していないこと
- API page usability
- game導線が強いが探索を妨げないこと

## Human decisions

2026-07-16に以下を承認済み。

1. 原型のcatalogを型付きdataへ変換し、既存HTMLとゲームは`public/team-t-app/`へ静的assetとして移行する
2. V1のclick進捗を守るため、紹介HTMLを同一originの信頼済みrepository codeとして扱う
3. 原型の177ページ・200 APIをV1の信頼済み掲載対象として全件実装する。個別の事前疎通確認やavailability分類は開始条件にしない
