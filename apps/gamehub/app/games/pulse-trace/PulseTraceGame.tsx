"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { withBasePath } from "../../lib/base-path"

type Screen = "intro" | "countdown" | "playing" | "paused" | "result"
type Note = { lane: number; hitAt: number; hit: boolean }
type Stats = { score: number; combo: number; maxCombo: number; perfect: number; good: number; late: number; miss: number; life: number; elapsed: number }

const ROUND_TIME = 60
const NOTES: Note[] = Array.from({ length: 130 }, (_, index) => {
  const section = index < 34 ? 0 : index < 79 ? 1 : 2
  const interval = [0.6, 0.45, 0.32][section]
  const hitAt = 2.2 + index * interval
  return { lane: (index * 7 + Math.floor(index / 5)) % 4, hitAt, hit: false }
})

function initialStats(): Stats { return { score: 0, combo: 0, maxCombo: 0, perfect: 0, good: 0, late: 0, miss: 0, life: 3, elapsed: 0 } }
function formatScore(value: number) { return Math.floor(value).toString().padStart(6, "0") }
function grade(stats: Stats) { const total = stats.perfect + stats.good + stats.late + stats.miss; const accuracy = total ? (stats.perfect * 100 + stats.good * 70 + stats.late * 35) / total : 0; return accuracy >= 90 ? "S" : accuracy >= 75 ? "A" : accuracy >= 55 ? "B" : "C" }

