'use strict';
/* Catch the presents: slide the sleigh under the falling gifts. */
(function () {
  const { $, h } = App;
  const GOOD = [['🎁', 1, 5], ['🧸', 1, 2], ['🍬', 1, 2], ['⭐', 3, 1]];
  const COAL = ['⚫', -2, 2];
  const LENGTH = 40; // seconds
  let mode = 'easy';
  let raf = 0;

  function choose(tricky) {
    const pool = tricky ? GOOD.concat([COAL]) : GOOD;
    let n = Math.random() * pool.reduce((s, p) => s + p[2], 0);
    for (const p of pool) { n -= p[2]; if (n <= 0) return p; }
    return pool[0];
  }

  App.register('catch', {
    title: 'Catch the Presents',
    render(root, extra) {
      mode = App.state.best.catchMode || mode;
      [['easy', 'Easy'], ['tricky', 'Tricky']].forEach(([k, n]) => {
        extra.appendChild(h('<button class="tab' + (k === mode ? ' on' : '') + '" data-m="' + k + '">' + n + '</button>'));
      });
      extra.addEventListener('click', (e) => {
        const t = e.target.closest('.tab');
        if (!t) return;
        mode = t.dataset.m;
        App.state.best.catchMode = mode;
        App.save();
        App.sfx.pop();
        App.refresh();
      });

      const tricky = mode === 'tricky';
      const scr = h(
        '<div class="catch">' +
          '<div class="hud"><span class="chip score">🎁 0</span><span class="chip time">⏱️ ' + LENGTH + '</span>' +
            '<span class="chip best">🏆 ' + (App.state.best['catch_' + mode] || 0) + '</span></div>' +
          '<div class="field"><div class="basket">🛷</div>' +
            '<div class="start-over"><div><div class="big-icon">🎁</div>' +
              '<p>Slide your finger to move the sleigh and catch the presents!' +
              (tricky ? ' Watch out for lumps of coal ⚫' : '') + '</p>' +
              '<button class="btn go">Start!</button></div></div>' +
          '</div>' +
        '</div>');
      root.appendChild(scr);
      const field = $('.field', scr);
      const basket = $('.basket', scr);
      let W = 0, H = 0, size = 0, bsize = 0, bx = 0;
      let items = [], score = 0, left = LENGTH, spawnIn = 0, elapsed = 0, last = 0, playing = false;

      function measure() {
        const r = field.getBoundingClientRect();
        W = r.width; H = r.height;
        size = Math.max(44, Math.min(W, H) * 0.11);
        bsize = size * 1.7;
        field.style.setProperty('--sz', size + 'px');
        field.style.setProperty('--bsz', bsize + 'px');
        if (!bx) bx = W / 2;
        moveBasket(bx);
      }
      function moveBasket(x) {
        bx = Math.max(bsize / 2, Math.min(W - bsize / 2, x));
        basket.style.transform = 'translateX(' + (bx - bsize / 2) + 'px)';
      }
      function pointer(e) {
        if (e.target.closest('.btn')) return;
        e.preventDefault();
        moveBasket(e.clientX - field.getBoundingClientRect().left);
      }
      field.addEventListener('pointerdown', pointer);
      field.addEventListener('pointermove', pointer);

      function spawn() {
        const p = choose(tricky);
        const el = h('<div class="item"></div>');
        el.textContent = p[0];
        field.appendChild(el);
        const speed = tricky ? Math.min(0.62, 0.3 + elapsed * 0.008) : 0.24;
        items.push({ el, pts: p[1], x: App.rand(0, W - size), y: -size, v: speed * App.rand(0.85, 1.15) });
      }
      function hud() {
        $('.score', scr).textContent = '🎁 ' + score;
        $('.time', scr).textContent = '⏱️ ' + Math.max(0, Math.ceil(left));
      }
      function frame(ts) {
        const dt = Math.min(0.05, (ts - last) / 1000);
        last = ts;
        left -= dt;
        elapsed += dt;
        spawnIn -= dt;
        if (spawnIn <= 0) {
          spawn();
          spawnIn = tricky ? Math.max(0.38, 0.95 - elapsed * 0.014) : 1.05;
        }
        const catchTop = H - bsize * 0.95, catchBottom = H - bsize * 0.2;
        items = items.filter((it) => {
          it.y += it.v * H * dt;
          it.el.style.transform = 'translate(' + it.x + 'px,' + it.y + 'px)';
          const mid = it.y + size / 2;
          if (mid > catchTop && mid < catchBottom && Math.abs(it.x + size / 2 - bx) < bsize * 0.5) {
            score = Math.max(0, score + it.pts);
            const r = field.getBoundingClientRect();
            if (it.pts > 0) {
              App.sfx.bell(it.pts > 1 ? 'C6' : App.pick(['E5', 'G5', 'A5']), 0, 0.14);
              App.burst(r.left + it.x + size / 2, r.top + it.y, ['✨', '⭐'], 4);
            } else {
              App.sfx.nope();
              basket.classList.remove('shake');
              void basket.offsetWidth;
              basket.classList.add('shake');
            }
            it.el.remove();
            return false;
          }
          if (it.y > H) { it.el.remove(); return false; }
          return true;
        });
        hud();
        if (left <= 0) return finish();
        raf = requestAnimationFrame(frame);
      }
      function finish() {
        playing = false;
        items.forEach((it) => it.el.remove());
        items = [];
        const key = 'catch_' + mode;
        const best = App.state.best[key] || 0;
        const record = score > best;
        if (record) { App.state.best[key] = score; App.save(); }
        App.party();
        const card = App.modal('<div class="big-icon">🛷</div><h2>' + (record ? 'New record!' : 'Great catching!') + '</h2>' +
          '<p>You caught <b>' + score + '</b> ' + (score === 1 ? 'point' : 'points') + ' of presents.</p>' +
          '<button class="btn again">Play again</button>', { onClose: () => App.refresh() });
        $('.again', card).addEventListener('click', App.closeModal);
      }
      $('.go', scr).addEventListener('click', () => {
        if (playing) return;
        playing = true;
        $('.start-over', scr).remove();
        measure();
        score = 0; left = LENGTH; elapsed = 0; spawnIn = 0.3;
        App.sfx.win();
        last = performance.now();
        raf = requestAnimationFrame(frame);
      });

      this._measure = measure;
      addEventListener('resize', measure);
      measure();
    },
    leave() {
      cancelAnimationFrame(raf);
      removeEventListener('resize', this._measure);
    }
  });
})();
