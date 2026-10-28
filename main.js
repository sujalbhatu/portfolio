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
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; cur.style.opacity = 1; });
  document.querySelectorAll('a').forEach(a => {
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
  let introHook = () => {};
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
    introHook();
    // rows move under a still pointer while scrolling, so hide the preview
    if (peekOn) { peek.classList.remove('on'); peekOn = false; }
  };
  addEventListener('scroll', onScroll, {passive: true}); onScroll();
  const navLinks = document.querySelectorAll('[data-nav]');
  const themeIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting || e.target.id === 'intro') return;
    document.body.dataset.theme = e.target.dataset.bg;
    readColors();
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

  // ---------- THE EYE ----------
  // The iris is painted once into an offscreen canvas, a few hundred fibres per
  // frame so it visibly grows in; every frame after that only transforms it.
  function* paintIris(g, size, seed) {
    let s = seed;
    const r = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
    const px = size / 1800, c = size / 2, R = size * .44, rp = R * .2, rc = R * .45;
    g.setTransform(1, 0, 0, 1, c, c);
    // angular density: fibre bundles and the gaps between them (crypts)
    const dens = Array.from({length: 360}, () => r());
    const density = a => { const i = ((a / TAU * 360) % 360 + 360) % 360, i0 = Math.floor(i), f = i - i0; return dens[i0] * (1 - f) + dens[(i0 + 1) % 360] * f; };
    const base = g.createRadialGradient(0, 0, rp * .8, 0, 0, R);
    base.addColorStop(0, '#2a1708'); base.addColorStop(.25, '#5c3a12'); base.addColorStop(.42, '#3f4a2c');
    base.addColorStop(.65, '#22404f'); base.addColorStop(.9, '#16293a'); base.addColorStop(1, 'rgba(8,12,18,0)');
    g.fillStyle = base; g.beginPath(); g.arc(0, 0, R * 1.02, 0, TAU); g.fill();
    yield;
    g.globalCompositeOperation = 'lighter';
    const strand = (a, r0, r1, col0, col1, al, w, f, p, amp) => {
      const gr = g.createLinearGradient(Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * r1, Math.sin(a) * r1);
      gr.addColorStop(0, col0 + al + ')'); gr.addColorStop(1, col1 + (al * .7) + ')');
      g.strokeStyle = gr; g.lineWidth = w;
      g.beginPath(); g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      for (let k = 1; k <= 6; k++) {
        const t = k / 6, rr = r0 + (r1 - r0) * t, aa = a + Math.sin(t * Math.PI * f + p) * amp;
        g.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr);
      }
      g.stroke();
    };
    // pupillary zone: warm amber fibres
    for (let i = 0; i < 2600; i++) {
      const a = r() * TAU, d = density(a);
      strand(a, rp * (.96 + r() * .1), rc * (.85 + r() * .3),
        `rgba(${235 + r() * 20 | 0},${140 + r() * 60 | 0},${55 + r() * 35 | 0},`, `rgba(${200 + r() * 40 | 0},${170 + r() * 40 | 0},${90 + r() * 30 | 0},`,
        (.05 + r() * .12) * (.5 + d), (.5 + r() * 1.3) * px, 1 + r() * 2, r() * 6, (r() - .5) * .05);
      if (i % 260 === 259) yield;
    }
    // ciliary zone: cooler, longer, wavier fibres, thinned where the density dips
    for (let i = 0; i < 4200; i++) {
      const a = r() * TAU, d = density(a);
      if (r() > .25 + d * .9) continue;
      const cool = r() < .7;
      strand(a, rc * (.9 + r() * .15), R * (.78 + r() * .21),
        `rgba(${170 + r() * 40 | 0},${165 + r() * 35 | 0},${110 + r() * 40 | 0},`,
        cool ? `rgba(${80 + r() * 50 | 0},${150 + r() * 50 | 0},${190 + r() * 45 | 0},` : `rgba(${120 + r() * 40 | 0},${170 + r() * 30 | 0},${160 + r() * 30 | 0},`,
        (.04 + r() * .11) * (.4 + d), (.5 + r() * 1.6) * px, 1 + r() * 3, r() * 6, (r() - .5) * .06);
      if (i % 300 === 299) yield;
    }
    // collarette: the bright, irregular ring between the two zones
    for (let i = 0; i < 1400; i++) {
      const a = r() * TAU, rr = rc * (1 + .05 * Math.sin(a * 17) + .03 * Math.sin(a * 43 + 1) + (r() - .5) * .03), len = R * (.01 + r() * .035);
      g.strokeStyle = `rgba(255,${185 + r() * 50 | 0},${110 + r() * 50 | 0},${.05 + r() * .12})`;
      g.lineWidth = (.6 + r() * 1.4) * px;
      g.beginPath(); g.moveTo(Math.cos(a) * (rr - len), Math.sin(a) * (rr - len)); g.lineTo(Math.cos(a) * (rr + len), Math.sin(a) * (rr + len)); g.stroke();
    }
    yield;
    g.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 140; i++) {
      const a = r() * TAU; if (density(a) > .45) continue;
      const rr = rc * 1.08 + r() * (R * .72 - rc), len = R * (.03 + r() * .07), w = R * (.006 + r() * .012);
      g.setTransform(1, 0, 0, 1, c, c); g.rotate(a); g.translate(rr, 0);
      const cg = g.createRadialGradient(0, 0, 0, 0, 0, len);
      cg.addColorStop(0, 'rgba(6,8,12,.5)'); cg.addColorStop(.6, 'rgba(6,8,12,.2)'); cg.addColorStop(1, 'rgba(6,8,12,0)');
      g.fillStyle = cg; g.beginPath(); g.ellipse(0, 0, len, w, 0, 0, TAU); g.fill();
    }
    g.setTransform(1, 0, 0, 1, c, c);
    for (let i = 0; i < 14; i++) {
      const rr = R * (.74 + r() * .2), a0 = r() * TAU, span = .2 + r() * .9;
      g.strokeStyle = `rgba(4,8,14,${.12 + r() * .18})`; g.lineWidth = (1 + r() * 2.5) * px;
      g.beginPath();
      for (let k = 0; k <= 30; k++) { const a = a0 + span * k / 30, q = rr * (1 + Math.sin(k * .9 + i) * .004); k ? g.lineTo(Math.cos(a) * q, Math.sin(a) * q) : g.moveTo(Math.cos(a) * q, Math.sin(a) * q); }
      g.stroke();
    }
    const lim = g.createRadialGradient(0, 0, R * .8, 0, 0, R * 1.03);
    lim.addColorStop(0, 'rgba(5,8,13,0)'); lim.addColorStop(.72, 'rgba(5,8,13,.7)'); lim.addColorStop(1, 'rgba(5,8,13,0)');
    g.fillStyle = lim; g.beginPath(); g.arc(0, 0, R * 1.04, 0, TAU); g.fill();
    const ruff = g.createRadialGradient(0, 0, rp * .92, 0, 0, rp * 1.45);
    ruff.addColorStop(0, 'rgba(30,14,4,.95)'); ruff.addColorStop(1, 'rgba(30,14,4,0)');
    g.fillStyle = ruff; g.beginPath(); g.arc(0, 0, rp * 1.45, 0, TAU); g.fill();
  }

  const small = matchMedia('(max-width: 700px)').matches;
  const IRIS_SIZE = small ? 1200 : 2000;
  const irisCv = document.createElement('canvas'); irisCv.width = irisCv.height = IRIS_SIZE;
  const painter = paintIris(irisCv.getContext('2d'), IRIS_SIZE, 11);
  let painted = false, sheetImg = null, bits = '';

  // Daugman's rubber sheet: sample the painted iris in polar coordinates.
  const buildSheet = () => {
    const sheet = $('#sheet'); if (!sheet) return;
    const W = Math.round(sheet.clientWidth * DPR), H = Math.round(sheet.clientHeight * DPR);
    if (!W || !H) return;
    sheet.width = W; sheet.height = H;
    const src = irisCv.getContext('2d').getImageData(0, 0, IRIS_SIZE, IRIS_SIZE).data;
    const c = IRIS_SIZE / 2, R = IRIS_SIZE * .44, r0 = R * .23, r1 = R * .96;
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    const o = off.getContext('2d'), img = o.createImageData(W, H);
    for (let x = 0; x < W; x++) {
      const a = x / W * TAU - Math.PI / 2;
      for (let y = 0; y < H; y++) {
        const rr = r1 - (r1 - r0) * y / (H - 1);
        const sx = Math.round(c + Math.cos(a) * rr), sy = Math.round(c + Math.sin(a) * rr), si = (sy * IRIS_SIZE + sx) * 4, di = (y * W + x) * 4;
        img.data[di] = src[si] * 1.5; img.data[di + 1] = src[si + 1] * 1.5; img.data[di + 2] = src[si + 2] * 1.5; img.data[di + 3] = 255;
      }
    }
    o.putImageData(img, 0, 0); sheetImg = off;
    // a toy IrisCode: is each band brighter than its neighbour?
    bits = '';
    for (let i = 0; i < 96; i++) {
      const x = Math.floor(i / 96 * W), y = Math.floor(H * (.3 + (i % 3) * .2)), k = (y * W + x) * 4, k2 = (y * W + Math.min(W - 1, x + 3)) * 4;
      bits += (img.data[k] + img.data[k + 1] > img.data[k2] + img.data[k2 + 1]) ? '1' : '0';
    }
  };

  const eye = $('#eye'), ectx = eye.getContext('2d'), intro = $('#intro'), stage = $('#stage');
  const hud = $('#hud'), nameEl = $('.name'), statement = $('#statement'), statementSub = $('#statementSub'), bitsEl = $('#bits');
  const EDPR = Math.min(devicePixelRatio || 1, 1.5);
  let EW = 0, EH = 0, introP = 0, lookX = 0, lookY = 0, constrict = 0, eyeBorn = null, eyeVisible = true;
  new IntersectionObserver(es => eyeVisible = es[0].isIntersecting).observe(stage);
  const sizeEye = () => { EW = stage.clientWidth; EH = stage.clientHeight; eye.width = Math.round(EW * EDPR); eye.height = Math.round(EH * EDPR); };
  // statement words light up one by one as you scroll through the dark
  const words = [];
  statement.innerHTML = statement.innerHTML.split(/(\s+)/).map(w => /^\s+$/.test(w) || !w ? w : `<span class="wd2">${w}</span>`).join('');
  statement.querySelectorAll('.wd2').forEach(w => words.push(w));
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const aperture = $('#aperture');
  const updateIntro = () => {
    const rc = intro.getBoundingClientRect();
    introP = clamp01(-rc.top / Math.max(1, rc.height - innerHeight));
    const p = introP;
    nameEl.style.opacity = 1 - clamp01(p / .16);
    nameEl.style.transform = `scale(${1 + p * .6})`;
    hud.style.opacity = 1 - clamp01(p / .1);
    statement.style.opacity = clamp01((p - .4) / .06);
    const lit = Math.floor(words.length * clamp01((p - .44) / .3));
    words.forEach((w, i) => w.classList.toggle('lit', i < lit));
    statementSub.style.opacity = clamp01((p - .76) / .06);
    // last stretch: the dark gives way to paper
    // last stretch: paper opens out of the dark like an aperture; the text inverts as the edge passes it
    const k = clamp01((p - .84) / .13);
    aperture.style.clipPath = `circle(${(k * k * (3 - 2 * k) * 75).toFixed(2)}% at 50% 50%)`;
    intro.style.background = k >= 1 ? 'var(--paper)' : '';
    if (rc.bottom > innerHeight * .5) document.body.dataset.theme = k > .55 ? 'paper' : 'void';
  };
  introHook = updateIntro;

  const drawEye = t => {
    if (!eyeVisible || !EW) return;
    if (!painted) {
      const until = performance.now() + 10;
      while (performance.now() < until) { if (painter.next().done) { painted = true; buildSheet(); break; } }
    }
    if (eyeBorn === null) eyeBorn = t;
    const age = (t - eyeBorn) / 1000;
    const W = EW, H = EH, p = introP;
    ectx.setTransform(EDPR, 0, 0, EDPR, 0, 0);
    ectx.fillStyle = '#06080B'; ectx.fillRect(0, 0, W, H);
    const dive = Math.pow(clamp01(p / .42), 2.6);
    const baseD = small ? W * 1.2 : Math.min(H * 1.04, W * .7);
    const rp0 = baseD / 2 * .2;
    const zMax = Math.hypot(W, H) / (2 * rp0) * 1.25;
    const z = 1 + (zMax - 1) * dive;
    // the eye glances toward the cursor
    const tx = (mx - W / 2) / W, ty = (my - H / 2) / H;
    lookX += (tx - lookX) * .06; lookY += (ty - lookY) * .06;
    const cxs = W / 2 + lookX * 26 * (1 - dive), cys = H / 2 + lookY * 18 * (1 - dive);
    const S = baseD / .88 * z;
    // halo
    const halo = ectx.createRadialGradient(cxs, cys, baseD * .42 * z, cxs, cys, baseD * .75 * z);
    halo.addColorStop(0, 'rgba(70,120,160,.16)'); halo.addColorStop(1, 'rgba(70,120,160,0)');
    ectx.fillStyle = halo; ectx.fillRect(0, 0, W, H);
    ectx.save(); ectx.translate(cxs, cys); ectx.rotate(reduce ? 0 : t * .000012);
    ectx.drawImage(irisCv, -S / 2, -S / 2, S, S);
    ectx.restore();
    // pupil: opens from wide to normal on load, breathes, and narrows when the cursor comes close (light)
    const d = Math.hypot(mx - cxs, my - cys) / (baseD / 2);
    constrict += ((d < 1 ? (1 - d) * .22 : 0) - constrict) * .05;
    const open = reduce ? 1 : 1 + 1.6 * Math.pow(1 - clamp01(age / 2.6), 3);
    const rp = rp0 * z * open * (1 + (reduce ? 0 : Math.sin(t / 2600) * .035) - constrict);
    const pcx = cxs + lookX * rp * .25, pcy = cys + lookY * rp * .2;
    const pg = ectx.createRadialGradient(pcx, pcy, rp * .9, pcx, pcy, rp * 1.08);
    pg.addColorStop(0, '#020203'); pg.addColorStop(1, 'rgba(2,2,3,0)');
    ectx.fillStyle = pg; ectx.beginPath(); ectx.arc(pcx, pcy, rp * 1.08, 0, TAU); ectx.fill();
    // a soft window reflection on the cornea
    ectx.save(); ectx.translate(cxs - rp0 * z * .85 + lookX * 10, cys - rp0 * z * .95 + lookY * 8); ectx.rotate(-.25);
    const sp = ectx.createRadialGradient(0, 0, 0, 0, 0, rp0 * z * .7);
    const spA = 1 - clamp01(dive * 3);
    sp.addColorStop(0, `rgba(255,255,255,${.55 * spA})`); sp.addColorStop(.5, `rgba(255,255,255,${.12 * spA})`); sp.addColorStop(1, 'rgba(255,255,255,0)');
    ectx.fillStyle = sp; ectx.beginPath(); ectx.ellipse(0, 0, rp0 * z * .7, rp0 * z * .42, 0, 0, TAU); ectx.fill();
    ectx.restore();
    // instrument ring: ticks, crosshair and a slow amber sweep; fades as you dive
    const ring = 1 - clamp01(p / .12);
    if (ring > 0) {
      const RR = baseD / 2 * 1.07;
      ectx.save(); ectx.translate(W / 2, H / 2); ectx.globalAlpha = ring * clamp01(age / 1.5);
      ectx.strokeStyle = 'rgba(239,232,218,.35)'; ectx.lineWidth = .7;
      ectx.beginPath(); ectx.arc(0, 0, RR, 0, TAU); ectx.stroke();
      for (let i = 0; i < 180; i++) {
        const a = i / 180 * TAU, l = i % 15 ? 5 : 13;
        ectx.globalAlpha = ring * (i % 15 ? .35 : .7);
        ectx.beginPath(); ectx.moveTo(Math.cos(a) * RR, Math.sin(a) * RR); ectx.lineTo(Math.cos(a) * (RR + l), Math.sin(a) * (RR + l)); ectx.stroke();
      }
      const sa = (t / 7000) % 1 * TAU;
      ectx.globalAlpha = ring * .9; ectx.strokeStyle = '#E2A458'; ectx.lineWidth = 1.6;
      ectx.beginPath(); ectx.arc(0, 0, RR + 6, sa - .35, sa); ectx.stroke();
      ectx.restore();
    }
    // unrolled sheet with a scan line, and the bits it produces
    if (sheetImg) {
      const sheet = $('#sheet'), sc = sheet.getContext('2d'), sw = sheet.width, sh = sheet.height;
      const ph = (t / 7000) % 1;
      sc.clearRect(0, 0, sw, sh); sc.drawImage(sheetImg, 0, 0);
      sc.fillStyle = '#E2A458'; sc.fillRect(ph * sw, 0, 1.5 * DPR, sh);
      sc.fillStyle = 'rgba(6,8,11,.45)'; sc.fillRect(ph * sw, 0, sw - ph * sw, sh);
      const n = Math.floor(ph * bits.length);
      const shown = bits.slice(0, n) + '·'.repeat(bits.length - n);
      if (bitsEl.textContent !== shown) bitsEl.textContent = shown;
    }
  };

  // the contact section ends with a smaller copy of the same eye
  const eye2 = $('#iris2'), e2 = eye2.getContext('2d'), eye2St = watch(eye2);
  let e2s = 0, l2x = 0, l2y = 0;
  const sizeEye2 = () => { e2s = eye2.clientWidth; eye2.width = eye2.height = Math.round(e2s * DPR); };
  const drawEye2 = t => {
    if (!eye2St.on || !e2s || !painted) return;
    const b = eye2.getBoundingClientRect(), c = e2s / 2;
    const dx = mx - (b.left + c), dy = my - (b.top + c), dist = Math.hypot(dx, dy) || 1;
    l2x += (dx / dist * Math.min(1, dist / 500) - l2x) * .08; l2y += (dy / dist * Math.min(1, dist / 500) - l2y) * .08;
    e2.setTransform(DPR, 0, 0, DPR, 0, 0); e2.clearRect(0, 0, e2s, e2s);
    const S = e2s / .88 * .96;
    e2.save(); e2.translate(c + l2x * 6, c + l2y * 6); e2.drawImage(irisCv, -S / 2, -S / 2, S, S); e2.restore();
    const rp = e2s / 2 * .96 * .2 * (1 + Math.sin(t / 2600) * .04);
    e2.fillStyle = '#020203'; e2.beginPath(); e2.arc(c + l2x * (6 + rp * .3), c + l2y * (6 + rp * .3), rp, 0, TAU); e2.fill();
    e2.fillStyle = 'rgba(255,255,255,.5)'; e2.beginPath(); e2.ellipse(c - rp * .9, c - rp * 1.0, rp * .45, rp * .26, -.25, 0, TAU); e2.fill();
  };

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
    // law-report cloth: oxblood, navy, forest, tan, charcoal; gilt bands near the top
    const cloth = ['#6E2E2B', '#7A3A2E', '#23344F', '#2C3E5C', '#2F4B3A', '#3D5A45', '#9C7A4B', '#8A6A3F', '#3A3C40', '#5A4636'];
    let s = '', x = 2;
    for (let i = 0; i < 123; i++) {
      const w = 7 + Math.round(rnd() * 2), h = 232 + rnd() * 56, y = 296 - h, col = cloth[Math.floor(rnd() * cloth.length)];
      s += `<g class="book"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="${col}"/>` +
        `<rect x="${x}" y="${y + 14}" width="${w}" height="1.6" fill="#D8B46A" opacity=".85"/>` +
        `<rect x="${x}" y="${y + 19}" width="${w}" height="1" fill="#D8B46A" opacity=".6"/>` +
        `<rect x="${x + 1.5}" y="${y + 30}" width="${w - 3}" height="${8 + rnd() * 10}" rx=".5" fill="#000" opacity=".22"/>` +
        `<rect x="${x}" y="${296 - 16}" width="${w}" height="1.2" fill="#D8B46A" opacity=".5"/></g>`;
      x += w + (rnd() < .15 ? 2 : 1);
    }
    shelf.setAttribute('viewBox', `0 0 ${x + 2} 300`);
    s += `<rect x="0" y="296" width="${x + 2}" height="4" fill="currentColor" opacity=".55"/>`;
    s += '<line id="sweep" x1="0" x2="0" y1="0" y2="296" stroke="#E2A458" stroke-width="2"/>';
    shelf.innerHTML = s;
    shelf.querySelectorAll('.book').forEach(el => spines.push({el, x: +el.firstElementChild.getAttribute('x'), y: +el.firstElementChild.getAttribute('y')}));
    shelf.dataset.w = x + 2;
  }
  const sweep = shelf.querySelector('#sweep'), shelfW = +shelf.dataset.w;
  const shelfTag = $('#shelfTag'), shelfAct = $('#shelfAct'), shelfQ = $('#shelfQ');
  // real questions and the section that answers each; the winning Act is a fixed spine
  const searches = [
    ['PIO reply deadline', 'Right to Information Act, 2005 · s.7(1)', 21],
    ['contract signed by a minor', 'Indian Contract Act, 1872 · s.11', 58],
    ['punishment for theft', 'Bharatiya Nyaya Sanhita, 2023 · s.303', 96],
    ['arrest without a warrant', 'BNSS, 2023 · s.35', 37],
  ];
  let shelfRound = -1, hits = [], best = 0;
  const drawShelf = t => {
    if (!shelfSt.on) return;
    const P = 6400, round = Math.floor(t / P), ph = (t % P) / P;
    if (round !== shelfRound) {
      shelfRound = round;
      spines.forEach(sp => sp.el.classList.remove('hit', 'top'));
      shelfTag.classList.remove('show'); shelf.classList.remove('narrow');
      const [q, act, idx] = searches[round % searches.length];
      shelfQ.textContent = q; shelfAct.textContent = act; best = idx;
      const sp = spines[idx], at = (sp.x + 4) / shelfW;
      shelfTag.style.left = at * 100 + '%';
      shelfTag.style.height = 58 + Math.max(0, (sp.y - 34) / 300 * shelf.clientHeight) + 'px';
      shelfTag.classList.toggle('l', at < .2); shelfTag.classList.toggle('r', at > .8);
      const r = seeded(round * 31 + 5); hits = [idx];
      while (hits.length < 5) { const i = Math.floor(r() * 123); if (!hits.includes(i)) hits.push(i); }
    }
    const x = reduce ? shelfW : Math.min(1, ph / .45) * shelfW;
    sweep.setAttribute('x1', x); sweep.setAttribute('x2', x);
    sweep.setAttribute('opacity', ph < .45 && !reduce ? .9 : 0);
    hits.forEach(i => { if (spines[i].x <= x) spines[i].el.classList.add('hit'); });
    const settled = ph >= .5 || reduce;
    shelf.classList.toggle('narrow', settled && ph < .94);
    if (settled) { spines[best].el.classList.add('top'); shelfTag.classList.add('show'); }
  };

  // ---------- ROLLONE HALL ----------
  const seats = $('#seats'), seatEls = [];
  for (let i = 0; i < 120; i++) { const d = document.createElement('i'); d.className = 'seat'; seats.append(d); seatEls.push(d); }
  const playHall = () => {
    const present = $('#present'), hc = $('#hclock'), hb = $('#hbar'), feed = $('#feed');
    const fill = el => { el.classList.remove('ping'); el.classList.add('on'); };
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
        o.el.classList.add('ping');
        setTimeout(() => fill(o.el), 700);
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
  const resize = () => { sizeEye(); sizeEye2(); sizeEEG(); if (painted) buildSheet(); updateIntro(); };
  addEventListener('resize', resize);
  resize();
  document.querySelectorAll('[data-bg]').forEach(s => themeIO.observe(s));
  const loop = t => {
    cx += (mx - cx) * .2; cy += (my - cy) * .2;
    cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
    if (peekOn || peek.classList.contains('on')) {
      const vx = mx - pkx;
      pkx += (mx - pkx) * .12; pky += (my - pky) * .12;
      peek.style.transform = `translate(${pkx + 190}px,${pky}px) translate(-50%,-50%) rotate(${Math.max(-8, Math.min(8, vx * .04))}deg) scale(${peekOn ? 1 : .6})`;
    } else { pkx = mx; pky = my; }
    try {
      drawEye(t); drawEye2(t); drawEEG(t); drawQR(t); drawShelf(t);
    } finally { requestAnimationFrame(loop); }
  };
  requestAnimationFrame(loop);
})();
