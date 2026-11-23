// 応答の LLM の順番(本人の決定 2026-11-23、avatar-research.md の 3c 節)。
// 1. OpenAI gpt-6.2-astra(reasoning low、Responses API を直接)
// 2. OpenRouter の baidu/ernie-5.5-flash-preview:free(学習する提供元へ回さない data_collection=deny)
// 3. Z.AI の glm-4.7-flash(thinking を切る)
// 2・3 は free-ai-pool の OpenRouter 互換の adapter と同じ呼び方(chat/completions + SSE)を Worker の fetch で直接書いた。

export type ChatTurn = { role: "user" | "assistant"; content: string }

export type Usage = {
  inputTokens: number
  cachedInputTokens: number
  /** キャッシュに書いた分(30 分の枠)。OpenAI だけ返す */
  cacheWriteTokens?: number
  outputTokens: number
}

export type ProviderId = "openai" | "openrouter" | "zai"

export type ProviderSpec = {
  id: ProviderId
  model: string
  paid: boolean
  /** 最初の字が届くまでの待ちの上限。超えたら次へ。 */
  firstTokenTimeoutMs: number
}

export const CHAIN: ProviderSpec[] = [
  { id: "openai", model: "gpt-6.2-astra", paid: true, firstTokenTimeoutMs: 20_000 },
  { id: "openrouter", model: "baidu/ernie-5.5-flash-preview:free", paid: false, firstTokenTimeoutMs: 20_000 },
  { id: "zai", model: "glm-4.7-flash", paid: false, firstTokenTimeoutMs: 60_000 },
]

/**
 * $/100 万トークン。gpt-6.2-astra の公式料金(入力・キャッシュ・出力は 2026-11-23 に確認、avatar-research.md 3c)。
 * キャッシュの書き込み(30 分)の 10.00 は 2026-11-24 に料金表の検索結果で確認(https://developers.openai.com/api/docs/pricing)。
 */
const PRICES: Record<string, { input: number; cachedInput: number; cacheWrite: number; output: number }> = {
  "gpt-6.2-astra": { input: 8.0, cachedInput: 0.4, cacheWrite: 10.0, output: 40.0 },
}

export function costUsd(model: string, usage: Usage): number {
  const p = PRICES[model]
  if (!p) return 0
  const write = usage.cacheWriteTokens ?? 0
  const plain = Math.max(0, usage.inputTokens - usage.cachedInputTokens - write)
  return (
    (plain * p.input +
      usage.cachedInputTokens * p.cachedInput +
      write * p.cacheWrite +
      usage.outputTokens * p.output) /
    1_000_000
  )
}

/** 最悪の場合の 1 回の額。日の上限の見積もりに使う。 */
export function worstCaseUsd(model: string, inputTokensEstimate: number, maxOutputTokens: number): number {
  return costUsd(model, {
    inputTokens: inputTokensEstimate,
    cachedInputTokens: 0,
    cacheWriteTokens: inputTokensEstimate,
    outputTokens: maxOutputTokens,
  })
}

export type StreamEvent = { type: "delta"; text: string } | { type: "usage"; usage: Usage; model?: string }

export class UpstreamError extends Error {
  constructor(
    readonly provider: ProviderId,
    readonly status: number,
    message: string
  ) {
    super(message)
  }
}

type Keys = { OPENAI_API_KEY?: string; OPENROUTER_API_KEY?: string; ZAI_API_KEY?: string }

export function hasKey(spec: ProviderSpec, keys: Keys): boolean {
  if (spec.id === "openai") return Boolean(keys.OPENAI_API_KEY)
  if (spec.id === "openrouter") return Boolean(keys.OPENROUTER_API_KEY)
  return Boolean(keys.ZAI_API_KEY)
}

