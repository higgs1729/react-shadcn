"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const WORLD = { width: 1000, height: 700 }
const ROUND_TIME = 60
const ECHO_WINDOW = 6

type Screen = "intro" | "playing" | "over"
type Point = { x: number; y: number; t: number }
type Echo = {
  points: Point[]
  born: number
  speed: number
  nearCooldown: number
}
type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
}
type Game = {
  elapsed: number
  score: number
  combo: number
  lives: number
  player: { x: number; y: number; dx: number; dy: number }
  history: Point[]
  echoes: Echo[]
  shard: { x: number; y: number; life: number } | null
  shardDelay: number
  collected: number
  lastEchoAt: number
  sampleClock: number
  phase: number
  phaseCooldown: number
  invulnerable: number
  shake: number
  particles: Particle[]
}

type Hud = {
  time: number
  score: number
  combo: number
  lives: number
  echoes: number
  phaseCooldown: number
  nextEcho: number
}

const initialHud: Hud = {
  time: ROUND_TIME,
  score: 0,
  combo: 1,
  lives: 3,
  echoes: 0,
  phaseCooldown: 0,
  nextEcho: ECHO_WINDOW,
}

function newGame(): Game {
  return {
    elapsed: 0,
    score: 0,
    combo: 1,
    lives: 3,
    player: { x: WORLD.width / 2, y: WORLD.height / 2, dx: 1, dy: 0 },
    history: [{ x: WORLD.width / 2, y: WORLD.height / 2, t: 0 }],
    echoes: [],
    shard: null,
    shardDelay: 0.8,
    collected: 0,
    lastEchoAt: 0,
    sampleClock: 0,
    phase: 0,
    phaseCooldown: 0,
    invulnerable: 0,
    shake: 0,
    particles: [],
  }
}

