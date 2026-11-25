"use client"

// 分身の案内役。勝手には出ない(本人 2026-11-24)。右下の「分身を呼ぶ」を押すと出て、閉じると引っ込む。
// 出ている間だけ、ピックアップの作品が画面の中ほどに来たらその作品の方を指して、前もって合成した本人の声(複製)で一言案内する。
// 質問すると頭脳の Worker(avatar-worker)が答えを流し、音がオンなら文ごとに本人の声で読む。
// 口は重ねない。話す間は口も体も動画の中で動いている talk_1 の型を流す。
// 音は「音を出す」がオンのときだけ。AudioContext は押した操作(呼ぶ・聞く・音をオン)の中で起こす。
// 話し終えたら・「止める」・次の質問で、必ず待機に戻る(声の時計が止まったら終わった扱い。lib/avatar-voice.ts)
// 声を待っている間は口を動かさない。話す型は声が実際に鳴っている間だけ(本人 2026-11-25)。
// 音がオンのときは、答えの字を全部薄く出し、鳴った所まで濃くして、吹き出しをそこへ送る(本人 2026-11-25)。
// TTS は字ごとの時刻を返さないので、文ごとの声の「声の出ている時間」を、その文の字に読みの重さ(漢字は重く、
// 句読点は 0)で割り振る。文の頭で必ず合い直すので、ずれは 1 文の中だけ(数字の読み・英字で数字ほど先走る)。
// 音がオフのときは今まで通り、字はすぐ濃く出し、字の長さ(1 字 110 ms)だけ話す型を流す
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react"

import lines from "../lib/avatar-lines.json"
import { AvatarPlayer, type ClipId } from "../lib/avatar-player"
import { AvatarVoice, type VoiceTrack } from "../lib/avatar-voice"
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
/** 声 1 本(seq)が受け持つ答えの字の範囲 */
type Range = { start: number; end: number; text: string }

/** 読みの重さ。漢字は 1 字でおよそ 2 拍、小さい「ゃ」などは前の字と 1 拍、句読点・括弧・空白は声に出ない */
function weight(c: string): number {
  if (/[\s、。，．,.!?！？「」『』（）()・…—:：〜~]/.test(c)) return 0
  if (/[ぁぃぅぇぉゃゅょゎァィゥェォャュョヮ]/.test(c)) return 0.3
  if (/[一-鿿々]/.test(c)) return 1.7
  if (/[0-9０-９]/.test(c)) return 1.5
  return 1
}

