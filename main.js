(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = Math.min(devicePixelRatio || 1, 2);
  const TAU = Math.PI * 2;
  const $ = s => document.querySelector(s);
  const seeded = s => () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const rnd = seeded(7);

  requestAnimationFrame(() => document.body.classList.add('ready'));

  // Colours come from CSS variables; re-read them whenever the section theme changes.
  let C = {};
  const readColors = () => {
    const s = getComputedStyle(document.body);
    C = {fg: s.getPropertyValue('--fg').trim(), bg: s.getPropertyValue('--bg').trim(), acc: s.getPropertyValue('--acc').trim(), green: s.getPropertyValue('--green').trim()};
  };
  readColors();

  // IST clock
  const clock = $('#clock');
  const tickClock = () => clock.textContent = new Date().toLocaleTimeString('en-GB', {timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit'});
  tickClock(); setInterval(tickClock, 15000);

  // cursor + magnets
  const cur = $('.cursor');
  let mx = innerWidth * .75, my = innerHeight * .4, cx = mx, cy = my;
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; cur.style.opacity = 1; });
  document.querySelectorAll('a, .iris-wrap').forEach(a => {
    a.addEventListener('pointerenter', () => cur.classList.add('big'));
    a.addEventListener('pointerleave', () => cur.classList.remove('big'));
  });
  document.querySelectorAll('.magnet').forEach(m => {
    m.addEventListener('pointermove', e => {
      const r = m.getBoundingClientRect();
      m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
    });
    m.addEventListener('pointerleave', () => m.style.transform = '');
  });

  // scroll progress + section themes + active nav
  const peek = $('.peek');
  let pkx = 0, pky = 0, peekOn = false;
  const prog = $('.progress');
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    // rows move under a still pointer while scrolling, so hide the preview
    if (peekOn) { peek.classList.remove('on'); peekOn = false; }
  };
  addEventListener('scroll', onScroll, {passive: true}); onScroll();
  const navLinks = document.querySelectorAll('[data-nav]');
  const themeIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    document.body.dataset.theme = e.target.dataset.bg;
    readColors(); hero.restrip(); contactIris.restrip();
    navLinks.forEach(a => a.classList.toggle('on', a.dataset.nav === e.target.dataset.sec));
  }), {rootMargin: '-50% 0px -50% 0px'});

  const once = (el, fn, margin = '0px 0px -12% 0px') => {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); }
    }), {rootMargin: margin});
    io.observe(el);
  };
  const watch = el => {
    const st = {on: false};
    new IntersectionObserver(es => st.on = es[0].isIntersecting).observe(el);
    return st;
  };
  // big headings rise word by word from behind a mask
  const splitWords = el => {
    let n = 0;
    const walk = node => [...node.childNodes].forEach(ch => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const wd = document.createElement('span'), inner = document.createElement('span');
          wd.className = 'wd'; inner.textContent = part; inner.style.transitionDelay = (n++ * 55) + 'ms';
          wd.append(inner); frag.append(wd);
        });
        ch.replaceWith(frag);
      } else if (ch.nodeType === 1 && ch.tagName !== 'BR') walk(ch);
    });
    walk(el);
  };
  document.querySelectorAll('.ch-head h2, .contact h2').forEach(h => {
    h.classList.remove('reveal'); h.classList.add('split'); splitWords(h);
    once(h, t => t.classList.add('in'));
  });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
    once(el, t => t.classList.add('in'));
  });

  // hover previews on the work index: a tiny version of each project's visual
  const peekArt = (() => {
    const r = seeded(99);
    let seatsMini = '';
    for (let y = 0; y < 6; y++) for (let x = 0; x < 11; x++) {
      const on = r() < .8;
      seatsMini += `<rect x="${24 + x * 21 + (x > 3 ? 8 : 0) + (x > 7 ? 8 : 0)}" y="${46 + y * 20}" width="15" height="11" rx="3" fill="${on ? '#2F6B4F' : 'none'}" stroke="${on ? 'none' : '#B9C2B6'}" opacity="${on ? (.55 + r() * .45).toFixed(2) : 1}"/>`;
    }
    let books = '';
    for (let i = 0; i < 46; i++) {
      const h = 90 + r() * 40, hit = [7, 19, 26, 33, 41].includes(i);
      books += `<rect x="${22 + i * 5.3}" y="${165 - h}" width="3.6" height="${h}" rx=".6" fill="${hit ? '#2B4C7E' : '#15171B'}" opacity="${hit ? 1 : (.18 + r() * .3).toFixed(2)}"/>`;
    }
    let lines = '';
    for (let c = 0; c < 22; c++) {
      const keepIt = [3, 8, 11, 15, 19].includes(c), y0 = 12 + c * 7.6;
      let d = `M0 ${y0}`;
      for (let x = 0; x <= 280; x += 4) d += ` L${x} ${(y0 + Math.sin(x * .05 + c) * 2.2 + (r() - .5) * 2.4).toFixed(1)}`;
      lines += `<path d="${d}" fill="none" stroke="${keepIt ? '#9FD8C4' : '#ECE6D8'}" stroke-width="${keepIt ? 1.2 : .6}" opacity="${keepIt ? .95 : .14}"/>`;
    }
    let iris = '';
    for (let i = 0; i < 220; i++) {
      const a = i / 220 * TAU, r0 = 22 + r() * 4, r1 = 50 + r() * 26;
      iris += `<line x1="${140 + Math.cos(a) * r0}" y1="${95 + Math.sin(a) * r0}" x2="${140 + Math.cos(a) * r1}" y2="${95 + Math.sin(a) * r1}" stroke="${r() < .04 ? '#C8502C' : '#15171B'}" stroke-width=".6" opacity="${(.2 + r() * .5).toFixed(2)}"/>`;
    }
    const svg = (bg, body) => `<svg viewBox="0 0 280 190" style="background:${bg}">${body}</svg>`;
    return {
      rollone: svg('#E7EBE3', `<rect x="70" y="22" width="140" height="5" rx="2.5" fill="#15171B"/>${seatsMini}`),
      openforge: svg('#E6EAF0', books + '<line x1="16" x2="264" y1="166" y2="166" stroke="#15171B"/>'),
      ggcs: svg('#0D1014', lines),
      iris: svg('#F2F0EA', iris + '<circle cx="140" cy="95" r="80" fill="none" stroke="#15171B" stroke-opacity=".5" stroke-width=".7"/><circle cx="140" cy="95" r="20" fill="#15171B"/><circle cx="134" cy="88" r="3" fill="#F2F0EA"/>')
    };
  })();
  document.querySelectorAll('[data-peek]').forEach(row => {
    const show = () => {
      if (peekOn && peek.dataset.k === row.dataset.peek) return;
      peek.innerHTML = peekArt[row.dataset.peek]; peek.dataset.k = row.dataset.peek; peek.classList.add('on'); peekOn = true;
    };
    row.addEventListener('pointerenter', show);
    row.addEventListener('pointermove', show);
    row.addEventListener('pointerleave', () => { peek.classList.remove('on'); peekOn = false; });
  });

  // count-up numbers
  document.querySelectorAll('[data-count]').forEach(b => once(b, () => {
    const to = +b.dataset.count, from = +(b.dataset.from || 0), dec = +(b.dataset.dec || 0);
    if (reduce) { b.textContent = to.toFixed(dec); return; }
    const t0 = performance.now(), dur = 1800;
    const step = t => {
      const p = Math.min(1, Math.max(0, (t - t0) / dur)), e = 1 - Math.pow(1 - p, 4);
      b.textContent = (from + (to - from) * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }));

  // ---------- IRIS (hero + contact) ----------
  // Fibres radiate from the pupil; the strip below is the same fibres unrolled
  // (Daugman's rubber sheet), and the bits are a toy IrisCode read off it.
  function makeIris(canvas, {n = 900, seed = 7, strip = null, code = null, ticks = true} = {}) {
    const r = seeded(seed), ctx = canvas.getContext('2d');
    const fibres = Array.from({length: n}, (_, i) => ({
      a: i / n * TAU + r() * .01, r0: .25 + r() * .05, r1: .58 + r() * .36, bend: (r() - .5) * .08,
      w: .35 + r() * .6, al: .14 + r() * .42, warm: r() < .035
    }));
    const rings = Array.from({length: 9}, (_, k) => ({r: .3 + k * .075 + r() * .02, d1: 2 + r() * 6, d2: 3 + r() * 9}));
    const sx = strip && strip.getContext('2d');
    let size = 0, sw = 0, sh = 0, px = 0, py = 0, born = null, scan = 0, verifyAt = -1, lastBits = '';
    const st = watch(canvas);
    const resize = () => {
      size = canvas.clientWidth; canvas.width = canvas.height = Math.round(size * DPR);
      if (strip) { sw = strip.clientWidth; sh = strip.clientHeight; strip.width = Math.round(sw * DPR); strip.height = Math.round(sh * DPR); }
      restrip();
    };
    // the unrolled strip only changes with the theme, so cache it as an image
    let stripImg = null;
    const restrip = () => {
      if (!strip || !sw) return;
      const off = document.createElement('canvas'); off.width = strip.width; off.height = strip.height;
      const o = off.getContext('2d'); o.setTransform(DPR, 0, 0, DPR, 0, 0);
      fibres.forEach(f => {
        const x = f.a / TAU * sw;
        o.strokeStyle = f.warm ? C.acc : C.fg; o.globalAlpha = f.al * .9; o.lineWidth = f.w;
        o.beginPath(); o.moveTo(x, sh * (1 - (f.r0 - .22) / .75)); o.lineTo(x + f.bend * 40, sh * (1 - (f.r1 - .22) / .75)); o.stroke();
      });
      stripImg = off;
    };
    const draw = t => {
      if (!st.on || !size) return;
      if (born === null) born = t;
      const R = size / 2 * .92, c = size / 2;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, size, size);
      const grow = reduce ? 1 : Math.max(0, Math.min(1, (t - born) / 2200));
      const g = 1 - Math.pow(1 - grow, 3);
      // pupil drifts toward the cursor
      const b = canvas.getBoundingClientRect();
      const dx = mx - (b.left + c), dy = my - (b.top + c), dist = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, dist / 600) * R * .07;
      px += (dx / dist * k - px) * .08; py += (dy / dist * k - py) * .08;
      const verifying = verifyAt >= 0 && t - verifyAt < 1500;
      const dil = 1 + Math.sin(t / 2400) * .04 - (verifying ? .08 : 0);
      ctx.save(); ctx.translate(c, c);
      ctx.strokeStyle = C.fg; ctx.lineWidth = .6;
      if (ticks) {
        ctx.globalAlpha = .45;
        for (let i = 0; i < 120 * g; i++) {
          const a = i / 120 * TAU - Math.PI / 2, l = i % 10 ? 5 : 12;
          ctx.beginPath(); ctx.moveTo(Math.cos(a) * R * 1.02, Math.sin(a) * R * 1.02); ctx.lineTo(Math.cos(a) * (R * 1.02 + l), Math.sin(a) * (R * 1.02 + l)); ctx.stroke();
        }
      }
      ctx.globalAlpha = .5; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.arc(0, 0, R, -Math.PI / 2, -Math.PI / 2 + TAU * g); ctx.stroke();
      rings.forEach(rg => {
        ctx.globalAlpha = .12; ctx.setLineDash([rg.d1, rg.d2]);
        ctx.beginPath(); ctx.arc(px * .4, py * .4, rg.r * R * dil, 0, TAU * g); ctx.stroke();
      });
      ctx.setLineDash([]);
      const pr = R * .24 * dil;
      for (const f of fibres) {
        if (f.a / TAU > g) continue;
        const a = f.a - Math.PI / 2, sway = reduce ? 0 : Math.sin(t / 1800 + f.a * 6) * .004;
        const r0 = Math.max(pr + 2, f.r0 * R * dil), r1 = f.r1 * R, m = (r0 + r1) / 2, am = a + f.bend + sway;
        ctx.globalAlpha = f.al; ctx.lineWidth = f.w; ctx.strokeStyle = f.warm ? C.acc : C.fg;
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0 + px, Math.sin(a) * r0 + py);
        ctx.quadraticCurveTo(Math.cos(am) * m + px * .5, Math.sin(am) * m + py * .5, Math.cos(a) * r1 + px * .1, Math.sin(a) * r1 + py * .1);
        ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.fillStyle = C.fg;
      ctx.beginPath(); ctx.arc(px, py, pr * g, 0, TAU); ctx.fill();
      ctx.fillStyle = C.bg; ctx.globalAlpha = .9;
      ctx.beginPath(); ctx.arc(px - pr * .32, py - pr * .34, pr * .13 * g, 0, TAU); ctx.fill();
      // scanning sweep: slow when idle, one fast pass when clicked
      scan = verifying ? (t - verifyAt) / 1500 : reduce ? .25 : (t / 6000) % 1;
      const sa = scan * TAU - Math.PI / 2;
      ctx.globalAlpha = .9; ctx.strokeStyle = C.acc; ctx.lineWidth = verifying ? 2.2 : 1.4;
      ctx.beginPath(); ctx.arc(0, 0, R * .98, sa - (verifying ? .6 : .25), sa); ctx.stroke();
      ctx.globalAlpha = .35; ctx.lineWidth = .8; ctx.setLineDash([1, 5]);
      ctx.beginPath(); ctx.moveTo(Math.cos(sa) * pr, Math.sin(sa) * pr); ctx.lineTo(Math.cos(sa) * R * .98, Math.sin(sa) * R * .98); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      if (strip && stripImg) {
        sx.setTransform(1, 0, 0, 1, 0, 0); sx.clearRect(0, 0, strip.width, strip.height);
        sx.globalAlpha = g; sx.drawImage(stripImg, 0, 0);
        sx.setTransform(DPR, 0, 0, DPR, 0, 0);
        const x = scan * sw;
        sx.fillStyle = C.acc; sx.globalAlpha = .9; sx.fillRect(x, 0, 1.5, sh);
        sx.globalAlpha = .1; sx.fillRect(0, 0, x, sh); sx.globalAlpha = 1;
      }
      if (code) {
        const bits = Math.max(24, Math.floor(code.clientWidth / 7.4)), done = Math.floor(scan * bits);
        let s = '';
        for (let i = 0; i < bits; i++) {
          const f = fibres[(i * 37) % n];
          s += i <= done ? (((f.al > .35) ^ (f.bend > 0)) ? '1' : '0') : '·';
        }
        if (s !== lastBits) code.textContent = lastBits = s;
      }
    };
    return {draw, resize, restrip, verify: t => verifyAt = t, get verifyAt() { return verifyAt; }};
  }

  const hero = makeIris($('#iris'), {strip: $('#strip'), code: $('#code')});
  const contactIris = makeIris($('#iris2'), {n: 420, seed: 21, ticks: false});
  const status = $('#irisStatus'), statusHTML = status.innerHTML;
  $('.iris-wrap').addEventListener('click', () => {
    const t = performance.now();
    if (hero.verifyAt >= 0 && t - hero.verifyAt < 4500) return;
    hero.verify(t);
    status.classList.remove('ok'); status.textContent = 'Unrolling… encoding… comparing…';
    setTimeout(() => { status.classList.add('ok'); status.textContent = '✓ Match. Hello, whoever you are.'; }, 1500);
    setTimeout(() => { status.classList.remove('ok'); status.innerHTML = statusHTML; }, 4500);
  });

  // ---------- EEG (research background) ----------
  const eeg = $('#eeg'), ex = eeg.getContext('2d'), research = $('#research'), eegSt = watch(eeg);
  const keep = new Set([3, 8, 11, 15, 19]);
  const chans = Array.from({length: 22}, () => ({
    f: [.006 + rnd() * .01, .02 + rnd() * .03, .06 + rnd() * .07], ph: [rnd() * 6, rnd() * 6, rnd() * 6],
    n: Array.from({length: 64}, () => rnd() - .5)
  }));
  let ew = 0, eh = 0;
  const sizeEEG = () => { ew = eeg.clientWidth; eh = eeg.clientHeight; eeg.width = Math.round(ew * DPR); eeg.height = Math.round(eh * DPR); };
  const drawEEG = t => {
    if (!eegSt.on || !ew) return;
    ex.setTransform(DPR, 0, 0, DPR, 0, 0); ex.clearRect(0, 0, ew, eh);
    const rr = research.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (innerHeight * .6 - rr.top) / (rr.height * .5)));
    const gap = eh / 23, shift = reduce ? 0 : t * .04, narrow = ew < 700;
    ex.font = '500 9px "Geist Mono", monospace'; ex.textAlign = 'right';
    chans.forEach((c, i) => {
      const y0 = gap * (i + 1), kept = keep.has(i);
      const amp = kept ? gap * .32 : gap * .22;
      ex.globalAlpha = kept ? .25 + .7 * p : .16 * (1 - p * .75);
      ex.strokeStyle = kept ? '#9FD8C4' : '#ECE6D8';
      ex.lineWidth = kept ? 1.3 : .7;
      ex.beginPath();
      const end = narrow ? ew : ew - 56;
      for (let x = 0; x <= end; x += 3) {
        const u = x + shift;
        const y = y0 + amp * (Math.sin(u * c.f[0] + c.ph[0]) * .6 + Math.sin(u * c.f[1] + c.ph[1]) * .3 + Math.sin(u * c.f[2] + c.ph[2]) * .25 + c.n[Math.floor(u / 7) % 64] * .35);
        x ? ex.lineTo(x, y) : ex.moveTo(x, y);
      }
      ex.stroke();
      if (!narrow) { ex.fillStyle = ex.strokeStyle; ex.fillText('CH ' + String(i + 1).padStart(2, '0'), ew - 16, y0 + 3); }
    });
    // fade the left side so the copy stays readable
    const gr = ex.createLinearGradient(0, 0, ew, 0);
    gr.addColorStop(0, `rgba(13,16,20,${narrow ? .6 : .94})`); gr.addColorStop(.5, `rgba(13,16,20,${narrow ? .5 : .6})`); gr.addColorStop(1, `rgba(13,16,20,${narrow ? .3 : 0})`);
    ex.globalAlpha = 1; ex.fillStyle = gr; ex.fillRect(0, 0, ew - (narrow ? 0 : 60), eh);
  };

  // ---------- ROTATING QR (illustrative, not scannable) ----------
  const qr = $('#qr'), qrTok = $('#qrTok'), qrLife = $('#qrLife'), qrSt = watch(qr);
  const finder = (x, y) => [[0, 0], [22, 0], [0, 22]].some(([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7);
  let qrCells = [], qrSvg = '';
  for (const [fx, fy] of [[0, 0], [22, 0], [0, 22]]) {
    qrSvg += `<rect x="${fx + .5}" y="${fy + .5}" width="6" height="6" fill="none" stroke="currentColor" stroke-width="1"/>`;
    qrSvg += `<rect x="${fx + 2}" y="${fy + 2}" width="3" height="3" rx=".4" fill="currentColor"/>`;
  }
  for (let y = 0; y < 29; y++) for (let x = 0; x < 29; x++) if (!finder(x, y)) qrSvg += `<rect x="${x + .08}" y="${y + .08}" width=".84" height=".84" rx=".22" fill="currentColor" opacity="0"/>`;
  qr.innerHTML = qrSvg;
  qr.querySelectorAll('rect[opacity]').forEach(el => qrCells.push(el));
  const PERIOD = 3200;
  let qrEpoch = -1;
  const hex = r => Array.from({length: 4}, () => Math.floor(r() * 65536).toString(16).padStart(4, '0')).join('');
  const drawQR = t => {
    if (!qrSt.on) return;
    const epoch = Math.floor(t / PERIOD);
    if (epoch !== qrEpoch) {
      qrEpoch = epoch;
      const r = seeded(epoch * 7919 + 13);
      qrCells.forEach(el => el.setAttribute('opacity', r() < .48 ? '1' : '0'));
      const tok = hex(r);
      qrTok.textContent = tok.slice(0, 6) + '…' + tok.slice(-4);
    }
    qrLife.style.transform = `scaleX(${reduce ? 1 : 1 - (t % PERIOD) / PERIOD})`;
  };

  // ---------- SHELF OF 123 ACTS ----------
  const shelf = $('#shelf'), shelfSt = watch(shelf), spines = [];
  {
    let s = '';
    // book spines: similar heights, a couple of bands each, a few leaning
    for (let i = 0; i < 123; i++) {
      const h = 168 + rnd() * 62, x = i * 5 + .5, y = 248 - h, op = (.2 + rnd() * .3).toFixed(2);
      s += `<g><rect x="${x}" y="${y}" width="4" height="${h}" rx=".8" fill="currentColor" opacity="${op}"/>` +
        `<rect class="band" x="${x}" y="${y + 10 + rnd() * 8}" width="4" height="1.4" fill="var(--bg)" opacity=".7"/>` +
        `<rect class="band" x="${x}" y="${248 - 14 - rnd() * 6}" width="4" height="1" fill="var(--bg)" opacity=".6"/></g>`;
    }
    s += '<line id="sweep" x1="0" x2="0" y1="0" y2="250" stroke="#C8502C" stroke-width="1.2"/>';
    shelf.innerHTML = s;
    shelf.querySelectorAll('rect:not(.band)').forEach(el => spines.push({el, op: el.getAttribute('opacity')}));
  }
  const sweep = shelf.querySelector('#sweep');
  let shelfRound = -1, hits = [];
  const drawShelf = t => {
    if (!shelfSt.on) return;
    const P = 4200, round = Math.floor(t / P), ph = (t % P) / P;
    if (round !== shelfRound) {
      shelfRound = round;
      hits.forEach(i => { spines[i].el.style.fill = ''; spines[i].el.setAttribute('opacity', spines[i].op); });
      const r = seeded(round * 31 + 5); hits = [];
      while (hits.length < 5) { const i = Math.floor(r() * 123); if (!hits.includes(i)) hits.push(i); }
    }
    const x = reduce ? 620 : Math.min(1, ph / .55) * 620;
    sweep.setAttribute('x1', x); sweep.setAttribute('x2', x);
    sweep.setAttribute('opacity', ph < .55 && !reduce ? .9 : 0);
    hits.forEach(i => { if (i * 5 <= x) { spines[i].el.style.fill = '#2B4C7E'; spines[i].el.setAttribute('opacity', '1'); } });
  };

  // ---------- ROLLONE HALL ----------
  const seats = $('#seats'), seatEls = [];
  {
    let s = '';
    for (let row = 0; row < 8; row++) for (let c = 0; c < 15; c++) {
      const x = 8 + c * 34 + (c >= 5 ? 14 : 0) + (c >= 10 ? 14 : 0), y = 10 + row * 30;
      s += `<rect x="${x}" y="${y}" width="24" height="18" rx="5" fill="none" stroke="#B9C2B6" stroke-width="1.2"/>`;
    }
    seats.innerHTML = s;
    seats.querySelectorAll('rect').forEach(r => seatEls.push(r));
  }
  const playHall = () => {
    const present = $('#present'), hc = $('#hclock'), hb = $('#hbar'), feed = $('#feed');
    const fill = el => { el.setAttribute('fill', '#2F6B4F'); el.setAttribute('stroke', 'none'); el.setAttribute('opacity', (.6 + rnd() * .4).toFixed(2)); };
    if (reduce) { seatEls.forEach(fill); present.textContent = 120; hb.style.width = '100%'; hc.textContent = '00:24.0'; return; }
    // arrivals bunch up early, like a real start of class
    const order = seatEls.map((el, i) => ({el, i, t: Math.pow(rnd(), 1.7) * 22800 + 500})).sort((a, b) => a.t - b.t);
    const stages = [['QR verified', 'now'], ['PIN accepted', 'now'], ['inside geofence', 'now'], ['face verified', null]];
    const end = order[order.length - 1].t;
    let k = 0; const t0 = performance.now();
    const step = now => {
      const el = Math.max(0, now - t0);
      while (k < order.length && order[k].t <= el) {
        const o = order[k++];
        o.el.setAttribute('fill', '#E36B3A'); o.el.setAttribute('stroke', 'none');
        setTimeout(() => fill(o.el), 650);
        present.textContent = k;
        if (k % 3 === 0 || k === 120) {
          const [what, when] = stages[Math.floor(rnd() * 4)];
          const li = document.createElement('li');
          li.innerHTML = `<span>Roll 23CS${String(o.i + 1).padStart(3, '0')} · ${what}</span><span>${when || (55 + Math.floor(rnd() * 25)) + ' ms'}</span>`;
          feed.prepend(li); if (feed.children.length > 3) feed.lastChild.remove();
        }
      }
      const s = Math.min(el, end) / 1000;
      hc.textContent = `00:${s.toFixed(1).padStart(4, '0')}`;
      hb.style.width = (k / 120 * 100) + '%';
      if (k < order.length) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  once($('#hall'), playHall, '0px 0px -30% 0px');

  // ---------- OPENFORGE CHAT ----------
  const runChat = () => {
    const steps = document.querySelectorAll('#pipe li'), ans = $('#answer'), cites = $('#cites');
    const blocks = [
      ['h4', 'Short answer'],
      ['p', 'Within <b>30 days</b> of receiving the request.<sup>1</sup> If it concerns someone’s life or liberty, within <b>48 hours</b>.<sup>1</sup>'],
      ['h4', 'What the law says'],
      ['p', 'The Public Information Officer must give the information, or reject the request with reasons, within thirty days.<sup>1</sup>']
    ];
    if (reduce) {
      steps.forEach(s => s.classList.add('on'));
      ans.innerHTML = blocks.map(([t, h]) => `<${t}>${h}</${t}>`).join('');
      cites.innerHTML = '<span>1 · RTI Act, 2005 — s.7(1)</span>';
      return;
    }
    let i = 0;
    const pipe = () => { if (i < steps.length) { steps[i++].classList.add('on'); setTimeout(pipe, 520); } else type(0); };
    const type = bi => {
      if (bi >= blocks.length) { cites.innerHTML = '<span>1 · RTI Act, 2005 — s.7(1)</span>'; return; }
      const [tag, content] = blocks[bi];
      const el = document.createElement(tag); ans.appendChild(el);
      const tokens = content.split(/(<[^>]+>[^<]*<\/[^>]+>|\s+)/).filter(Boolean);
      let ti = 0;
      const tick = () => {
        el.innerHTML = tokens.slice(0, ti).join('') + (ti < tokens.length ? '<span class="caret"></span>' : '');
        if (ti++ < tokens.length) setTimeout(tick, 38); else setTimeout(() => type(bi + 1), 160);
      };
      tick();
    };
    pipe();
  };
  once($('#chat'), runChat, '0px 0px -30% 0px');
  once($('#bars'), b => b.classList.add('go'), '0px 0px -20% 0px');

  // ---------- main loop ----------
  const resize = () => { hero.resize(); contactIris.resize(); sizeEEG(); };
  addEventListener('resize', resize);
  resize();
  document.querySelectorAll('[data-bg]').forEach(s => themeIO.observe(s));
  if (document.fonts) document.fonts.ready.then(() => { readColors(); hero.restrip(); });
  const loop = t => {
    cx += (mx - cx) * .2; cy += (my - cy) * .2;
    cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
    if (peekOn || peek.classList.contains('on')) {
      const vx = mx - pkx;
      pkx += (mx - pkx) * .12; pky += (my - pky) * .12;
      peek.style.transform = `translate(${pkx + 190}px,${pky}px) translate(-50%,-50%) rotate(${Math.max(-8, Math.min(8, vx * .04))}deg) scale(${peekOn ? 1 : .6})`;
    } else { pkx = mx; pky = my; }
    try {
      hero.draw(t); contactIris.draw(t); drawEEG(t); drawQR(t); drawShelf(t);
    } finally { requestAnimationFrame(loop); }
  };
  requestAnimationFrame(loop);
})();
