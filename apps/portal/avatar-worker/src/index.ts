/// <reference types="@cloudflare/workers-types" />
import persona from "./persona.md"
import knowledge from "./knowledge.md"
import { Guard, type GuardLimits } from "./guard"
import { synthesizeStream, takeLead, takeSentences } from "./tts"
import {
  CHAIN,
  costUsd,
  hasKey,
  streamProvider,
  UpstreamError,
  worstCaseUsd,
  type ChatTurn,
  type Usage,
} from "./providers"

export { Guard }

type Env = {
  GUARD: DurableObjectNamespace<Guard>
  OPENAI_API_KEY?: string
  OPENROUTER_API_KEY?: string
  ZAI_API_KEY?: string
  IP_SALT?: string
  ALLOWED_ORIGINS?: string
  DAILY_BUDGET_USD?: string
  IP_PER_10MIN?: string
  IP_PER_DAY?: string
  DAILY_MAX_REQUESTS?: string
  MAX_OUTPUT_TOKENS?: string
  MAX_ANSWER_CHARS?: string
  /** 声の合成(Gemini の TTS)。鍵が無ければ声は付けない */
  GEMINI_API_KEY?: string
  TTS_VOICE?: string
  TTS_MODEL?: string
  /** 1 日(日本時間)に声にする字数の上限。超えたら字だけで答える */
  DAILY_TTS_CHARS?: string
  /** 試験用。並べた provider を飛ばす(例 "openai")。本番では置かない。 */
  TEST_SKIP_PROVIDERS?: string
}

const MAX_TURNS = 8
const MAX_USER_CHARS = 400
const MAX_ASSISTANT_CHARS = 800
const MAX_BODY_BYTES = 16 * 1024

// 束の中の維持者向けコメントはモデルに渡さない
const SYSTEM = `${persona}\n\n${knowledge}`.replace(/<!--[\s\S]*?-->/g, "").trim()
// 実測で 1 字 ≒ 0.74 トークン(2026-11-24、6,212 字で 4,570)。見積もりは少し多めの 0.9 で取る
const TOKENS_PER_CHAR = 0.9
const SYSTEM_TOKEN_ESTIMATE = Math.ceil(SYSTEM.length * TOKENS_PER_CHAR)

function num(value: string | undefined, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

function allowedOrigins(env: Env): string[] {
  return (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get("Origin") ?? ""
  const list = allowedOrigins(env)
  return {
    "Access-Control-Allow-Origin": list.includes(origin) ? origin : (list[0] ?? ""),
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  }
}

function json(request: Request, env: Env, body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request, env),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...extra,
    },
  })
}