/** 文の frac(0〜1)まで鳴ったとき、濃くする字の数。字の半ばまで鳴ったらその字を濃くする */
function charAt(text: string, frac: number): number {
  if (frac >= 1) return text.length
  const ws = [...text].map(weight)
  const total = ws.reduce((a, b) => a + b, 0)
  if (!total) return frac > 0 ? text.length : 0
  const target = frac * total
  let acc = 0
  let i = 0
  // サロゲートペアを分けないよう、字の単位で数えて UTF-16 の位置を返す
  let pos = 0
  for (const ch of text) {
    acc += ws[i++]
    if (acc - ws[i - 1] / 2 > target) return pos
    pos += ch.length
  }
  return text.length
}
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
  /** 声に合わせて濃くした字の数。null は全部濃い(音がオフ・話し終えた) */
  const [spoken, setSpoken] = useState<number | null>(null)
  const bubbleRef = useRef<HTMLParagraphElement>(null)
  const pendingRef = useRef<HTMLSpanElement>(null)
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

  /** 作品を指している間は、声が鳴っても話す型へ替えない(指し終えると next で話す型へ続く) */
  const pointing = useCallback(() => playerRef.current?.current?.startsWith("point") ?? false, [])

  /** 話す型へ。keepClip のとき(作品を指している間)は型を替えず、指し終えたら話す型へ続く */
  const beginTalk = useCallback((keepClip: boolean) => {
    if (speakingRef.current) return
    speakingRef.current = true
    setTalking(true)
    const player = playerRef.current
    if (player && !keepClip && player.current !== "talk_1") void player.switchTo("talk_1", { cut: true })
  }, [])

  /**
   * 声の並び(track)に字幕と口を合わせる。鳴っている文の範囲の字を、鳴った割合まで濃くする。
   * 鳴っている間だけ話す型、0.6 秒より長く鳴らなければ待機へ(文の間で口を開け閉めしない)。
   * 全部鳴り終えるか、次の話・「止める」で token が変わったら終わる
   */
  const follow = useCallback(
    (track: VoiceTrack, ranges: Range[], token: number, keepClip: () => boolean) =>
      new Promise<void>((resolve) => {
        let last = 0
        let quietSince = 0
        let heard = false
        let ended = false
        let nudged = 0
        const end = () => {
          ended = true
          resolve()
        }
        void track.finished.then(end)
        const tick = () => {
          if (ended || token !== tokenRef.current) return end()
          const st = track.now()
          let idx = last
          if (st.playing !== null) {
            const r = ranges[st.playing]
            if (r) idx = r.start + charAt(r.text, st.frac)
          } else if (st.done > 0) {
            const r = ranges[st.done - 1]
            if (r) idx = r.end
          }
          if (idx > last) {
            last = idx
            setSpoken(idx)
          }
          if (st.playing !== null) {
            quietSince = 0
            if (!heard) {
              heard = true
              setThinking(false)
            }
            const keep = keepClip()
            beginTalk(keep)
            // 型の切り替えの最中に頼んだ話す型は、player が今の型の終わりまで後回しにする。鳴っている間は頼み直す
            const player = playerRef.current
            const now = performance.now()
            if (player && !keep && player.current !== "talk_1" && now - nudged > 400) {
              nudged = now
              void player.switchTo("talk_1", { cut: true })
            }
          } else if (speakingRef.current) {
            const now = performance.now()
            if (!quietSince) quietSince = now
            else if (now - quietSince > 600) toIdle()
          }
          if (st.finished) return end()
          requestAnimationFrame(tick)
        }
        tick()
      }),
    [beginTalk, toIdle]
  )

  // 濃くした所(薄い字の始まり)の行が、吹き出しの上から 1/3 あたりに来るよう送る。行が変わったときだけ動く
  useEffect(() => {
    const box = bubbleRef.current
    const mark = pendingRef.current
    if (!box || !mark || spoken === null) return
    const r = mark.getClientRects()[0]
    if (!r) return
    const lineTop = r.top - box.getBoundingClientRect().top + box.scrollTop
    const want = Math.max(0, Math.min(box.scrollHeight - box.clientHeight, lineTop - box.clientHeight * 0.34))
    if (Math.abs(box.scrollTop - want) > r.height * 0.6) box.scrollTo({ top: want, behavior: "smooth" })
  }, [spoken, bubble])

  /** 前もって合成した台詞を言う。point を渡すとその方を指してから話す */
  const say = useCallback(
    async (lineId: string, opts: { point?: ClipId; bowAfter?: boolean } = {}) => {
      const player = playerRef.current
      const line = LINE[lineId]
      if (!player || !line || !openRef.current) return
      const token = ++tokenRef.current
      const voice = voiceRef.current
      voice.stop()
      afterRef.current = opts.bowAfter ? ["bow_1"] : []
      const withVoice = await canSpeak()
      if (token !== tokenRef.current) return
      setBubble(line.text)
      setSpoken(withVoice ? 0 : null)
      if (opts.point) {
        await player.switchTo(opts.point, { cut: true })
        // 腕が上がり始めてから話す
        await sleep(700)
        if (token !== tokenRef.current) return
      }
      const track = withVoice ? voice.track() : null
      const buf = track ? await voice.load(`${ASSETS}/voice/${lineId}.m4a`) : null
      if (token !== tokenRef.current) return track?.kill()
      if (track) {
        if (buf) track.buffer(0, buf, line.text)
        else track.skip(0, line.text, (line.text.length * MS_PER_CHAR) / 1000)
        track.close()
        await follow(track, [{ start: 0, end: line.text.length, text: line.text }], token, pointing)
      } else {
        setSpoken(null)
        beginTalk(Boolean(opts.point))
        await sleep(line.text.length * MS_PER_CHAR)
      }
      if (token !== tokenRef.current) return
      setSpoken(null)
      finishSpeaking()
    },
    [finishSpeaking, canSpeak, follow, beginTalk, pointing]
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
      // 音がオンなら声の並びを作り、字は薄く出して声に合わせて濃くする。作れなければ声なし
      let track = (await canSpeak()) ? voice.track() : null
      const withVoice = track !== null
      if (!live()) return track?.kill()
      const ranges: Range[] = []
      /** seq の声が受け持つ字の範囲を、前の文の終わりから探して決める(文は届く順が前後することがある) */
      const place = (seq: number, text: string) => {
        if (ranges[seq] || !text) return
        const from = ranges.slice(0, seq).reduce((n, r) => (r ? Math.max(n, r.end) : n), 0)
        let at = answer.indexOf(text, from)
        if (at < 0) at = from
        const end = Math.min(answer.length, at + text.length)
        ranges[seq] = { start: at, end, text: answer.slice(at, end) }
      }
      const following = track ? follow(track, ranges, token, pointing) : null
      /** 声を付けない答え(音がオフ・Worker が声を付けないと言った)は、字の長さだけ話す型 */
      const dropVoice = () => {
        track?.kill()
        track = null
        setSpoken(null)
        setThinking(false)
      }
      if (track) setSpoken(0)

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
            const t = track
            if (event === "meta") {
              // 声の鍵が無い・1 日の字数を使い切った Worker は voice: false を返す(返さない旧版は今まで通り)
              if (t && data.voice === false) dropVoice()
            } else if (event === "delta") {
              answer += data.text
              setBubble(answer)
              if (!t) {
                setThinking(false)
                beginTalk(pointed)
                plays.push(sleep(String(data.text).length * MS_PER_CHAR))
              }
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
            } else if (!t) {
              continue
            } else if (event === "voice_chunk") {
              // stream の声の断片(文の最初の 1 つだけ text が付く)
              if (data.text) place(data.seq, data.text)
              t.chunk(data.seq, data.mime, data.data, data.text)
            } else if (event === "voice_end") {
              place(data.seq, data.text)
              t.end(data.seq, data.text)
            } else if (event === "audio") {
              // 旧形式(1 文まるごと)。deploy 前の Worker のため
              place(data.seq, data.text)
              audioChain = audioChain.then(async () => {
                const b = await voice.decode(data.mime, data.data)
                if (b) t.buffer(data.seq, b, data.text, { normalize: true })
                else t.skip(data.seq, data.text, (String(data.text).length * MS_PER_CHAR) / 1000)
              })
            } else if (event === "audio_skip") {
              place(data.seq, data.text)
              t.skip(data.seq, data.text ?? "", (String(data.text ?? "").length * MS_PER_CHAR) / 1000)
            } else if (event === "error") {
              answer = data.message
              setBubble(answer)
              dropVoice()
            }
          }
        }
        await audioChain
        const t = track
        if (t && live()) {
          // 声の付かなかった残り(1 日の字数の上限に当たった後など)は、字の速さで濃くする
          const covered = ranges.reduce((n, r) => (r ? Math.max(n, r.end) : n), 0)
          const rest = answer.slice(covered)
          if (rest.trim()) {
            const seq = t.nextSeq
            ranges[seq] = { start: covered, end: answer.length, text: rest }
            t.skip(seq, rest, (rest.trim().length * MS_PER_CHAR) / 1000)
          }
          t.close()
          await following
        }
        await Promise.all(plays)
      } catch (e) {
        if (!live()) return // 次の質問か「止める」で捨てた
        track?.kill()
        setSpoken(null)
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
          setSpoken(null)
          finishSpeaking()
        }
      }
    },
    [turns, finishSpeaking, guideTo, silence, canSpeak, follow, beginTalk, pointing]
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
            <p className={styles.bubble} ref={bubbleRef}>
              {/* 読み上げには字だけを渡す(濃さの切り替えで同じ文を何度も読ませない) */}
              <span className="visually-hidden" aria-live="polite">
                {bubble}
              </span>
              {spoken === null ? (
                <span aria-hidden="true">{bubble}</span>
              ) : (
                <>
                  <span aria-hidden="true">{bubble.slice(0, spoken)}</span>
                  <span aria-hidden="true" className={styles.pending} ref={pendingRef}>
                    {bubble.slice(spoken)}
                  </span>
                </>
              )}
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
