'use strict';
/* Crossword: picture clues, a fresh puzzle every time, and a big on-screen keyboard. */
(function () {
  const { $, $$, h, esc } = App;
  const LEVELS = {
    little: { name: 'Little', count: 5, minLen: 3, maxLen: 5, max: 8 },
    big: { name: 'Big', count: 8, minLen: 3, maxLen: 9, max: 12 }
  };
  const saved = {};
  let level = null;
  const K = (x, y) => x + ',' + y;

  // Lay words out so they cross on shared letters and never touch side by side.
  function layout(key) {
    const L = LEVELS[key];
    const bank = App.WORDS.filter((w) => w[0].length >= L.minLen && w[0].length <= L.maxLen);
    let best = null;
    for (let attempt = 0; attempt < 120; attempt++) {
      const pool = App.shuffle(bank);
      const cells = new Map();
      const placed = [];
      let minX = 0, minY = 0, maxX = 0, maxY = 0;
      const put = (w, x, y, dir) => {
        for (let i = 0; i < w[0].length; i++) {
          const k = dir === 'across' ? K(x + i, y) : K(x, y + i);
          const c = cells.get(k) || { ch: w[0][i] };
          c[dir] = true;
          cells.set(k, c);
        }
        placed.push({ word: w[0], emoji: w[1], clue: w[2], x, y, dir });
        minX = Math.min(minX, x); minY = Math.min(minY, y);
        maxX = Math.max(maxX, dir === 'across' ? x + w[0].length - 1 : x);
        maxY = Math.max(maxY, dir === 'down' ? y + w[0].length - 1 : y);
      };
      // Returns how many letters the word would share, or 0 if it does not fit there.
      const fits = (word, x, y, dir) => {
        const dx = dir === 'across' ? 1 : 0, dy = 1 - dx;
        if (cells.has(K(x - dx, y - dy)) || cells.has(K(x + dx * word.length, y + dy * word.length))) return 0;
        let crossings = 0;
        for (let i = 0; i < word.length; i++) {
          const cx = x + dx * i, cy = y + dy * i;
          const c = cells.get(K(cx, cy));
          if (c) {
            if (c.ch !== word[i] || c[dir]) return 0;
            crossings++;
          } else if (cells.has(K(cx + dy, cy + dx)) || cells.has(K(cx - dy, cy - dx))) return 0;
        }
        return crossings < word.length ? crossings : 0;
      };
      // Start from one of the longer words: more letters to cross.
      const first = pool.slice(0, 5).sort((a, b) => b[0].length - a[0].length)[0];
      put(first, 0, 0, Math.random() < 0.5 ? 'across' : 'down');
      for (const w of pool) {
        if (placed.length >= L.count) break;
        if (w === first) continue;
        const word = w[0];
        const opts = [];
        cells.forEach((c, k) => {
          if (c.across && c.down) return;
          const dir = c.across ? 'down' : 'across';
          const [cx, cy] = k.split(',').map(Number);
          for (let i = 0; i < word.length; i++) {
            if (word[i] !== c.ch) continue;
            const x = dir === 'across' ? cx - i : cx, y = dir === 'down' ? cy - i : cy;
            const n = fits(word, x, y, dir);
            if (!n) continue;
            const w2 = Math.max(maxX, dir === 'across' ? x + word.length - 1 : x) - Math.min(minX, x) + 1;
            const h2 = Math.max(maxY, dir === 'down' ? y + word.length - 1 : y) - Math.min(minY, y) + 1;
            if (w2 > L.max || h2 > L.max) continue;
            opts.push({ x, y, dir, score: n * 1000 - w2 * h2 + Math.random() });
          }
        });
        if (!opts.length) continue;
        opts.sort((a, b) => b.score - a.score);
        put(w, opts[0].x, opts[0].y, opts[0].dir);
      }
      if (placed.length < L.count) continue;
      const area = (maxX - minX + 1) * (maxY - minY + 1);
      if (!best || area < best.area) best = { area, placed, minX, minY, W: maxX - minX + 1, H: maxY - minY + 1 };
      if (best && attempt >= 25) break;
    }
    if (!best) return null;

    // Shift to start at 0,0, list each word's squares, then number the starting squares in reading order.
    const entries = best.placed.map((p) => {
      const x = p.x - best.minX, y = p.y - best.minY;
      const squares = [];
      for (let i = 0; i < p.word.length; i++) squares.push(p.dir === 'across' ? K(x + i, y) : K(x, y + i));
      return { word: p.word, emoji: p.emoji, clue: p.clue, dir: p.dir, x, y, cells: squares };
    });
    const starts = {};
    entries.slice().sort((a, b) => a.y - b.y || a.x - b.x).forEach((e) => {
      const k = K(e.x, e.y);
      if (!starts[k]) starts[k] = Object.keys(starts).length + 1;
      e.num = starts[k];
    });
    entries.sort((a, b) => (a.dir === b.dir ? a.num - b.num : a.dir === 'across' ? -1 : 1));
    const letters = {};
    entries.forEach((e) => e.cells.forEach((k, i) => { letters[k] = e.word[i]; }));
    return { key, W: best.W, H: best.H, entries, letters, starts, fill: {}, lock: {}, done: [], hints: 0, sel: 0, pos: 0 };
  }
  App.makeCrossword = layout; // used by the tests

  App.register('crossword', {
    title: 'Crossword',
    render(root, extra) {
      level = level || App.state.best.cwLevel || 'little';
      Object.keys(LEVELS).forEach((k) => {
        extra.appendChild(h('<button class="tab' + (k === level ? ' on' : '') + '" data-l="' + k + '">' + LEVELS[k].name + '</button>'));
      });
      extra.appendChild(h('<button class="tab new" aria-label="New puzzle">🔄</button>'));
      extra.addEventListener('click', (e) => {
        const t = e.target.closest('.tab');
        if (!t) return;
        App.sfx.pop();
        if (t.classList.contains('new')) delete saved[level];
        else { level = t.dataset.l; App.state.best.cwLevel = level; App.save(); }
        App.refresh();
      });

      const P = saved[level] = saved[level] || layout(level);
      const keyRow = (letters, last) => letters.split('').map((c) => '<button class="key" data-k="' + c + '">' + c + '</button>').join('') + last;
      const scr = h(
        '<div class="cw">' +
          '<div class="cw-wrap"><div class="cw-grid" style="grid-template-columns:repeat(' + P.W + ',1fr);grid-template-rows:repeat(' + P.H + ',1fr)"></div></div>' +
          '<div class="cw-side">' +
            '<div class="cw-clue"></div>' +
            '<div class="cw-list"></div>' +
          '</div>' +
          '<div class="cw-keys">' +
            '<div class="key-row">' + keyRow('ABCDEFGHIJKLM', '<button class="key wide" data-k="back" aria-label="Rub out">⌫</button>') + '</div>' +
            '<div class="key-row">' + keyRow('NOPQRSTUVWXYZ', '<button class="key wide hint" data-k="hint" aria-label="Give me a letter">💡</button>') + '</div>' +
          '</div>' +
        '</div>');
      root.appendChild(scr);
      const wrap = $('.cw-wrap', scr), grid = $('.cw-grid', scr);

      const entry = () => P.entries[P.sel];
      const full = (e) => e.cells.every((k) => P.fill[k]);
      const right = (e) => e.cells.every((k, i) => P.fill[k] === e.word[i]);
      const label = (e) => e.num + ' ' + (e.dir === 'across' ? 'Across' : 'Down');

      function fit() {
        const r = wrap.getBoundingClientRect();
        const cell = Math.floor(Math.min(r.width / P.W, r.height / P.H, 92));
        grid.style.width = cell * P.W + 'px';
        grid.style.height = cell * P.H + 'px';
        grid.style.setProperty('--u', cell + 'px');
      }
      function paint() {
        const e = entry();
        const bad = {};
        P.entries.forEach((en, i) => {
          if (!P.done.includes(i) && full(en)) en.cells.forEach((k, j) => { if (P.fill[k] !== en.word[j]) bad[k] = true; });
        });
        grid.innerHTML = Object.keys(P.letters).map((k) => {
          const [x, y] = k.split(',').map(Number);
          const cls = 'cw-c' + (e.cells.includes(k) ? ' in' : '') + (e.cells[P.pos] === k ? ' cur' : '') +
            (P.lock[k] ? ' ok' : '') + (bad[k] ? ' bad' : '');
          return '<button class="' + cls + '" data-k="' + k + '" style="grid-column:' + (x + 1) + ';grid-row:' + (y + 1) + '">' +
            (P.starts[k] ? '<i>' + P.starts[k] + '</i>' : '') + '<b>' + (P.fill[k] || '') + '</b></button>';
        }).join('');
        $('.cw-clue', scr).innerHTML = '<span class="cw-pic">' + e.emoji + '</span>' +
          '<div class="cw-words"><div class="cw-tag">' + label(e) + ' · ' + e.word.length + ' letters</div><p>' + esc(e.clue) + '</p></div>' +
          '<button class="speak read" aria-label="Read the clue">🔊</button>';
        $('.cw-list', scr).innerHTML = ['across', 'down'].map((dir) =>
          '<div class="cw-h">' + (dir === 'across' ? 'Across →' : 'Down ↓') + '</div>' +
          P.entries.map((en, i) => en.dir !== dir ? '' :
            '<button class="cw-item' + (i === P.sel ? ' on' : '') + (P.done.includes(i) ? ' done' : '') + '" data-e="' + i + '">' +
            '<b>' + en.num + '</b><span class="cw-ipic">' + en.emoji + '</span><span>' + esc(en.clue) + '</span></button>').join('')).join('');
      }
      function select(i, pos) {
        P.sel = i;
        const e = entry();
        if (pos === undefined) {
          pos = e.cells.findIndex((k) => !P.lock[k] && !P.fill[k]);
          if (pos < 0) pos = e.cells.findIndex((k) => !P.lock[k]);
          if (pos < 0) pos = 0;
        }
        P.pos = pos;
      }
      function advance() {
        const e = entry();
        for (let i = P.pos + 1; i < e.cells.length; i++) if (!P.lock[e.cells[i]]) { P.pos = i; return; }
      }
      // After a square changes, see whether any word through it is now complete.
      function check(k) {
        P.entries.forEach((en, i) => {
          if (P.done.includes(i) || !en.cells.includes(k) || !full(en)) return;
          if (!right(en)) { if (i === P.sel) App.sfx.nope(); return; }
          P.done.push(i);
          en.cells.forEach((c) => { P.lock[c] = true; });
          ['C5', 'E5', 'G5'].forEach((note, j) => App.sfx.play('glock', note, j * 0.09, 0.55));
          App.say(en.word, 'word-' + en.word.toLowerCase());
          const r = grid.getBoundingClientRect();
          App.burst(r.left + r.width / 2, r.top + r.height / 2, ['⭐', '✨'], 10);
        });
        if (P.done.length === P.entries.length) {
          setTimeout(() => {
            App.party();
            App.say(App.LINES['crossword-done'], 'crossword-done');
            const card = App.modal('<div class="big-icon">📝</div><h2>You finished the crossword!</h2>' +
              '<p>' + (P.hints ? 'You used <b>' + P.hints + '</b> ' + (P.hints === 1 ? 'hint.' : 'hints.') : 'And with no hints at all!') + '</p>' +
              '<button class="btn again">New puzzle</button>');
            $('.again', card).addEventListener('click', () => { delete saved[level]; App.closeModal(); App.refresh(); });
          }, 1300);
        } else if (P.done.includes(P.sel)) {
          select(P.entries.findIndex((en, i) => !P.done.includes(i)));
        }
      }
      function press(key) {
        if (P.done.length === P.entries.length) return;
        let e = entry();
        let k = e.cells[P.pos];
        if (key === 'back') {
          if (P.lock[k] || !P.fill[k]) {
            for (let i = P.pos - 1; i >= 0; i--) if (!P.lock[e.cells[i]]) { P.pos = i; break; }
            k = e.cells[P.pos];
          }
          if (!P.lock[k]) delete P.fill[k];
          App.sfx.pop();
        } else {
          if (P.lock[k]) { advance(); k = entry().cells[P.pos]; if (P.lock[k]) { paint(); return; } }
          if (key === 'hint') {
            P.fill[k] = P.letters[k];
            P.lock[k] = true;
            P.hints++;
            App.sfx.sparkle();
          } else {
            P.fill[k] = key;
            App.sfx.chime(App.pick(['C5', 'D5', 'E5', 'G5']));
          }
          const was = P.sel;
          check(k);
          if (P.sel === was) advance();
        }
        paint();
      }

      grid.addEventListener('click', (ev) => {
        const b = ev.target.closest('.cw-c');
        if (!b) return;
        const k = b.dataset.k;
        const through = P.entries.map((en, i) => (en.cells.includes(k) ? i : -1)).filter((i) => i >= 0);
        let pickIdx;
        if (through.includes(P.sel) && (through.length === 1 || entry().cells[P.pos] !== k)) pickIdx = P.sel;
        else pickIdx = through.find((i) => i !== P.sel);
        if (pickIdx === undefined) pickIdx = through[0];
        App.sfx.pop();
        select(pickIdx, P.entries[pickIdx].cells.indexOf(k));
        paint();
      });
      scr.addEventListener('click', (ev) => {
        const key = ev.target.closest('.key');
        if (key) { press(key.dataset.k); return; }
        const item = ev.target.closest('.cw-item');
        if (item) { App.sfx.pop(); select(+item.dataset.e); paint(); return; }
        if (ev.target.closest('.read')) App.say(entry().clue, 'clue-' + entry().word.toLowerCase());
      });
      this._keys = (ev) => {
        if (ev.ctrlKey || ev.metaKey || ev.altKey || document.querySelector('.modal')) return;
        if (/^[a-zA-Z]$/.test(ev.key)) press(ev.key.toUpperCase());
        else if (ev.key === 'Backspace') { ev.preventDefault(); press('back'); }
      };
      document.addEventListener('keydown', this._keys);

      this._fit = fit;
      addEventListener('resize', fit);
      if (P.done.includes(P.sel) && P.done.length < P.entries.length) select(P.entries.findIndex((en, i) => !P.done.includes(i)));
      fit();
      paint();
    },
    leave() {
      removeEventListener('resize', this._fit);
      document.removeEventListener('keydown', this._keys);
    }
  });
})();
