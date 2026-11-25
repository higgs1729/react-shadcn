// 答えに本人の声を付ける。Gemini の TTS(本人の声の複製)を、答えの文が 1 つ終わるたびに呼ぶ。
// 鍵は Worker の secret(GEMINI_API_KEY)だけに置き、ブラウザには出さない。
// 別の口(/tts)を作らず /chat の中でだけ呼ぶので、この Worker が作った答え以外は声にならない
// (訪問者が好きな文を読ませる無料の TTS にされない)。字数は Guard の 1 日の上限から取る。
// 音量は合成のたびに少しずつ違うので、ブラウザ側で -16 LUFS 相当に寄せる(Worker は CPU を使わず中継だけ)。
// 合成は stream で受けて、届いた断片をそのまま流す(本人 2026-11-25「喋り始めが遅い」)。
// 2026-11-26 の実測(同じ 45 字): 一括は 6.3 秒で全部、stream は 3.5 秒で最初の断片・以後は再生の 2〜5 倍の速さで届く。
// 一括は文が短くても 5.5 秒かかり、最初の音までは文の長さでほとんど縮まない。

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions"

export type TtsAudio = { mime: string; data: string }

/** 文の終わり。ここで区切って先頭の文から声にする。 */
const SENTENCE_END = /[。！？!?\n]/

/** 溜まった字から、終わった文を取り出す。残りは次へ持ち越す。 */
/**
 * 答えの最初の 1 本だけ、文の終わりを待たずに読点で切る。最初の声を少しでも早く合成に回すため。
 * 短すぎる頭(「はい、」など)は切らない。
 */
export function takeLead(buffer: string): { lead: string; rest: string } | null {
  const i = buffer.search(/[、,，]/)
  if (i < 9) return null
  return { lead: buffer.slice(0, i + 1).trim(), rest: buffer.slice(i + 1) }
}

export function takeSentences(buffer: string): { sentences: string[]; rest: string } {
  const sentences: string[] = []
  let start = 0
  for (let i = 0; i < buffer.length; i++) {
    if (!SENTENCE_END.test(buffer[i])) continue
    // 「。」が続く・閉じ括弧が続くときは、そこまで含める
    let end = i + 1
    while (end < buffer.length && /[。！？!?」』）)\n]/.test(buffer[end])) end++
    const s = buffer.slice(start, end).trim()
    // 短すぎる文(「はい。」など)は次と合わせる。合成の回数と継ぎ目を減らす
    if (s.length >= 8) {
      sentences.push(s)
      start = end
    }
    i = end - 1
  }
  return { sentences, rest: buffer.slice(start) }
}

function findAudio(node: unknown): { data: string; mime_type?: string; mimeType?: string } | null {
  if (Array.isArray(node)) {
    for (const v of node) {
      const a = findAudio(v)
      if (a) return a
    }
    return null
  }
  if (node && typeof node === "object") {
    const o = node as Record<string, unknown>
    if (typeof o.data === "string" && o.data.length > 1000) return o as { data: string }
    for (const v of Object.values(o)) {
      const a = findAudio(v)
      if (a) return a
    }
  }
  return null
}

export async function synthesize(
  text: string,
  opts: { apiKey: string; voice: string; model: string; signal?: AbortSignal }
): Promise<TtsAudio> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "x-goog-api-key": opts.apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts.model,
      input: text,
      response_format: { type: "audio" },
      generation_config: { speech_config: [{ voice: opts.voice }] },
    }),
    signal: opts.signal,
  })
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 200)
    throw new Error(`tts ${res.status} ${detail}`)
  }
  const audio = findAudio(await res.json())
  if (!audio) throw new Error("tts no_audio")
  // RIFF で始まらなければ 24kHz・mono・16bit の生の PCM(synth.py の実測と同じ扱い)
  const mime = audio.mime_type ?? audio.mimeType ?? (audio.data.startsWith("UklGR") ? "audio/wav" : "audio/L16;rate=24000")
  return { mime, data: audio.data }
}

/**
 * stream で合成し、届いた断片(base64 の 24kHz・mono・16bit の PCM)を onChunk に渡す。渡した断片の数を返す。
 * 断片は 80 ms 前後と細かいので、最初の 1 つはすぐ、その後は 0.4 秒分ほどためてから渡す(SSE の数を減らす。
 * 中身は base64 のまま並べるだけで、Worker で decode しない)。
 */
export async function synthesizeStream(
  text: string,
  opts: { apiKey: string; voice: string; model: string; signal?: AbortSignal },
  onChunk: (mime: string, data: string[]) => Promise<void>
): Promise<number> {
  const res = await fetch(`${ENDPOINT}?alt=sse`, {
    method: "POST",
    headers: { "x-goog-api-key": opts.apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts.model,
      input: text,
      response_format: { type: "audio" },
      generation_config: { speech_config: [{ voice: opts.voice }] },
      stream: true,
    }),
    signal: opts.signal,
  })
  if (!res.ok || !res.body) {
    const detail = (await res.text()).slice(0, 200)
    throw new Error(`tts ${res.status} ${detail}`)
  }
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
  let buf = ""
  let sent = 0
  let mime = "audio/L16;rate=24000"
  let pending: string[] = []
  let pendingLen = 0
  const flush = async () => {
    if (!pending.length) return
    const out = pending
    pending = []
    pendingLen = 0
    sent++
    await onChunk(mime, out)
  }
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buf += value
    let cut: number
    while ((cut = buf.indexOf("\n\n")) >= 0) {
      const block = buf.slice(0, cut)
      buf = buf.slice(cut + 2)
      const raw = /^data: (.+)$/m.exec(block)?.[1]
      if (!raw) continue
      const ev = JSON.parse(raw) as {
        event_type?: string
        delta?: { type?: string; data?: string; sample_rate?: number }
        error?: { message?: string }
      }
      if (ev.error) throw new Error(`tts stream ${String(ev.error.message ?? "error").slice(0, 120)}`)
      // 声は step.stop で終わり。その後の interaction.completed は 18 秒遅れて来ることがあった(2026-11-26 実測)ので待たない
      if (ev.event_type === "step.stop" || ev.event_type === "interaction.completed") {
        await flush()
        await reader.cancel().catch(() => {})
        return sent
      }
      const d = ev.delta
      if (ev.event_type !== "step.delta" || d?.type !== "audio" || !d.data) continue
      if (d.sample_rate) mime = `audio/L16;rate=${d.sample_rate}`
      pending.push(d.data)
      pendingLen += d.data.length
      // base64 の 0.4 秒分 ≒ 24000 * 2 * 0.4 * 4 / 3 字
      if (sent === 0 || pendingLen >= 25_600) await flush()
    }
  }
  await flush()
  return sent
}
