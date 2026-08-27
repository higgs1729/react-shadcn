/* ==========================================================================
   ツナギメ / TSUNAGIME — main.js

   方針: どのブロックも「無くても壊れない」こと。
   GSAP が落ちても図は完成形で見え、JS 全体が落ちても本文は読める。
   ========================================================================== */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- 1. 狭い画面のナビ -------------------------------------------------- */
  const toggle = document.querySelector('.gnav-toggle');
  const nav = document.getElementById('gnav');

  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'CLOSE' : 'MENU';
    };

    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    window.matchMedia('(min-width: 48em)').addEventListener('change', (e) => {
      if (e.matches) setOpen(false);
    });
  }

  /* --- 2. 出現アニメーション ---------------------------------------------- */
  const targets = document.querySelectorAll('.reveal');

  if (reduced) {
    targets.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    targets.forEach((el) => io.observe(el));
  }

  /* --- 3. 仕組みの図（このサイト唯一の重い演出） --------------------------
     CSS の既定が最終状態なので、ここで初期状態を「巻き戻して」から
     スクロールに合わせて再生する。GSAP が無ければ何もしない＝完成形のまま。 */
  function initFlow() {
    const svg = document.getElementById('flow-svg');
    if (!svg || reduced) return;
    if (!window.gsap || !window.ScrollTrigger) return;   // 読み込み失敗時は静止画として使う

    gsap.registerPlugin(ScrollTrigger);

    const wires = svg.querySelectorAll('.wire');
    const pulses = svg.querySelectorAll('.pulse');
    const stockNum = svg.querySelector('#stock-num');
    const oversellNum = svg.querySelector('#oversell-num');
    const fmt = new Intl.NumberFormat('ja-JP');

    // 経路の長さを測って、線を「引かれる前」に戻す
    wires.forEach((w) => {
      const len = w.getTotalLength();
      gsap.set(w, { strokeDasharray: len, strokeDashoffset: len });
    });
    pulses.forEach((p) => {
      const len = p.getTotalLength();
      // 短い光の点を1つだけ置き、残りを空白にする
      gsap.set(p, { strokeDasharray: `14 ${len}`, strokeDashoffset: len, opacity: 1 });
    });

    gsap.set(['#ch1', '#ch2', '#ch3'], { opacity: 0, x: -24 });
    gsap.set('#hub', { opacity: 0, scale: 0.9, transformOrigin: '465px 200px' });
    gsap.set(['#stock', '#oversell'], { opacity: 0 });

    const counter = { stock: 0, oversell: 12 };
    stockNum.textContent = '0';
    oversellNum.textContent = '12';
    oversellNum.setAttribute('fill', '#ffab7a');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.flow__stage',
        start: 'top 78%',
        end: 'bottom 62%',
        scrub: 1,
      },
    });

    tl.to(['#ch1', '#ch2', '#ch3'], { opacity: 1, x: 0, duration: 1, stagger: 0.18 })
      .to(['#w1', '#w2', '#w3'], { strokeDashoffset: 0, duration: 1.4, stagger: 0.12 }, '-=0.4')
      .to('#hub', { opacity: 1, scale: 1, duration: 0.8 }, '-=0.8')
      .to(['#p1', '#p2', '#p3'], { strokeDashoffset: 0, duration: 1.2, stagger: 0.15 }, '-=0.5')
      .to('#w4', { strokeDashoffset: 0, duration: 1 }, '-=0.5')
      .to('#stock', { opacity: 1, duration: 0.6 }, '-=0.6')
      .to('#p4', { strokeDashoffset: 0, duration: 0.9 }, '-=0.4')
      .to(counter, {
        stock: 1284,
        duration: 1.4,
        onUpdate: () => { stockNum.textContent = fmt.format(Math.round(counter.stock)); },
      }, '-=0.6')
      .to('#oversell', { opacity: 1, duration: 0.5 }, '-=1.2')
      .to(counter, {
        oversell: 0,
        duration: 1,
        onUpdate: () => {
          const v = Math.round(counter.oversell);
          oversellNum.textContent = String(v);
          oversellNum.setAttribute('fill', v === 0 ? '#7cf5c4' : '#ffab7a');
        },
      }, '-=0.8')
      /* scrub は進捗をなめらかに追随させる性質上、1.0 へ厳密には収束しない。
         数値の変化を終端ぎりぎりに置くと「売り越し 1件」で止まって見える。
         最後に何も起きない余白を足し、実質 progress 0.85 で完成させる。
         別トリガーで値を上書きする方法は、タイムラインが毎フレーム書き戻すため効かない。 */
      .to({}, { duration: 1.2 });
  }

  /* --- 4. 料金シミュレーター ----------------------------------------------
     プランは「売り場の数」と「注文件数」の両方で決まる。
     安いほうを勝手に選ぶのではなく、条件を満たす最小のプランを選ぶ。 */
  function initSim() {
    const form = document.getElementById('sim-form');
    if (!form) return;

    const PLANS = [
      { name: 'Starter',  base: 19800, included: 3000,  over: 3.0, maxChannels: 2 },
      { name: 'Standard', base: 54800, included: 15000, over: 2.2, maxChannels: Infinity },
      { name: 'Scale',    base: 148000, included: 50000, over: 1.4, maxChannels: Infinity },
    ];

    const el = (id) => document.getElementById(id);
    const orders = el('sim-orders');
    const ordersR = el('sim-orders-range');
    const channels = el('sim-channels');
    const channelsR = el('sim-channels-range');
    const yen = new Intl.NumberFormat('ja-JP');

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

    const cost = (p, o) => p.base + Math.max(0, o - p.included) * p.over;

    /* 含まれる件数を1件でも超えたら上位プラン、という選び方はしない。
       FAQ に「その月だけ超過分をお支払いいただければよい」と書いてあり、
       件数で機械的に上げると 15,001件で Standard 54,802円 が Scale 148,000円 に
       跳ね、案内と矛盾する。売り場数だけを満たすべき制約として扱い、
       あとは超過分まで含めた総額が最も安いものを選ぶ。 */
    const pick = (o, c) => {
      const eligible = PLANS.filter((p) => c <= p.maxChannels);
      return eligible.reduce((best, p) => (cost(p, o) < cost(best, o) ? p : best), eligible[0]);
    };

    const why = (p, o, c) => {
      const head = c > 2 ? '売り場が3つ以上のため Starter は対象外。' : '';
      const others = PLANS.filter((x) => x !== p && c <= x.maxChannels);
      if (!others.length) return `${head}この規模で選べるプランです`;
      const diff = Math.round(Math.min(...others.map((x) => cost(x, o))) - cost(p, o));
      return `${head}超過分を含めた総額が、次に安いプランより ${yen.format(diff)}円 安くなります`;
    };

    const render = () => {
      const o = clamp(parseInt(orders.value, 10) || 0, 0, 200000);
      const c = clamp(parseInt(channels.value, 10) || 1, 1, 40);
      const p = pick(o, c);
      const extra = Math.max(0, o - p.included);
      const total = p.base + Math.round(extra * p.over);

      el('sim-plan').textContent = p.name;
      el('sim-why').textContent = why(p, o, c);
      el('sim-base').textContent = `${yen.format(p.base)}円`;
      el('sim-included').textContent = `${yen.format(p.included)}件`;
      el('sim-over').textContent = extra
        ? `${yen.format(extra)}件 × ${p.over}円`
        : `0件 × ${p.over}円`;
      el('sim-total').textContent = `${yen.format(total)}円`;
    };

    // 数値入力とスライダーを双方向に結ぶ。どちらからでも操作できる。
    const link = (num, range) => {
      range.addEventListener('input', () => { num.value = range.value; render(); });
      num.addEventListener('input', () => {
        const min = Number(range.min), max = Number(range.max);
        const v = clamp(parseInt(num.value, 10) || min, min, max);
        range.value = v;
        render();
      });
      // 入力途中の空欄などを、フォーカスが外れた時点で正規化する
      num.addEventListener('blur', () => {
        const min = Number(range.min), max = Number(range.max);
        num.value = clamp(parseInt(num.value, 10) || min, min, max);
        render();
      });
    };

    link(orders, ordersR);
    link(channels, channelsR);
    form.addEventListener('submit', (e) => e.preventDefault());
    render();
  }

  initFlow();
  initSim();
})();
