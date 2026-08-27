/* ==========================================================================
   Meguri — main.js
   演出は GSAP + ScrollTrigger（自己ホスト）。
   GSAP が読めなかった場合でも、本文は最初から見えている状態を保つ。
   ========================================================================== */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* --- 0. 保険 ------------------------------------------------------------
     .rise は js-anim が付いている間だけ透明。GSAP が来なかったら、
     ここで js-anim を外して全部見える状態に戻す。 */
  if (!hasGsap || reduced) {
    document.documentElement.classList.remove('js-anim');
  } else {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* --- 1. ヘッダーの地色 --------------------------------------------------- */
  const header = document.getElementById('header');
  const hero = document.getElementById('top');
  if (header && hero) {
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:60vh;left:0;width:1px;height:1px;';
    hero.style.position = 'relative';
    hero.appendChild(sentinel);
    new IntersectionObserver(([e]) => header.classList.toggle('is-solid', !e.isIntersecting)).observe(sentinel);
  }

  /* --- 2. 狭い画面のナビ --------------------------------------------------- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav');
  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'CLOSE' : 'MENU';
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 48em)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* --- 3. ナビの現在地 ----------------------------------------------------- */
  const links = [...document.querySelectorAll('.nav a[href^="#"]:not(.btn)')];
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

  /* --- 4. 数字のカウントアップ（GSAP なしでも動く） ------------------------ */
  const counters = [...document.querySelectorAll('[data-count]')];
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    if (reduced) { el.textContent = target.toFixed(decimals) + suffix; return; }
    const dur = 1100;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (counters.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { runCount(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach((el) => io.observe(el));
  }

  if (!hasGsap || reduced) return;   // ここから先は演出だけ

  /* --- 5. 出現 ------------------------------------------------------------- */
  gsap.utils.toArray('.rise').forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  /* --- 6. 課題リストの進行 -------------------------------------------------
     4つの信号を、スクロール位置に合わせて順に立てる。
     クラスの付け外しだけなので、途中で戻しても崩れない。 */
  const steps = gsap.utils.toArray('[data-step]');
  steps.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 70%',
      end: 'bottom 40%',
      onToggle: (self) => el.classList.toggle('is-on', self.isActive),
    });
  });

  /* --- 7. 製品画面の起き上がり ---------------------------------------------
     scrub で傾きを戻す。ページを戻したときも同じ絵になるように、
     時間ではなくスクロール量に紐づける。 */
  const app = document.querySelector('.app');
  if (app && window.matchMedia('(min-width: 48em)').matches) {
    gsap.fromTo(app,
      { rotateX: 14, scale: 0.94, transformPerspective: 1200, transformOrigin: '50% 100%' },
      {
        rotateX: 0, scale: 1, ease: 'none',
        scrollTrigger: { trigger: app, start: 'top 85%', end: 'top 35%', scrub: 0.4 },
      });
  }

  /* --- 8. 背景の光の追従 --------------------------------------------------- */
  gsap.utils.toArray('.glow').forEach((el) => {
    gsap.to(el, {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
    });
  });

  /* --- 9. 機能カードの段差 -------------------------------------------------- */
  ScrollTrigger.batch('.feature', {
    start: 'top 88%',
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' }),
    once: true,
  });

  /* 画像や書体が遅れて入ると位置がずれる。読み込み完了後に測り直す。 */
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
