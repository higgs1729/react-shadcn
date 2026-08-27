/* ==========================================================================
   nagi — main.js
   依存なし。視差は scroll イベントではなく rAF でまとめて書き込む。
   ========================================================================== */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- 1. ヘッダーの地色 --------------------------------------------------- */
  const header = document.getElementById('header');
  const hero = document.getElementById('top');

  if (header && hero) {
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;bottom:0;left:0;width:1px;height:1px;';
    hero.style.position = 'relative';
    hero.appendChild(sentinel);
    new IntersectionObserver(
      ([e]) => header.classList.toggle('is-solid', !e.isIntersecting)
    ).observe(sentinel);
  }

  /* --- 2. 狭い画面のナビ --------------------------------------------------- */
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
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 48em)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* --- 3. 出現 ------------------------------------------------------------- */
  const fades = document.querySelectorAll('.fade');
  if (reduced) {
    fades.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    fades.forEach((el) => io.observe(el));
  }

  /* --- 4. 視差 -------------------------------------------------------------
     scroll ごとに getBoundingClientRect を呼ぶと、読み取りと書き込みが
     交互になってレイアウトが何度も再計算される。
     位置の読み取りは rAF の中で一度だけ行い、書き込みもそこでまとめる。
     動かすのは CSS 変数だけで、要素の box は動かさない（scale で余白を確保済み）。 */
  const layers = [...document.querySelectorAll('[data-parallax]')];

  if (layers.length && !reduced) {
    let ticking = false;

    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      layers.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;         // 画面外は触らない

        // 要素の中心が画面中央からどれだけ離れているか（-1 〜 1）
        const progress = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);

        // 画像は scale(--pscale) で拡大してある。上下にはみ出している余白は
        // 片側 (pscale - 1) / 2。そこを超えて動かすと下地が見えるので、
        // 実際に使うのはその 85% までにする。
        const scale = parseFloat(getComputedStyle(el).getPropertyValue('--pscale')) || 1;
        const headroom = ((scale - 1) / 2) * r.height * 0.85;
        const depth = parseFloat(el.dataset.parallax);   // 0〜1。層ごとの強さ

        el.style.setProperty('--shift', `${(progress * headroom * depth).toFixed(2)}px`);
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* --- 5. ナビの現在地 ----------------------------------------------------- */
  const links = [...document.querySelectorAll('.nav a[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  if (links.length === sections.length && sections.length) {
    const ratio = new Map(sections.map((s) => [s, 0]));
    let shown = null;
    const show = (section) => {
      if (section === shown) return;
      shown = section;
      const i = sections.indexOf(section);
      links.forEach((a, n) => a.classList.toggle('is-current', n === i));
    };

    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => ratio.set(e.target, e.intersectionRatio));
      let best = null;
      ratio.forEach((r, s) => { if (r > (best ? ratio.get(best) : 0)) best = s; });
      const inHero = window.scrollY + innerHeight * 0.5 < sections[0].offsetTop;
      if (inHero) show(null);
      else if (best) show(best);
    }, { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] });

    sections.forEach((s) => spy.observe(s));
  }
})();
