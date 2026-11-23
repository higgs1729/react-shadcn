"use client"

// 分身の案内役。勝手には出ない(本人 2026-11-24)。右下の「分身を呼ぶ」を押すと出て、閉じると引っ込む。
// 出ている間だけ、ピックアップの作品が画面の中ほどに来たらその作品の方を指して、前もって合成した本人の声(複製)で一言案内する。
// 質問すると頭脳の Worker(avatar-worker)が答えを流し、音がオンなら文ごとに本人の声で読む。
// 口は重ねない。話す間は口も体も動画の中で動いている talk_1 の型を流す。
// 音は「音を出す」がオンのときだけ。AudioContext は押した操作(呼ぶ・聞く・音をオン)の中で起こす。
// 話し終えたら・「止める」・次の質問で、必ず待機に戻る(声の 1 本ごとに時間の上限がある。lib/avatar-voice.ts)
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react"

import lines from "../lib/avatar-lines.json"
import { AvatarPlayer, type ClipId } from "../lib/avatar-player"
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
/** 声が無いとき、字幕を読む速さに合わせて話す型を続ける長さ(1 字あたり) */
const MS_PER_CHAR = 110
/** 答えの流れが止まったときの上限 */
const ANSWER_TIMEOUT_MS = 60_000

// 答えの中にこの語が出たら、その作品へ連れて行って指す
const MENTION: Record<string, string[]> = {
  nephelia: ["ネフェリア"],
  cadence: ["CADENCE", "動画制作の事業", "むかしぐらし"],
  asagiri: ["朝霧"],
  gamehub: ["GAMEHUB", "ゲームハブ"],
  studio: ["Design System Studio"],
}

