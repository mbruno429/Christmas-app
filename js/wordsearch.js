'use strict';
/* Word search: drag across the letters, or tap the first letter and then the last letter of a word. */
(function () {
  const { $, $$, h } = App;
  // dirs are [across, down] steps: right, down, and the two diagonals for bigger puzzles.
  const LEVELS = {
    little: { name: 'Little', n: 7, count: 5, maxLen: 6, dirs: [[1, 0], [0, 1]] },
    medium: { name: 'Medium', n: 9, count: 8, maxLen: 8, dirs: [[1, 0], [0, 1], [1, 1]] },
    big: { name: 'Big', n: 11, count: 11, maxLen: 9, dirs: [[1, 0], [0, 1], [1, 1], [1, -1]] }
  };
  const COLORS = ['#ff7eb6', '#ffb703', '#6cc5f0', '#8fdc7c', '#c9a7ff', '#ff9f1c', '#5ad1c0', '#ff8a8a', '#b9d04a', '#9db4ff', '#f6a6d8'];
  // Random letters must never spell something rude by accident.
  const NAUGHTY = ['ASS', 'SEX', 'FUC', 'FUK', 'SHIT', 'DAMN', 'HELL', 'CRAP', 'POO', 'PEE', 'BUTT', 'FART', 'KILL', 'HATE',
    'DUMB', 'DIE', 'BOOB', 'PISS', 'DICK', 'COCK', 'TIT', 'CUM', 'HOE', 'SLUT', 'BUM', 'UGLY', 'FAT', 'GUN', 'DEAD'];
  const saved = {};
  let level = null;
  const rnd = (n) => Math.floor(Math.random() * n);

  function lines(g, n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      let row = '', col = '';
      for (let j = 0; j < n; j++) { row += g[i * n + j]; col += g[j * n + i]; }
      out.push(row, col);
    }
    for (let d = -(n - 1); d < n; d++) {
      let a = '', b = '';
      for (let y = 0; y < n; y++) {
        const x = y + d;
        if (x >= 0 && x < n) { a += g[y * n + x]; b += g[y * n + (n - 1 - x)]; }
      }
      out.push(a, b);
    }
    return out;
  }
  function rude(g, n) {
    return lines(g, n).some((s) => {
      const r = s.split('').reverse().join('');
      return NAUGHTY.some((w) => s.includes(w) || r.includes(w));
    });
  }

  function make(key) {
    const L = LEVELS[key], n = L.n;
    const bank = App.WORDS.filter((w) => w[0].length <= L.maxLen);
    for (let attempt = 0; attempt < 80; attempt++) {
      const g = new Array(n * n).fill('');
      const words = [];
      for (const w of App.shuffle(bank)) {
        if (words.length >= L.count) break;
        const word = w[0], len = word.length;
        for (let t = 0; t < 150; t++) {
          const [dx, dy] = App.pick(L.dirs);
          const x0 = dx ? rnd(n - len + 1) : rnd(n);
          const y0 = dy === 1 ? rnd(n - len + 1) : dy === -1 ? len - 1 + rnd(n - len + 1) : rnd(n);
          let fits = true;
          for (let i = 0; i < len && fits; i++) {
            const c = g[(y0 + dy * i) * n + x0 + dx * i];
            if (c && c !== word[i]) fits = false;
          }
          if (!fits) continue;
          for (let i = 0; i < len; i++) g[(y0 + dy * i) * n + x0 + dx * i] = word[i];
          words.push({ word, emoji: w[1] });
          break;
        }
      }
      if (words.length < L.count) continue;
      const letters = words.map((w) => w.word).join('') + 'AEIOSTRNL';
      for (let t = 0; t < 40; t++) {
        const full = g.map((c) => c || letters[rnd(letters.length)]);
        if (!rude(full, n)) return { key, n, grid: full, words, found: [], marks: [] };
      }
    }
    return null;
  }
  App.makeWordSearch = make; // used by the tests

  App.register('wordsearch', {
    title: 'Word Search',
    render(root, extra) {
      level = level || App.state.best.wsLevel || 'little';
      Object.keys(LEVELS).forEach((k) => {
        extra.appendChild(h('<button class="tab' + (k === level ? ' on' : '') + '" data-l="' + k + '">' + LEVELS[k].name + '</button>'));
      });
      extra.appendChild(h('<button class="tab new" aria-label="New puzzle">🔄</button>'));
      extra.addEventListener('click', (e) => {
        const t = e.target.closest('.tab');
        if (!t) return;
        App.sfx.pop();
        if (t.classList.contains('new')) delete saved[level];
        else { level = t.dataset.l; App.state.best.wsLevel = level; App.save(); }
        App.refresh();
      });

      const P = saved[level] = saved[level] || make(level);
      const n = P.n;
      const scr = h(
        '<div class="ws">' +
          '<div class="ws-wrap"><div class="ws-grid" style="grid-template-columns:repeat(' + n + ',1fr)">' +
            '<svg class="ws-marks" viewBox="0 0 ' + n + ' ' + n + '" aria-hidden="true"></svg>' +
            P.grid.map((c, i) => '<div class="ws-c" data-i="' + i + '">' + c + '</div>').join('') +
          '</div></div>' +
          '<div class="ws-list">' +
            P.words.map((w) => '<button class="ws-w" data-w="' + w.word + '"><span class="ws-pic">' + w.emoji +
              '</span><span class="ws-t">' + w.word + '</span></button>').join('') +
          '</div>' +
        '</div>');
      root.appendChild(scr);
      const wrap = $('.ws-wrap', scr), grid = $('.ws-grid', scr), marks = $('.ws-marks', scr);
      const cells = $$('.ws-c', scr);

      function fit() {
        const r = wrap.getBoundingClientRect();
        const side = Math.floor(Math.min(r.width, r.height));
        grid.style.width = grid.style.height = side + 'px';
        grid.style.setProperty('--u', (side / n) + 'px');
      }
      const lineSVG = (m, cls) => '<line class="' + cls + '" x1="' + (m.x1 + 0.5) + '" y1="' + (m.y1 + 0.5) + '" x2="' + (m.x2 + 0.5) +
        '" y2="' + (m.y2 + 0.5) + '" stroke="' + m.color + '"/>';
      let sel = null;    // the line being dragged: {x1, y1, x2, y2}
      let anchor = null; // first letter chosen by tapping
      function paint() {
        marks.innerHTML = P.marks.map((m) => lineSVG(m, 'mark')).join('') +
          (sel ? lineSVG(Object.assign({ color: '#ffffff' }, sel), 'sel') : '');
        cells.forEach((c, i) => c.classList.toggle('anchor', !!anchor && anchor.y * n + anchor.x === i));
        $$('.ws-w', scr).forEach((b) => b.classList.toggle('found', P.found.includes(b.dataset.w)));
      }
      const cellAt = (e) => {
        const r = grid.getBoundingClientRect();
        return {
          x: Math.max(0, Math.min(n - 1, Math.floor((e.clientX - r.left) / r.width * n))),
          y: Math.max(0, Math.min(n - 1, Math.floor((e.clientY - r.top) / r.height * n)))
        };
      };
      // Bend a wobbly finger path onto a straight line: across, down or diagonal.
      function snap(a, b) {
        let dx = b.x - a.x, dy = b.y - a.y;
        if (Math.abs(dx) > 2 * Math.abs(dy)) dy = 0;
        else if (Math.abs(dy) > 2 * Math.abs(dx)) dx = 0;
        else {
          let len = Math.max(Math.abs(dx), Math.abs(dy));
          const sx = Math.sign(dx) || 1, sy = Math.sign(dy) || 1;
          while (len > 0 && (a.x + sx * len < 0 || a.x + sx * len >= n || a.y + sy * len < 0 || a.y + sy * len >= n)) len--;
          dx = sx * len; dy = sy * len;
        }
        return { x1: a.x, y1: a.y, x2: a.x + dx, y2: a.y + dy };
      }
      function tryLine(l, e) {
        const steps = Math.max(Math.abs(l.x2 - l.x1), Math.abs(l.y2 - l.y1));
        const sx = Math.sign(l.x2 - l.x1), sy = Math.sign(l.y2 - l.y1);
        let s = '';
        for (let i = 0; i <= steps; i++) s += P.grid[(l.y1 + sy * i) * n + l.x1 + sx * i];
        const back = s.split('').reverse().join('');
        const hit = P.words.find((w) => !P.found.includes(w.word) && (w.word === s || w.word === back));
        if (!hit) { if (steps > 0) App.sfx.nope(); return; }
        P.found.push(hit.word);
        P.marks.push(Object.assign({ color: COLORS[(P.found.length - 1) % COLORS.length] }, l));
        ['C5', 'E5', 'G5'].forEach((note, i) => App.sfx.play('glock', note, i * 0.09, 0.55));
        App.say(hit.word, 'word-' + hit.word.toLowerCase());
        App.burst(e.clientX, e.clientY, ['⭐', '✨'], 8);
        if (P.found.length === P.words.length) {
          setTimeout(() => {
            App.party();
            App.say(App.LINES['found-all'], 'found-all');
            const card = App.modal('<div class="big-icon">🔍</div><h2>You found them all!</h2>' +
              '<p>Every word is circled.</p><button class="btn again">New puzzle</button>');
            $('.again', card).addEventListener('click', () => { delete saved[level]; App.closeModal(); App.refresh(); });
          }, 1300);
        }
      }

      let start = null;
      grid.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        start = cellAt(e);
        sel = snap(start, start);
        try { grid.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        paint();
      });
      grid.addEventListener('pointermove', (e) => {
        if (!start) return;
        sel = snap(start, cellAt(e));
        paint();
      });
      const finish = (e) => {
        if (!start) return;
        const l = sel;
        start = null;
        sel = null;
        if (l.x1 === l.x2 && l.y1 === l.y2) {
          // A tap: first tap picks the first letter, second tap picks the last.
          if (anchor && (anchor.x !== l.x1 || anchor.y !== l.y1)) {
            const line = snap(anchor, { x: l.x1, y: l.y1 });
            anchor = null;
            if (line.x2 === l.x1 && line.y2 === l.y1) tryLine(line, e); else App.sfx.nope();
          } else {
            anchor = anchor ? null : { x: l.x1, y: l.y1 };
            App.sfx.pop();
          }
        } else {
          anchor = null;
          tryLine(l, e);
        }
        paint();
      };
      grid.addEventListener('pointerup', finish);
      grid.addEventListener('pointercancel', () => { start = null; sel = null; paint(); });

      $('.ws-list', scr).addEventListener('click', (e) => {
        const b = e.target.closest('.ws-w');
        if (b) { App.sfx.pop(); App.say(b.dataset.w, 'word-' + b.dataset.w.toLowerCase()); }
      });

      this._fit = fit;
      addEventListener('resize', fit);
      fit();
      paint();
    },
    leave() { removeEventListener('resize', this._fit); }
  });
})();
