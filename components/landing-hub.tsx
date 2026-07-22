// Editorial "digital studio" portal. No client hooks — pure CSS interactions,
// so this stays a server component. Cross-app links use plain <a> with the
// GitHub Pages basePath prefixed, so a click boots the target app fresh.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

const BRAND = "higgs1729"

type AppEntry = {
  no: string
  category: string
  title: string
  subtitle: string
  href: string
  motif: "nodes" | "grid" | "rings"
}

const apps: AppEntry[] = [
  {
    no: "01",
    category: "AI DESIGN SYSTEM",
    title: "Studio",
    subtitle: "brief から実装まで、UI 設計を契約で固定する。",
    href: `${basePath}/overview/`,
    motif: "nodes",
  },
  {
    no: "02",
    category: "WEB API CATALOG",
    title: "Team T",
    subtitle: "177 の公開 API を、その場で叩いて確かめる。",
    href: `${basePath}/team-t-app/`,
    motif: "grid",
  },
  {
    no: "03",
    category: "3D ARCADE",
    title: "Neon Tunnel",
    subtitle: "被弾ゼロでコイン 3 枚、完全走行を狙う。",
    href: `${basePath}/team-t-app/games/neon-tunnel.html`,
    motif: "rings",
  },
]

function Motif({ kind }: { kind: AppEntry["motif"] }) {
  if (kind === "nodes") {
    return (
      <svg viewBox="0 0 160 96" className="lp-motif" fill="none" aria-hidden="true">
        <polyline points="18,74 54,44 96,58 142,24" className="lp-hair" />
        <line x1="54" y1="44" x2="60" y2="80" className="lp-hair" />
        {[
          [18, 74],
          [54, 44],
          [142, 24],
          [60, 80],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.4" className="lp-node" />
        ))}
        <circle cx="96" cy="58" r="5" className="lp-node-accent" />
      </svg>
    )
  }
  if (kind === "grid") {
    return (
      <svg viewBox="0 0 160 96" className="lp-motif" fill="none" aria-hidden="true">
        {[0, 1, 2].map((r) =>
          [0, 1, 2, 3].map((c) => {
            const accent = r === 1 && c === 1
            return (
              <rect
                key={`${r}-${c}`}
                x={18 + c * 34}
                y={16 + r * 24}
                width="24"
                height="14"
                rx="3"
                className={accent ? "lp-node-accent-fill" : "lp-hair"}
              />
            )
          })
        )}
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 160 96" className="lp-motif" fill="none" aria-hidden="true">
      {[62, 48, 34, 20].map((rx, i) => (
        <ellipse
          key={rx}
          cx="80"
          cy="48"
          rx={rx}
          ry={rx * 0.58}
          className="lp-hair"
          style={{ opacity: 0.3 + i * 0.18 }}
        />
      ))}
      <circle cx="80" cy="48" r="3.6" className="lp-node-accent" />
    </svg>
  )
}

function HeroArt() {
  return (
    <div className="lp-art" aria-hidden="true">
      <svg viewBox="0 0 520 520" className="lp-art-svg" fill="none">
        {/* orbital hairlines */}
        <g transform="rotate(-18 260 260)">
          <ellipse cx="260" cy="260" rx="230" ry="150" className="lp-hair" />
          <ellipse cx="260" cy="260" rx="170" ry="230" className="lp-hair-faint" />
        </g>
        <path
          d="M60 300 C 160 120, 360 120, 470 250"
          className="lp-hair-accent"
        />
        {/* orbit nodes */}
        <circle cx="470" cy="250" r="4.5" className="lp-dot-accent" />
        <circle cx="60" cy="300" r="3.5" className="lp-dot" />
        <circle cx="300" cy="86" r="3" className="lp-dot" />
      </svg>

      <div className="lp-frame lp-frame-c">
        <svg viewBox="0 0 96 96" fill="none" className="lp-diamond">
          <rect
            x="10"
            y="10"
            width="76"
            height="76"
            className="lp-hair"
          />
          <rect
            x="48"
            y="14"
            width="48"
            height="48"
            transform="rotate(45 48 48)"
            className="lp-hair-accent"
          />
          <circle cx="48" cy="48" r="4" className="lp-dot-accent" />
        </svg>
      </div>
    </div>
  )
}

