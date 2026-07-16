<!-- encoding:UTF-8 -->

# Team T product brief

- Status: approved
- Evidence date: 2026-07-16
- Source prototype: `sampleforYou/teamT-app - コピー/`

## Product statement

Team Tは、外部Web APIを探し、概要を理解し、実際の操作を試せるAPIギャラリーである。大量のAPI候補をカテゴリ・検索・おすすめから発見できるようにし、ゲーム要素によって探索を続けるきっかけを提供する。

## Confirmed evidence

以下は原型の文書、データ、実装、実画面から確認済み。

- カタログには177の選択可能な紹介ページがある
- 通常ページ175件は1ページにつき1 APIを紹介する
- `API一覧` は1ページで5 API、`API Viewer` は1ページで20 APIを扱う
- 論理的な収録数は `175 + 5 + 20 = 200 API`
- 検索、階層カテゴリ、おすすめ一覧、URLハッシュ復元、iframe previewが動作する
- API紹介ページ内の操作で進捗が上がり、100%でコインを得る
- コインを消費して8種類のミニゲームを起動する
- テーマ、アクセント、端末内設定をlocalStorageへ保存する設計がある
- Spring Boot認証の原型はあるが、GitHub Pagesの静的公開環境では実行できない

## User hypotheses

### Primary user hypothesis

Web APIを学び始めた学生・初学者。公式ドキュメントだけでは用途やレスポンスを想像しづらく、興味のあるAPIを気軽に見つけて試したい人。2026-07-16にprimary userとして承認済み。

### Secondary user hypothesis

- 授業・勉強会でAPI例を紹介する教員、メンター、学生チーム
- 新しい公開APIや実装アイデアを短時間で探索したい開発者

### Assumed user problem

- API情報が複数サイトへ分散し、何ができるAPIなのか比較しにくい
- 認証、CORS、利用停止などにより、試せるAPIと参考情報だけのAPIを判別しづらい
- API学習は成果が見えにくく、複数のAPIを継続して探索する動機が弱い

これらは原型から推定した仮説であり、ユーザー調査では未検証。

## Value proposition

「どのAPIを使えばよいか分からない」状態から、検索またはカテゴリ選択を通じて候補を見つけ、その場で用途と操作結果を確認できる状態へ短時間で移す。

ゲームはAPI探索の代替目的ではなく、APIページを実際に操作した行動へ小さな報酬を返し、次のAPIを試すきっかけにする。利用は任意だが存在を埋もれさせず、初回利用時と報酬獲得時に次の行動が分かる強い導線を持たせる。

## Desired user outcomes

1. 興味・課題・カテゴリからAPI候補を見つけられる
2. 選んだAPIの用途と操作方法を理解できる
3. 利用可能なら、その場で入力または操作を試して結果を確認できる
4. 利用不可の場合も、理由と代替となる確認方法を理解できる
5. 探索の進捗を感じながら、別のAPIへ移れる

## V1 scope

### Core

- 177紹介ページ・200 logical APIsのカタログデータ
- キーワード検索
- 大分類・小分類による階層ナビゲーション
- おすすめ一覧
- API紹介ページの表示
- URLから選択状態を共有・復元する機能
- 原型の177紹介ページ・200 APIを信頼済み掲載対象として全件提供
- desktop / mobileで成立するアプリシェル

### Supporting

- ライト・ダークテーマとアクセント設定
- API操作進捗とコイン
- 8種類のミニゲーム
- 初回からゲームの存在とコイン獲得方法が分かり、API探索の節目でゲームへ自然に移れる導線
- 端末内での状態保存とリセット
- 認証と誤認されない端末内プロフィール

### Deferred

- 本物のユーザー登録・ログイン
- 複数端末間の進捗同期
- 管理画面からのAPI追加・編集
- server-side proxyによるCORS回避や秘密鍵の保護
- 205の既存紹介HTMLをすべてReact componentへ書き直すこと

## Non-goals

- すべてのAPIを本番利用可能と保証するAPI marketplace
- APIキーや利用者の秘密情報をGitHub Pages上で保管すること
- API品質、安全性、SLAをTeam Tが保証すること
- ゲームを遊ばなければAPIを閲覧できない設計
- 現行golden flowからアプリ全体を自動生成すること

## Success criteria

### User outcome

- 初見ユーザーが補助なしで2分以内に、関心のあるAPIを1件探して紹介ページを開ける
- 初見ユーザーの80%以上が、選択したAPIの用途を説明し、試せる場合は主要操作を1回完了できる
- ゲームを利用しなくても、API検索・閲覧・試行の全core flowを完了できる

### Content integrity

- カタログに177の一意なpage IDがあり、参照先ファイルの欠落が0件
- `apiCount` の合計が200となり、複数APIページの内訳と一致する
- 外部APIの稼働を保証する表示は行わず、実行時失敗から別候補へ戻れる

### Product quality

- GitHub Pagesのbase pathを含む直接URLとリロードでcore flowが壊れない
- desktopとmobileで検索、ナビ、preview、設定をキーボードでも操作できる
- core flowの自動テスト、Storybook UI状態、a11y検証が成功する
- Team Tアプリの保存処理が同一origin上の他アプリのlocalStorageを消去しない

### External dependency honesty

- カタログ掲載の信頼と、外部APIの現在の稼働保証を混同しない
- 外部API障害がアプリシェル全体を利用不能にしない

## Constraints

- 既存 `react-shadcn` の静的exportに同居し、GitHub Pagesの `/react-shadcn/team-t-app/` で公開する
- Server Actions、request依存Route Handler、cookiesを使うserver authenticationは利用できない
- クライアントへ秘密鍵を含めない
- 既存HTML資産は段階移行し、最初のvertical sliceではiframe再利用を許可する
- APIカタログが主要データ正本となるため、ID、参照先、API数、状態を機械検証可能にする

## Risks

- 200 APIの保守コストが高く、外部サービスの変更で状態が急速に古くなる
- iframe内ページのUI・アクセシビリティ・セキュリティ品質が不均一
- ゲーム報酬がAPI学習より強くなると、プロダクト目的がぼやける
- 認証原型と端末内プロフィールが混在すると、本物の認証だと誤認される
- 外部APIへのbrowser fetchはCORSとrate limitに左右される

## Human decisions

2026-07-16に以下を承認済み。

1. Primary userは「Web APIを学び始めた学生・初学者」とする
2. ゲームは「API探索を支える任意の報酬ループ」とする。ただし、ユーザーが存在と利用方法に気付ける強い導線を持たせる
3. GitHub Pages版では本物のログインを外し、必要な個人化は「端末内プロフィール」と明示する
