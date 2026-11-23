# avatar-worker(分身アバターの会話の頭脳)

ポートフォリオ(apps/portal、GitHub Pages)の分身アバターが答えるための Cloudflare Worker。鍵はここ(Worker の secret)だけに置き、ブラウザには出さない。計画は `C:/agents/notes/就活/portfolio/avatar-research.md` の 3・3c 節。

## 中身

| ファイル | 役目 |
|---|---|
| `src/index.ts` | `POST /chat`(SSE で答えを流す)と `GET /health`。呼び元の確認、入力の切りそろえ、LLM の順番の切り替え、答えの長さの上限 |
| `src/guard.ts` | Durable Object 1 つで、IP ごとの回数・全体の 1 日の回数・1 日の OpenAI の使用額を数える。IP はソルト付きのハッシュで持つ。日の切り替えは日本時間の 0 時 |
| `src/providers.ts` | 順番: gpt-6.2-astra(reasoning low、Responses API)→ OpenRouter の `baidu/ernie-5.5-flash-preview:free`(`data_collection: deny`)→ Z.AI の `glm-4.7-flash`(thinking off)。429・5xx・最初の字までの時間切れ(20 秒・20 秒・60 秒)で次へ。字を流し始めた後は切り替えない |
| `src/tts.ts` | 答えに本人の声(Gemini 3.8 Flash TTS の複製の声 `TTS_VOICE`)を付ける。答えの文が 1 つ終わるたびに合成を始め、文の順に `audio` で流す。`/chat` の中でだけ呼ぶので、この Worker が作った答え以外は声にならない |
| `src/persona.md` | 口調と守ること(一人称は僕、答えない物は「守秘のため控えます」、無いことは作らない) |
| `src/knowledge.md` | 事実の束。正本は `C:/dev/agent-workspace/profile/` と `apps/portal/lib/works.ts`。**公開してよい物だけ**を手で束ねた。学校名・学年・電話・住所・メール・金額・直接契約の先方の名前は入れていない(持っていない事実は漏れない) |
| `scripts/dev.mjs` | 鍵をファイルに書かずに `wrangler dev` を立てる(OPENAI はユーザー環境変数、OpenRouter・Z.AI は free-ai-pool の `.env` から読んで子プロセスの環境にだけ渡す) |
| `scripts/ask.mjs` | 質問の JSON を流して、答え・秒・費用を JSONL に出す |

persona と knowledge は Responses API の **developer の発言**として先頭に置く。`instructions` に置くとキャッシュが効かなかった(2026-11-24 実測)。developer にすると 2 回目から約 4,570 トークンがキャッシュされ、1 回の費用が約 $0.04 → 約 $0.006 になった。

## API

`POST /chat`、本文 `{ "messages": [{ "role": "user" | "assistant", "content": "..." }], "voice": true }`(`voice` は訪問者が音をオンにしているときだけ true)(直近 8 発言、訪問者は 1 発言 400 字まで)。`Origin` が `ALLOWED_ORIGINS` に無いと 403。

返りは `text/event-stream`:

- `meta` `{ provider, model }` — 最初の字の直前
- `delta` `{ text }` — 答えの断片
- `done` `{ provider, model, firstTokenMs, totalMs, usage, costUsd, truncated, fallbacks }`
- `audio` `{ seq, text, mime, data }` — voice が true のとき、文ごとの声(base64。`audio/wav` か 24kHz・mono・16bit の PCM)。末尾に長い無音が付くことがあるので、ブラウザ側で切って音量をそろえる(`lib/avatar-voice.ts`)
- `audio_skip` `{ seq, text }` — その文は声にできなかった(1 日の字数の上限・合成の失敗)。画面は字だけで続ける
- `error` `{ code: "all_providers_failed", message, fallbacks }` — 全部だめなとき。`message` はそのまま画面に出せる文

上限に当たると 429 の JSON `{ error: "rate_limited", reason, message }` と `Retry-After`。

## 上限(`wrangler.jsonc` の vars)

| 名前 | 既定 | 当たったとき |
|---|---|---|
| `IP_PER_10MIN` / `IP_PER_DAY` | 10 / 40 | 429(LLM を呼ばない) |
| `DAILY_MAX_REQUESTS` | 500 | 429。無料のモデルも呼ばずに止まる |
| `DAILY_BUDGET_USD` | 1.00 | その回の最悪の額を足すと超える見込みなら OpenAI を呼ばず、無料の 2 つだけで答える |
| `MAX_OUTPUT_TOKENS` / `MAX_ANSWER_CHARS` | 600 / 700 | 上流に上限を渡し、Worker でも字数で切って上流を止める |
| `DAILY_TTS_CHARS` | 5000 | 1 日(日本時間)に声にする字数。超えた文は `audio_skip`(字だけ)。Gemini TTS の月の上限 ¥800 に収める見込みの値(料金は公開の表からの見積もり、請求は未確認) |

額は回の前に最悪の値を取り置き、終わったら実際の usage で精算する(Durable Object が直列に処理するので、同時に来ても上限をすり抜けない)。

## ローカルで試す

```
node apps/portal/avatar-worker/scripts/dev.mjs                       # 127.0.0.1:8788
node apps/portal/avatar-worker/scripts/dev.mjs --skip openai          # 予備の切り替えを試す
node apps/portal/avatar-worker/scripts/dev.mjs -- --var DAILY_BUDGET_USD:0.05
node apps/portal/avatar-worker/scripts/ask.mjs questions.json out.jsonl
```

`npx wrangler` はこのリポジトリの workspaces のせいで `apps/portal` を作業場所と見なすので、**必ず `--config <このフォルダ>/wrangler.jsonc` を付ける**(dev.mjs は付けている)。状態は `%TEMP%/avatar-brain-state` に置く。

## 本番に出す

2026-11-24 に出した: https://react-shadcn-avatar-brain.higgs1729.workers.dev 。`node apps/portal/avatar-worker/scripts/deploy.mjs` が deploy と secret 5 本(声の GEMINI_API_KEY を含む)をまとめてする(下は手で打つ場合)。

```
npx -y wrangler@4 secret put OPENAI_API_KEY --config apps/portal/avatar-worker/wrangler.jsonc
npx -y wrangler@4 secret put OPENROUTER_API_KEY --config apps/portal/avatar-worker/wrangler.jsonc
npx -y wrangler@4 secret put ZAI_API_KEY --config apps/portal/avatar-worker/wrangler.jsonc
npx -y wrangler@4 secret put IP_SALT --config apps/portal/avatar-worker/wrangler.jsonc
npx -y wrangler@4 secret put GEMINI_API_KEY --config apps/portal/avatar-worker/wrangler.jsonc   # 値はユーザー環境変数 GEMINI_PAID_API_KEY
npx -y wrangler@4 deploy --config apps/portal/avatar-worker/wrangler.jsonc
```

本番の `ALLOWED_ORIGINS` は `https://higgs1729.github.io` だけ(手元の試しは dev.mjs が localhost を足す)。Origin はブラウザ以外なら偽れるので、本当の守りは回数と額の上限。OpenAI の管理画面の月の予算も別に掛けておく。画面には「AI が答えています。質問は AI の提供元に送られます」を出す(Z.AI の表示義務)。
