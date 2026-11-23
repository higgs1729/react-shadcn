"use client"

// 分身の案内役。Works から下で画面の端に立ち、ピックアップの作品が画面の中ほどに来たら
// その作品の方を指して、前もって合成した本人の声(複製)で一言案内する。
// 「分身に聞く」から質問すると、頭脳の Worker(avatar-worker)が答えを流し、音がオンなら
// 文ごとに本人の声で読む。口は声の大きさで開け閉めする(音がオフなら字の長さだけ決まった揺れで)。
// 音はユーザーが右下の「音を出す」を押すまで出さない(sound-toggle の SOUND_EVENT に従う)。
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react"

import lines from "../lib/avatar-lines.json"
import { AvatarPlayer, type ClipId, type MouthTrack } from "../lib/avatar-player"
import { AvatarVoice } from "../lib/avatar-voice"
import { picks } from "../lib/works"
import styles from "./avatar-guide.module.css"
import { SOUND_EVENT } from "./sound-toggle"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
const ASSETS = `${basePath}/avatar`
const BRAIN_URL =
  process.env.NEXT_PUBLIC_AVATAR_BRAIN_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8788"
    : "https://react-shadcn-avatar-brain.higgs1729.workers.dev")

const CLIPS: ClipId[] = ["idle_1", "talk_1", "point_l_2", "point_r_2", "bow_1"]
const LINE = Object.fromEntries(lines.map((l) => [l.id, l])) as Record<string, (typeof lines)[number]>

// 答えの中にこの語が出たら、その作品へ連れて行って指す
const MENTION: Record<string, string[]> = {
  nephelia: ["ネフェリア"],
  cadence: ["CADENCE", "動画制作の事業", "むかしぐらし"],
  asagiri: ["朝霧"],
  gamehub: ["GAMEHUB", "ゲームハブ"],
  studio: ["Design System Studio"],
}

const SUGGEST = ["どんな人ですか？", "ネフェリアはどうやって作ったの？", "AIをどう使っていますか？"]

type Turn = { role: "user" | "assistant"; content: string }
/** 立つ所。x は姿の中心の画面上の横位置(px)。null は既定(広い画面は右、狭い画面は左)。bubble は吹き出しを出す側 */
type Spot = { x: number | null; bubble: "left" | "right" }
const HOME: Spot = { x: null, bubble: "left" }

function soundIsOn() {
  try {
    return localStorage.getItem("portal:sound") === "on"
  } catch {
    return false
  }
}

