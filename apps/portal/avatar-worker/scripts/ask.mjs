// ローカルの Worker に質問を投げ、答え・時間・費用を JSONL で出す。
// 使い方: node scripts/ask.mjs <questions.json> <out.jsonl> [--url http://127.0.0.1:8788] [--origin http://localhost:3000]
// questions.json は [{ "id": "q1", "group": "作品", "q": "..." }, ...]
import { readFileSync, appendFileSync } from "node:fs"

const [qPath, outPath, ...rest] = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = rest.indexOf(name)
  return i >= 0 ? rest[i + 1] : fallback
}
const base = opt("--url", "http://127.0.0.1:8788")
const origin = opt("--origin", "http://localhost:3000")
const questions = JSON.parse(readFileSync(qPath, "utf8"))

async function ask(q) {
  const started = Date.now()
  const res = await fetch(`${base}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify({ messages: [{ role: "user", content: q }] }),
  })
  if (!res.ok || !res.headers.get("content-type")?.includes("event-stream")) {
    return { status: res.status, body: await res.text(), clientMs: Date.now() - started }
  }
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = ""
  let text = ""
  let firstClientMs = null
  const events = {}
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    let i
    while ((i = buf.indexOf("\n\n")) >= 0) {
      const raw = buf.slice(0, i)
      buf = buf.slice(i + 2)
      const ev = raw.match(/^event: (.*)$/m)?.[1]
      const data = JSON.parse(raw.match(/^data: (.*)$/m)?.[1] ?? "null")
      if (ev === "delta") {
        if (firstClientMs === null) firstClientMs = Date.now() - started
        text += data.text
      } else events[ev] = data
    }
  }
  return { status: res.status, text, firstClientMs, clientMs: Date.now() - started, ...events }
}

for (const item of questions) {
  const r = await ask(item.q)
  const row = { ...item, ...r, chars: r.text ? [...r.text].length : 0 }
  appendFileSync(outPath, JSON.stringify(row) + "\n")
  console.log(item.id, r.status, r.done?.provider ?? r.error?.code ?? r.body?.slice(0, 80), `${r.clientMs}ms`, r.done?.costUsd ?? "")
}
