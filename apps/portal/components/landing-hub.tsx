/* eslint-disable @next/next/no-img-element -- static-exported source artwork has fixed, pre-cut dimensions */
// The portal stays a server component with no shared app state. Plain anchors
// preserve GitHub Pages basePath behavior while every app remains independently
// bootable inside the monorepo.
import { ASSET_BASE_URL } from "../lib/asset-base"
import { JsonList, type JsonListNode } from "./json-list"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

// GAMEHUB is statically exported and composed into the Pages tree alongside
// the other apps. Development still points at its dedicated dev server, while
// production uses the composed /gamehub subtree. Set NEXT_PUBLIC_GAMEHUB_URL
// only when an alternate deployment should be used explicitly.
const gamehubHref =
  process.env.NEXT_PUBLIC_GAMEHUB_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3001/gamehub/"
    : `${basePath}/gamehub/`)

type AppEntry = {
  id: string
  title: string
  description: string
  href: string
  action: string
  logo: string
  /** apps/portal/public/app-previews/ の staging ファイル名。R2 配信 */
  preview: string
}

const apps: AppEntry[] = [
  {
    id: "team-t",
    title: "Team T API Lab",
    description:
      "目的やカテゴリから公開APIを探し、その場で仕様とレスポンスを確かめられる開発者向けカタログです。",
    href: `${basePath}/team-t/`,
    action: "Team T API Labを開く",
    logo: "logo-team-t.png",
    preview: "team-t.png",
  },
  {
    id: "studio",
    title: "AI Design System Studio",
    description:
      "briefから実装までを分解し、採用したパターン、選定理由、検証結果をまとめた設計ポートフォリオです。",
    href: `${basePath}/studio/overview/`,
    action: "Studioを開く",
    logo: "logo-studio.png",
    preview: "studio.png",
  },
  {
    id: "python-test",
    title: "データ分析試験 模擬問題集",
    description:
      "Python3エンジニア認定データ分析試験に向けて、分野や難易度を選び、誤答を繰り返し復習できます。",
    href: `${basePath}/python-test/`,
    action: "問題集を開く",
    logo: "logo-python-test.png",
    preview: "python-test.png",
  },
  {
    id: "gamehub",
    title: "GAMEHUB",
    description:
      "ブラウザですぐ遊べるゲームを集めた個人ゲームハブです。注目タイトルやゲーム一覧から、遊びたいゲームを探せます。",
    href: gamehubHref,
    action: "GAMEHUBを見る",
    logo: "logo-gamehub.svg",
    preview: "gamehub.png",
  },
]

function assetPath(fileName: string) {
  return `${basePath}/design-assets/${fileName}`
}

