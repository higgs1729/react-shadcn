// The portal is intentionally a server component with no shared app state.
// Plain anchors preserve GitHub Pages basePath behavior and keep every app
// independently bootable while the repository structure is being reorganized.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

type AppLink = {
  label: string
  href: string
}

type AppEntry = {
  id: string
  purpose: string
  title: string
  description: string
  href: string
  action: string
  facts: string[]
  links?: AppLink[]
}

const apps: AppEntry[] = [
  {
    id: "01",
    purpose: "UI設計の過程を見る",
    title: "AI Design System Studio",
    description:
      "briefから実装までを分解し、採用したパターン、選定理由、検証結果をまとめた設計ポートフォリオです。",
    href: `${basePath}/overview/`,
    action: "Studioを開く",
    facts: ["13画面タイプ", "33ブロック役割", "実装例と検証記録"],
    links: [
      { label: "パターン一覧", href: `${basePath}/patterns/` },
      { label: "品質レポート", href: `${basePath}/quality/` },
    ],
  },
  {
    id: "02",
    purpose: "公開APIを探して試す",
    title: "Team T",
    description:
      "目的やカテゴリから公開APIを探し、その場で仕様とレスポンスを確かめられる開発者向けカタログです。",
    href: `${basePath}/team-t-app/`,
    action: "Team Tを開く",
    facts: ["177紹介ページ", "200 API", "検索・実行・おすすめ"],
    links: [
      {
        label: "Neon Tunnelで遊ぶ",
        href: `${basePath}/team-t-app/games/neon-tunnel.html`,
      },
    ],
  },
  {
    id: "03",
    purpose: "Python試験を練習する",
    title: "データ分析試験 模擬問題集",
    description:
      "Python3エンジニア認定データ分析試験に向けて、分野や難易度を選び、誤答を繰り返し復習できます。",
    href: `${basePath}/python-test/`,
    action: "問題集を開く",
    facts: ["学習用181問", "誤答・マーク絞り込み", "端末内に自動保存"],
  },
]