// 自己紹介は候補に出さない(本人 2026-11-24)
const SUGGEST = ["ネフェリアはどうやって作ったの？", "AIをどう使っていますか？"]

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
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

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
  const playerRef = useRef<AvatarPlayer | null>(null)
  const voiceRef = useRef<AvatarVoice>(new AvatarVoice())
  const speakingRef = useRef(false)
  const afterRef = useRef<ClipId[]>([])
  /** 話す・答えるのたびに増やす。古い番号の続きは何もしない */
  const tokenRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)
  const guidedRef = useRef(new Set<string>())
  const greetedRef = useRef(false)
  /** 挨拶を言い終えるまでは作品の案内を始めない */
  const greetDoneRef = useRef(false)
  const recheckRef = useRef<() => void>(() => {})
  const chattingRef = useRef(false)
  const openRef = useRef(false)

  /** 呼ばれて出ているか */
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [spot, setSpot] = useState<Spot>(HOME)
  const figureRef = useRef<HTMLDivElement>(null)
  const [moving, setMoving] = useState(false)
  const [bubble, setBubble] = useState("")
  const [input, setInput] = useState("")
  /** 答えを待っている(最初の字が来るまで) */
  const [thinking, setThinking] = useState(false)
  /** 話している(声か、声が無ければ字幕の長さだけ) */
  const [talking, setTalking] = useState(false)
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

  // 初めて呼ばれたときに動画を読み込んで再生を始める
  useEffect(() => {
    if (!open || playerRef.current || !canvasRef.current) return
    let cancelled = false
    ;(async () => {
      if (!canvasRef.current) return
      let player: AvatarPlayer
      try {
        player = new AvatarPlayer(canvasRef.current, ASSETS, {
          next: (current) => {
            // 話している間は話す型を続け、お辞儀などの後の型は話し終えてから
            if (speakingRef.current) return "talk_1"
            const queued = afterRef.current.shift()
            if (queued) return queued
            return current === "idle_1" ? null : "idle_1"
          },
        })
      } catch {
        return // WebGL が無い環境では出さない
      }
      playerRef.current = player
      if (process.env.NODE_ENV === "development") {
        // 試しの観測用(本番のビルドには入らない)
        ;(window as unknown as Record<string, unknown>).__avatar = {
          state: () => ({
            clip: player.current,
            speaking: speakingRef.current,
            after: [...afterRef.current],
            voiceBusy: voiceRef.current.busy,
            audio: voiceRef.current.state,
          }),
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
  }, [open])

  useEffect(() => () => playerRef.current?.dispose(), [])

  // 画面の幅が変わったら、測った立つ所は使えないので既定へ戻す
  const spotRef = useRef<Spot>(HOME)
  useEffect(() => {
    const reset = () => {
      spotRef.current = HOME
      setSpot(HOME)
    }
    window.addEventListener("resize", reset)
    return () => window.removeEventListener("resize", reset)
  }, [])

  /** 待機へ戻す。話す型の残りが長ければ途中で溶かして戻す */
  const toIdle = useCallback(() => {
    speakingRef.current = false
    setTalking(false)
    const player = playerRef.current
    if (!player) return
    if (player.current === "talk_1" || player.current?.startsWith("point")) {
      if (player.remaining > 1.2) void player.switchTo(afterRef.current.shift() ?? "idle_1", { cut: true })
    }
  }, [])

  /** 話している物・答えの流れを全部止めて待機へ。次の質問・「止める」・閉じるで呼ぶ */
  const silence = useCallback(() => {
    tokenRef.current++
    abortRef.current?.abort()
    abortRef.current = null
    voiceRef.current.stop()
    chattingRef.current = false
    setThinking(false)
    afterRef.current = []
    toIdle()
  }, [toIdle])

  const finishSpeaking = useCallback(() => {
    const hasAfter = afterRef.current.length > 0
    toIdle()
    // お辞儀などが残っていれば、それが済んでから次の案内へ
    setTimeout(() => recheckRef.current(), hasAfter ? 6500 : 900)
  }, [toIdle])

  /** 声を鳴らせるか(音がオンで AudioContext が動いている) */
  const canSpeak = useCallback(async () => soundIsOn() && (await voiceRef.current.ready()), [])

  /** 前もって合成した台詞を言う。point を渡すとその方を指してから話す */
  const say = useCallback(
    async (lineId: string, opts: { point?: ClipId; bowAfter?: boolean } = {}) => {
      const player = playerRef.current
      const line = LINE[lineId]
      if (!player || !line || !openRef.current) return
      const token = ++tokenRef.current
      const voice = voiceRef.current
      voice.stop()
      setBubble(line.text)
      afterRef.current = opts.bowAfter ? ["bow_1"] : []
      speakingRef.current = true
      setTalking(true)
      if (opts.point) {
        await player.switchTo(opts.point, { cut: true })
        // 腕が上がり始めてから話す
        await sleep(700)
      } else if (player.current !== "talk_1") {
        await player.switchTo("talk_1", { cut: true })
      }
      if (token !== tokenRef.current) return
      const buf = (await canSpeak()) ? await voice.load(`${ASSETS}/voice/${lineId}.m4a`) : null
      if (token !== tokenRef.current) return
      if (buf) await voice.enqueue(buf)
      else await sleep(line.text.length * MS_PER_CHAR)
      if (token !== tokenRef.current) return
      finishSpeaking()
    },
    [finishSpeaking, canSpeak]
  )

  /** 立つ所を替える(消えて、別の所に出る) */
  const moveTo = useCallback(async (next: Spot) => {
    const cur = spotRef.current
    if (cur.bubble === next.bubble && (cur.x === next.x || (cur.x !== null && next.x !== null && Math.abs(cur.x - next.x) < 4))) return
    spotRef.current = next
    setMoving(true)
    await sleep(250)
    setSpot(next)
    setMoving(false)
    await sleep(250)
  }, [])

  const guideTo = useCallback(
    async (id: string, speak: boolean) => {
      const index = picks.findIndex((p) => p.id === id)
      const article = document.querySelectorAll<HTMLElement>("#panel-pick .pick")[index]
      if (index < 0 || !article || !openRef.current) return
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

  // 呼ばれて最初に出たときの挨拶
  useEffect(() => {
    if (!ready || !open || greetedRef.current) return
    greetedRef.current = true
    void (async () => {
      const first = document.querySelector<HTMLElement>("#panel-pick .pick")
      if (first && wide() && nearCenter(first)) await moveTo(aim(first, figureRef.current?.offsetWidth ?? 400).spot)
      await say("greet", { bowAfter: true })
      greetDoneRef.current = true
    })()
  }, [ready, open, say, moveTo])

  // 出ている間、ピックアップの作品が画面の中ほどに来たら 1 回だけ案内する
  useEffect(() => {
    if (!ready || !open) return
    const articles = [...document.querySelectorAll<HTMLElement>("#panel-pick .pick")]
    const busyNow = () => !openRef.current || chattingRef.current || speakingRef.current || !greetDoneRef.current
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const id = picks[articles.indexOf(e.target as HTMLElement)]?.id
          if (!id || guidedRef.current.has(id) || busyNow()) continue
          void guideTo(id, true)
        }
      },
      { rootMargin: "-40% 0px -40% 0px" }
    )
    articles.forEach((a) => io.observe(a))
    // 話している間に中ほどへ来た作品は、話し終えてから案内する
    recheckRef.current = () => {
      if (busyNow()) return
      const id = picks[articles.findIndex(nearCenter)]?.id
      if (id && !guidedRef.current.has(id)) void guideTo(id, true)
    }
    return () => {
      io.disconnect()
      recheckRef.current = () => {}
    }
  }, [ready, open, guideTo])

  const summon = () => {
    voiceRef.current.unlock()
    openRef.current = true
    setOpen(true)
  }

  const dismiss = () => {
    openRef.current = false
    silence()
    setOpen(false)
    setBubble("")
  }

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim().slice(0, 400)
      if (!q) return
      // 前の答え(声・流れ)は捨てる
      silence()
      voiceRef.current.unlock()
      const voice = voiceRef.current
      const player = playerRef.current
      const history: Turn[] = [...turns, { role: "user" as const, content: q }].slice(-8)
      setTurns(history)
      setInput("")
      setThinking(true)
      chattingRef.current = true
      const token = ++tokenRef.current
      const ctrl = new AbortController()
      abortRef.current = ctrl
      const timer = setTimeout(() => ctrl.abort(), ANSWER_TIMEOUT_MS)
      const live = () => token === tokenRef.current
      setBubble("…")

      let answer = ""
      let pointed = false
      let audioChain: Promise<void> = Promise.resolve()
      const plays: Promise<void>[] = []
      const withVoice = await canSpeak()
      const startTalk = () => {
        if (speakingRef.current) return
        speakingRef.current = true
        setTalking(true)
        if (player && player.current !== "talk_1" && !pointed) void player.switchTo("talk_1", { cut: true })
      }

      try {
        const res = await fetch(`${BRAIN_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, voice: withVoice }),
          signal: ctrl.signal,
        })
        if (!res.ok || !res.body) {
          const err = (await res.json().catch(() => null)) as { message?: string } | null
          throw new Error(err?.message ?? "いまは答えられませんでした。少し時間をおいてもう一度どうぞ。")
        }
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
        let buf = ""
        for (;;) {
          const { value, done } = await reader.read()
          if (done || !live()) break
          buf += value
          let cut: number
          while ((cut = buf.indexOf("\n\n")) >= 0) {
            const block = buf.slice(0, cut)
            buf = buf.slice(cut + 2)
            const event = /^event: (.+)$/m.exec(block)?.[1]
            const raw = /^data: (.+)$/m.exec(block)?.[1]
            if (!event || !raw || !live()) continue
            const data = JSON.parse(raw)
            if (event === "delta") {
              answer += data.text
              setThinking(false)
              setBubble(answer)
              startTalk()
              if (!withVoice) plays.push(sleep(String(data.text).length * MS_PER_CHAR))
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
                if (b && live()) plays.push(voice.enqueue(b, { normalize: true }))
              })
            } else if (event === "audio_skip") {
              audioChain = audioChain.then(() => {
                plays.push(sleep(String(data.text ?? "").length * MS_PER_CHAR))
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
        if (!live()) return // 次の質問か「止める」で捨てた
        answer =
          e instanceof Error && /[ぁ-ん]/.test(e.message)
            ? e.message
            : "いまは答えられませんでした。少し時間をおいてもう一度どうぞ。"
        setBubble(answer)
      } finally {
        clearTimeout(timer)
        if (answer) setTurns((t) => [...t, { role: "assistant" as const, content: answer.slice(0, 800) }].slice(-8))
        if (live()) {
          abortRef.current = null
          chattingRef.current = false
          setThinking(false)
          finishSpeaking()
        }
      }
    },
    [turns, finishSpeaking, guideTo, silence, canSpeak]
  )

  const cls = [
    styles.dock,
    spot.x === null ? styles.home : "",
    spot.bubble === "left" ? styles.bubbleLeft : styles.bubbleRight,
    open && ready ? styles.on : "",
    moving ? styles.moving : "",
  ].join(" ")

  return (
    <>
      {!open ? (
        <button type="button" className={styles.launcher} onClick={summon} aria-label="分身を呼ぶ(作品を案内し、質問に答えます)">
          <span className={styles.launcherFace} aria-hidden="true">
            <img src={`${ASSETS}/face.png`} alt="" width={40} height={40} />
          </span>
          分身を呼ぶ
        </button>
      ) : null}

      <aside
        className={cls}
        aria-label="分身の案内役"
        hidden={!open}
        style={spot.x === null ? undefined : ({ "--x": `${Math.round(spot.x)}px` } as CSSProperties)}
      >
        <div className={styles.figure} ref={figureRef} aria-hidden="true">
          <canvas ref={canvasRef} className={styles.canvas} width={640} height={660} />
        </div>

        <div className={styles.talk}>
          {bubble ? (
            <p className={styles.bubble} aria-live="polite">
              {bubble}
            </p>
          ) : null}
          {!sound ? <p className={styles.hint}>右下の「音を出す」をオンにすると、声も聞けます</p> : null}

          <form
            className={styles.panel}
            onSubmit={(e) => {
              e.preventDefault()
              void ask(input)
            }}
          >
            <div className={styles.chips}>
              {SUGGEST.map((s) => (
                <button key={s} type="button" className={styles.chip} onClick={() => void ask(s)}>
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
              />
              <button type="submit" className={styles.send} disabled={!input.trim()}>
                聞く
              </button>
            </div>
            <p className={styles.note}>
              AI が答えています。質問は AI の提供元に送られます。声は本人の声を元にした AI の合成音声です。
            </p>
          </form>
          <div className={styles.acts}>
            {thinking || talking ? (
              <button type="button" className={styles.stop} onClick={silence}>
                {thinking ? "考え中…止める" : "止める"}
              </button>
            ) : null}
            <button type="button" className={styles.toggle} onClick={dismiss}>
              閉じる
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
