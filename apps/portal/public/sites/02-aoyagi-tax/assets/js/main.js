/* ==========================================================================
   税理士法人 あおやぎ会計 — main.js
   演出は持たない。開閉と現在地表示、フォームの応答だけを担当する。
   ========================================================================== */
(() => {
  'use strict';

  /* --- 1. 狭い画面の引き出しナビ ------------------------------------------ */
  const toggle = document.querySelector('.drawer-toggle');
  const sidebar = document.getElementById('sidebar');
  const scrim = document.getElementById('scrim');

  if (toggle && sidebar && scrim) {
    scrim.hidden = false; // JS がある時だけ幕を使う

    const setOpen = (open) => {
      sidebar.classList.toggle('is-open', open);
      scrim.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '閉じる' : 'メニュー';
      document.body.style.overflow = open ? 'hidden' : '';
    };

    toggle.addEventListener('click', () => setOpen(!sidebar.classList.contains('is-open')));
    scrim.addEventListener('click', () => setOpen(false));

    sidebar.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    // 広い画面ではサイドバーが常設に戻る。開いた状態を持ち越すと body が固まる
    window.matchMedia('(min-width: 64em)').addEventListener('change', (e) => {
      if (e.matches) setOpen(false);
    });
  }

  /* --- 2. サイドナビの現在地 ----------------------------------------------
     節が8つあり長さもばらばらなので、交差比率が最大のものを現在地とする。 */
  const links = [...document.querySelectorAll('.sidenav a[href^="#"]')];
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
  }

  /* --- 3. フォーム --------------------------------------------------------
     架空サイトのため送信先はない。押しても何も起きないと不具合に見えるので、
     入力チェックだけを本物と同じように行い、送信しない旨を明示して返す。 */
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  if (form && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const missing = [...form.querySelectorAll('[required]')].filter((f) => !f.value.trim());
      const email = form.querySelector('#f-email');
      const badEmail = email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());

      if (missing.length) {
        status.textContent = `未入力の必須項目が ${missing.length} 件あります。`;
        status.style.color = '#ffb59c';
        missing[0].focus();
        return;
      }
      if (badEmail) {
        status.textContent = 'メールアドレスの形式をご確認ください。';
        status.style.color = '#ffb59c';
        email.focus();
        return;
      }

      status.textContent = '入力内容に問題はありません。ただし本サイトは架空のデモのため、送信は行われませんでした。';
      status.style.color = '#9fd2a8';
    });
  }
})();