export default function PulseTraceGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const statsRef = useRef<Stats>(initialStats())
  const notesRef = useRef<Note[]>([])
  const screenRef = useRef<Screen>("intro")
  const soundRef = useRef(true)
  const audioRef = useRef<AudioContext | null>(null)
  const [screen, setScreen] = useState<Screen>("intro")
  const [stats, setStats] = useState<Stats>(initialStats())
  const [soundOn, setSoundOn] = useState(true)
  const [status, setStatus] = useState("WAITING FOR SIGNAL")
  const [highScore, setHighScore] = useState(0)

  useEffect(() => { screenRef.current = screen }, [screen])
  useEffect(() => { soundRef.current = soundOn }, [soundOn])
  useEffect(() => {
    const saved = Number(window.localStorage.getItem("pulse-trace-high-score") || 0)
    const timer = window.setTimeout(() => setHighScore(Number.isFinite(saved) && saved > 0 ? saved : 0), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const tone = useCallback((frequency: number, duration = 0.07) => {
    if (!soundRef.current || !audioRef.current) return
    const audio = audioRef.current
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()
    oscillator.type = "square"
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.045, audio.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration)
    oscillator.connect(gain).connect(audio.destination)
    oscillator.start()
    oscillator.stop(audio.currentTime + duration)
  }, [])

  const finish = useCallback(() => {
    const current = statsRef.current
    const finalScore = current.score + (current.life * 1200)
    const saved = Number(window.localStorage.getItem("pulse-trace-high-score") || 0)
    if (finalScore > saved) { window.localStorage.setItem("pulse-trace-high-score", String(finalScore)); setHighScore(finalScore) }
    setStats({ ...current, score: finalScore })
    setScreen("result"); screenRef.current = "result"; setStatus(current.life ? "RUN COMPLETE" : "SIGNAL LOST"); tone(current.life ? 880 : 120, 0.3)
  }, [tone])

  const startGame = useCallback(() => {
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!audioRef.current && AudioCtor) audioRef.current = new AudioCtor()
    void audioRef.current?.resume()
    notesRef.current = NOTES.map((note) => ({ ...note, hit: false }))
    statsRef.current = initialStats(); setStats(initialStats()); setStatus("GET READY")
    setScreen("countdown"); screenRef.current = "countdown"
    window.setTimeout(() => { if (screenRef.current === "countdown") { setScreen("playing"); screenRef.current = "playing"; setStatus("READ THE BEAT"); tone(660) } }, 3000)
  }, [tone])

  const toggleSound = useCallback(() => { setSoundOn((value) => !value) }, [])
  const judge = useCallback((lane: number) => {
    if (screenRef.current !== "playing") return
    const current = statsRef.current
    const candidate = notesRef.current.find((note) => !note.hit && note.lane === lane && Math.abs(note.hitAt - current.elapsed) <= 0.22)
    if (!candidate) { current.combo = 0; setStatus("MISS"); tone(110); return }
    candidate.hit = true
    const delta = Math.abs(candidate.hitAt - current.elapsed)
    const result = delta <= 0.07 ? "PERFECT" : delta <= 0.14 ? "GOOD" : "LATE"
    const base = result === "PERFECT" ? 1000 : result === "GOOD" ? 600 : 250
    current.combo += 1; current.maxCombo = Math.max(current.maxCombo, current.combo); current.score += base * (1 + Math.min(current.combo - 1, 20) * 0.05)
    if (result === "PERFECT") current.perfect += 1
    else if (result === "GOOD") current.good += 1
    else current.late += 1
    setStatus(result); setStats({ ...current }); tone(result === "PERFECT" ? 880 : 520)
  }, [tone])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (["z", "x", "n", "m", "enter", "escape"].includes(key)) event.preventDefault()
      if (key === "s") toggleSound()
      if ((key === "enter" || key === "r") && (screenRef.current === "intro" || screenRef.current === "result")) startGame()
      if (key === "escape" && screenRef.current === "playing") { setScreen("paused"); screenRef.current = "paused" }
      else if (key === "escape" && screenRef.current === "paused") { setScreen("playing"); screenRef.current = "playing" }
      const lane = { z: 0, x: 1, n: 2, m: 3 }[key as "z" | "x" | "n" | "m"]
      if (lane !== undefined) judge(lane)
    }
    window.addEventListener("keydown", onKeyDown, { passive: false })
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [judge, startGame, toggleSound])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return
    let frame = 0; let last = performance.now(); let hudClock = 0
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now
      const current = statsRef.current
      if (screenRef.current === "playing") {
        current.elapsed += dt; hudClock += dt
        for (const note of notesRef.current) if (!note.hit && current.elapsed - note.hitAt > 0.22) { note.hit = true; current.miss += 1; current.combo = 0; current.life -= 1; setStatus("MISS") }
        if (current.life <= 0 || current.elapsed >= ROUND_TIME) finish()
        else if (hudClock > 0.08) { hudClock = 0; setStats({ ...current }) }
      }
      const rect = canvas.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1); const width = Math.max(1, Math.floor(rect.width * dpr)); const height = Math.max(1, Math.floor(rect.height * dpr))
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height }
      context.setTransform(width / 1000, 0, 0, height / 700, 0, 0); context.fillStyle = "#090a0e"; context.fillRect(0, 0, 1000, 700)
      for (let lane = 0; lane < 4; lane += 1) { const x = lane * 250; context.fillStyle = lane % 2 ? "rgba(245,240,220,.018)" : "rgba(217,255,67,.025)"; context.fillRect(x, 0, 250, 700); context.strokeStyle = "rgba(245,240,220,.12)"; context.strokeRect(x, 0, 250, 700) }
      const lineY = 560; context.strokeStyle = "#d9ff43"; context.lineWidth = 3; context.beginPath(); context.moveTo(24, lineY); context.lineTo(976, lineY); context.stroke()
      for (const note of notesRef.current) { if (note.hit) continue; const y = lineY - (note.hitAt - current.elapsed) * 330; if (y < -40 || y > 730) continue; const x = note.lane * 250 + 125; context.fillStyle = "#f5f0dc"; context.shadowColor = "#d9ff43"; context.shadowBlur = 18; context.beginPath(); context.arc(x, y, 19, 0, Math.PI * 2); context.fill(); context.shadowBlur = 0; context.strokeStyle = "#d9ff43"; context.stroke() }
      context.font = "700 22px monospace"; context.textAlign = "center"; ["Z", "X", "N", "M"].forEach((key, lane) => { context.fillStyle = "rgba(245,240,220,.6)"; context.fillText(key, lane * 250 + 125, 640) })
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw); return () => cancelAnimationFrame(frame)
  }, [finish])

  const accuracy = stats.perfect + stats.good + stats.late + stats.miss ? Math.round((stats.perfect * 100 + stats.good * 70 + stats.late * 35) / (stats.perfect + stats.good + stats.late + stats.miss)) : 0
  return <main className="game-shell pulse-shell">
    <header className="topbar"><div className="brand-lockup"><span className="brand-mark">GH</span><div><strong>{"PULSE//TRACE"}</strong><span>RHYTHM SIGNAL / 01</span></div></div><div className="topbar-actions"><button className="sound-button" type="button" onClick={toggleSound}>SOUND: {soundOn ? "ON" : "OFF"}</button><a className="pulse-back-link" href={withBasePath("/games")}>ALL GAMES</a></div></header>
    <div className="game-layout"><section className="arena-column"><div className="hud-row"><div className="hud-block score-block"><span>SCORE</span><strong>{formatScore(stats.score)}</strong></div><div className="hud-block"><span>COMBO</span><strong>x{String(stats.combo).padStart(2, "0")}</strong></div><div className="hud-block time-block"><span>TIME</span><strong>{String(Math.max(0, Math.ceil(ROUND_TIME - stats.elapsed))).padStart(2, "0")}</strong></div></div><div className="canvas-frame pulse-arena"><canvas ref={canvasRef} aria-label="PULSE//TRACE game arena" />
      {(screen === "intro" || screen === "countdown" || screen === "result" || screen === "paused") && <div className="game-overlay pulse-overlay"><span className="eyebrow">{screen === "countdown" ? "SIGNAL LOCK / " + (3 - Math.min(2, Math.floor(stats.elapsed))) : "READ THE BEAT / HOLD THE LINE"}</span><h1>{"PULSE//"}<span>TRACE</span></h1>{screen === "intro" && <><p className="lead">TAP THE SIGNAL. HOLD THE LINE.</p><p className="intro-copy">ノーツが判定線に重なる瞬間、同じレーンを叩く。<br />キーボードでもタップでもプレイできます。</p><button className="primary-button" type="button" onClick={startGame}>START RUN <span>↗</span></button><span className="key-hint">ENTER / Z X N M TO PLAY</span></>}{screen === "countdown" && <p className="pulse-countdown">GET READY</p>}{screen === "paused" && <><p className="lead">SIGNAL PAUSED</p><button className="primary-button" type="button" onClick={() => { setScreen("playing"); screenRef.current = "playing" }}>RESUME <span>↗</span></button><span className="key-hint">ESC TO RESUME</span></>}{screen === "result" && <><div className="grade">{grade(stats)}</div><p className="result-label">{status}</p><p className="result-score">{formatScore(stats.score)}</p><p className="result-message">ACCURACY {accuracy}% · MAX COMBO {stats.maxCombo}</p><button className="primary-button" type="button" onClick={startGame}>RETRY [R] <span>↻</span></button><span className="key-hint">HIGH SCORE {formatScore(highScore)}</span></>}</div>}
      <span className="corner-label corner-top">PATTERN {String(Math.floor(stats.elapsed / 8) + 1).padStart(2, "0")}</span><span className="corner-label corner-bottom">JUDGMENT LINE / 4-LANE INPUT</span><div className="integrity"><span>LIFE</span><div>{[0, 1, 2].map((life) => <i className={life < stats.life ? "alive" : ""} key={life} />)}</div></div></div><div className="pulse-tap-deck">{["Z", "X", "N", "M"].map((key, lane) => <button key={key} type="button" onPointerDown={() => judge(lane)}>{key}<small>LANE {lane + 1}</small></button>)}</div><div className="pulse-status" aria-live="polite">{status}</div></section>
      <aside className="side-panel pulse-side"><div className="panel-section"><span className="section-index">01 / HOW TO PLAY</span><h2>READ<br />THE<br />BEAT.</h2><p>ノーツが酸性イエローの判定線に重なる瞬間、同じレーンを入力。</p></div><div className="panel-section"><span className="section-index">02 / OPERATE</span><ol><li><b>Z / X / N / M</b><span>FOUR LANES</span></li><li><b>PERFECT ±70MS</b><span>GOOD ±140MS</span></li><li><b>MISS -1 LIFE</b><span>THREE SIGNALS</span></li></ol></div><div className="panel-section record-section"><span className="section-index">03 / LOCAL RECORD</span><div className="record-value">{formatScore(highScore)}</div><div className="record-meta"><span>BEST SIGNAL</span><span>{highScore ? "VERIFIED" : "NO DATA"}</span></div></div></aside>
    </div><footer><span>PULSE//TRACE © 2046 NULL MEMORY LAB</span><span>LOCAL SCORE ONLY · SOUND: {soundOn ? "ON" : "OFF"}</span></footer><div className="sr-only" aria-live="polite">残り{Math.ceil(ROUND_TIME - stats.elapsed)}秒、スコア{stats.score}、ライフ{stats.life}</div>
  </main>
}