function previewPath(fileName: string) {
  return `${ASSET_BASE_URL}/app-previews/${fileName}`
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

// JsonList は枠(波括弧・区切り線・入れ子・detail レイアウトでの選択)だけを
// 持つ。左ツリーの行(title)と右ペインの中身(detail)はここが渡す ReactNode。
// title は detail を持つノードでは <button> の中に入るため、CTA のような
// interactive な要素は必ず detail 側へ置く(json-list.tsx の警告コメント参照)。
function toListNode(app: AppEntry): JsonListNode {
  return {
    id: app.id,
    title: (
      <span className="portal-app-entry" key={`${app.id}-title`}>
        <img
          className="portal-app-logo"
          src={assetPath(app.logo)}
          alt=""
          width="100"
          height="100"
        />
        <span className="portal-json-key" aria-hidden="true">
          &quot;name&quot;:
        </span>
        <span className="portal-app-name">
          <span aria-hidden="true">&quot;</span>
          {app.title}
          <span aria-hidden="true">&quot;</span>
        </span>
      </span>
    ),
    detail: (
      <article className="portal-app-detail" key={`${app.id}-detail`}>
        <div className="portal-app-summary">
          <div className="portal-selected-object">
            <div>
              <span className="portal-json-key">&quot;selectedApp&quot;</span>
              <span aria-hidden="true">: {"{"}</span>
            </div>
            <div className="portal-selected-name">
              <span className="portal-selected-name-key">
                <span className="portal-json-key">&quot;name&quot;</span>
                <span aria-hidden="true">:</span>
              </span>
              <strong>&quot;{app.title}&quot;</strong>
            </div>
            <div aria-hidden="true">{"}"}</div>
          </div>

          <p className="portal-description">
            <BreakableCopy>{app.description}</BreakableCopy>
          </p>
          <a className="portal-action" href={app.href}>
            <span>{app.action}</span>
            <img
              src={assetPath("arrow-right.png")}
              alt=""
              width="33"
              height="33"
            />
          </a>
        </div>

        <div className="portal-preview-frame">
          <img
            className="portal-preview"
            src={previewPath(app.preview)}
            alt={`${app.title}の画面プレビュー`}
            width="1280"
            height="800"
          />
        </div>
      </article>
    ),
  }
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

        <section className="portal-directory" aria-label="アプリ一覧">
          <JsonList
            label="アプリ一覧"
            layout="detail"
            defaultSelectedId="team-t"
            nodes={apps.map(toListNode)}
          />
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
.portal-kicker {
  margin: 0;
  color: var(--portal-accent);
  font-size: 0.78rem;
  font-weight: 760;
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
/* 枠(見出し・区切り線・波括弧)は JsonList が持つ。ここはカードの中身だけ。 */
.portal .jlist {
  --jlist-line: var(--portal-line);
  --jlist-accent: var(--portal-accent);
  --jlist-mono: var(--font-mono, ui-monospace, monospace);
}
.portal .jlist-detail {
  container-type: inline-size;
  container-name: portal-detail-pane;
}
.portal-app-entry {
  display: inline-flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  gap: 0.65rem;
  white-space: nowrap;
}
.portal-app-logo {
  flex: none;
  width: 1.55rem;
  height: 1.55rem;
  object-fit: contain;
}
.portal-json-key {
  flex: none;
  font-family: var(--jlist-mono);
  font-size: 0.84rem;
  font-weight: 540;
  letter-spacing: 0;
}
.portal-app-name {
  min-width: 0;
  overflow: hidden;
  font-size: clamp(0.92rem, 1.08vw, 1.05rem);
  font-weight: 620;
  letter-spacing: -0.018em;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.portal-app-detail {
  display: grid;
  grid-template-columns: minmax(15rem, 18rem) minmax(26rem, 43.375rem);
  gap: clamp(2.75rem, 4vw, 4rem);
  align-items: start;
  justify-content: space-between;
  min-width: 0;
}
.portal-app-summary {
  min-width: 0;
  padding-top: 0.2rem;
}
.portal-selected-object {
  display: grid;
  gap: 1.4rem;
  font-family: var(--jlist-mono);
  font-size: 0.94rem;
  line-height: 1.3;
}
.portal-selected-name {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 0.5rem;
  align-items: start;
  min-width: 0;
  padding-left: 1.5rem;
  border-left: 1px solid var(--portal-line);
  white-space: normal;
}
.portal-selected-name-key {
  display: inline-flex;
  gap: 0.25rem;
  white-space: nowrap;
}
.portal-selected-name strong {
  min-width: 0;
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: clamp(1.25rem, 1.35vw, 1.4rem);
  font-weight: 780;
  line-height: 1.25;
  letter-spacing: -0.045em;
  overflow-wrap: anywhere;
  text-wrap: balance;
}
.portal-selected-object > div:first-child .portal-json-key {
  color: var(--portal-accent);
}
.portal-preview-frame {
  width: 100%;
  max-width: 43.375rem;
  overflow: hidden;
  padding: 0.75rem;
  background: #f0ece9;
}
.portal-preview {
  display: block;
  width: 100%;
  max-width: 41.875rem;
  max-height: 33.125rem;
  height: auto;
  aspect-ratio: 16 / 10;
  object-fit: contain;
}
.portal-description {
  margin: 2rem 0 0;
  font-size: 0.9rem;
  line-height: 1.85;
  overflow-wrap: anywhere;
}
.portal-copy-segment { white-space: normal; }
.portal-action {
  width: fit-content;
  min-height: 3.15rem;
  margin-top: 1.25rem;
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

@container portal-detail-pane (max-width: 46rem) {
  .portal-app-detail {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 980px) {
  .portal {
    --portal-curve-opacity: 0.34;
    min-height: 100svh;
  }
  .portal-hero-copy { width: min(38rem, calc(100vw - 7rem)); }
  .portal-app-detail {
    grid-template-columns: minmax(0, 1fr);
  }
  .portal-preview-frame { max-width: 41.875rem; }
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
  .portal-app-entry { gap: 0.45rem; }
  .portal-app-logo {
    width: 1.35rem;
    height: 1.35rem;
  }
  .portal-json-key { font-size: 0.75rem; }
  .portal-app-name { font-size: 0.84rem; }
  .portal-selected-object { gap: 1rem; }
  .portal-selected-name strong { font-size: 1.35rem; }
  .portal-description { margin-top: 1.4rem; }
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
