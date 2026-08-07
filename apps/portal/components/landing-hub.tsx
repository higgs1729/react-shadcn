/* eslint-disable @next/next/no-img-element -- static-exported source artwork has fixed, pre-cut dimensions */
// The portal stays a server component with no shared app state. Plain anchors
// preserve GitHub Pages basePath behavior while every app remains independently
// bootable inside the monorepo.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

// GAMEHUB is a Cloudflare Workers app (vinext + SSR) developed in
// tmp/AI_game_contest, so it cannot join the static Pages composition the way
// the sibling apps do. In dev, point at its own dev server so the card is
// actually clickable; the built site keeps linking to the source. Set
// NEXT_PUBLIC_GAMEHUB_URL to override once it has a real deployment.
const gamehubHref =
  process.env.NEXT_PUBLIC_GAMEHUB_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3001/"
    : "https://github.com/higgs1729/react-shadcn/tree/master/tmp/AI_game_contest")

type AppEntry = {
  id: string
  purpose: string
  title: string
  description: string
  href: string
  action: string
  logo: string
}

const apps: AppEntry[] = [
  {
    id: "studio",
    purpose: "UI設計の過程を見る",
    title: "AI Design System Studio",
    description:
      "briefから実装までを分解し、採用したパターン、選定理由、検証結果をまとめた設計ポートフォリオです。",
    href: `${basePath}/studio/overview/`,
    action: "Studioを開く",
    logo: "logo-studio.png",
  },
  {
    id: "team-t",
    purpose: "公開APIを探して試す",
    title: "Team T",
    description:
      "目的やカテゴリから公開APIを探し、その場で仕様とレスポンスを確かめられる開発者向けカタログです。",
    href: `${basePath}/team-t/`,
    action: "Team Tを開く",
    logo: "logo-team-t.png",
  },
  {
    id: "python-test",
    purpose: "Python試験を練習する",
    title: "データ分析試験 模擬問題集",
    description:
      "Python3エンジニア認定データ分析試験に向けて、分野や難易度を選び、誤答を繰り返し復習できます。",
    href: `${basePath}/python-test/`,
    action: "問題集を開く",
    logo: "logo-python-test.png",
  },
  {
    id: "gamehub",
    purpose: "ブラウザゲームで遊ぶ",
    title: "GAMEHUB",
    description:
      "ブラウザですぐ遊べるゲームを集めた個人ゲームハブです。注目タイトルやゲーム一覧から、遊びたいゲームを探せます。",
    href: gamehubHref,
    action: "GAMEHUBを見る",
    logo: "logo-gamehub.svg",
  },
]

function assetPath(fileName: string) {
  return `${basePath}/design-assets/${fileName}`
}

function BreakableCopy({ children }: { children: string }) {
  const segments = children.split("、")

  return segments.map((segment, index) => (
    <span className="portal-copy-segment" key={`${segment}-${index}`}>
      {segment}
      {index < segments.length - 1 ? "、" : null}
      {index < segments.length - 1 ? <wbr /> : null}
    </span>
  ))
}