async function hashIp(ip: string, salt: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${ip}`))
  return [...new Uint8Array(digest)]
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/** 入力を切りそろえる。最後は必ず訪問者の発言。 */
function sanitizeTurns(raw: unknown): ChatTurn[] | null {
  if (!Array.isArray(raw)) return null
  const turns: ChatTurn[] = []
  for (const item of raw.slice(-MAX_TURNS)) {
    if (!item || typeof item !== "object") return null
    const { role, content } = item as { role?: unknown; content?: unknown }
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null
    const text = content.trim().slice(0, role === "user" ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS)
    if (!text) continue
    turns.push({ role, content: text })
  }
  while (turns.length && turns[0].role !== "user") turns.shift()
  if (!turns.length || turns[turns.length - 1].role !== "user") return null
  return turns
}

const LIMIT_MESSAGES: Record<string, string> = {
  ip_burst: "続けての質問が多いので、少し時間をおいてからもう一度どうぞ。",
  ip_day: "今日はたくさん話してもらったので、続きはまた明日お願いします。",
  global_day: "今日はもう答えられる回数を使い切ってしまいました。また明日来てもらえたらうれしいです。",
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) })
    }
    if (request.method === "GET" && url.pathname === "/health") {
      const guard = env.GUARD.get(env.GUARD.idFromName("global"))
      const status = await guard.status()
      return json(request, env, {
        ok: true,
        providers: CHAIN.map((p) => ({ id: p.id, model: p.model, ready: hasKey(p, env) })),
        today: { day: status.day, requests: status.requests, spentUsd: Number(status.spentUsd.toFixed(5)) },
        budgetUsd: num(env.DAILY_BUDGET_USD, 1),
        voice: { ready: Boolean(env.GEMINI_API_KEY && env.TTS_VOICE), ttsChars: status.ttsChars ?? 0, dailyTtsChars: num(env.DAILY_TTS_CHARS, 0) },
      })
    }
    if (request.method !== "POST" || url.pathname !== "/chat") {
      return json(request, env, { error: "not_found" }, 404)
    }

    const origin = request.headers.get("Origin") ?? ""
    if (!allowedOrigins(env).includes(origin)) {
      return json(request, env, { error: "origin_not_allowed" }, 403)
    }
    const length = Number(request.headers.get("Content-Length") ?? "0")
    if (length > MAX_BODY_BYTES) return json(request, env, { error: "too_large" }, 413)
    let body: { messages?: unknown; voice?: unknown }
    try {
      const text = await request.text()
      if (text.length > MAX_BODY_BYTES) return json(request, env, { error: "too_large" }, 413)
      body = JSON.parse(text)
    } catch {
      return json(request, env, { error: "bad_json" }, 400)
    }
    const turns = sanitizeTurns(body.messages)
    if (!turns) return json(request, env, { error: "bad_messages" }, 400)

    const maxOutputTokens = num(env.MAX_OUTPUT_TOKENS, 600)
    const maxAnswerChars = num(env.MAX_ANSWER_CHARS, 700)
    const paidModel = CHAIN.find((p) => p.paid)!.model
    const inputEstimate =
      SYSTEM_TOKEN_ESTIMATE + Math.ceil(turns.reduce((n, t) => n + t.content.length, 0) * TOKENS_PER_CHAR)
    const limits: GuardLimits = {
      ipPer10Min: num(env.IP_PER_10MIN, 10),
      ipPerDay: num(env.IP_PER_DAY, 40),
      dailyMaxRequests: num(env.DAILY_MAX_REQUESTS, 500),
      dailyBudgetUsd: num(env.DAILY_BUDGET_USD, 1),
      reserveUsd: worstCaseUsd(paidModel, inputEstimate, maxOutputTokens),
    }

    const ip = request.headers.get("CF-Connecting-IP") ?? "local"
    const ipHash = await hashIp(ip, env.IP_SALT ?? "avatar-brain")
    const guard = env.GUARD.get(env.GUARD.idFromName("global"))
    const admission = await guard.admit(ipHash, limits)
    if (!admission.ok) {
      return json(
        request,
        env,
        { error: "rate_limited", reason: admission.reason, message: LIMIT_MESSAGES[admission.reason] },
        429,
        { "Retry-After": String(admission.retryAfterSec) }
      )
    }

    const skip = new Set((env.TEST_SKIP_PROVIDERS ?? "").split(",").map((s) => s.trim()).filter(Boolean))
    const chain = CHAIN.filter((p) => hasKey(p, env) && !skip.has(p.id) && (!p.paid || admission.paidAllowed))

    // 声は訪問者が音をオンにしたときだけ(body.voice)。鍵と声の id が無ければ付けない
    const voiceOn = body.voice === true && Boolean(env.GEMINI_API_KEY && env.TTS_VOICE)
    const dailyTtsChars = num(env.DAILY_TTS_CHARS, 0)

    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
    const writer = writable.getWriter()
    const enc = new TextEncoder()
    const send = (event: string, data: unknown) =>
      writer.write(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))

    // 途中で切って usage が届かなかった回の額。入力は全部キャッシュの書き込み、出力は流した字数で見積もる(多めの側)
    const estimateCut = (model: string, chars: number) =>
      costUsd(model, {
        inputTokens: inputEstimate,
        cachedInputTokens: 0,
        cacheWriteTokens: inputEstimate,
        outputTokens: Math.min(maxOutputTokens, Math.ceil(chars * 1.2) + 20),
      })

    // 文が 1 つ終わるたびに合成を始める(本人 2026-11-25「喋り始めが遅い」で stream に替えた)。
    // 合成は並べて走らせ、届いた断片をすぐ voice_chunk { seq, text(その文の最初の 1 つだけ), mime, data: base64[] } で流す。
    // 文の順に鳴らすのはブラウザ(seq の順に並べる)。文の終わりは voice_end { seq, text }、1 つも声が出なければ audio_skip { seq, text }
    const ttsJobs: Promise<void>[] = []
    let ttsSeq = 0
    let ttsBuffer = ""
    let ttsStopped = !voiceOn
    const speak = (sentence: string) => {
      if (ttsStopped) return
      const seq = ttsSeq++
      const job = (async () => {
        let chunks = 0
        try {
          const ok = await guard.reserveTts(admission.day, sentence.length, dailyTtsChars)
          if (!ok) {
            ttsStopped = true
            return
          }
          const abort = new AbortController()
          const timer = setTimeout(() => abort.abort("tts_timeout"), 30_000)
          try {
            await synthesizeStream(
              sentence,
              {
                apiKey: env.GEMINI_API_KEY!,
                voice: env.TTS_VOICE!,
                model: env.TTS_MODEL ?? "gemini-3.8-flash-tts",
                signal: abort.signal,
              },
              async (mime, data) => {
                await send("voice_chunk", chunks === 0 ? { seq, text: sentence, mime, data } : { seq, mime, data })
                chunks++
              }
            )
          } finally {
            clearTimeout(timer)
          }
        } catch (err) {
          console.log(JSON.stringify({ at: "tts", seq, chunks, error: String(err).slice(0, 120) }))
        } finally {
          await send(chunks ? "voice_end" : "audio_skip", { seq, text: sentence })
        }
      })()
      ttsJobs.push(job)
    }
    const ttsDone = () => Promise.all(ttsJobs)
    const feedVoice = (text: string, flush = false) => {
      if (ttsStopped) return
      ttsBuffer += text
      const { sentences, rest } = takeSentences(ttsBuffer)
      ttsBuffer = rest
      // 最初の 1 本は読点で先に切って合成に回す(文の終わりを待たない)
      if (ttsSeq === 0 && !sentences.length) {
        const lead = takeLead(ttsBuffer)
        if (lead) {
          ttsBuffer = lead.rest
          sentences.push(lead.lead)
        }
      }
      for (const s of sentences) speak(s)
      if (flush && ttsBuffer.trim()) {
        speak(ttsBuffer.trim())
        ttsBuffer = ""
      }
    }

    const run = async () => {
      const started = Date.now()
      const attempts: { provider: string; error: string; ms: number }[] = []
      let actualUsd = 0
      try {
        for (const spec of chain) {
          const controller = new AbortController()
          const timer = setTimeout(() => controller.abort("first_token_timeout"), spec.firstTokenTimeoutMs)
          const hardTimer = setTimeout(() => controller.abort("total_timeout"), 90_000)
          const tryStart = Date.now()
          let chars = 0
          let firstMs: number | null = null
          let usage: Usage | null = null
          let resolvedModel = spec.model
          let truncated = false
          try {
            for await (const ev of streamProvider(spec, env, SYSTEM, turns, maxOutputTokens, controller.signal)) {
              if (ev.type === "usage") {
                usage = ev.usage
                if (ev.model) resolvedModel = ev.model
                continue
              }
              if (firstMs === null) {
                clearTimeout(timer)
                firstMs = Date.now() - started
                await send("meta", { provider: spec.id, model: spec.model, voice: voiceOn })
              }
              let text = ev.text
              if (chars + text.length > maxAnswerChars) {
                text = text.slice(0, maxAnswerChars - chars)
                truncated = true
              }
              chars += text.length
              if (text) {
                await send("delta", { text })
                feedVoice(text)
              }
              if (truncated) {
                controller.abort("answer_too_long")
                break
              }
            }
            if (firstMs === null) throw new UpstreamError(spec.id, 502, "empty_answer")
            const cost = usage ? costUsd(spec.model, usage) : spec.paid ? estimateCut(spec.model, chars) : 0
            actualUsd += cost
            feedVoice("", true)
            await ttsDone()
            await send("done", {
              provider: spec.id,
              model: resolvedModel,
              firstTokenMs: firstMs,
              totalMs: Date.now() - started,
              usage,
              costUsd: Number(cost.toFixed(6)),
              truncated,
              fallbacks: attempts,
            })
            return
          } catch (err) {
            if (firstMs !== null) {
              // 途中まで流した後に切れたら、次へは回さずに終える
              if (spec.paid) actualUsd += usage ? costUsd(spec.model, usage) : estimateCut(spec.model, chars)
              feedVoice("", true)
              await ttsDone()
              await send("done", {
                provider: spec.id,
                model: resolvedModel,
                firstTokenMs: firstMs,
                totalMs: Date.now() - started,
                usage,
                truncated: true,
                interrupted: true,
                fallbacks: attempts,
              })
              return
            }
            const reason =
              controller.signal.aborted
                ? String(controller.signal.reason)
                : err instanceof UpstreamError
                  ? `${err.status} ${err.message.slice(0, 120)}`
                  : String(err).slice(0, 120)
            attempts.push({ provider: spec.id, error: reason, ms: Date.now() - tryStart })
            console.log(JSON.stringify({ at: "fallback", provider: spec.id, error: reason.slice(0, 60) }))
          } finally {
            clearTimeout(timer)
            clearTimeout(hardTimer)
          }
        }
        await send("error", {
          code: "all_providers_failed",
          message: "いま混んでいて答えられませんでした。少し時間をおいて、もう一度聞いてもらえますか。",
          fallbacks: attempts,
        })
      } finally {
        await guard.settle(admission.day, admission.reservedUsd, actualUsd)
        await writer.close()
      }
    }
    ctx.waitUntil(run())

    return new Response(readable, {
      headers: {
        ...corsHeaders(request, env),
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-store",
      },
    })
  },
} satisfies ExportedHandler<Env>