export function LandingHub() {
  return (
    <div className="portal">
      <style>{styles}</style>

      <header className="portal-header">
        <a
          className="portal-brand"
          href={`${basePath}/`}
          aria-label="アプリ一覧の先頭へ"
        >
          <span className="portal-brand-name">higgs1729</span>
          <span className="portal-brand-separator" aria-hidden="true">
            /
          </span>
          <span className="portal-brand-section">apps</span>
        </a>
        <span className="portal-count">3 apps</span>
      </header>

      <main className="portal-main">
        <section className="portal-intro" aria-labelledby="portal-title">
          <p className="portal-kicker">個人制作のアプリ</p>
          <h1 id="portal-title">使いたいものを、ここから選ぶ。</h1>
          <p className="portal-lead">
            UI設計の記録、公開APIの探索、Python試験の学習。
            それぞれ独立したアプリとしてブラウザで利用できます。
          </p>
        </section>

        <section className="portal-directory" aria-labelledby="directory-title">
          <div className="portal-section-heading">
            <h2 id="directory-title">アプリ一覧</h2>
            <p>目的と機能を確認して開いてください。</p>
          </div>

          <ol className="portal-list">
            {apps.map((app) => (
              <li key={app.id} className="portal-item">
                <article className="portal-app">
                  <div className="portal-index" aria-hidden="true">
                    {app.id}
                  </div>

                  <div className="portal-app-body">
                    <p className="portal-purpose">{app.purpose}</p>
                    <h3>{app.title}</h3>
                    <p className="portal-description">{app.description}</p>

                    <ul
                      className="portal-facts"
                      aria-label={`${app.title}の主な内容`}
                    >
                      {app.facts.map((fact) => (
                        <li key={fact}>{fact}</li>
                      ))}
                    </ul>

                    {app.links ? (
                      <nav
                        className="portal-sub-links"
                        aria-label={`${app.title}の関連ページ`}
                      >
                        {app.links.map((link) => (
                          <a key={link.href} href={link.href}>
                            {link.label}
                          </a>
                        ))}
                      </nav>
                    ) : null}
                  </div>

                  <div className="portal-action-wrap">
                    <a className="portal-action" href={app.href}>
                      {app.action}
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        </section>

        <aside className="portal-note" aria-label="このページについて">
          <p className="portal-note-title">このページについて</p>
          <p>
            ここは各アプリへの入口だけを担当します。設定や学習データなどの状態は、
            それぞれのアプリ内で個別に管理されます。
          </p>
        </aside>
      </main>

      <footer className="portal-footer">
        <span>© 2026 higgs1729</span>
        <a href="#portal-title">ページ上部へ</a>
      </footer>
    </div>
  )
}

const styles = `
.portal {
  --portal-bg: #f3f2ee;
  --portal-panel: #fbfaf7;
  --portal-fg: #1d1d1b;
  --portal-muted: #65635e;
  --portal-line: #d5d2ca;
  --portal-accent: #2159d6;
  --portal-accent-soft: #e7ecf8;
  min-height: 100svh;
  background: var(--portal-bg);
  color: var(--portal-fg);
  font-family: var(--font-sans, system-ui, sans-serif);
}

.portal *, .portal *::before, .portal *::after { box-sizing: border-box; }
.portal a { color: inherit; text-decoration: none; }

.portal-header,
.portal-main,
.portal-footer {
  width: min(100% - 2rem, 72rem);
  margin-inline: auto;
}

.portal-header {
  min-height: 4.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--portal-line);
}

.portal-brand {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: 0.88rem;
  font-weight: 650;
}
.portal-brand-name { letter-spacing: -0.01em; }
.portal-brand-separator,
.portal-brand-section,
.portal-count { color: var(--portal-muted); }
.portal-brand-section,
.portal-count {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.75rem;
}

.portal-main { padding-block: clamp(2.5rem, 5vw, 4rem) 4rem; }

.portal-intro { max-width: 50rem; }
.portal-kicker,
.portal-purpose,
.portal-note-title {
  margin: 0;
  color: var(--portal-accent);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.portal-intro h1 {
  max-width: 48rem;
  margin: 0.75rem 0 0;
  font-size: clamp(2.35rem, 5.6vw, 4.2rem);
  line-height: 1.03;
  letter-spacing: -0.055em;
  font-weight: 720;
  text-wrap: balance;
}
.portal-lead {
  max-width: 42rem;
  margin: 1.5rem 0 0;
  color: var(--portal-muted);
  font-size: clamp(1rem, 2vw, 1.15rem);
  line-height: 1.9;
}

.portal-directory { margin-top: clamp(3rem, 6vw, 4.5rem); }
.portal-section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--portal-fg);
}
.portal-section-heading h2 {
  margin: 0;
  font-size: 1.25rem;
  letter-spacing: -0.025em;
}
.portal-section-heading p {
  margin: 0;
  color: var(--portal-muted);
  font-size: 0.85rem;
}

.portal-list { margin: 0; padding: 0; list-style: none; }
.portal-item { border-bottom: 1px solid var(--portal-line); }
.portal-app {
  display: grid;
  grid-template-columns: 3rem minmax(0, 1fr) minmax(10rem, 14rem);
  gap: clamp(1rem, 3vw, 2rem);
  padding-block: clamp(1.75rem, 4vw, 2.6rem);
}
.portal-index {
  padding-top: 0.2rem;
  color: var(--portal-muted);
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.78rem;
}
.portal-app-body { max-width: 42rem; }
.portal-purpose { color: var(--portal-muted); }
.portal-app h3 {
  margin: 0.55rem 0 0;
  font-size: clamp(1.45rem, 3vw, 2rem);
  line-height: 1.2;
  letter-spacing: -0.035em;
}
.portal-description {
  max-width: 39rem;
  margin: 0.8rem 0 0;
  color: var(--portal-muted);
  line-height: 1.75;
}
.portal-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.25rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
  color: var(--portal-fg);
  font-size: 0.82rem;
}
.portal-facts li::before {
  content: "";
  display: inline-block;
  width: 0.35rem;
  height: 0.35rem;
  margin-right: 0.5rem;
  border-radius: 50%;
  background: var(--portal-accent);
  vertical-align: 0.08rem;
}
.portal-sub-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  margin-top: 1.15rem;
}
.portal-sub-links a {
  color: var(--portal-accent);
  font-size: 0.83rem;
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, var(--portal-accent) 35%, transparent);
  text-underline-offset: 0.25rem;
}
.portal-action-wrap {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.portal-action {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--portal-fg);
  border-radius: 0.5rem;
  background: var(--portal-fg);
  color: var(--portal-panel) !important;
  font-size: 0.88rem;
  font-weight: 650;
  transition: background-color 140ms ease, color 140ms ease;
}
.portal-action:hover {
  background: transparent;
  color: var(--portal-fg) !important;
}

.portal-note {
  display: grid;
  grid-template-columns: minmax(9rem, 0.35fr) minmax(0, 1fr);
  gap: 1.5rem;
  margin-top: 4rem;
  padding: 1.4rem;
  border: 1px solid var(--portal-line);
  border-radius: 0.65rem;
  background: var(--portal-panel);
}
.portal-note-title { color: var(--portal-fg); }
.portal-note > p:last-child {
  max-width: 43rem;
  margin: 0;
  color: var(--portal-muted);
  font-size: 0.88rem;
  line-height: 1.75;
}

.portal-footer {
  min-height: 5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-top: 1px solid var(--portal-line);
  color: var(--portal-muted);
  font-size: 0.78rem;
}
.portal-footer a { text-decoration: underline; text-underline-offset: 0.25rem; }

.portal a:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--portal-accent) 45%, transparent);
  outline-offset: 4px;
}

@media (max-width: 760px) {
  .portal-section-heading { align-items: start; flex-direction: column; gap: 0.35rem; }
  .portal-app { grid-template-columns: 2rem minmax(0, 1fr); }
  .portal-action-wrap { grid-column: 2; justify-content: start; }
  .portal-action { width: min(100%, 18rem); }
  .portal-note { grid-template-columns: 1fr; gap: 0.65rem; }
}

@media (max-width: 480px) {
  .portal-header, .portal-main, .portal-footer { width: min(100% - 1.25rem, 72rem); }
  .portal-main { padding-top: 2rem; }
  .portal-intro h1 { font-size: clamp(2.15rem, 10.5vw, 2.8rem); }
  .portal-app { grid-template-columns: 1fr; gap: 0.8rem; }
  .portal-index { padding: 0; }
  .portal-action-wrap { grid-column: 1; }
  .portal-footer { align-items: flex-start; flex-direction: column; justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  .portal * { transition: none !important; }
}
`