export async function* streamProvider(
  spec: ProviderSpec,
  keys: Keys,
  system: string,
  turns: ChatTurn[],
  maxOutputTokens: number,
  signal: AbortSignal
): AsyncGenerator<StreamEvent> {
  if (spec.id === "openai") {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal,
      headers: { Authorization: `Bearer ${keys.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: spec.model,
        reasoning: { effort: "low" },
        // instructions に置くとキャッシュが効かなかった(2026-11-24 実測で cached 0 が 3 回)。developer の発言にすると 2 回目から効く
        input: [{ role: "developer", content: system }, ...turns.map((t) => ({ role: t.role, content: t.content }))],
        max_output_tokens: maxOutputTokens,
        store: false,
        stream: true,
        // 事実の束を毎回同じ前置きにし、キャッシュを同じ鍵に寄せる
        prompt_cache_key: "avatar-brain-v1",
      }),
    })
    if (!res.ok || !res.body) throw new UpstreamError(spec.id, res.status, await safeText(res))
    for await (const { event, data } of readSse(res.body)) {
      if (!data || data === "[DONE]") continue
      const obj = JSON.parse(data)
      const type = obj.type ?? event
      if (type === "response.output_text.delta" && obj.delta) {
        yield { type: "delta", text: obj.delta }
      } else if (type === "response.completed" || type === "response.incomplete") {
        const u = obj.response?.usage
        if (u) {
          yield {
            type: "usage",
            model: obj.response?.model,
            usage: {
              inputTokens: u.input_tokens ?? 0,
              cachedInputTokens: u.input_tokens_details?.cached_tokens ?? 0,
              cacheWriteTokens: u.input_tokens_details?.cache_write_tokens ?? 0,
              outputTokens: u.output_tokens ?? 0,
            },
          }
        }
      } else if (type === "response.failed" || type === "error") {
        throw new UpstreamError(spec.id, 502, JSON.stringify(obj.response?.error ?? obj.error ?? obj).slice(0, 300))
      }
    }
    return
  }

  const isRouter = spec.id === "openrouter"
  const url = isRouter
    ? "https://openrouter.ai/api/v1/chat/completions"
    : "https://api.z.ai/api/paas/v4/chat/completions"
  const body: Record<string, unknown> = {
    model: spec.model,
    messages: [{ role: "system", content: system }, ...turns],
    max_tokens: maxOutputTokens,
    stream: true,
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${isRouter ? keys.OPENROUTER_API_KEY : keys.ZAI_API_KEY}`,
  }
  if (isRouter) {
    body.provider = { data_collection: "deny" }
    body.stream_options = { include_usage: true }
    headers["X-Title"] = "portfolio avatar"
  } else {
    body.thinking = { type: "disabled" }
  }
  const res = await fetch(url, { method: "POST", signal, headers, body: JSON.stringify(body) })
  if (!res.ok || !res.body) throw new UpstreamError(spec.id, res.status, await safeText(res))
  for await (const { data } of readSse(res.body)) {
    if (!data || data === "[DONE]") continue
    const obj = JSON.parse(data)
    if (obj.error) throw new UpstreamError(spec.id, 502, JSON.stringify(obj.error).slice(0, 300))
    const text = obj.choices?.[0]?.delta?.content
    if (typeof text === "string" && text) yield { type: "delta", text }
    if (obj.usage) {
      yield {
        type: "usage",
        model: obj.model,
        usage: {
          inputTokens: obj.usage.prompt_tokens ?? 0,
          cachedInputTokens: obj.usage.prompt_tokens_details?.cached_tokens ?? 0,
          outputTokens: obj.usage.completion_tokens ?? 0,
        },
      }
    }
  }
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 300)
  } catch {
    return ""
  }
}

async function* readSse(body: ReadableStream<Uint8Array>): AsyncGenerator<{ event?: string; data: string }> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buf = ""
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    let idx: number
    while ((idx = buf.search(/\r?\n\r?\n/)) >= 0) {
      const raw = buf.slice(0, idx)
      buf = buf.slice(idx).replace(/^\r?\n\r?\n/, "")
      let event: string | undefined
      const data: string[] = []
      for (const line of raw.split(/\r?\n/)) {
        if (line.startsWith("event:")) event = line.slice(6).trim()
        else if (line.startsWith("data:")) data.push(line.slice(5).replace(/^ /, ""))
      }
      if (data.length) yield { event, data: data.join("\n") }
    }
  }
}
