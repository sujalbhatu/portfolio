(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DPR = Math.min(devicePixelRatio || 1, 2);
  const TAU = Math.PI * 2;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const root = document.documentElement;
  const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };

  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('ready')));

  // ---------- toast ----------
  const toastEl = $('#toast'); let toastT;
  const toast = msg => { toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 1800); };

  // ---------- theme ----------
  const setTheme = t => { root.dataset.theme = t; store.set('theme', t); document.querySelector('meta[name=theme-color]').content = t === 'light' ? '#fafaf9' : '#09090b'; };
  $('#themeBtn').addEventListener('click', () => setTheme(root.dataset.theme === 'light' ? 'dark' : 'light'));

  // ---------- résumé link: hide it until a résumé file is published ----------
  fetch('resume.pdf', { method: 'HEAD' }).then(r => { if (!r.ok) throw 0; }).catch(() => $$('.resume-link').forEach(a => a.remove()));

  // ---------- IST clock ----------
  const clock = $('#clock');
  const tick = () => clock.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
  tick(); setInterval(tick, 20000);

  // ---------- nav: background on scroll + active section ----------
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 12);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });
  const navLinks = $$('[data-nav]');
  const secObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('on', a.dataset.nav === e.target.dataset.sec));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('[data-sec]').forEach(s => secObs.observe(s));

  // ---------- reveal on scroll ----------
  $$('.sec-head, .case, .rcard, .how-grid li, .tl li, .skills, .about-l, .contact-card, .proof > div').forEach(el => el.classList.add('rv'));
  const rvObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rvObs.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach((el, i) => { el.style.transitionDelay = (el.parentElement.matches('.how-grid, .tl, .proof') ? [...el.parentElement.children].indexOf(el) * 70 : 0) + 'ms'; rvObs.observe(el); });

  // ---------- count-up numbers ----------
  const cntObs = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cntObs.unobserve(e.target);
    const b = e.target, to = +b.dataset.count, dec = +(b.dataset.dec || 0);
    if (reduce) return;
    const t0 = performance.now(), dur = 1600;
    const step = t => {
      const p = Math.min(1, (t - t0) / dur), k = 1 - Math.pow(1 - p, 4);
      b.textContent = (to * k).toFixed(dec);
      if (p < 1) requestAnimationFrame(step); else b.textContent = to.toFixed(dec);
    };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  $$('[data-count]').forEach(b => cntObs.observe(b));

  // ---------- spotlight cards ----------
  $$('.spot, .case').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  // ---------- hero art parallax ----------
  const art = $('#heroArt');
  if (art && !reduce && matchMedia('(pointer: fine)').matches) {
    const back = art.querySelector('.s-back'), front = art.querySelector('.s-front');
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * .08; cy += (ty - cy) * .08;
      back.style.transform = `rotateY(${-14 + cx * 6}deg) rotateX(${6 - cy * 5}deg) translateZ(-40px)`;
      front.style.transform = `rotateY(${-10 + cx * 9}deg) rotateX(${4 - cy * 7}deg) translateZ(60px) translate(${cx * 10}px, ${cy * 8}px)`;
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > .001 ? requestAnimationFrame(loop) : 0;
    };
    addEventListener('pointermove', e => {
      if (scrollY > innerHeight) return;
      tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5;
      if (!raf) { back.style.transition = front.style.transition = 'opacity .8s'; raf = requestAnimationFrame(loop); }
    }, { passive: true });
  }

  // ---------- tabs ----------
  $$('[data-viewer]').forEach(v => {
    const btns = [...v.querySelectorAll('[data-tab]')], ink = v.querySelector('.tab-ink');
    const place = b => { ink.style.left = b.offsetLeft + 'px'; ink.style.width = b.offsetWidth + 'px'; };
    const show = b => {
      btns.forEach(x => x.setAttribute('aria-selected', x === b));
      v.querySelectorAll('.pane').forEach(p => p.classList.toggle('on', p.dataset.pane === b.dataset.tab));
      place(b);
    };
    btns.forEach(b => b.addEventListener('click', () => show(b)));
    v.querySelector('.tabs').addEventListener('keydown', e => {
      const i = btns.findIndex(b => b.getAttribute('aria-selected') === 'true');
      const n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (n) { const b = btns[(i + n + btns.length) % btns.length]; show(b); b.focus(); }
    });
    // panes that start visible animate their bars when scrolled into view
    const firstOn = v.querySelector('.pane.on');
    firstOn.classList.remove('on');
    new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { firstOn.classList.add('on'); o.disconnect(); } }, { threshold: .3 }).observe(v);
    const fit = () => place(btns.find(b => b.getAttribute('aria-selected') === 'true'));
    fit(); addEventListener('resize', fit); document.fonts && document.fonts.ready.then(fit);
  });

  // ---------- copy email ----------
  const copyMail = $('#copyMail');
  copyMail.addEventListener('click', () => {
    const m = copyMail.dataset.mail;
    (navigator.clipboard ? navigator.clipboard.writeText(m) : Promise.reject()).then(() => toast('Email copied')).catch(() => { location.href = 'mailto:' + m; });
  });

  // ---------- command palette ----------
  const pal = $('#palette'), palIn = $('#palInput'), palList = $('#palList');
  const go = id => () => document.getElementById(id).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  const open = u => () => window.open(u, '_blank', 'noopener');
  const cmds = [
    ['RollOne case study', 'section', go('rollone')],
    ['OpenForge case study', 'section', go('openforge')],
    ['Research: GGCS and IrisAuth', 'section', go('research')],
    ['About', 'section', go('about')],
    ['Contact', 'section', go('contact')],
    ['Copy email address', 'action', () => copyMail.click()],
    ['Switch theme', 'action', () => $('#themeBtn').click()],
    ['Open OpenForge (live)', 'link', open('https://openforge.online')],
    ['Open RollOne (live)', 'link', open('https://campustrack.openforge.online')],
    ['GitHub', 'link', open('https://github.com/sujalbhatu')],
    ['LinkedIn', 'link', open('https://www.linkedin.com/in/sujal-bhatu-19027429a/')],
    ['Codeforces', 'link', open('https://codeforces.com/profile/sujalbhatu')],
  ];
  let shown = cmds, sel = 0, lastFocus = null;
  const render = () => {
    palList.innerHTML = '';
    shown.forEach((c, i) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option'); li.className = i === sel ? 'sel' : '';
      li.innerHTML = `<span></span><small>${c[1]}</small>`; li.firstChild.textContent = c[0];
      li.addEventListener('click', () => run(c)); li.addEventListener('pointermove', () => { if (sel !== i) { sel = i; render(); } });
      palList.appendChild(li);
    });
  };
  const openPal = () => { lastFocus = document.activeElement; pal.hidden = false; palIn.value = ''; shown = cmds; sel = 0; render(); palIn.focus(); };
  const closePal = () => { pal.hidden = true; lastFocus && lastFocus.focus && lastFocus.focus(); };
  const run = c => { closePal(); c[2](); };
  palIn.addEventListener('input', () => { const q = palIn.value.toLowerCase(); shown = cmds.filter(c => c[0].toLowerCase().includes(q)); sel = 0; render(); });
  palIn.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { sel = Math.min(shown.length - 1, sel + 1); render(); e.preventDefault(); }
    if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); render(); e.preventDefault(); }
    if (e.key === 'Enter' && shown[sel]) run(shown[sel]);
  });
  pal.addEventListener('click', e => { if (e.target === pal) closePal(); });
  $('#openPalette').addEventListener('click', openPal);
  addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hidden ? openPal() : closePal(); }
    else if (e.key === 'Escape' && !pal.hidden) closePal();
  });

  // ---------- canvases only draw while on screen ----------
  const watch = el => { const s = { on: false }; new IntersectionObserver(es => s.on = es[0].isIntersecting).observe(el); return s; };
  const seeded = s => () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const rnd = seeded(7);

  // ---------- THE IRIS (IrisAuth card) ----------
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

  const irisEl = $('#iris'), ig = irisEl.getContext('2d'), irisSt = watch(irisEl);
  const IRIS_SIZE = matchMedia('(max-width: 700px)').matches ? 900 : 1300;
  const irisCv = document.createElement('canvas'); irisCv.width = irisCv.height = IRIS_SIZE;
  const painter = paintIris(irisCv.getContext('2d'), IRIS_SIZE, 11);
  let painted = false, iw = 0, ih = 0, lx = 0, ly = 0, mx = -1, my = -1;
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  const sizeIris = () => { iw = irisEl.clientWidth; ih = irisEl.clientHeight; irisEl.width = Math.round(iw * DPR); irisEl.height = Math.round(ih * DPR); };
  const drawIris = t => {
    if (!irisSt.on || !iw) return;
    if (!painted) { for (let k = 0; k < 4 && !painted; k++) painted = painter.next().done; }
    const b = irisEl.getBoundingClientRect(), cx = iw / 2, cy = ih / 2;
    let tx = 0, ty = 0;
    if (mx >= 0) { const dx = mx - (b.left + cx), dy = my - (b.top + cy), d = Math.hypot(dx, dy) || 1; tx = dx / d * Math.min(1, d / 600); ty = dy / d * Math.min(1, d / 600); }
    lx += (tx - lx) * .07; ly += (ty - ly) * .07;
    ig.setTransform(DPR, 0, 0, DPR, 0, 0); ig.clearRect(0, 0, iw, ih);
    const S = Math.max(iw, ih) * 1.05, R = S * .44;
    ig.save(); ig.translate(cx + lx * 10, cy + ly * 8);
    ig.rotate(reduce ? 0 : t / 90000);
    ig.drawImage(irisCv, -S / 2, -S / 2, S, S); ig.restore();
    const px = cx + lx * 14, py = cy + ly * 11;
    const rp = R * .2 * (1 + (reduce ? 0 : Math.sin(t / 2400) * .05));
    ig.fillStyle = '#020203'; ig.beginPath(); ig.arc(px, py, rp, 0, TAU); ig.fill();
    ig.fillStyle = 'rgba(255,255,255,.45)'; ig.beginPath(); ig.ellipse(px - rp * .7, py - rp * .75, rp * .34, rp * .2, -.3, 0, TAU); ig.fill();
    // Daugman segmentation rings, drawn like an instrument overlay
    ig.strokeStyle = 'rgba(245,181,68,.55)'; ig.lineWidth = 1; ig.setLineDash([3, 5]);
    ig.beginPath(); ig.arc(px, py, rp * 1.08, 0, TAU); ig.stroke();
    ig.beginPath(); ig.arc(cx + lx * 10, cy + ly * 8, R * .93, 0, TAU); ig.stroke();
    ig.setLineDash([]);
    // vignette so the card edge stays calm
    const v = ig.createRadialGradient(cx, cy, Math.min(iw, ih) * .3, cx, cy, Math.max(iw, ih) * .75);
    v.addColorStop(0, 'rgba(7,8,11,0)'); v.addColorStop(1, 'rgba(7,8,11,.85)');
    ig.fillStyle = v; ig.fillRect(0, 0, iw, ih);
  };

  // ---------- EEG (GGCS card): 22 channels, the 5 GGCS keeps stay lit ----------
  const eeg = $('#eeg'), ex = eeg.getContext('2d'), eegSt = watch(eeg);
  const keep = new Set([3, 8, 11, 15, 19]);
  const chans = Array.from({ length: 22 }, () => ({
    f: [.006 + rnd() * .01, .02 + rnd() * .03, .06 + rnd() * .07], ph: [rnd() * 6, rnd() * 6, rnd() * 6],
    n: Array.from({ length: 64 }, () => rnd() - .5)
  }));
  let ew = 0, eh = 0, eegStart = null;
  const sizeEEG = () => { ew = eeg.clientWidth; eh = eeg.clientHeight; eeg.width = Math.round(ew * DPR); eeg.height = Math.round(eh * DPR); };
  const drawEEG = t => {
    if (!eegSt.on || !ew) { if (!eegSt.on) eegStart = null; return; }
    if (eegStart === null) eegStart = t;
    // loop: all 22 visible, then 17 fade out, hold, reset
    const cyc = reduce ? 5 : ((t - eegStart) / 1000) % 9;
    const p = Math.max(0, Math.min(1, (cyc - 1.6) / 1.8)) * (cyc > 8.2 ? Math.max(0, 1 - (cyc - 8.2) / .8) : 1);
    ex.setTransform(DPR, 0, 0, DPR, 0, 0); ex.clearRect(0, 0, ew, eh);
    const gap = (eh - 20) / 22, shift = reduce ? 0 : t * .05;
    ex.font = '500 9px "Geist Mono", monospace'; ex.textAlign = 'right';
    chans.forEach((c, i) => {
      const y0 = 10 + gap * (i + .5), kept = keep.has(i);
      const amp = kept ? gap * .9 : gap * .55;
      ex.globalAlpha = kept ? .45 + .55 * p : .32 * (1 - p * .85);
      ex.strokeStyle = kept ? '#F5B544' : '#c9cad6';
      ex.lineWidth = kept ? 1.5 : .8;
      ex.beginPath();
      for (let x = 0; x <= ew - 50; x += 3) {
        const u = x + shift;
        const y = y0 + amp * (Math.sin(u * c.f[0] + c.ph[0]) * .5 + Math.sin(u * c.f[1] + c.ph[1]) * .25 + Math.sin(u * c.f[2] + c.ph[2]) * .2 + c.n[Math.floor(u / 7) % 64] * .3);
        x ? ex.lineTo(x, y) : ex.moveTo(x, y);
      }
      ex.stroke();
      ex.fillStyle = ex.strokeStyle; ex.fillText('CH' + String(i + 1).padStart(2, '0'), ew - 12, y0 + 3);
    });
    ex.globalAlpha = 1;
  };

  const resize = () => { sizeIris(); sizeEEG(); };
  resize(); addEventListener('resize', resize);
  document.fonts && document.fonts.ready.then(resize);
  const frame = t => { drawIris(t); drawEEG(t); requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
})();