export function LandingHub() {
  return (
    <div className="lp">
      <style>{styles}</style>

      <header className="lp-nav">
        <a href="#top" className="lp-brand">
          <span className="lp-brand-name">{BRAND}</span>
        </a>
        <nav className="lp-nav-links">
          <a href="#apps">Apps</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main id="top">
        <section className="lp-hero">
          <div className="lp-hero-copy">
            <h1 className="lp-title">
              <span className="lp-line">
                <span className="lp-solid">Ideas,</span>
              </span>
              <span className="lp-line">
                <span className="lp-outline">built into</span>{" "}
                <span className="lp-solid">tools.</span>
              </span>
            </h1>
            <div className="lp-cta">
              <a href="#apps" className="lp-btn">
                Explore Apps
                <span className="lp-btn-arrow">↗</span>
              </a>
              <a href="#about" className="lp-link">
                About this studio
              </a>
            </div>
          </div>
          <HeroArt />
        </section>

        <div className="lp-meta-row">
          <span>SELECTED APPS</span>
          <span className="lp-meta-right">
            <span>03 PROJECTS</span>
          </span>
        </div>

        <section id="apps" className="lp-apps">
          {apps.map((app) => (
            <a key={app.no} href={app.href} className="lp-card" aria-label={`${app.title} を開く`}>
              <div className="lp-card-art">
                <Motif kind={app.motif} />
              </div>
              <div className="lp-card-meta">
                <span className="lp-card-cat">
                  {app.no} / {app.category}
                </span>
                <span className="lp-card-arrow">↗</span>
              </div>
              <h2 className="lp-card-title">{app.title}</h2>
              <p className="lp-card-sub">{app.subtitle}</p>
            </a>
          ))}
        </section>

        <section id="about" className="lp-about">
          <div className="lp-about-grid">
            <h2 className="lp-about-title">
              Useful things,
              <br />
              beautifully made.
            </h2>
            <p className="lp-about-body">
              技術とデザインのあいだを行き来しながら、
              触れて気持ちのいい道具をつくっています。
              この入り口から、いま動いている作品へ入れます。
            </p>
          </div>
        </section>
      </main>

      <footer id="contact" className="lp-footer">
        <div className="lp-footer-brand">
          <span>© 2026 {BRAND}</span>
        </div>
        <nav className="lp-footer-links">
          <a href="#apps">Apps</a>
          <a href="#about">About</a>
          <a href="#top">Top</a>
        </nav>
      </footer>
    </div>
  )
}

