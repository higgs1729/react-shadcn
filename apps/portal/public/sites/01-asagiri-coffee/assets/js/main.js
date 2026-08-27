/* ==========================================================================
   喫茶と焙煎 朝霧 — main.js
   依存なし。すべて IntersectionObserver / matchMedia で完結させる。
   ========================================================================== */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- 1. ヘッダーの地色切り替え ------------------------------------------
     scroll イベントで毎フレーム判定せず、ヒーロー末尾に置いた番兵を
     IntersectionObserver で監視する。スクロール中の再計算が起きない。 */
  const header = document.getElementById('header');
  const hero = document.getElementById('top');

  if (header && hero) {
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;bottom:0;left:0;width:1px;height:1px;';
    hero.appendChild(sentinel);

    new IntersectionObserver(
      ([entry]) => header.classList.toggle('is-solid', !entry.isIntersecting),
      { rootMargin: '0px' }
    ).observe(sentinel);
  }

  /* --- 2. 小さい画面のナビ ------------------------------------------------ */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav');

  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
      document.body.style.overflow = open ? 'hidden' : '';
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));

    // リンクを踏んだら閉じる（同一ページ内遷移なので閉じないと行き先が見えない）
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });

    // Esc で閉じる
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    // 画面が広がったら状態を捨てる（開いたまま拡大すると body が固まる）
    window.matchMedia('(min-width: 48em)').addEventListener('change', (e) => {
      if (e.matches) setOpen(false);
    });
  }

  /* --- 3. 出現アニメーション ---------------------------------------------- */
  const targets = document.querySelectorAll('.reveal');

  if (reduced) {
    targets.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target); // 一度出したら監視をやめる
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    targets.forEach((el) => io.observe(el));
  }

  /* --- 4. ナビの現在地ハイライト（任意の拡張） ----------------------------
     いまは何もしていない。サイトはこの関数が空のままでも完成している。

     やること: いま画面に見えている節に対応する .nav a へ 'is-current' を付け、
     他からは外す。CSS 側の .nav a.is-current は用意済み。

     判定方針に複数の正解があり、体感が変わる:
       (a) 画面上端に最も近い節を現在地とする
           → 迷いがなく安定。ただし節の切り替わりが早めに感じられる
       (b) 画面中央を横切っている節を現在地とする
           → 「読んでいる場所」と一致しやすい。短い節では点灯しないことがある
       (c) 交差比率が最大の節を現在地とする
           → 長短が混ざる本サイト向き。ただし比率の再計算が要る

     注意: 最終節（#shop）はページ末尾のため、下に余白がなく (b) だと
     点灯しないまま終わることがある。そこも含めてどう扱うか。            */
  function initScrollSpy() {
    const links = [...document.querySelectorAll('.nav a[href^="#"]')];
    // links と同じ並びの節。links[i] ↔ sections[i] が対応する
    const sections = links
      .map((a) => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    if (links.length !== sections.length || !sections.length) return;

    /* 点灯の反映はここで済ませてある。
       引数に節の要素を渡すと、その節に対応するリンクだけが点灯する。
       null を渡すと全部消灯する（帯の上など、どこでもない場所の表現）。 */
    let shown = null;
    const show = (section) => {
      if (section === shown) return; // 同じなら DOM を触らない
      shown = section;
      const i = sections.indexOf(section);
      links.forEach((a, n) => a.classList.toggle('is-current', n === i));
    };

    /* ------------------------------------------------------------------ */

    // (c) 交差比率が最大の節を現在地とする。節の長短が大きく違うため、
    //     「上端に近い」より「いま画面を占めている」で選ぶほうが実感に合う。
    const ratio = new Map(sections.map((s) => [s, 0]));

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => ratio.set(e.target, e.intersectionRatio));

        let best = null;
        ratio.forEach((r, s) => { if (r > (best ? ratio.get(best) : 0)) best = s; });

        // ヒーローを見ている間は「まだどの節でもない」。最初の節が画面の端に
        // わずかに入っただけで点灯すると、先走って見える。判定はこちらを優先する。
        const inHero = window.scrollY + innerHeight * 0.5 < sections[0].offsetTop;
        if (inHero) show(null);
        else if (best) show(best);
        // 帯（画像だけの区切り）でどの節も外れた瞬間は、直前の点灯を保つ。
      },
      { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] }
    );

    sections.forEach((s) => spy.observe(s));

    /* ------------------------------------------------------------------ */
  }

  initScrollSpy();
})();
