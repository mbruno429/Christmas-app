'use strict';
/* Shared plumbing: saved state, dates, sound, speech, navigation, effects. */
window.App = (function () {
  const KEY = 'our-christmas-v1';
  const DEFAULTS = {
    names: ['Little One', 'Big Kid'],
    sound: true,
    voice: true,
    preview: false,
    opened: {},   // { 2026: [1, 2, ...] }
    deeds: {},    // { 2026: [1, 2, ...] }
    trees: [[], []],
    lights: [true, true],
    letters: [null, null],
    best: {}
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  let state;
  try {
    state = Object.assign(clone(DEFAULTS), JSON.parse(localStorage.getItem(KEY) || '{}'));
  } catch (e) {
    state = clone(DEFAULTS);
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  }
  function reset() {
    Object.keys(state).forEach((k) => delete state[k]);
    Object.assign(state, clone(DEFAULTS));
    save();
  }

  /* ---------- tiny DOM helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  function h(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ---------- dates ---------- */
  function today() {
    const m = /[?&]date=(\d{4})-(\d{2})-(\d{2})/.exec(location.search);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }
  const daysBetween = (a, b) => Math.round((b - a) / 864e5);
  function season() {
    const t = today();
    // Jan 1-6 still belongs to the Christmas that just happened.
    const y = (t.getMonth() === 0 && t.getDate() <= 6) ? t.getFullYear() - 1 : t.getFullYear();
    const xmas = new Date(y, 11, 25);
    const eve = new Date(y, 11, 24);
    // Advent starts on the fourth Sunday before Christmas.
    const advent = new Date(y, 11, 24 - eve.getDay() - 21);
    const sleeps = daysBetween(t, xmas);
    const candles = t >= advent ? Math.min(4, Math.floor(daysBetween(advent, t) / 7) + 1) : 0;
    let doorDay = 0; // highest calendar door that may be opened
    if (sleeps <= 0) doorDay = 25;
    else if (t.getMonth() === 11) doorDay = t.getDate();
    return {
      t, y, xmas, advent, sleeps, candles, doorDay,
      isChristmas: sleeps <= 0,
      untilAdvent: daysBetween(t, advent)
    };
  }
  const list = (bucket, y) => (state[bucket][y] = state[bucket][y] || []);

  /* ---------- sound ---------- */
  let ac = null;
  function audio() {
    if (!state.sound) return null;
    if (!ac) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      try { ac = new C(); } catch (e) { return null; }
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  const NOTE = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, C6: 1046.5
  };
  function bell(note, when, vol) {
    const a = audio();
    if (!a) return;
    const f = typeof note === 'number' ? note : NOTE[note];
    const t = a.currentTime + (when || 0);
    const v = vol || 0.2;
    [[1, 1], [2, 0.45], [3, 0.2], [4.2, 0.1]].forEach(([mult, gain]) => {
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = 'sine';
      o.frequency.value = f * mult;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v * gain, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35 + 1.2 / mult);
      o.connect(g);
      g.connect(a.destination);
      o.start(t);
      o.stop(t + 1.8);
    });
  }
  function sweep(from, to, dur, type, vol) {
    const a = audio();
    if (!a) return;
    const t = a.currentTime;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(from, t);
    o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(vol || 0.18, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  const sfx = {
    bell,
    pop: () => sweep(520, 880, 0.09, 'sine', 0.2),
    nope: () => sweep(220, 150, 0.18, 'triangle', 0.16),
    win: () => ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => bell(n, i * 0.13)),
    sparkle: () => bell(pick(['C5', 'E5', 'G5', 'A5', 'C6']), 0, 0.12)
  };

  /* ---------- read aloud ---------- */
  function say(text) {
    if (!state.voice || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const clean = String(text).replace(/[\p{Extended_Pictographic}️‍]/gu, '');
      const u = new SpeechSynthesisUtterance(clean);
      u.rate = 0.9;
      u.pitch = 1.1;
      speechSynthesis.speak(u);
    } catch (e) { /* no voice available */ }
  }
  function hush() {
    try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) { /* ignore */ }
  }

  /* ---------- effects ---------- */
  function burst(x, y, chars, n) {
    chars = chars || ['✨', '⭐', '❄️'];
    n = n || 9;
    for (let i = 0; i < n; i++) {
      const p = h('<span class="particle"></span>');
      p.textContent = pick(chars);
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.setProperty('--dx', rand(-130, 130).toFixed(0) + 'px');
      p.style.setProperty('--dy', rand(-170, 40).toFixed(0) + 'px');
      p.style.setProperty('--rot', rand(-200, 200).toFixed(0) + 'deg');
      p.style.fontSize = rand(18, 40).toFixed(0) + 'px';
      document.body.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  }
  function party() {
    sfx.win();
    for (let i = 0; i < 6; i++) {
      setTimeout(() => burst(rand(0.15, 0.85) * innerWidth, rand(0.2, 0.7) * innerHeight,
        ['🎉', '⭐', '✨', '🎄', '🔔', '❄️'], 10), i * 140);
    }
  }
  let toastTimer = null;
  function toast(msg) {
    let t = $('#toast');
    if (!t) { t = h('<div id="toast" role="status"></div>'); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ---------- modal ---------- */
  let modalEl = null;
  let modalOnClose = null;
  function closeModal() {
    if (!modalEl) return;
    const cb = modalOnClose;
    modalEl.remove();
    modalEl = null;
    modalOnClose = null;
    hush();
    if (cb) cb();
  }
  function modal(html, opts) {
    opts = opts || {};
    closeModal();
    modalEl = h('<div class="modal"><div class="card ' + (opts.cls || '') + '">' +
      '<button class="x" aria-label="Close">✕</button>' + html + '</div></div>');
    modalOnClose = opts.onClose || null;
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl || e.target.closest('.x')) closeModal();
    });
    document.body.appendChild(modalEl);
    return modalEl.firstElementChild;
  }

  /* ---------- screens & navigation ---------- */
  const screens = {};
  let current = null;
  function register(name, def) { screens[name] = def; }
  function route() {
    const name = (location.hash || '#home').slice(1);
    const scr = screens[name] || screens.home;
    if (current && current.leave) current.leave();
    modalOnClose = null; // the screen is being redrawn anyway
    closeModal();
    hush();
    $$('.name-tag, .particle').forEach((el) => el.remove());
    if ($('#toast')) $('#toast').classList.remove('show');
    const view = $('#view');
    view.innerHTML = '';
    view.className = 'view-' + (screens[name] ? name : 'home');
    let extra = null;
    if (scr !== screens.home) {
      const bar = h('<header class="bar"><button class="back" aria-label="Home">🏠</button>' +
        '<h1></h1><div class="bar-extra"></div></header>');
      $('h1', bar).textContent = scr.title || '';
      $('.back', bar).addEventListener('click', back);
      extra = $('.bar-extra', bar);
      view.appendChild(bar);
    }
    const body = h('<div class="body"></div>');
    view.appendChild(body);
    current = scr;
    scr.render(body, extra);
  }
  function go(name) {
    sfx.pop();
    history.pushState({ deep: true }, '', '#' + name);
    route();
  }
  function back() {
    sfx.pop();
    if (history.state && history.state.deep) history.back();
    else { history.replaceState(null, '', '#home'); route(); }
  }
  function refresh() { route(); }

  /* ---------- falling snow ---------- */
  function startSnow() {
    const c = $('#snow');
    const x = c.getContext('2d');
    const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, flakes = [], raf = 0, last = 0;
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      c.width = W * dpr; c.height = H * dpr;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = calm ? 25 : Math.round(Math.min(90, W * H / 14000));
      flakes = Array.from({ length: n }, () => ({
        x: rand(0, W), y: rand(0, H), r: rand(1.2, 4), v: rand(18, 55), ph: rand(0, 6.28)
      }));
      draw(0);
    }
    function draw(dt) {
      x.clearRect(0, 0, W, H);
      x.fillStyle = '#fff';
      for (const f of flakes) {
        f.y += f.v * dt;
        f.ph += dt;
        f.x += Math.sin(f.ph) * 12 * dt;
        if (f.y > H + 5) { f.y = -5; f.x = rand(0, W); }
        x.globalAlpha = 0.35 + f.r / 8;
        x.beginPath();
        x.arc(f.x, f.y, f.r, 0, 6.2832);
        x.fill();
      }
    }
    function tick(ts) {
      const dt = Math.min(0.05, (ts - last) / 1000 || 0);
      last = ts;
      draw(dt);
      raf = requestAnimationFrame(tick);
    }
    function run() {
      cancelAnimationFrame(raf);
      if (!document.hidden && !calm) { last = performance.now(); raf = requestAnimationFrame(tick); }
    }
    addEventListener('resize', size);
    document.addEventListener('visibilitychange', run);
    size();
    run();
  }

  return {
    state, save, reset, $, $$, h, esc, rand, pick, shuffle,
    today, season, list, NOTE, sfx, say, hush, burst, party, toast,
    modal, closeModal, register, route, go, back, refresh, startSnow
  };
})();