const styles = `
.lp {
  --bg: #0a0d15;
  --panel: #0e1220;
  --fg: #edeff5;
  --muted: #7c8497;
  --faint: #545c70;
  --line: rgba(255,255,255,0.08);
  --line-strong: rgba(255,255,255,0.16);
  --accent: #6b76ff;
  --accent-2: #34d6e8;
  position: relative;
  min-height: 100svh;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-sans, system-ui, sans-serif);
  overflow-x: clip;
}
/* keep the whole page dark even where content is short / on overscroll */
.lp::before {
  content: "";
  position: fixed; inset: 0; z-index: -1;
  background:
    radial-gradient(90rem 60rem at 78% -10%, rgba(72,86,180,0.16), transparent 60%),
    radial-gradient(60rem 50rem at 12% 8%, rgba(52,120,150,0.10), transparent 55%),
    var(--bg);
}
.lp a { color: inherit; text-decoration: none; }

.lp-mono, .lp-nav-links, .lp-brand-name,
.lp-card-cat, .lp-meta-row, .lp-footer-links {
  font-family: var(--font-mono, ui-monospace, monospace);
}

/* NAV */
.lp-nav {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center; justify-content: space-between;
  gap: 1.5rem;
  padding: 1.15rem clamp(1.25rem, 4vw, 3.5rem);
  border-bottom: 1px solid var(--line);
  background: color-mix(in oklab, var(--bg) 82%, transparent);
  backdrop-filter: blur(10px);
}
.lp-brand { display: flex; align-items: center; gap: 0.6rem; }
.lp-brand-name { font-size: 0.85rem; font-weight: 600; letter-spacing: 0.24em; }
.lp-nav-links { display: none; gap: 2rem; font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); }
.lp-nav-links a { transition: color 0.2s ease; }
.lp-nav-links a:hover { color: var(--fg); }
@media (min-width: 780px) { .lp-nav-links { display: flex; } }

/* HERO */
.lp-hero {
  display: grid; grid-template-columns: 1fr;
  gap: 2.5rem;
  align-items: center;
  padding: clamp(3rem, 8vw, 6.5rem) clamp(1.25rem, 4vw, 3.5rem) clamp(2rem, 4vw, 3rem);
  max-width: 90rem; margin: 0 auto;
}
@media (min-width: 960px) {
  .lp-hero { grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr); gap: 3rem; }
}
.lp-hero-copy { min-width: 0; }
.lp-title {
  margin: 0;
  font-size: clamp(3rem, 10.5vw, 8rem);
  line-height: 0.9; letter-spacing: -0.045em; font-weight: 800;
}
.lp-line { display: block; }
.lp-solid { color: var(--fg); }
.lp-outline {
  color: transparent;
  -webkit-text-stroke: 1.6px color-mix(in oklab, var(--fg) 60%, transparent);
}
.lp-cta { margin-top: 2.6rem; display: flex; align-items: center; gap: 1.6rem; flex-wrap: wrap; }
.lp-btn {
  display: inline-flex; align-items: center; gap: 0.7rem;
  padding: 0.95rem 1.6rem; border-radius: 12px;
  background: linear-gradient(120deg, var(--accent), var(--accent-2));
  color: #05060c; font-weight: 600; font-size: 0.95rem;
  box-shadow: 0 18px 40px -20px var(--accent);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.lp-btn:hover { transform: translateY(-2px); box-shadow: 0 24px 50px -20px var(--accent); }
.lp-btn-arrow { transition: transform 0.2s ease; }
.lp-btn:hover .lp-btn-arrow { transform: translate(2px, -2px); }
.lp-link {
  position: relative; font-size: 0.9rem; color: var(--fg); padding-bottom: 3px;
}
.lp-link::after {
  content: ""; position: absolute; left: 0; bottom: 0; height: 1px; width: 100%;
  background: var(--line-strong); transition: background 0.2s ease;
}
.lp-link:hover::after { background: var(--accent-2); }

/* HERO ART */
.lp-art { display: none; position: relative; aspect-ratio: 1; }
@media (min-width: 960px) { .lp-art { display: block; } }
.lp-art-svg { width: 100%; height: 100%; }
.lp-hair { stroke: var(--line-strong); stroke-width: 1; }
.lp-hair-faint { stroke: var(--line); stroke-width: 1; }
.lp-hair-accent { stroke: color-mix(in oklab, var(--accent) 70%, transparent); stroke-width: 1.2; }
.lp-dot { fill: var(--faint); }
.lp-dot-accent { fill: var(--accent-2); }
.lp-frame {
  position: absolute; display: flex; flex-direction: column; gap: 0.25rem;
  border: 1px solid var(--line); background: color-mix(in oklab, var(--panel) 70%, transparent);
  backdrop-filter: blur(3px);
}
.lp-frame-c { bottom: 12%; right: 16%; padding: 0.5rem; }
.lp-diamond { width: 5.5rem; height: 5.5rem; }

/* META ROW */
.lp-meta-row {
  display: flex; justify-content: space-between; align-items: center; gap: 1rem;
  padding: 1.1rem clamp(1.25rem, 4vw, 3.5rem);
  max-width: 90rem; margin: 0 auto;
  border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
  font-size: 0.66rem; letter-spacing: 0.2em; color: var(--faint);
}
.lp-meta-right { display: flex; gap: 1.5rem; }

/* APPS */
.lp-apps {
  display: grid; grid-template-columns: 1fr; gap: 1px;
  background: var(--line);
  max-width: 90rem; margin: 0 auto;
  border-bottom: 1px solid var(--line);
}
@media (min-width: 720px) { .lp-apps { grid-template-columns: repeat(3, 1fr); } }
.lp-card {
  display: flex; flex-direction: column;
  padding: clamp(1.5rem, 3vw, 2.4rem);
  background: var(--bg);
  min-height: 22rem;
  transition: background 0.25s ease;
}
.lp-card:hover { background: var(--panel); }
.lp-card-art {
  height: 7rem; display: flex; align-items: center; justify-content: center;
  margin-bottom: 1.6rem;
}
.lp-motif { width: 70%; height: 100%; }
.lp-motif .lp-hair { stroke: var(--faint); stroke-width: 1.5; transition: stroke 0.25s ease; }
.lp-card:hover .lp-motif .lp-hair { stroke: var(--muted); }
.lp-node { fill: var(--muted); }
.lp-node-accent { fill: var(--accent-2); }
.lp-node-accent-fill { fill: color-mix(in oklab, var(--accent) 55%, transparent); stroke: var(--accent-2); stroke-width: 1.5; }
.lp-card-meta { display: flex; justify-content: space-between; align-items: center; }
.lp-card-cat { font-size: 0.64rem; letter-spacing: 0.16em; color: var(--faint); }
.lp-card-arrow {
  font-size: 1.05rem; color: var(--faint);
  transition: transform 0.25s ease, color 0.25s ease;
}
.lp-card:hover .lp-card-arrow { transform: translate(3px, -3px); color: var(--accent-2); }
.lp-card-title {
  margin: 0.9rem 0 0; font-size: clamp(1.6rem, 3vw, 2.1rem);
  font-weight: 700; letter-spacing: -0.02em;
}
.lp-card-sub { margin: 0.7rem 0 0; font-size: 0.9rem; line-height: 1.7; color: var(--muted); max-width: 22rem; }

/* ABOUT */
.lp-about {
  padding: clamp(4rem, 9vw, 7rem) clamp(1.25rem, 4vw, 3.5rem);
  max-width: 90rem; margin: 0 auto;
}
.lp-about-grid {
  display: grid; grid-template-columns: 1fr; gap: 2rem;
  align-items: end;
}
@media (min-width: 860px) {
  .lp-about-grid { grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 4rem; }
}
.lp-about-title {
  margin: 0; font-size: clamp(2.4rem, 6vw, 4.6rem);
  line-height: 1.02; letter-spacing: -0.04em; font-weight: 800;
}
.lp-about-body { font-size: clamp(0.95rem, 2vw, 1.1rem); line-height: 1.95; color: var(--muted); }

/* FOOTER */
.lp-footer {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.25rem;
  padding: 2rem clamp(1.25rem, 4vw, 3.5rem);
  max-width: 90rem; margin: 0 auto;
  border-top: 1px solid var(--line);
  font-size: 0.72rem; letter-spacing: 0.08em; color: var(--faint);
}
.lp-footer-brand { display: flex; align-items: center; gap: 0.7rem; }
.lp-footer-links { display: flex; gap: 1.6rem; text-transform: uppercase; letter-spacing: 0.16em; }
.lp-footer-links a { transition: color 0.2s ease; }
.lp-footer-links a:hover { color: var(--fg); }

@media (prefers-reduced-motion: reduce) {
  .lp * { transition: none !important; }
}
`
