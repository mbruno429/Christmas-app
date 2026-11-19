'use strict';
/* Shared plumbing: saved state, dates, sound, music, narration, navigation, effects. */
window.App = (function () {
  const KEY = 'our-christmas-v1';
  const DEFAULTS = {
    names: ['Little One', 'Big Kid'],
    sound: true,
    voice: true,
    music: true,
    musicVol: 0.6,
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

  /* ---------- sound: real sampled instruments with a little room echo ---------- */
  const NOTE = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77, C6: 1046.5
  };
  const SCALE = Object.keys(NOTE);
  // instrument -> [notes recorded, loudness boost]
  const KITS = {
    bell: [SCALE.slice(0, 8), 3.4],            // tubular bells, for the bell screen
    celesta: [SCALE, 3.6],                     // soft taps and chimes
    box: [SCALE, 3.2],                         // music box, for Bethlehem
    glock: [['C5', 'E5', 'G5', 'A5', 'C6'], 2.4] // bright sparkles
  };
  const buffers = {};
  let ac = null, dry = null, wet = null, samplesStarted = false;

  function audio() {
    if (!state.sound) return null;
    if (!ac) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      try { ac = new C(); } catch (e) { return null; }
      dry = ac.createGain();
      dry.gain.value = 0.9;
      dry.connect(ac.destination);
      // A soft synthetic room so notes ring instead of stopping dead.
      try {
        const len = Math.floor(ac.sampleRate * 1.7);
        const ir = ac.createBuffer(2, len, ac.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
          const d = ir.getChannelData(ch);
          for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
        }
        const conv = ac.createConvolver();
        conv.buffer = ir;
        wet = ac.createGain();
        wet.gain.value = 0.2;
        wet.connect(conv);
        conv.connect(ac.destination);
      } catch (e) { wet = null; }
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function loadSamples() {
    const a = audio();
    if (!a || samplesStarted) return;
    samplesStarted = true;
    Object.keys(KITS).forEach((kit) => KITS[kit][0].forEach((n) => {
      const id = kit + '_' + n;
      fetch('audio/notes/' + id + '.mp3')
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject()))
        .then((data) => new Promise((ok, no) => a.decodeAudioData(data, ok, no)))
        .then((buf) => {
          // Skip the tiny silence MP3 files start with, so taps answer instantly.
          const d = buf.getChannelData(0);
          let i = 0;
          while (i < d.length && Math.abs(d[i]) < 0.004) i++;
          buffers[id] = { buf, off: Math.max(0, i / buf.sampleRate - 0.002) };
        })
        .catch(() => {});
    }));
  }
  // Fallback while samples are still loading: a simple synthesized bell.
  function synth(note, when, level) {
    const f = NOTE[note] || 523.25;
    const t = ac.currentTime + when;
    [[1, 1], [2, 0.45], [3, 0.2]].forEach(([mult, gain]) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.frequency.value = f * mult;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.22 * level * gain, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3 + 1.1 / mult);
      o.connect(g);
      g.connect(dry);
      o.start(t);
      o.stop(t + 1.6);
    });
  }
  function play(kit, note, when, level) {
    const a = audio();
    if (!a) return;
    loadSamples();
    when = when || 0;
    level = level === undefined ? 0.7 : level;
    const s = buffers[kit + '_' + note];
    if (!s) { synth(note, when, level); return; }
    const src = a.createBufferSource();
    const g = a.createGain();
    src.buffer = s.buf;
    g.gain.value = level * KITS[kit][1];
    src.connect(g);
    g.connect(dry);
    if (wet) g.connect(wet);
    src.start(a.currentTime + when, s.off);
  }
  const sfx = {
    play,
    pop: () => play('celesta', 'C6', 0, 0.3),
    nope: () => { play('box', 'E4', 0, 0.55); play('box', 'C4', 0.13, 0.55); },
    win: () => {
      ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => play('glock', n, i * 0.12, 0.6));
      ['C5', 'E5', 'G5'].forEach((n) => play('celesta', n, 0.5, 0.5));
    },
    sparkle: () => play('glock', pick(['C5', 'E5', 'G5', 'A5', 'C6']), 0, 0.42),
    chime: (note, when) => play('celesta', note, when, 0.6)
  };

  /* ---------- background music ---------- */
  const music = (function () {
    let el = null, order = [], at = 0, ducked = false, blocked = false, started = false, errors = 0, fadeTimer = 0;
    const listeners = [];
    const target = () => (state.musicVol || 0) * 0.55 * (ducked ? 0.22 : 1);
    function fade() {
      clearInterval(fadeTimer);
      if (!el) return;
      fadeTimer = setInterval(() => {
        const diff = target() - el.volume;
        if (Math.abs(diff) < 0.02) { el.volume = Math.max(0, Math.min(1, target())); clearInterval(fadeTimer); return; }
        el.volume = Math.max(0, Math.min(1, el.volume + diff * 0.25));
      }, 40);
    }
    function current() { return order.length ? App.TRACKS[order[at]] : null; }
    function tell() { listeners.forEach((fn) => fn(current(), playing())); }
    function playing() { return !!el && !el.paused; }
    function load(i) {
      at = (i + order.length) % order.length;
      el.src = 'audio/music/' + current()[0] + '.mp3';
      if ('mediaSession' in navigator && window.MediaMetadata) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({ title: current()[1], artist: 'Kevin MacLeod', album: 'Our Christmas' });
        } catch (e) { /* not supported */ }
      }
    }
    function ensure() {
      if (el) return;
      order = shuffle(App.TRACKS.map((t, i) => i));
      el = new Audio();
      el.preload = 'auto';
      el.addEventListener('ended', () => { errors = 0; next(); });
      el.addEventListener('playing', () => { errors = 0; tell(); });
      el.addEventListener('pause', tell);
      el.addEventListener('error', () => {
        // Offline and not saved yet: try the next one, but do not spin forever.
        if (++errors < App.TRACKS.length) setTimeout(next, 800);
      });
      load(0);
    }
    function resume() {
      if (!state.music || blocked || document.hidden) return;
      ensure();
      el.volume = Math.max(0, Math.min(1, target()));
      const p = el.play();
      if (p && p.catch) p.catch(() => {});
    }
    function pause() { if (el) el.pause(); }
    function next() {
      if (!el) { resume(); return; }
      load(at + 1);
      resume();
      tell();
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); else if (started) resume(); });
    return {
      // Browsers only allow sound after a touch, so the first tap anywhere starts the music.
      kick() { if (!started) { started = true; resume(); saveAll(); } },
      next,
      current,
      playing,
      onchange(fn) { listeners.length = 0; if (fn) listeners.push(fn); },
      setEnabled(on) { state.music = on; save(); if (on) { started = true; resume(); } else pause(); tell(); },
      setVolume(v) { state.musicVol = v; save(); if (el) el.volume = Math.max(0, Math.min(1, target())); },
      duck(on) { ducked = on; fade(); },
      block(on) { blocked = on; if (on) pause(); else if (started) resume(); }
    };
  })();

  // Quietly keep a copy of every song on the tablet so music also works with no internet.
  function saveAll() {
    if (!('caches' in window) || !navigator.serviceWorker || !navigator.serviceWorker.controller) return;
    const urls = App.TRACKS.map((t) => new URL('audio/music/' + t[0] + '.mp3', location.href).href);
    caches.open('our-christmas-music-v1').then(async (cache) => {
      for (const url of urls) {
        try {
          if (await cache.match(url)) continue;
          const res = await fetch(url);
          if (res.ok && res.status === 200) await cache.put(url, res);
        } catch (e) { return; }
      }
    }).catch(() => {});
  }

  /* ---------- read aloud: recorded narration first, the tablet's own voice as a backup ---------- */
  let clip = null;
  let bestVoice = null;
  function chooseVoice() {
    if (!('speechSynthesis' in window)) return;
    let top = -1;
    speechSynthesis.getVoices().forEach((v) => {
      if (!/^en/i.test(v.lang)) return;
      let s = 0;
      if (/natural|neural|enhanced|premium/i.test(v.name)) s += 4;
      if (/google/i.test(v.name)) s += 2;
      if (/en[-_]US/i.test(v.lang)) s += 1;
      if (!v.localService) s += 1;
      if (s > top) { top = s; bestVoice = v; }
    });
  }
  if ('speechSynthesis' in window) {
    chooseVoice();
    try { speechSynthesis.addEventListener('voiceschanged', chooseVoice); } catch (e) { /* older browsers */ }
  }
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      const clean = String(text).replace(/[\p{Extended_Pictographic}️‍]/gu, '');
      const u = new SpeechSynthesisUtterance(clean);
      if (bestVoice) u.voice = bestVoice;
      u.rate = 0.95;
      u.pitch = 1;
      u.onend = u.onerror = () => music.duck(false);
      music.duck(true);
      speechSynthesis.speak(u);
    } catch (e) { music.duck(false); }
  }
  function hush() {
    if (clip) { clip.onended = clip.onerror = null; clip.pause(); clip = null; }
    try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    music.duck(false);
  }
  // say(text, clipName): plays audio/voice/<clipName>.mp3 when there is one.
  function say(text, name) {
    if (!state.voice) return;
    hush();
    if (!name) { speak(text); return; }
    const a = new Audio('audio/voice/' + name + '.mp3');
    clip = a;
    const done = () => { if (clip === a) { clip = null; music.duck(false); } };
    a.onended = done;
    a.onerror = () => { done(); speak(text); };
    music.duck(true);
    const p = a.play();
    if (p && p.catch) p.catch(() => { if (clip === a) { done(); speak(text); } });
  }

  /* ---------- emoji drawn as pictures, so they look the same (and good) on every tablet ---------- */
  let emojiRx = null;
  function emojiText(node) {
    const text = node.nodeValue;
    if (!text || !emojiRx) return;
    emojiRx.lastIndex = 0;
    if (!emojiRx.test(text)) return;
    const p = node.parentNode;
    if (!p || /^(INPUT|TEXTAREA|SCRIPT|STYLE|TITLE|OPTION)$/.test(p.nodeName)) return;
    const frag = document.createDocumentFragment();
    let last = 0, m;
    emojiRx.lastIndex = 0;
    while ((m = emojiRx.exec(text))) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const img = document.createElement('img');
      img.className = 'em';
      img.alt = m[1];
      img.draggable = false;
      img.src = 'img/e/' + App.EMOJI[m[1]] + '.webp';
      frag.appendChild(img);
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    p.replaceChild(frag, node);
  }
  function emojify(root) {
    if (root.nodeType === 3) { emojiText(root); return; }
    if (root.nodeType !== 1) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(emojiText);
  }
  function startEmoji() {
    if (!App.EMOJI) return;
    const keys = Object.keys(App.EMOJI).sort((a, b) => b.length - a.length);
    emojiRx = new RegExp('(' + keys.join('|') + ')\\uFE0F?', 'gu');
    keys.forEach((k) => { new Image().src = 'img/e/' + App.EMOJI[k] + '.webp'; }); // warm them up
    new MutationObserver((muts) => {
      muts.forEach((m) => {
        if (m.type === 'characterData') emojiText(m.target);
        else m.addedNodes.forEach(emojify);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
    emojify(document.body);
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
    music.onchange(null);
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

  /* ---------- night sky: twinkling stars and falling snow ---------- */
  function startSnow() {
    const c = $('#snow');
    const x = c.getContext('2d');
    const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, flakes = [], stars = [], raf = 0, last = 0, clock = 0;
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      c.width = W * dpr; c.height = H * dpr;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = calm ? 25 : Math.round(Math.min(90, W * H / 14000));
      flakes = Array.from({ length: n }, () => ({
        x: rand(0, W), y: rand(0, H), r: rand(1.4, 4.6), v: rand(18, 55), ph: rand(0, 6.28)
      }));
      stars = Array.from({ length: Math.round(Math.min(70, W * H / 16000)) }, () => ({
        x: rand(0, W), y: rand(0, H * 0.62), r: rand(0.6, 1.7), ph: rand(0, 6.28), sp: rand(0.6, 2.2)
      }));
      draw(0);
    }
    function draw(dt) {
      clock += dt;
      x.clearRect(0, 0, W, H);
      x.fillStyle = '#fff6d8';
      for (const s of stars) {
        x.globalAlpha = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(s.ph + clock * s.sp));
        x.beginPath();
        x.arc(s.x, s.y, s.r, 0, 6.2832);
        x.fill();
      }
      x.fillStyle = '#fff';
      for (const f of flakes) {
        f.y += f.v * dt;
        f.ph += dt;
        f.x += Math.sin(f.ph) * 12 * dt;
        if (f.y > H + 5) { f.y = -5; f.x = rand(0, W); }
        x.globalAlpha = 0.3 + f.r / 9;
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
    today, season, list, NOTE, sfx, music, audio, loadSamples, say, hush, burst, party, toast,
    modal, closeModal, register, route, go, back, refresh, startSnow, startEmoji
  };
})();