export function LandingHub() {
  return (
    <div className="portal" id="portal-top">
      <style>{styles}</style>

      <header className="portal-header">
        <a className="portal-brand" href={`${basePath}/`}>
          higgs1729
        </a>
        <nav className="portal-nav" aria-label="サイト内ナビゲーション">
          <a href={`${basePath}/works/`}>作品紹介</a>
          <a href={`${basePath}/projects/`}>進行中のプロジェクト</a>
          <a href={`${basePath}/activities/`}>継続的な活動</a>
        </nav>
      </header>

      <figure className="portal-coordinate-system" aria-hidden="true">
        <img
          className="portal-axis-y-head"
          src={assetPath("axis-y-head.png")}
          alt=""
        />
        <img
          className="portal-axis-y-tail"
          src={assetPath("axis-y-tail.png")}
          alt=""
        />
        <div className="portal-axis-x">
          <span className="portal-axis-x-stroke">
            <img src={assetPath("axis-x.png")} alt="" />
          </span>
          <span className="portal-axis-x-arrow">
            <img src={assetPath("axis-x.png")} alt="" />
          </span>
          <span className="portal-axis-x-label">
            <img src={assetPath("axis-x.png")} alt="" />
          </span>
        </div>
        <span className="portal-axis-origin-label">
          <img src={assetPath("axis-x.png")} alt="" />
        </span>
        <img
          className="portal-integral-curve"
          src={assetPath("integral-curve.png")}
          alt=""
        />
      </figure>

      <main className="portal-main">
        <section className="portal-hero" aria-labelledby="portal-title">
          <div className="portal-hero-copy">
            <p className="portal-kicker">WEB APPS</p>
            <h1 id="portal-title">
              <span>公開中のアプリを、</span>
              <span>今すぐ使おう。</span>
            </h1>
            <p className="portal-lead">
              <span>制作物のうちウェブ上で利用できるアプリを、</span>
              <span>
                ここにまとめています。すべてブラウザから直接開けます。
              </span>
            </p>
          </div>
        </section>

        <section className="portal-directory" aria-labelledby="directory-title">
          <div className="portal-directory-heading">
            <h2 id="directory-title">
              アプリ一覧 <span aria-hidden="true">= [</span>
            </h2>
          </div>

          <ol className="portal-list">
            {apps.map((app) => (
              <li key={app.id} className="portal-item">
                <article className="portal-app">
                  <span
                    className="portal-brace portal-brace-open"
                    aria-hidden="true"
                  >
                    {"{"}
                  </span>

                  <img
                    className="portal-app-logo"
                    src={assetPath(app.logo)}
                    alt=""
                    width="100"
                    height="100"
                  />

                  <div className="portal-app-body">
                    <p className="portal-purpose">{app.purpose}</p>
                    <h3>{app.title}</h3>
                    <p className="portal-description">
                      <BreakableCopy>{app.description}</BreakableCopy>
                    </p>
                  </div>

                  <a className="portal-action" href={app.href}>
                    <span>{app.action}</span>
                    <img
                      src={assetPath("arrow-right.png")}
                      alt=""
                      width="33"
                      height="33"
                    />
                  </a>

                  <span
                    className="portal-brace portal-brace-close"
                    aria-hidden="true"
                  >
                    {"},"}
                  </span>
                </article>
              </li>
            ))}
          </ol>

          <div className="portal-list-end" aria-hidden="true">
            ]
          </div>
        </section>
      </main>

      <footer className="portal-footer">
        <span>© 2026 higgs1729</span>
        <a href="#portal-top">ページ上部へ</a>
      </footer>
    </div>
  )
}