function subscribeSound(onChange: () => void) {
  window.addEventListener(SOUND_EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(SOUND_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

const wide = () => window.matchMedia("(min-width: 75em)").matches

function nearCenter(el: HTMLElement) {
  const r = el.getBoundingClientRect()
  const mid = window.innerHeight / 2
  return r.top < mid + window.innerHeight * 0.1 && r.bottom > mid - window.innerHeight * 0.1
}

/** 姿の幅のうち、中立の姿勢の人が占める半分の幅(canvas の幅に対する割合。動画の実測 x 494〜767 / 640 から) */
const BODY_HALF = 0.22

/**
 * ピックアップの n 件目を案内するときの立つ所と指す型。
 * 広い画面は画像と文が左右に並ぶので、文の列のすぐ外(画像の側)に立って画像を指す。文には重ならない。
 * 狭い画面は画像の下に文が来るので、左下に立って右(画面の中ほど)を指す。
 */
function aim(article: HTMLElement, canvasW: number): { spot: Spot; clip: ClipId } {
  const body = article.querySelector<HTMLElement>(".pick__body")
  if (!wide() || !body) return { spot: HOME, clip: "point_r_2" }
  const r = body.getBoundingClientRect()
  const imageOnRight = article.classList.contains("pick--flip")
  const gap = 12
  return imageOnRight
    ? { spot: { x: r.right + canvasW * BODY_HALF + gap, bubble: "right" }, clip: "point_r_2" }
    : { spot: { x: r.left - canvasW * BODY_HALF - gap, bubble: "left" }, clip: "point_l_2" }
}

export function AvatarGuide() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouthRef = useRef<HTMLCanvasElement>(null)
  const playerRef = useRef<AvatarPlayer | null>(null)
  const voiceRef = useRef<AvatarVoice>(new AvatarVoice())
  const speakingRef = useRef(false)
  const afterRef = useRef<ClipId[]>([])
  const sayTokenRef = useRef(0)
  const guidedRef = useRef(new Set<string>())
  const greetedRef = useRef(false)
  /** 挨拶を言い終えるまでは作品の案内を始めない */
  const greetDoneRef = useRef(false)
  const recheckRef = useRef<() => void>(() => {})
  const chattingRef = useRef(false)

  const [visible, setVisible] = useState(false)
  const [ready, setReady] = useState(false)
  const [spot, setSpot] = useState<Spot>(HOME)
  const figureRef = useRef<HTMLDivElement>(null)
  const [moving, setMoving] = useState(false)
  const [bubble, setBubble] = useState("")
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const sound = useSyncExternalStore(subscribeSound, soundIsOn, () => false)
  const [turns, setTurns] = useState<Turn[]>([])

  // 音の選択に従う。オンにした操作の中で AudioContext を起こす
  useEffect(() => {
    const onSound = (e: Event) => {
      const on = (e as CustomEvent<{ on: boolean }>).detail?.on ?? soundIsOn()
      if (on) voiceRef.current.unlock()
      else voiceRef.current.stop()
    }
    window.addEventListener(SOUND_EVENT, onSound)
    return () => window.removeEventListener(SOUND_EVENT, onSound)
  }, [])

  // 前に「オン」を選んだ人も、ページを開き直した後は押すまで鳴らせない(ブラウザの決まり)。最初の操作で起こす
  useEffect(() => {
    if (!sound) return
    const wake = () => voiceRef.current.unlock()
    window.addEventListener("pointerdown", wake, { once: true })
    window.addEventListener("keydown", wake, { once: true })
    return () => {
      window.removeEventListener("pointerdown", wake)
      window.removeEventListener("keydown", wake)
    }
  }, [sound])

  // Works に入ったら出す
  useEffect(() => {
    const works = document.getElementById("works")
    if (!works) return
    const check = () => setVisible(works.getBoundingClientRect().top < window.innerHeight * 0.55)
    check()
    window.addEventListener("scroll", check, { passive: true })
    window.addEventListener("resize", check)
    return () => {
      window.removeEventListener("scroll", check)
      window.removeEventListener("resize", check)
    }
  }, [])

  // 初めて出るときに動画を読み込んで再生を始める
  useEffect(() => {
    if (!visible || playerRef.current || !canvasRef.current || !mouthRef.current) return
    let cancelled = false
    ;(async () => {
      const track = (await fetch(`${ASSETS}/mouth.json`).then((r) => r.json())) as MouthTrack
      if (cancelled || !canvasRef.current || !mouthRef.current) return
      let player: AvatarPlayer
      try {
        player = new AvatarPlayer(canvasRef.current, mouthRef.current, ASSETS, track, {
          next: (current) => {
            // 話している間は話す型を続け、お辞儀などの後の型は話し終えてから
            if (speakingRef.current) return "talk_1"
            const queued = afterRef.current.shift()
            if (queued) return queued
            return current === "idle_1" ? null : "idle_1"
          },
          mouth: () => voiceRef.current.level(),
        })
      } catch {
        return // WebGL が無い環境では出さない
      }
      playerRef.current = player
      if (process.env.NODE_ENV === "development") {
        // 試しの観測用(本番のビルドには入らない)
        ;(window as unknown as Record<string, unknown>).__avatar = {
          state: () => ({ clip: player.current, speaking: speakingRef.current, after: [...afterRef.current], voiceBusy: voiceRef.current.busy, unlocked: voiceRef.current.unlocked }),
        }
      }
      await player.preload(CLIPS)
      if (cancelled) return
      await player.start("idle_1")
      setReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [visible])

  useEffect(() => () => playerRef.current?.dispose(), [])

  // 画面の幅が変わったら、測った立つ所は使えないので既定へ戻す
  useEffect(() => {
    const reset = () => {
      spotRef.current = HOME
      setSpot(HOME)
    }
    window.addEventListener("resize", reset)
    return () => window.removeEventListener("resize", reset)
  }, [])

  /** 話し終えたら待機へ。話す型の残りが長ければ途中で溶かして戻す */
  const finishSpeaking = useCallback(() => {
    speakingRef.current = false
    const player = playerRef.current
    if (!player) return
    const hasAfter = afterRef.current.length > 0
    if (player.current === "talk_1" && player.remaining > 2.2) {
      void player.switchTo(afterRef.current.shift() ?? "idle_1", { cut: true })
    }
    // お辞儀などが残っていれば、それが済んでから次の案内へ
    setTimeout(() => recheckRef.current(), hasAfter ? 6500 : 900)
  }, [])

  /** 前もって合成した台詞を言う。point を渡すとその方を指してから話す */
  const say = useCallback(
    async (lineId: string, opts: { point?: ClipId; bowAfter?: boolean } = {}) => {
      const player = playerRef.current
      const line = LINE[lineId]
      if (!player || !line) return
      const token = ++sayTokenRef.current
      const voice = voiceRef.current
      voice.stop()
      setBubble(line.text)
      afterRef.current = opts.bowAfter ? ["bow_1"] : []
      if (opts.point) {
        speakingRef.current = true
        await player.switchTo(opts.point, { cut: true })
        // 腕が上がり始めてから話す
        await new Promise((r) => setTimeout(r, 700))
      } else {
        speakingRef.current = true
        if (player.current !== "talk_1") await player.switchTo("talk_1", { cut: true })
      }
      if (token !== sayTokenRef.current) return
      const buf = voice.unlocked && soundIsOn() ? await voice.load(`${ASSETS}/voice/${lineId}.m4a`) : null
      if (token !== sayTokenRef.current) return
      if (buf) await voice.enqueue(buf)
      else await voice.pretend(line.text.length)
      if (token !== sayTokenRef.current) return
      finishSpeaking()
    },
    [finishSpeaking]
  )

  /** 立つ所を替える(消えて、別の所に出る) */
  const spotRef = useRef<Spot>(HOME)
  const moveTo = useCallback(async (next: Spot) => {
    const cur = spotRef.current
    if (cur.bubble === next.bubble && (cur.x === next.x || (cur.x !== null && next.x !== null && Math.abs(cur.x - next.x) < 4))) return
    spotRef.current = next
    setMoving(true)
    await new Promise((r) => setTimeout(r, 250))
    setSpot(next)
    setMoving(false)
    await new Promise((r) => setTimeout(r, 250))
  }, [])

  const guideTo = useCallback(
    async (id: string, speak: boolean) => {
      const index = picks.findIndex((p) => p.id === id)
      const article = document.querySelectorAll<HTMLElement>("#panel-pick .pick")[index]
      if (index < 0 || !article) return
      guidedRef.current.add(id)
      const { spot: next, clip } = aim(article, figureRef.current?.offsetWidth ?? 400)
      await moveTo(next)
      // 動いている間にスクロールで外れたら、案内せずに次の機会へ回す
      if (speak && !nearCenter(article)) {
        guidedRef.current.delete(id)
        recheckRef.current()
        return
      }
      if (speak) await say(id, { point: clip })
      else {
        afterRef.current = []
        await playerRef.current?.switchTo(clip, { cut: true })
      }
    },
    [moveTo, say]
  )

  // 最初に出たときの挨拶
  useEffect(() => {
    if (!ready || greetedRef.current) return
    greetedRef.current = true
    void (async () => {
      // 広い画面は、最初の作品の文の列のすぐ外に立って挨拶する(本文に重ねない)
      const first = document.querySelector<HTMLElement>("#panel-pick .pick")
      if (first && wide()) await moveTo(aim(first, figureRef.current?.offsetWidth ?? 400).spot)
      await say("greet", { bowAfter: true })
      greetDoneRef.current = true
    })()
  }, [ready, say, moveTo])

  // ピックアップの作品が画面の中ほどに来たら、1 回だけ案内する
  useEffect(() => {
    if (!ready) return
    const articles = [...document.querySelectorAll<HTMLElement>("#panel-pick .pick")]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const index = articles.indexOf(e.target as HTMLElement)
          const id = picks[index]?.id
          if (!id || guidedRef.current.has(id) || chattingRef.current || speakingRef.current || !greetDoneRef.current)
            continue
          void guideTo(id, true)
        }
      },
      { rootMargin: "-40% 0px -40% 0px" }
    )
    articles.forEach((a) => io.observe(a))
    // 話している間に中ほどへ来た作品は、話し終えてから案内する
    recheckRef.current = () => {
      if (chattingRef.current || speakingRef.current || !greetDoneRef.current) return
      const index = articles.findIndex(nearCenter)
      const id = picks[index]?.id
      if (id && !guidedRef.current.has(id)) void guideTo(id, true)
    }
    return () => io.disconnect()
  }, [ready, guideTo])

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim().slice(0, 400)
      if (!q || busy) return
      const voice = voiceRef.current
      const player = playerRef.current
      const history: Turn[] = [...turns, { role: "user" as const, content: q }].slice(-8)
      setTurns(history)
      setInput("")
      setBusy(true)
      chattingRef.current = true
      const token = ++sayTokenRef.current
      voice.stop()
      afterRef.current = []
      setBubble("…")

      let answer = ""
      let pointed = false
      let audioChain: Promise<void> = Promise.resolve()
      const plays: Promise<void>[] = []
      const withVoice = soundIsOn() && voice.unlocked
      const startTalk = () => {
        if (speakingRef.current) return
        speakingRef.current = true
        if (player && player.current !== "talk_1" && !pointed) void player.switchTo("talk_1", { cut: true })
      }

      try {
        const res = await fetch(`${BRAIN_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, voice: withVoice }),
        })
        if (!res.ok || !res.body) {
          const err = (await res.json().catch(() => null)) as { message?: string } | null
          throw new Error(err?.message ?? "いまは答えられませんでした。少し時間をおいてもう一度どうぞ。")
        }
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
        let buf = ""
        for (;;) {
          const { value, done } = await reader.read()
          if (done) break
          buf += value
          let cut: number
          while ((cut = buf.indexOf("\n\n")) >= 0) {
            const block = buf.slice(0, cut)
            buf = buf.slice(cut + 2)
            const event = /^event: (.+)$/m.exec(block)?.[1]
            const raw = /^data: (.+)$/m.exec(block)?.[1]
            if (!event || !raw || token !== sayTokenRef.current) continue
            const data = JSON.parse(raw)
            if (event === "delta") {
              answer += data.text
              setBubble(answer)
              startTalk()
              if (!withVoice) plays.push(voice.pretend(data.text.length))
              if (!pointed) {
                const hit = Object.entries(MENTION).find(([, words]) => words.some((w) => answer.includes(w)))
                if (hit) {
                  pointed = true
                  document
                    .querySelectorAll<HTMLElement>("#panel-pick .pick")
                    [picks.findIndex((p) => p.id === hit[0])]?.scrollIntoView({ behavior: "smooth", block: "center" })
                  void guideTo(hit[0], false)
                }
              }
            } else if (event === "audio") {
              audioChain = audioChain.then(async () => {
                const b = await voice.decode(data.mime, data.data)
                if (b && token === sayTokenRef.current) plays.push(voice.enqueue(b, { normalize: true }))
              })
            } else if (event === "audio_skip") {
              audioChain = audioChain.then(() => {
                plays.push(voice.pretend(String(data.text ?? "").length))
              })
            } else if (event === "error") {
              answer = data.message
              setBubble(answer)
            }
          }
        }
        await audioChain
        await Promise.all(plays)
      } catch (e) {
        answer = e instanceof Error && /[ぁ-ん]/.test(e.message) ? e.message : "いまは答えられませんでした。少し時間をおいてもう一度どうぞ。"
        setBubble(answer)
      } finally {
        if (answer) setTurns((t) => [...t, { role: "assistant" as const, content: answer.slice(0, 800) }].slice(-8))
        setBusy(false)
        chattingRef.current = false
        if (token === sayTokenRef.current) finishSpeaking()
      }
    },
    [busy, turns, finishSpeaking, guideTo]
  )

  const cls = [
    styles.dock,
    spot.x === null ? styles.home : "",
    spot.bubble === "left" ? styles.bubbleLeft : styles.bubbleRight,
    visible && ready ? styles.on : "",
    moving ? styles.moving : "",
  ].join(" ")

  return (
    <aside
      className={cls}
      aria-label="分身の案内役"
      style={spot.x === null ? undefined : ({ "--x": `${Math.round(spot.x)}px` } as CSSProperties)}
    >
      <div className={styles.figure} ref={figureRef} aria-hidden="true">
        <canvas ref={canvasRef} className={styles.canvas} width={640} height={660} />
        <canvas ref={mouthRef} className={styles.canvas} width={640} height={660} />
      </div>

      <div className={styles.talk}>
        {bubble ? (
          <p className={styles.bubble} aria-live="polite">
            {bubble}
          </p>
        ) : null}
        {!sound ? <p className={styles.hint}>右下の「音を出す」で、声も聞けます</p> : null}

        {open ? (
          <form
            className={styles.panel}
            onSubmit={(e) => {
              e.preventDefault()
              void ask(input)
            }}
          >
            <div className={styles.chips}>
              {SUGGEST.map((s) => (
                <button key={s} type="button" className={styles.chip} disabled={busy} onClick={() => void ask(s)}>
                  {s}
                </button>
              ))}
            </div>
            <div className={styles.row}>
              <label className="visually-hidden" htmlFor="avatar-q">
                分身への質問
              </label>
              <input
                id="avatar-q"
                className={styles.input}
                value={input}
                maxLength={400}
                placeholder="作品や僕のことを聞いてください"
                onChange={(e) => setInput(e.target.value)}
                disabled={busy}
              />
              <button type="submit" className={styles.send} disabled={busy || !input.trim()}>
                {busy ? "考え中" : "聞く"}
              </button>
            </div>
            <p className={styles.note}>
              AI が答えています。質問は AI の提供元に送られます。声は本人の声を元にした AI の合成音声です。
            </p>
          </form>
        ) : null}
        <button type="button" className={styles.toggle} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? "閉じる" : "分身に聞く"}
        </button>
      </div>
    </aside>
  )
}
