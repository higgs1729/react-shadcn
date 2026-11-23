// 答えに本人の声を付ける。Gemini の TTS(本人の声の複製)を、答えの文が 1 つ終わるたびに呼ぶ。
// 鍵は Worker の secret(GEMINI_API_KEY)だけに置き、ブラウザには出さない。
// 別の口(/tts)を作らず /chat の中でだけ呼ぶので、この Worker が作った答え以外は声にならない
// (訪問者が好きな文を読ませる無料の TTS にされない)。字数は Guard の 1 日の上限から取る。
// 音量は合成のたびに少しずつ違うので、ブラウザ側で -16 LUFS 相当に寄せる(Worker は CPU を使わず中継だけ)。

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions"

export type TtsAudio = { mime: string; data: string }

/** 文の終わり。ここで区切って先頭の文から声にする。 */
const SENTENCE_END = /[。！？!?\n]/

/** 溜まった字から、終わった文を取り出す。残りは次へ持ち越す。 */
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