const styles = `
.portal {
  --portal-bg: #f8f4f3;
  --portal-fg: #070707;
  --portal-muted: #3f3d3a;
  --portal-line: #d8d2ce;
  --portal-accent: #ea4b17;
  --portal-link: #2563eb;
  --portal-header-height: 3.375rem;
  --portal-hero-height: 26.25rem;
  --portal-content-left: clamp(4.4rem, 12.24vw, 11.75rem);
  --portal-content-right: clamp(1rem, 7.3vw, 7rem);
  --portal-origin-x: clamp(2.25rem, 8.14vw, 7.75rem);
  --portal-axis-left: clamp(0.75rem, 2.1vw, 2rem);
  --portal-axis-y-width: 2.8125rem;
  --portal-axis-y-head-height: 27.125rem;
  --portal-curve-left: 30.6%;
  --portal-curve-width: 63.3%;
  --portal-curve-height: 23.375rem;
  --portal-curve-opacity: 1;
  position: relative;
  min-height: 64rem;
  overflow-x: clip;
  background: var(--portal-bg);
  color: var(--portal-fg);
  font-family: var(--font-sans, system-ui, sans-serif);
}

.portal *, .portal *::before, .portal *::after { box-sizing: border-box; }
.portal a { color: inherit; text-decoration: none; }
.portal img { user-select: none; }

.portal-header {
  position: sticky;
  top: 0;
  z-index: 40;
  height: var(--portal-header-height);
  display: flex;
  align-items: center;
  padding-inline: clamp(1rem, 6.77vw, 6.5rem);
  background: #030303;
  color: #fff;
}
.portal-brand {
  font-size: 1.15rem;
  font-weight: 720;
  letter-spacing: -0.02em;
}
.portal-nav {
  display: flex;
  align-items: center;
  gap: clamp(0.85rem, 2.5vw, 2.5rem);
  margin-left: auto;
  font-size: 0.78rem;
  font-weight: 620;
}
.portal-nav a {
  color: #d6d6d6;
  transition: color 140ms ease;
}
.portal-nav a:hover { color: #fff; }
.portal-nav a:focus-visible {
  outline: 2px solid var(--portal-accent);
  outline-offset: 5px;
}

.portal-coordinate-system {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  pointer-events: none;
}
.portal-axis-y-head,
.portal-axis-y-tail,
.portal-axis-x,
.portal-axis-origin-label,
.portal-integral-curve {
  position: absolute;
}
.portal-axis-y-head,
.portal-axis-y-tail,
.portal-integral-curve,
.portal-axis-x img,
.portal-axis-origin-label img {
  max-width: none;
}
.portal-axis-y-head,
.portal-axis-y-tail {
  z-index: 3;
  left: var(--portal-origin-x);
  width: var(--portal-axis-y-width);
}
.portal-axis-y-head {
  top: calc(var(--portal-header-height) + var(--portal-hero-height));
  height: var(--portal-axis-y-head-height);
  transform: translate(-65.556%, -90.553%);
}
.portal-axis-y-tail {
  top: calc(var(--portal-header-height) + var(--portal-hero-height));
  height: calc(100% - var(--portal-header-height) - var(--portal-hero-height) - 1rem);
  transform: translateX(-65.556%);
}
.portal-axis-x {
  z-index: 3;
  top: calc(var(--portal-header-height) + var(--portal-hero-height));
  right: 0;
  left: var(--portal-axis-left);
  height: 2px;
  transform: translateY(-50%);
}
.portal-axis-x-stroke,
.portal-axis-x-arrow,
.portal-axis-x-label,
.portal-axis-origin-label {
  display: block;
  overflow: hidden;
}
.portal-axis-x-stroke {
  position: absolute;
  inset: 0;
}
.portal-axis-x-stroke img {
  position: absolute;
  top: -11px;
  left: 0;
  width: 100%;
  height: 38px;
}
.portal-axis-x-arrow {
  position: absolute;
  top: -5px;
  left: calc(98.14% - 11px);
  width: 11px;
  height: 11px;
}
.portal-axis-x-arrow img {
  position: absolute;
  top: -7px;
  left: -1412px;
  width: 1449px;
  height: 38px;
}
.portal-axis-x-label {
  position: absolute;
  top: -5px;
  left: calc(98.14% + 11px);
  width: 10px;
  height: 10px;
}
.portal-axis-x-label img {
  position: absolute;
  top: -7px;
  left: -1433px;
  width: 1449px;
  height: 38px;
}
.portal-axis-origin-label {
  z-index: 3;
  top: calc(var(--portal-header-height) + var(--portal-hero-height));
  left: var(--portal-origin-x);
  width: 13px;
  height: 13px;
  transform: translate(-20.5px, 6.5px);
}
.portal-axis-origin-label img {
  position: absolute;
  top: -18px;
  left: -72px;
  width: 1449px;
  height: 38px;
}
.portal-integral-curve {
  z-index: 1;
  top: calc(var(--portal-header-height) + var(--portal-hero-height));
  left: var(--portal-curve-left);
  width: var(--portal-curve-width);
  height: var(--portal-curve-height);
  opacity: var(--portal-curve-opacity);
  transform: translateY(-98.128%);
}

.portal-main,
.portal-footer {
  position: relative;
  z-index: 2;
}
.portal-hero { height: var(--portal-hero-height); }
.portal-hero-copy {
  width: min(35rem, 45vw);
  padding-top: 5.45rem;
  margin-left: var(--portal-content-left);
}
.portal-kicker,
.portal-purpose {
  margin: 0;
  color: var(--portal-accent);
  font-size: 0.78rem;
  font-weight: 760;
}
.portal-kicker {
  position: relative;
  padding-bottom: 1.1rem;
  letter-spacing: 0.055em;
}
.portal-kicker::after {
  content: "";
  position: absolute;
  bottom: 0.35rem;
  left: 0;
  width: 2.4rem;
  height: 0.22rem;
  background: var(--portal-accent);
}
.portal-hero h1 {
  margin: 1rem 0 0;
  font-size: clamp(3.25rem, 4.35vw, 4.2rem);
  line-height: 1.08;
  letter-spacing: -0.055em;
  font-weight: 790;
}
.portal-hero h1 span,
.portal-lead span {
  display: block;
  white-space: nowrap;
}
.portal-lead {
  margin: 1.35rem 0 0;
  font-size: 0.93rem;
  line-height: 1.75;
  letter-spacing: 0.015em;
}

.portal-directory {
  margin-inline: var(--portal-content-left) var(--portal-content-right);
}
.portal-directory-heading {
  height: 4rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--portal-line);
}
.portal-directory-heading h2 {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1;
  letter-spacing: -0.025em;
}
.portal-directory-heading h2 span {
  margin-left: 0.45rem;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.95rem;
  font-weight: 450;
  letter-spacing: 0;
}

.portal-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.portal-item { border-bottom: 1px solid var(--portal-line); }
.portal-app {
  min-height: 7.3rem;
  display: grid;
  grid-template-columns: 2.8rem 9rem minmax(0, 1fr) 11.15rem 2.2rem;
  align-items: center;
  gap: 0.75rem;
}
.portal-brace {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 1.1rem;
  font-weight: 430;
}
.portal-brace-open { align-self: start; padding-top: 1.15rem; }
.portal-brace-close { justify-self: end; }
.portal-app-logo {
  width: 5.6rem;
  height: 5.6rem;
  margin-left: 0.45rem;
  object-fit: contain;
}
.portal-app-body { min-width: 0; }
.portal-purpose {
  font-size: 0.72rem;
  letter-spacing: 0.01em;
}
.portal-app h3 {
  margin: 0.7rem 0 0;
  font-size: clamp(1.25rem, 1.55vw, 1.55rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
  font-weight: 560;
  white-space: nowrap;
}
.portal-description {
  margin: 0.55rem 0 0;
  font-size: clamp(0.72rem, 0.88vw, 0.84rem);
  line-height: 1.5;
}
.portal-copy-segment { white-space: nowrap; }
.portal-action {
  min-height: 3.15rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.7rem 0.85rem 0.7rem 1.05rem;
  background: #030303;
  color: #fff !important;
  font-size: 0.88rem;
  font-weight: 650;
  white-space: nowrap;
  transition: background-color 140ms ease, color 140ms ease;
}
.portal-action img {
  width: 1.6rem;
  height: 1.6rem;
  object-fit: contain;
}
.portal-action:hover {
  background: var(--portal-accent);
}
.portal-list-end {
  height: 2.7rem;
  display: flex;
  align-items: center;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 1rem;
}

.portal-footer {
  min-height: 5.5625rem;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-inline: var(--portal-content-left) var(--portal-content-right);
  padding-bottom: 1.55rem;
  font-size: 0.76rem;
}
.portal-footer a {
  color: var(--portal-link);
  font-size: 0.84rem;
  font-weight: 680;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 0.48rem;
}

.portal a:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--portal-link) 52%, transparent);
  outline-offset: 4px;
}
.portal-action:focus-visible {
  outline-color: color-mix(in srgb, var(--portal-accent) 58%, transparent);
}

@media (max-width: 980px) {
  .portal {
    --portal-curve-opacity: 0.34;
    min-height: 100svh;
  }
  .portal-hero-copy { width: min(38rem, calc(100vw - 7rem)); }
  .portal-app {
    grid-template-columns: 2rem 5.5rem minmax(0, 1fr) 2rem;
    padding-block: 1rem;
  }
  .portal-app-logo { width: 4.75rem; height: 4.75rem; }
  .portal-action {
    grid-column: 3;
    width: min(100%, 12rem);
    margin-top: 0.85rem;
  }
  .portal-brace-close { grid-column: 4; grid-row: 1 / span 2; }
}

@media (max-width: 680px) {
  .portal {
    --portal-header-height: 3.5rem;
    --portal-hero-height: 24.7rem;
    --portal-content-left: 3.25rem;
    --portal-content-right: 1rem;
    --portal-origin-x: 2.25rem;
    --portal-axis-left: 0.75rem;
    --portal-curve-left: 18%;
    --portal-curve-width: 76%;
    --portal-curve-opacity: 0.28;
  }
  .portal-header { padding-inline: 1.1rem; }
  .portal-nav {
    gap: 0.45rem;
    font-size: 0.6rem;
  }
  .portal-axis-y-head,
  .portal-axis-y-tail { opacity: 0.72; }
  .portal-hero-copy {
    width: calc(100% - 3.9rem);
    padding-top: 4.3rem;
  }
  .portal-hero h1 {
    font-size: clamp(2.15rem, 9.4vw, 3.15rem);
    line-height: 1.12;
  }
  .portal-lead {
    font-size: clamp(0.68rem, 2.8vw, 0.84rem);
    line-height: 1.65;
  }
  .portal-directory-heading { height: 3.6rem; }
  .portal-app {
    grid-template-columns: 1.55rem minmax(0, 1fr) 1.7rem;
    gap: 0.45rem 0.65rem;
  }
  .portal-brace-open { grid-column: 1; grid-row: 1; }
  .portal-app-logo {
    grid-column: 2;
    grid-row: 1;
    width: 4.5rem;
    height: 4.5rem;
    margin-left: 0;
  }
  .portal-app-body { grid-column: 2; grid-row: 2; }
  .portal-action { grid-column: 2; grid-row: 3; }
  .portal-brace-close { grid-column: 3; grid-row: 1 / span 3; }
  .portal-app h3 { font-size: 1.22rem; }
  .portal-description { font-size: clamp(0.64rem, 2.65vw, 0.78rem); }
  .portal-footer {
    min-height: 6.5rem;
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    padding-bottom: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .portal * { scroll-behavior: auto !important; transition: none !important; }
}
`
