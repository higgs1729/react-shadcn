// 正本: portfolio/webSites/sites/08-portal-axis/index.html
// マークアップも文言も 08 のまま。状態を持つのは各 client component の中だけで、
// この component は server のまま保つ。
import { closingHref } from "../lib/works"
import { AvatarGuide } from "./avatar-guide"
import { AxisFigure } from "./axis-figure"
import { BrandMark } from "./brand-mark"
import { GravityField } from "./gravity-field"
import { HeroScene } from "./hero-scene"
import { MailLink } from "./mail-link"
import { PortalMotion } from "./portal-motion"
import { PortalNav } from "./portal-nav"
import { SoundToggle } from "./sound-toggle"
import { WorksTabs } from "./works-tabs"

export function PortalLanding() {
  return (
    <>
      {/* 3D のヒーローを読み込む間だけ被せる。html に hero-3d が無ければ出ない。
          曲線が引かれる長さで進み具合を見せる（座標系の演出と同じ意味の図）。
          左右の端はフィルムの送り穴の帯で、進み具合に合わせてフィルムが送られる */}
      <div className="loader" aria-hidden="true">
        <span className="loader__film loader__film--l" />
        <span className="loader__film loader__film--r" />
        <svg className="loader__fig" viewBox="0 0 240 120">
          <path className="loader__axis" d="M 20 10 V 104 M 12 100 H 232" />
          <path
            className="loader__curve"
            pathLength={1}
            d="M 20 99 C 70 99 90 96 110 70 C 130 40 150 30 228 28"
          />
        </svg>
        <p className="loader__t">
          読み込み中 <span className="loader__n">0</span>%
        </p>
        <p className="loader__sound">このサイトは音が出ます。右下のボタンで切り替えられます</p>
      </div>
      <SoundToggle />
      {/* 分身の案内役。Works から下で画面の端に立つ */}
      <AvatarGuide />

      <a className="skip" href="#main">
        本文へスキップ
      </a>

      <PortalNav />

      <main id="main">
        {/* ===== ヒーロー。演出はここに集中させる ===== */}
        <section className="hero" id="top">
          <AxisFigure />
          {/* 3D 版。ヒーロー全体に1枚。読み込めたときだけ、図と 3 行の文字を鋼の 3D に替える */}
          <HeroScene />

          <div className="hero__inner">
            <p className="hero__mark">
              <span className="hero__glyph" aria-hidden="true">
                <BrandMark />
              </span>
              higgs<span className="brand__number">1729</span>
            </p>
            <h1 className="hero__t typewrite">
              <span className="typewrite__text">常に、学びを止めない</span>
              <span className="typewrite__caret" aria-hidden="true" />
            </h1>
            <p className="hero__lead">今までの制作物をまとめています</p>
            <div className="hero__acts">
              <a className="btn btn--primary" href="#works">
                一覧を見る
              </a>
              <a className="btn btn--tonal" href="#method">
                つくり方を見る
              </a>
            </div>
          </div>
        </section>

        {/* ===== 制作物 ===== */}
        <section className="works" id="works">
          <div className="wrap">
            <header className="sec">
              <p className="sec__label">Works</p>
              <h2 className="sec__t typewrite">
                <span className="typewrite__text">まずは、この5つから</span>
                <span className="typewrite__caret" aria-hidden="true" />
              </h2>
              <p className="sec__lead">
                性格の違う5つを選びました。残りはタブを切り替えると確認できます。
              </p>
            </header>

            <WorksTabs />
          </div>
        </section>

        {/* ===== つくり方 ===== */}
        <section className="method" id="method">
          <div className="wrap">
            <header className="sec">
              <p className="sec__label">Method</p>
              <h2 className="sec__t typewrite">
                <span className="typewrite__text">制作の手順</span>
                <span className="typewrite__caret" aria-hidden="true" />
              </h2>
              <p className="sec__lead">
                考えたことを、設計して、実装して、検証します。
              </p>
            </header>

            <ol className="cards">
              <li className="mcard">
                <p className="mcard__n">01</p>
                <h3>コンセプトを決定</h3>
                <p>何を伝え、誰に向けてどう動いてほしいかを定めます。</p>
              </li>
              <li className="mcard">
                <p className="mcard__n">02</p>
                <h3>デザインシステムの構築</h3>
                <p>色・文字・余白・部品を、繰り返し使える形に揃えます。</p>
              </li>
              <li className="mcard">
                <p className="mcard__n">03</p>
                <h3>実装とテストの設計</h3>
                <p>動く画面に落とし込み、幅や操作の違いを確かめます。</p>
              </li>
              <li className="mcard">
                <p className="mcard__n">04</p>
                <h3>部分最適化</h3>
                <p>見落としやすい点を一つずつ見直し、全体の質を上げます。</p>
              </li>
            </ol>
          </div>
        </section>

        {/* ===== 暗転は1回だけ ===== */}
        <section className="close">
          <GravityField />
          <div className="wrap close__inner">
            <h2 className="close__t">気になるものから見てください</h2>
            <p className="close__d">説明より、実物を見たほうが早い。</p>
            <div className="close__acts">
              <a className="btn btn--invert" href="#works">
                一覧を見る
              </a>
              <a className="btn btn--outline" href={closingHref}>
                最新のWebサイトを見る
              </a>
            </div>
          </div>
        </section>

        {/* ===== 連絡先 ===== */}
        <section className="contact" id="contact">
          <div className="wrap">
            <header className="sec">
              <p className="sec__label">Contact</p>
              <h2 className="sec__t typewrite">
                <span className="typewrite__text">連絡先</span>
                <span className="typewrite__caret" aria-hidden="true" />
              </h2>
              <p className="sec__lead">用件があれば、どちらからでもどうぞ。</p>
            </header>

            <ul className="links">
              <li>
                <MailLink />
              </li>
              <li>
                <a
                  className="link"
                  href="https://github.com/higgs1729"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="link__icon" aria-hidden="true">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="6" cy="6" r="2.6" />
                      <circle cx="6" cy="18" r="2.6" />
                      <circle cx="18" cy="9" r="2.6" />
                      <path d="M6 8.6v6.8M18 11.6c0 3-3 3.4-6 3.8" />
                    </svg>
                  </span>
                  <span className="link__body">
                    <span className="link__t">
                      GitHub
                      <span className="visually-hidden">
                        （新しいタブで開きます）
                      </span>
                    </span>
                    <span className="link__v">github.com/higgs1729</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          {/* 名前の由来を字の位置で言う。1729 は Hardy–Ramanujan number */}
          <p className="foot__mark" aria-hidden="true">
            higgs<span>1</span>
            <span>7</span>
            <span>2</span>
            <span>9</span>
          </p>
          <p className="visually-hidden">higgs1729</p>

          <div className="foot__legal">
            <p>
              掲載しているウェブサイトは、ポートフォリオ用に制作した
              <strong>架空</strong>の企業・店舗のものです。
              店名・社名・所在地・電話番号・人物・実績・数値はすべて実在しません。
            </p>
            <p>
              © 2026 higgs<span className="brand__number">1729</span>
            </p>
          </div>
        </div>
      </footer>

      <PortalMotion />
    </>
  )
}