function distance(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

function gradeFor(score: number, won: boolean) {
  if (won && score >= 14000) return "S"
  if (won || score >= 9000) return "A"
  if (score >= 5500) return "B"
  return "C"
}

export default function EchoShiftGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<Game>(newGame())
  const screenRef = useRef<Screen>("intro")
  const audioRef = useRef<AudioContext | null>(null)
  const soundRef = useRef(true)
  const [screen, setScreen] = useState<Screen>("intro")
  const [hud, setHud] = useState<Hud>(initialHud)
  const [soundOn, setSoundOn] = useState(true)
  const [highScore, setHighScore] = useState(0)
  const [result, setResult] = useState<{ score: number; won: boolean } | null>(
    null
  )

  useEffect(() => {
    screenRef.current = screen
  }, [screen])

  useEffect(() => {
    soundRef.current = soundOn
  }, [soundOn])

  useEffect(() => {
    const saved = Number(
      window.localStorage.getItem("echo-shift-high-score") || 0
    )
    const timer = window.setTimeout(() => setHighScore(saved), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const tone = useCallback(
    (frequency: number, duration = 0.08, volume = 0.05) => {
      if (!soundRef.current) return
      const audio = audioRef.current
      if (!audio) return
      const oscillator = audio.createOscillator()
      const gain = audio.createGain()
      oscillator.type = "square"
      oscillator.frequency.setValueAtTime(frequency, audio.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(80, frequency * 0.72),
        audio.currentTime + duration
      )
      gain.gain.setValueAtTime(volume, audio.currentTime)
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audio.currentTime + duration
      )
      oscillator.connect(gain)
      gain.connect(audio.destination)
      oscillator.start()
      oscillator.stop(audio.currentTime + duration)
    },
    []
  )

  const burst = useCallback(
    (game: Game, x: number, y: number, color: string, amount: number) => {
      for (let i = 0; i < amount; i += 1) {
        const angle = Math.random() * Math.PI * 2
        const speed = 70 + Math.random() * 180
        game.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.35 + Math.random() * 0.45,
          color,
        })
      }
    },
    []
  )

  const finishRun = useCallback(
    (game: Game, won: boolean) => {
      const finalScore = Math.floor(game.score + (won ? game.lives * 1200 : 0))
      const saved = Number(
        window.localStorage.getItem("echo-shift-high-score") || 0
      )
      if (finalScore > saved) {
        window.localStorage.setItem("echo-shift-high-score", String(finalScore))
        setHighScore(finalScore)
      }
      setResult({ score: finalScore, won })
      setScreen("over")
      screenRef.current = "over"
      tone(won ? 880 : 120, 0.35, 0.075)
    },
    [tone]
  )

  const startGame = useCallback(() => {
    if (!audioRef.current) {
      const AudioCtor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (AudioCtor) audioRef.current = new AudioCtor()
    }
    void audioRef.current?.resume()
    gameRef.current = newGame()
    setHud(initialHud)
    setResult(null)
    setScreen("playing")
    screenRef.current = "playing"
    tone(520, 0.12, 0.055)
  }, [tone])

  const setDirection = useCallback(
    (dx: number, dy: number) => {
      if (screenRef.current !== "playing") return
      gameRef.current.player.dx = dx
      gameRef.current.player.dy = dy
      tone(260, 0.025, 0.018)
    },
    [tone]
  )

  const activatePhase = useCallback(() => {
    if (screenRef.current !== "playing") return
    const game = gameRef.current
    if (game.phaseCooldown > 0 || game.phase > 0) return
    game.phase = 1.05
    game.phaseCooldown = 5.5
    burst(game, game.player.x, game.player.y, "#d9ff43", 18)
    tone(720, 0.18, 0.06)
  }, [burst, tone])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (
        ["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)
      ) {
        event.preventDefault()
      }
      if ((key === "enter" || key === "r") && screenRef.current !== "playing")
        startGame()
      if (key === "arrowup" || key === "w") setDirection(0, -1)
      if (key === "arrowdown" || key === "s") setDirection(0, 1)
      if (key === "arrowleft" || key === "a") setDirection(-1, 0)
      if (key === "arrowright" || key === "d") setDirection(1, 0)
      if (key === " ") activatePhase()
    }
    window.addEventListener("keydown", onKeyDown, { passive: false })
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [activatePhase, setDirection, startGame])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return

    let frame = 0
    let last = performance.now()
    let hudClock = 0

    const spawnShard = (game: Game) => {
      let x = 0
      let y = 0
      for (let tries = 0; tries < 20; tries += 1) {
        x = 70 + Math.random() * (WORLD.width - 140)
        y = 70 + Math.random() * (WORLD.height - 140)
        if (distance(x, y, game.player.x, game.player.y) > 180) break
      }
      game.shard = { x, y, life: 6.5 }
    }

    const getEchoPoint = (echo: Echo, elapsed: number) => {
      const progress =
        (((elapsed - echo.born) * echo.speed) % ECHO_WINDOW) / ECHO_WINDOW
      const index = Math.floor(progress * (echo.points.length - 1))
      return echo.points[Math.max(0, Math.min(echo.points.length - 1, index))]
    }

    const update = (game: Game, dt: number) => {
      game.elapsed += dt
      game.phase = Math.max(0, game.phase - dt)
      game.phaseCooldown = Math.max(0, game.phaseCooldown - dt)
      game.invulnerable = Math.max(0, game.invulnerable - dt)
      game.shake = Math.max(0, game.shake - dt * 3.5)
      game.combo = Math.max(1, game.combo - dt * 0.075)
      game.score += dt * 105 * game.combo

      const speed = 220 + Math.min(42, game.elapsed * 0.7)
      game.player.x += game.player.dx * speed * dt
      game.player.y += game.player.dy * speed * dt
      const margin = 28
      if (game.player.x < -margin) game.player.x = WORLD.width + margin
      if (game.player.x > WORLD.width + margin) game.player.x = -margin
      if (game.player.y < -margin) game.player.y = WORLD.height + margin
      if (game.player.y > WORLD.height + margin) game.player.y = -margin

      game.sampleClock += dt
      if (game.sampleClock >= 0.045) {
        game.sampleClock = 0
        game.history.push({
          x: game.player.x,
          y: game.player.y,
          t: game.elapsed,
        })
        game.history = game.history.filter(
          (point) => point.t >= game.elapsed - ECHO_WINDOW - 0.2
        )
      }

      if (game.elapsed - game.lastEchoAt >= ECHO_WINDOW) {
        const points = game.history.map((point) => ({ ...point }))
        if (points.length > 20) {
          const index = game.echoes.length
          game.echoes.push({
            points,
            born: game.elapsed,
            speed: 1 + Math.floor(index / 3) * 0.08,
            nearCooldown: 0,
          })
          burst(game, points[0].x, points[0].y, "#9e8cff", 22)
          tone(150 + index * 12, 0.22, 0.06)
        }
        game.lastEchoAt = game.elapsed
      }

      game.shardDelay -= dt
      if (!game.shard && game.shardDelay <= 0) spawnShard(game)
      if (game.shard) {
        game.shard.life -= dt
        const shardDistance = distance(
          game.player.x,
          game.player.y,
          game.shard.x,
          game.shard.y
        )
        if (shardDistance < 40) {
          game.score += 650 * game.combo
          game.combo = Math.min(8, game.combo + 0.65)
          game.collected += 1
          game.phaseCooldown = Math.max(0, game.phaseCooldown - 0.75)
          burst(game, game.shard.x, game.shard.y, "#f5f0dc", 20)
          tone(860 + game.combo * 38, 0.09, 0.05)
          game.shard = null
          game.shardDelay = 0.65
        } else if (game.shard.life <= 0) {
          game.shard = null
          game.shardDelay = 0.45
          game.combo = Math.max(1, game.combo - 0.45)
        }
      }

      for (const echo of game.echoes) {
        echo.nearCooldown = Math.max(0, echo.nearCooldown - dt)
        const point = getEchoPoint(echo, game.elapsed)
        const echoDistance = distance(
          game.player.x,
          game.player.y,
          point.x,
          point.y
        )
        if (echoDistance < 43 && game.phase <= 0 && game.invulnerable <= 0) {
          game.lives -= 1
          game.combo = 1
          game.invulnerable = 1.45
          game.shake = 1
          burst(game, game.player.x, game.player.y, "#ff6b5f", 32)
          tone(95, 0.28, 0.085)
          if (game.lives <= 0) {
            finishRun(game, false)
            return
          }
        } else if (
          echoDistance >= 46 &&
          echoDistance < 76 &&
          game.phase <= 0 &&
          echo.nearCooldown <= 0
        ) {
          game.score += 55 * game.combo
          game.combo = Math.min(8, game.combo + 0.12)
          echo.nearCooldown = 0.75
          tone(390, 0.035, 0.014)
        }
      }

      for (const particle of game.particles) {
        particle.x += particle.vx * dt
        particle.y += particle.vy * dt
        particle.vx *= 0.97
        particle.vy *= 0.97
        particle.life -= dt
      }
      game.particles = game.particles.filter((particle) => particle.life > 0)

      if (game.elapsed >= ROUND_TIME) finishRun(game, true)
    }

    const draw = (game: Game, now: number) => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const width = Math.max(1, Math.floor(rect.width * dpr))
      const height = Math.max(1, Math.floor(rect.height * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      context.setTransform(
        width / WORLD.width,
        0,
        0,
        height / WORLD.height,
        0,
        0
      )
      context.clearRect(0, 0, WORLD.width, WORLD.height)
      context.fillStyle = "#090a0e"
      context.fillRect(0, 0, WORLD.width, WORLD.height)

      const shakeX =
        game.shake > 0 ? (Math.random() - 0.5) * 12 * game.shake : 0
      const shakeY =
        game.shake > 0 ? (Math.random() - 0.5) * 12 * game.shake : 0
      context.save()
      context.translate(shakeX, shakeY)

      context.lineWidth = 1
      for (let x = 0; x <= WORLD.width; x += 50) {
        context.strokeStyle =
          x % 200 === 0 ? "rgba(217,255,67,.10)" : "rgba(255,255,255,.035)"
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x, WORLD.height)
        context.stroke()
      }
      for (let y = 0; y <= WORLD.height; y += 50) {
        context.strokeStyle =
          y % 200 === 0 ? "rgba(217,255,67,.10)" : "rgba(255,255,255,.035)"
        context.beginPath()
        context.moveTo(0, y)
        context.lineTo(WORLD.width, y)
        context.stroke()
      }

      context.strokeStyle = "rgba(217,255,67,.34)"
      context.lineWidth = 2
      context.strokeRect(13, 13, WORLD.width - 26, WORLD.height - 26)

      if (game.history.length > 2) {
        context.strokeStyle = "rgba(217,255,67,.18)"
        context.lineWidth = 3
        context.beginPath()
        game.history.forEach((point, index) => {
          if (index === 0) context.moveTo(point.x, point.y)
          else if (
            distance(
              point.x,
              point.y,
              game.history[index - 1].x,
              game.history[index - 1].y
            ) < 90
          ) {
            context.lineTo(point.x, point.y)
          } else {
            context.moveTo(point.x, point.y)
          }
        })
        context.stroke()
      }

      for (let echoIndex = 0; echoIndex < game.echoes.length; echoIndex += 1) {
        const echo = game.echoes[echoIndex]
        const point = getEchoPoint(echo, game.elapsed)
        context.strokeStyle = "rgba(158,140,255,.10)"
        context.lineWidth = 2
        context.beginPath()
        echo.points.forEach((trailPoint, index) => {
          if (index === 0) context.moveTo(trailPoint.x, trailPoint.y)
          else if (
            distance(
              trailPoint.x,
              trailPoint.y,
              echo.points[index - 1].x,
              echo.points[index - 1].y
            ) < 90
          )
            context.lineTo(trailPoint.x, trailPoint.y)
          else context.moveTo(trailPoint.x, trailPoint.y)
        })
        context.stroke()

        const pulse = 1 + Math.sin(now * 0.009 + echoIndex) * 0.12
        context.fillStyle = "rgba(158,140,255,.14)"
        context.beginPath()
        context.arc(point.x, point.y, 33 * pulse, 0, Math.PI * 2)
        context.fill()
        context.strokeStyle = "#9e8cff"
        context.lineWidth = 4
        context.beginPath()
        context.arc(point.x, point.y, 18, 0, Math.PI * 2)
        context.stroke()
        context.fillStyle = "#9e8cff"
        context.fillRect(point.x - 4, point.y - 4, 8, 8)
      }

      if (game.shard) {
        const shard = game.shard
        const pulse = 1 + Math.sin(now * 0.012) * 0.14
        context.save()
        context.translate(shard.x, shard.y)
        context.rotate(now * 0.0015)
        context.strokeStyle = "#f5f0dc"
        context.shadowColor = "#f5f0dc"
        context.shadowBlur = 18
        context.lineWidth = 3
        context.strokeRect(-12 * pulse, -12 * pulse, 24 * pulse, 24 * pulse)
        context.fillStyle = "rgba(245,240,220,.26)"
        context.fillRect(-7, -7, 14, 14)
        context.restore()
      }

      for (const particle of game.particles) {
        context.globalAlpha = Math.min(1, particle.life * 2.2)
        context.fillStyle = particle.color
        context.fillRect(particle.x - 3, particle.y - 3, 6, 6)
      }
      context.globalAlpha = 1

      const player = game.player
      const flicker = game.invulnerable > 0 && Math.floor(now / 70) % 2 === 0
      if (!flicker) {
        context.save()
        context.translate(player.x, player.y)
        const angle = Math.atan2(player.dy, player.dx)
        context.rotate(angle)
        if (game.phase > 0) {
          context.strokeStyle = "rgba(217,255,67,.5)"
          context.lineWidth = 3
          context.beginPath()
          context.arc(0, 0, 38 + Math.sin(now * 0.02) * 8, 0, Math.PI * 2)
          context.stroke()
        }
        context.shadowColor = "#d9ff43"
        context.shadowBlur = 22
        context.fillStyle = "#d9ff43"
        context.beginPath()
        context.moveTo(25, 0)
        context.lineTo(-15, 16)
        context.lineTo(-8, 0)
        context.lineTo(-15, -16)
        context.closePath()
        context.fill()
        context.shadowBlur = 0
        context.fillStyle = "#090a0e"
        context.fillRect(-8, -4, 11, 8)
        context.restore()
      }

      context.restore()

      const urgency = Math.max(0, 1 - (ROUND_TIME - game.elapsed) / 10)
      if (urgency > 0 && screenRef.current === "playing") {
        context.fillStyle = `rgba(255,107,95,${urgency * (0.04 + Math.sin(now * 0.012) * 0.025)})`
        context.fillRect(0, 0, WORLD.width, WORLD.height)
      }
    }

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const game = gameRef.current
      if (screenRef.current === "playing") update(game, dt)
      draw(game, now)
      hudClock += dt
      if (hudClock > 0.08) {
        hudClock = 0
        setHud({
          time: Math.max(0, ROUND_TIME - game.elapsed),
          score: Math.floor(game.score),
          combo: game.combo,
          lives: game.lives,
          echoes: game.echoes.length,
          phaseCooldown: game.phaseCooldown,
          nextEcho: Math.max(0, ECHO_WINDOW - (game.elapsed - game.lastEchoAt)),
        })
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [burst, finishRun, tone])

  const phaseReady = hud.phaseCooldown <= 0
  const finalGrade = result ? gradeFor(result.score, result.won) : ""

  return (
    <main className="game-shell">
      <header className="topbar">
        <div className="brand-lockup" aria-label="Echo Shift">
          <span className="brand-mark" aria-hidden="true">
            E/S
          </span>
          <div>
            <strong>ECHO//SHIFT</strong>
            <span>PROTOCOL 06</span>
          </div>
        </div>
        <div className="topbar-actions">
          <button
            className="sound-button"
            type="button"
            aria-label={soundOn ? "サウンドをオフ" : "サウンドをオン"}
            onClick={() => setSoundOn((value) => !value)}
          >
            SOUND {soundOn ? "ON" : "OFF"}
          </button>
        </div>
      </header>

      <div className="game-layout">
        <section className="arena-column" aria-label="ゲームエリア">
          <div className="hud-row">
            <div className="hud-block score-block">
              <span>SCORE</span>
              <strong>{hud.score.toString().padStart(6, "0")}</strong>
            </div>
            <div className="hud-block">
              <span>CHAIN</span>
              <strong>×{hud.combo.toFixed(1)}</strong>
            </div>
            <div className="hud-block time-block">
              <span>REMAIN</span>
              <strong className={hud.time < 10 ? "danger" : ""}>
                {hud.time.toFixed(1)}
              </strong>
            </div>
          </div>

          <div className="canvas-frame">
            <canvas ref={canvasRef} aria-label="Echo Shift ゲーム画面" />
            <div className="corner-label corner-top">
              FIELD_01 / WRAP ENABLED
            </div>
            <div className="corner-label corner-bottom">
              ECHO IN {hud.nextEcho.toFixed(1)} SEC
            </div>

            {screen === "intro" && (
              <div className="game-overlay intro-overlay">
                <span className="eyebrow">A 60 SECOND MEMORY TRAP</span>
                <h1>
                  {"ECHO"}
                  <span>{"//"}</span>
                  <br />
                  SHIFT
                </h1>
                <p className="lead">6秒前の自分が、敵になる。</p>
                <p className="intro-copy">
                  移動ルートは6秒ごとに残像として再生される。
                  <br />
                  自分の過去を避けながら、60秒間生き残れ。
                </p>
                <button
                  className="primary-button"
                  type="button"
                  onClick={startGame}
                >
                  ENTER THE LOOP <span>↗</span>
                </button>
                <span className="key-hint">ENTER TO START</span>
              </div>
            )}

            {screen === "over" && result && (
              <div className="game-overlay result-overlay">
                <span className="eyebrow">
                  {result.won ? "PROTOCOL COMPLETE" : "SIGNAL LOST"}
                </span>
                <div className="grade" aria-label={`ランク ${finalGrade}`}>
                  {finalGrade}
                </div>
                <p className="result-label">FINAL SCORE</p>
                <p className="result-score">
                  {result.score.toString().padStart(6, "0")}
                </p>
                <p className="result-message">
                  {result.won
                    ? "過去を置き去りにした。"
                    : "過去の軌道に捕捉された。"}
                </p>
                <button
                  className="primary-button"
                  type="button"
                  onClick={startGame}
                >
                  RUN IT BACK <span>↻</span>
                </button>
                <span className="key-hint">R / ENTER TO RETRY</span>
              </div>
            )}

            <div className="integrity" aria-label={`残りライフ ${hud.lives}`}>
              <span>INTEGRITY</span>
              <div>
                {[0, 1, 2].map((life) => (
                  <i className={life < hud.lives ? "alive" : ""} key={life} />
                ))}
              </div>
            </div>
          </div>

          <div className="control-deck">
            <div className="dpad" aria-label="移動操作">
              <button
                type="button"
                aria-label="上へ移動"
                onPointerDown={() => setDirection(0, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label="左へ移動"
                onPointerDown={() => setDirection(-1, 0)}
              >
                ←
              </button>
              <button
                type="button"
                aria-label="下へ移動"
                onPointerDown={() => setDirection(0, 1)}
              >
                ↓
              </button>
              <button
                type="button"
                aria-label="右へ移動"
                onPointerDown={() => setDirection(1, 0)}
              >
                →
              </button>
            </div>
            <div className="phase-control">
              <div className="phase-copy">
                <span>EMERGENCY PHASE</span>
                <small>
                  {phaseReady
                    ? "READY — ECHOを1秒間すり抜ける"
                    : `RECHARGING ${hud.phaseCooldown.toFixed(1)}s`}
                </small>
              </div>
              <div className="phase-meter" aria-hidden="true">
                <i
                  style={{
                    width: `${phaseReady ? 100 : Math.max(0, 100 - (hud.phaseCooldown / 5.5) * 100)}%`,
                  }}
                />
              </div>
              <button
                type="button"
                className={`phase-button ${phaseReady ? "ready" : ""}`}
                onClick={activatePhase}
                disabled={!phaseReady || screen !== "playing"}
              >
                <span>SPACE</span>
                SHIFT
              </button>
            </div>
          </div>
        </section>

        <aside className="side-panel">
          <div className="panel-section mission-section">
            <span className="section-index">01 / MISSION</span>
            <h2>
              RUN FROM
              <br />
              WHAT YOU
              <br />
              JUST DID.
            </h2>
            <p>
              白いシグナルを集めるとスコア倍率が上昇し、SHIFTの再使用時間も短縮される。
            </p>
          </div>

          <div className="panel-section steps-section">
            <span className="section-index">02 / OPERATE</span>
            <ol>
              <li>
                <b>MOVE</b>
                <span>WASD / ARROW</span>
              </li>
              <li>
                <b>PHASE</b>
                <span>SPACE / BUTTON</span>
              </li>
              <li>
                <b>SURVIVE</b>
                <span>60.0 SECONDS</span>
              </li>
            </ol>
          </div>

          <div className="panel-section record-section">
            <span className="section-index">03 / LOCAL RECORD</span>
            <div className="record-value">
              {highScore.toString().padStart(6, "0")}
            </div>
            <div className="record-meta">
              <span>BEST SIGNAL</span>
              <span>{highScore ? "VERIFIED" : "NO DATA"}</span>
            </div>
          </div>

          <div className="echo-legend">
            <span>
              <i className="you-dot" /> YOU / LIVE
            </span>
            <span>
              <i className="echo-dot" /> YOU / 6 SEC AGO
            </span>
          </div>
        </aside>
      </div>

      <footer>
        <span>ECHO//SHIFT © 2046 NULL MEMORY LAB</span>
        <span>NO COOKIES · LOCAL SCORE ONLY</span>
      </footer>
      <div className="sr-only" aria-live="polite">
        残り{Math.ceil(hud.time)}秒、スコア{hud.score}、ライフ{hud.lives}
      </div>
    </main>
  )
}
