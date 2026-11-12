(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const pad2 = n => String(n).padStart(2, '0');
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* ------------------------------------------------------------------
     DATA
  ------------------------------------------------------------------ */
  const PROJECTS = window.PROJECTS || [];
  const N = PROJECTS.length;
  let idx = PROJECTS.findIndex(p => p.slug === document.body.dataset.project);
  if (idx < 0) idx = 0;
  const P = PROJECTS[idx];
  const NEXT = PROJECTS[(idx + 1) % N];
  const nextHref = NEXT.slug + '.html';

  /* ------------------------------------------------------------------
     MOTION SETTINGS
  ------------------------------------------------------------------ */
  const S = {
    smooth: 0.1, revealDist: 48, revealDur: 1, grain: 0.1, cursor: 32, footRise: 37,
    tilt: 0, introSpeed: 1.2, imgParallax: 10, ambient: 0.55, revealBlur: 40, radius: 6, mouseDepth: 22
  };
  root.style.setProperty('--reveal-dist', S.revealDist + 'px');
  root.style.setProperty('--reveal-dur', S.revealDur + 's');
  root.style.setProperty('--grain', S.grain);
  root.style.setProperty('--bg-bright', S.ambient);

  // soft blurred backgrounds, drawn once into a tiny canvas so they cost nothing to move
  const softs = [];
  function drawSoft(o) {
    const im = o.im, cv = o.cv;
    const w = 64, h = Math.max(1, Math.round(64 * im.naturalHeight / Math.max(1, im.naturalWidth)));
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    try { ctx.filter = 'blur(3px) saturate(1.25)'; } catch (e) { /* older browsers draw it unfiltered */ }
    ctx.drawImage(im, -8, -8, w + 16, h + 16);
    ctx.filter = 'none';
    ctx.fillStyle = `rgba(0,0,0,${clamp(1 - S.ambient)})`;
    ctx.fillRect(0, 0, w, h);
  }
  function soft(el, src) {
    if (!el || !src) return;
    el.style.backgroundImage = 'none';
    const cv = document.createElement('canvas'); cv.className = 'soft';
    el.appendChild(cv);
    const im = new Image();
    const o = { im, cv };
    im.onload = () => { drawSoft(o); softs.push(o); };
    im.src = src;
  }
  /* ------------------------------------------------------------------
     FILL CONTENT
  ------------------------------------------------------------------ */
  // accent colour from content.js; the footer glow is derived from it
  function applyTheme() {
    const a = String((window.SITE && SITE.theme && SITE.theme.accent) || '#d9632c').trim();
    const m = /^#?([0-9a-f]{6})$/i.exec(a);
    if (!m) { document.documentElement.style.setProperty('--accent', a); return; }
    const n = parseInt(m[1], 16), rgb = [n >> 16 & 255, n >> 8 & 255, n & 255];
    const mix = (t, k) => '#' + rgb.map(c => Math.round(c + (t - c) * k).toString(16).padStart(2, '0')).join('');
    const st = document.documentElement.style;
    st.setProperty('--accent', '#' + m[1]);
    st.setProperty('--glow-hot', mix(255, 0.22));
    st.setProperty('--glow-deep', mix(0, 0.45));
  }
  applyTheme();

  // texts from content.js
  const TX = (window.SITE && SITE.text) || {};
  const NV = TX.nav || {};
  const CT = TX.case || {};
  const setText = (sel, v) => { const el = $(sel); if (el && v != null) el.textContent = v; };
  const setRoll = (sel, v) => { const el = $(sel); if (!el || v == null) return; el.dataset.t = v; el.firstElementChild.textContent = v; };
  const logoEl = $('#logo');
  if (TX.logoImage) {
    logoEl.classList.add('has-img');
    logoEl.innerHTML = `<img src="${esc(TX.logoImage)}" alt="">`;
  } else setText('#logo', TX.logo);
  const fullName = [TX.firstName, TX.lastName].filter(Boolean).join(' ').replace(/\.$/, '') || 'Home';
  $('#logo').dataset.veil = fullName; $('#foot-home').dataset.veil = fullName;
  setRoll('#nav-work', NV.work); setRoll('#nav-next', NV.next);
  setRoll('#foot-work', NV.work); setRoll('#foot-home', NV.home); setRoll('#foot-top', NV.top);
  setRoll('#next-all', CT.backToWork);
  setText('#hint-t', TX.scroll);
  setText('#lbl-over', CT.overview);
  setText('#lbl-next', CT.nextProject);
  if (CT.gallery) $('#h-gal').dataset.split = CT.gallery;
  setText('#foot-note', TX.footerNote);
  setText('#foot-name', TX.footerName);
  $('#foot-meta').innerHTML = (TX.footerMeta || []).map(t => `<span>${esc(t)}</span>`).join('');

  document.title = P.name + ' · ' + fullName;
  $('#p-count').textContent = pad2(idx + 1) + ' / ' + pad2(N);
  $('#p-case').textContent = (CT.prefix || 'Case') + ' ' + pad2(idx + 1) + ' / ' + pad2(N);
  $('#p-year').textContent = P.year;
  soft($('#p-amb'), P.img);
  const coverImg = $('#p-cover');
  coverImg.src = P.img; coverImg.alt = P.name;
  $('#p-h1').textContent = P.name;
  $('#p-lede').innerHTML = `<p>${esc(P.text)}</p>`;

  // title: each word is one line that rises as one piece
  const titleEl = $('#p-title');
  const lines = [];
  const letters = [];
  P.name.split(/\s+/).forEach((word, li) => {
    const line = document.createElement('span'); line.className = 'line';
    const wrap = document.createElement('span'); wrap.className = 'chw';
    const ch = document.createElement('span'); ch.className = 'ch'; ch.textContent = word;
    wrap.appendChild(ch); line.appendChild(wrap);
    letters.push({ el: ch, line: li, i: li, h: 0 });
    titleEl.appendChild(line); lines.push(line);
  });

  // overview
  $('#p-summary').textContent = P.summary || P.text;
  const meta = [[CT.role || 'Role', P.role], [CT.year || 'Year', P.year], [CT.team || 'Team', P.team], [CT.duration || 'Duration', P.duration], [CT.tools || 'Tools', P.tools]].filter(r => r[1]);
  $('#p-meta').innerHTML = meta.map((r, i) => `<div class="erow rv" style="--d:${(i * 0.08).toFixed(2)}s"><span class="lvl">${esc(r[0])}</span><span class="val">${esc(r[1])}</span></div>`).join('');

  // wide photo
  const wideSec = $('#p-wide');
  if (P.wide) {
    soft($('#wide-bg'), P.wide);
    const wi = $('#wide-img'); wi.src = P.wide; wi.alt = P.name;
  } else wideSec.hidden = true;

  // story
  const story = [[CT.challenge || 'Challenge', P.challenge], [CT.approach || 'Approach', P.approach], [CT.outcome || 'Outcome', P.outcome]].filter(r => r[1]);
  $('#p-story').innerHTML = story.map(r => `<div class="srow"><h2 class="h-display split" data-split="${esc(r[0])}"></h2><p class="rv">${esc(r[1])}</p></div>`).join('');

  // gallery
  const galSec = $('#p-gal'), galTrack = $('#gal-track');
  const gallery = Array.isArray(P.gallery) ? P.gallery.filter(g => g && g.img) : [];
  const galItems = gallery.map((g, i) => {
    const fig = document.createElement('figure'); fig.className = 'gal-item';
    fig.innerHTML = `<div class="media"><div class="m-bg"></div><img src="${esc(g.img)}" alt="${esc(g.caption || P.name)}" loading="lazy" decoding="async"></div>` +
      `<figcaption><span>${esc(g.caption || '')}</span><b>${pad2(i + 1)} / ${pad2(gallery.length)}</b></figcaption>`;
    galTrack.appendChild(fig);
    soft($('.m-bg', fig), g.img);
    const img = $('img', fig), media = $('.media', fig);
    const setAr = () => { if (img.naturalWidth) { media.style.setProperty('--ar', (img.naturalWidth / img.naturalHeight).toFixed(4)); measure(); } };
    if (img.complete) requestAnimationFrame(setAr); else img.addEventListener('load', setAr);
    return { el: fig, img, x: 0, w: 1 };
  });
  if (!galItems.length) galSec.hidden = true;
  $('#gal-count').textContent = pad2(gallery.length) + ' ' + (CT.photos || 'photos');

  // next project
  const nextEl = $('#p-next');
  nextEl.href = nextHref;
  nextEl.dataset.veil = NEXT.name;
  $('#next-name').textContent = NEXT.name;
  $('#next-idx').textContent = pad2(((idx + 1) % N) + 1) + ' / ' + pad2(N);
  const peekImg = $('#next-peek img'); peekImg.src = NEXT.img; peekImg.alt = '';
  $('#next-all').href = 'index.html#work-' + P.slug;
  $('#nav-next').href = nextHref;
  $('#nav-next').dataset.veil = NEXT.name;

  /* ------------------------------------------------------------------
     BUILD MOTION HELPERS
  ------------------------------------------------------------------ */
  $$('[data-split]').forEach(h => {
    h.setAttribute('aria-label', h.dataset.split);
    const wrap = document.createElement('span'); wrap.className = 'chw'; wrap.setAttribute('aria-hidden', 'true');
    const ch = document.createElement('span'); ch.className = 'ch'; ch.style.setProperty('--i', 0);
    ch.textContent = h.dataset.split; wrap.appendChild(ch); h.appendChild(wrap);
  });

  const scrubs = $$('.scrub').map(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map(w => '<span class="w" aria-hidden="true">' + esc(w) + '</span>').join(' ');
    return { el, words: $$('.w', el), top: 0, h: 0 };
  });

  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    $$('.curtain', en.target).forEach(c => c.classList.add('in'));
    io.unobserve(en.target);
  }), { threshold: 0.18 }) : null;
  $$('.rv, .split, .srow, #p-wide, #p-next').forEach(el => { io ? io.observe(el) : el.classList.add('in'); });
  if (!io) $$('.curtain').forEach(c => c.classList.add('in'));

  /* ------------------------------------------------------------------
     ELEMENTS
  ------------------------------------------------------------------ */
  const cursorEl = $('#cursor');
  cursorEl.style.setProperty('--cs', S.cursor + 'px');
  const heroEl = $('#p-hero'), stage = $('#p-stage'), amb = $('#p-amb'), frame = $('#p-frame'), shade = $('#p-shade');
  const topEl = $('#p-top'), titleWrap = $('#p-title-wrap'), hint = $('#p-hint'), lede = $('#p-lede');
  const widePar = $('#wide-par'), wideMedia = $('#wide-media');
  const galFill = $('#gal-fill');
  const foot = $('#foot'), footGlow = $('#foot-glow'), footName = $('#foot-name'), footNameWrap = $('#foot-name-wrap');
  const peek = $('#next-peek');
  const nav = $('#nav'), progressEl = $('#progress');
  const veil = $('#veil'), veilT = $('#veil-t');

  /* ------------------------------------------------------------------
     MEASURE
  ------------------------------------------------------------------ */
  const L = { vw: 1, vh: 1, sw: 1, sh: 1, heroTop: 0, heroH: 1, fx: 0, fy: 0, fw: 1, fh: 1, galTop: 0, galH: 1, galDist: 0, galW: 1, wideTop: 0, wideH: 1, docH: 1 };
  function measure() {
    L.vw = window.innerWidth; L.vh = window.innerHeight;
    const sy0 = window.scrollY;
    const abs = el => el.getBoundingClientRect().top + sy0;
    L.heroTop = abs(heroEl); L.heroH = heroEl.offsetHeight;
    L.sw = stage.clientWidth; L.sh = stage.clientHeight;
    const ar = coverImg.naturalWidth ? coverImg.naturalWidth / coverImg.naturalHeight : 0.75;
    const gutter = Math.max(16, L.vw * 0.042);
    let h = L.sh * 0.78, w = h * ar;
    if (w > L.sw - gutter * 2) { w = L.sw - gutter * 2; h = w / ar; }
    L.fw = w; L.fh = h; L.fx = (L.sw - w) / 2; L.fy = (L.sh - h) / 2;
    frame.style.left = L.fx + 'px'; frame.style.top = L.fy + 'px';
    frame.style.width = L.fw + 'px'; frame.style.height = L.fh + 'px';
    L.pw = peek.offsetWidth; L.ph = peek.offsetHeight;
    if (!galSec.hidden) {
      L.galW = galTrack.scrollWidth;
      L.galDist = Math.max(0, L.galW - L.vw);
      galSec.style.height = (L.vh + L.galDist) + 'px';
      L.galTop = abs(galSec); L.galH = galSec.offsetHeight;
      galItems.forEach(g => { g.x = g.el.offsetLeft; g.w = g.el.offsetWidth; });
    }
    if (!wideSec.hidden) { L.wideTop = abs(wideMedia); L.wideH = wideMedia.offsetHeight; }
    scrubs.forEach(s => { s.top = abs(s.el); s.h = s.el.offsetHeight; });
    letters.forEach(l => { l.h = l.el.offsetHeight; });
    footName.style.fontSize = '100px';
    const fcs = getComputedStyle(footNameWrap);
    const avail = footNameWrap.clientWidth - parseFloat(fcs.paddingLeft) - parseFloat(fcs.paddingRight);
    footName.style.fontSize = (100 * avail / Math.max(1, footName.scrollWidth)) + 'px';
    L.footTop = abs(foot); L.footH = foot.offsetHeight;
    footGlow.style.height = Math.max(0, L.footH - footNameWrap.offsetTop) + 'px';
    L.docH = document.documentElement.scrollHeight;
  }

  /* ------------------------------------------------------------------
     INPUT
  ------------------------------------------------------------------ */
  let mx = 0, my = 0, mxS = 0, myS = 0, px = -9999, py = -9999, pxS = -9999, pyS = -9999;
  let cx = -100, cy = -100, cxS = -100, cyS = -100;
  let nx = 0, ny = 0, nxS = 0, nyS = 0;
  window.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    mx = (e.clientX / L.vw - 0.5) * 2; my = (e.clientY / L.vh - 0.5) * 2;
    px = e.clientX; py = e.clientY; cx = e.clientX; cy = e.clientY;
    const t = e.target.closest ? e.target.closest('[data-cursor]') : null;
    if (t) { $('#cursor-t').textContent = t.dataset.cursor; cursorEl.classList.add('big'); cursorEl.style.setProperty('--cs', '84px'); }
    else { cursorEl.classList.remove('big'); cursorEl.style.setProperty('--cs', S.cursor + 'px'); }
    cursorEl.style.opacity = S.cursor > 0 ? '1' : '0';
  }, { passive: true });
  document.addEventListener('pointerleave', () => { px = py = -9999; cursorEl.style.opacity = '0'; });
  let nextHover = false;
  nextEl.addEventListener('pointerenter', () => { nextHover = true; });
  nextEl.addEventListener('pointerleave', () => { nextHover = false; });
  nextEl.addEventListener('pointermove', e => {
    const r = nextEl.getBoundingClientRect();
    nx = e.clientX - r.left; ny = e.clientY - r.top;
  }, { passive: true });

  /* ------------------------------------------------------------------
     PAGE TRANSITION
  ------------------------------------------------------------------ */
  function go(href, label) {
    if (reduce) { window.location.href = href; return; }
    veilT.textContent = label || '';
    veil.style.transition = 'clip-path 0.75s cubic-bezier(.7, 0, .2, 1)';
    veil.style.clipPath = 'inset(0 0 0 0)';
    veil.classList.add('cover');
    try { sessionStorage.setItem('hv-veil', '1'); } catch (e) { /* ignore */ }
    setTimeout(() => { window.location.href = href; }, 760);
  }
  $$('[data-top]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }));
  $$('a[data-veil]').forEach(a => a.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    go(a.getAttribute('href'), a.dataset.veil);
  }));
  // arriving: the project name on the loading screen flies to the title
  let flyIn = false, landed = true, tiltK = 1;
  function arrive() {
    if (!root.classList.contains('arrive')) return 0;
    veil.style.clipPath = 'inset(0 0 0 0)';
    root.classList.remove('arrive');
    if (reduce) {
      veil.style.clipPath = 'inset(0 0 100% 0)';
      return 0;
    }
    veilT.style.transition = 'none';
    veilT.innerHTML = P.name.split(/\s+/).map(w => '<span class="vw">' + esc(w) + '</span>').join(' ');
    veil.classList.add('cover');
    flyIn = true; landed = false; tiltK = 0;
    titleWrap.style.visibility = 'hidden';
    const ready = document.fonts && document.fonts.ready
      ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 700))])
      : Promise.resolve();
    ready.then(() => setTimeout(fly, 380));
    return 1e7;
  }
  function fly() {
    measure();
    introStart = performance.now() + 450;
    titleEl.classList.remove('masked');
    lines.forEach(li => { li.style.transform = 'none'; });
    letters.forEach(l => { l.el.style.transition = 'none'; l.el.style.transform = 'none'; });
    const words = $$('.vw', veilT);
    letters.forEach((l, i) => {
      const t = l.el.getBoundingClientRect(), w = words[i];
      if (!w) return;
      const r = w.getBoundingClientRect();
      const sc = r.width / Math.max(1, t.width);
      const dx = (r.left + r.width / 2) - (t.left + t.width / 2);
      const dy = (r.top + r.height / 2) - (t.top + t.height / 2);
      l.el.style.transformOrigin = '50% 50%';
      l.el.style.transform = `translate3d(${dx}px,${dy}px,0) scale(${sc})`;
    });
    titleWrap.style.zIndex = '98';
    titleWrap.style.visibility = '';
    veilT.style.opacity = '0';
    veil.classList.remove('cover');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      letters.forEach((l, i) => {
        l.el.style.transition = `transform 1.3s cubic-bezier(.65, 0, .25, 1) ${i * 0.06}s`;
        l.el.style.transform = 'translate3d(0,0,0) scale(1)';
      });
      veil.style.transition = 'clip-path 1.1s cubic-bezier(.65, 0, .25, 1) 0.1s';
      veil.style.clipPath = 'inset(0 0 100% 0)';
    }));
    setTimeout(() => {
      titleWrap.style.zIndex = '';
      letters.forEach(l => { l.el.style.transition = ''; });
      landed = true;
      veilT.style.opacity = ''; veilT.style.transition = '';
    }, 1300 + letters.length * 60 + 60);
  }
  window.addEventListener('pageshow', e => {
    if (!e.persisted) return;
    veil.style.transition = 'none'; veil.style.clipPath = 'inset(100% 0 0 0)'; veil.classList.remove('cover');
  });

  /* ------------------------------------------------------------------
     FRAME LOOP
  ------------------------------------------------------------------ */
  let sy = window.scrollY, vel = 0, last = performance.now();
  let introStart = reduce ? -1e6 : performance.now() + 150;
  let introDone = reduce;

  function updateHero(now) {
    const p = clamp((sy - L.heroTop) / Math.max(1, L.sh));
    const since = now - introStart;
    const ip = reduce ? 1 : easeOut(clamp(since / (S.introSpeed * 900)));
    const eRaw = reduce ? 1 : clamp((since - S.introSpeed * 600) / 1900), e = ease(eRaw);
    const k = p;

    // cover photo: a small window that rises in, then opens to the full poster by itself
    const w0 = Math.min(L.fw, clamp(L.sw * 0.2, 150, 320)), h0 = Math.min(L.fh, w0 * 1.22);
    const dx = mxS * S.mouseDepth * (1 - e), dy = myS * S.mouseDepth * (1 - e);
    let T = lerp((L.fh - h0) / 2 + (1 - ip) * h0 + dy, 0, e);
    let B = lerp((L.fh - h0) / 2 - dy, 0, e);
    let Lf = lerp((L.fw - w0) / 2 + dx, 0, e);
    let R = lerp((L.fw - w0) / 2 - dx, 0, e);
    T = Math.max(0, T); B = Math.max(0, B); Lf = Math.max(0, Lf); R = Math.max(0, R);
    frame.style.clipPath = `inset(${T}px ${R}px ${B}px ${Lf}px round ${lerp(S.radius, 4, e)}px)`;
    const fit = Math.max(w0 / L.fw, h0 / L.fh);
    coverImg.style.transform = `scale(${lerp(fit, 1, e)})`;
    amb.style.opacity = clamp(e * 1.2);
    shade.style.opacity = clamp((e - 0.6) / 0.4);
    const par = Math.max(0, sy - L.heroTop) * 0.3;
    frame.style.transform = `translate3d(0,${par}px,0)`;
    amb.style.transform = `translate3d(0,${par}px,0)`;

    // title
    const s0 = -k * L.vw * 0.16, s1 = k * L.vw * 0.12;
    if (lines[0]) lines[0].style.transform = `translate3d(${s0}px,0,0)`;
    if (lines[1]) lines[1].style.transform = `translate3d(${s1}px,0,0)`;
    for (let i = 2; i < lines.length; i++) lines[i].style.transform = `translate3d(${(i % 2 ? s1 : s0)}px,0,0)`;
    titleWrap.style.transform = `translate3d(${mxS * S.tilt * 0.5 * tiltK}px,0,0)`;
    titleWrap.style.opacity = 1 - clamp((p - 0.4) / 0.5);
    let maxT = 0;
    for (let i = 0; i < letters.length; i++) {
      const l = letters[i];
      const tl = flyIn ? 1 : clamp((since - l.i * 160) / (S.introSpeed * 1000));
      maxT = Math.max(maxT, tl);
      if (!flyIn) l.el.style.transform = `translate3d(0,${(1 - easeOut(tl)) * l.h * 1.08}px,0)`;
    }
    if (!introDone && maxT >= 1 && !flyIn) { introDone = true; titleEl.classList.remove('masked'); }

    topEl.style.opacity = easeOut(clamp(since / 900)) * (1 - clamp(p * 2));
    const lt = reduce ? 1 : clamp((since - S.introSpeed * 600 - 1900 * 0.6) / 1000);
    hint.style.opacity = easeOut(clamp(lt * 1.4 - 0.4)) * (1 - clamp(p * 4));
    const lv = easeOut(lt) * (1 - clamp((p - 0.25) / 0.35));
    lede.style.opacity = lv;
    lede.style.transform = `translate3d(0,${(1 - lv) * 30}px,0)`;
  }

  function updateMisc(dt) {
    // footer: the dark hill rises over the glow and the name rises as one word
    const fp = clamp((sy + L.vh - L.footTop) / Math.max(1, L.footH));
    if (fp > 0) {
      footGlow.style.opacity = 0.25 + 0.75 * easeOut(fp);
      footGlow.style.transform = `translate3d(${mxS * 24}px,${(1 - easeOut(fp)) * S.footRise}%,0)`;
      footName.style.transform = `translate3d(0,${(1 - easeOut(clamp((fp - 0.35) / 0.55))) * 100}%,0)`;
    }
    scrubs.forEach(s => {
      const top = s.top - sy;
      if (top > L.vh || top + s.h < 0) return;
      const pr = clamp((L.vh * 0.9 - top) / (L.vh * 0.5 + s.h * 0.5));
      const n = s.words.length;
      for (let i = 0; i < n; i++) s.words[i].style.opacity = 0.22 + 0.78 * clamp(pr * (n + 6) - i - 2, 0, 1);
    });
    // wide photo parallax
    if (!wideSec.hidden) {
      const et = L.wideTop - sy;
      if (et < L.vh && et + L.wideH > 0) {
        const r = clamp((L.vh - et) / (L.vh + L.wideH));
        widePar.style.transform = `translate3d(0,${(r - 0.5) * -S.imgParallax}%,0) scale(1.18)`;
      }
    }
    // gallery strip
    if (!galSec.hidden) {
      const gp = clamp((sy - L.galTop) / Math.max(1, L.galH - L.vh));
      const x = L.galDist > 0 ? -gp * L.galDist : Math.max(0, (L.vw - L.galW) / 2);
      galTrack.style.transform = `translate3d(${x}px,0,0)`;
      galFill.style.transform = `scaleX(${L.galDist > 0 ? gp : 1})`;
    }
    // next project peek
    const pk = 1 - Math.pow(1 - 0.14, dt * 60);
    nxS += (nx - nxS) * pk; nyS += (ny - nyS) * pk;
    if (nextHover) peek.style.transform = `translate3d(${nxS - L.pw / 2}px,${nyS - L.ph / 2}px,0)`;
    if (landed && tiltK < 1) tiltK = Math.min(1, tiltK + dt * 1.5);
    // nav + progress
    if (sy < 160 || vel < -40) nav.classList.remove('hide'); else if (vel > 40) nav.classList.add('hide');
    progressEl.style.transform = `scaleX(${clamp(sy / Math.max(1, L.docH - L.vh))})`;
  }

  function frameLoop(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    const target = window.scrollY, prev = sy;
    const k = reduce ? 1 : 1 - Math.pow(1 - S.smooth, dt * 60);
    sy += (target - sy) * k; if (Math.abs(target - sy) < 0.08) sy = target;
    vel = lerp(vel, (sy - prev) / dt, 0.12);
    const mk = 1 - Math.pow(1 - 0.08, dt * 60), pk = 1 - Math.pow(1 - 0.2, dt * 60);
    mxS += (mx - mxS) * mk; myS += (my - myS) * mk;
    if (px < -1000) { pxS = px; pyS = py; } else { pxS += (px - pxS) * pk; pyS += (py - pyS) * pk; }
    cxS += (cx - cxS) * pk; cyS += (cy - cyS) * pk;
    cursorEl.style.transform = `translate3d(${cxS}px,${cyS}px,0) translate(-50%,-50%)`;
    updateHero(now);
    updateMisc(dt);
    requestAnimationFrame(frameLoop);
  }

  /* ------------------------------------------------------------------
     START
  ------------------------------------------------------------------ */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) { /* ignore */ }
  window.scrollTo(0, 0);
  sy = 0;
  const openedAt = performance.now();
  window.addEventListener('load', () => { if (performance.now() - openedAt < 2500 && window.scrollY > 0) { window.scrollTo(0, 0); sy = 0; } });
  const delay = arrive();
  if (!reduce) introStart = performance.now() + 150 + delay;
  measure();
  coverImg.addEventListener('load', measure);
  let rz;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(measure, 120); });
  window.addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); if (!reduce && !flyIn && performance.now() < introStart + 200) introStart = performance.now() + 100; });
  requestAnimationFrame(t => { last = t; requestAnimationFrame(frameLoop); });
})();
