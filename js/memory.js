'use strict';
/* Matching game with three sizes so both kids can play. */
(function () {
  const { $, $$, h } = App;
  const FACES = ['🎄', '🎅', '⭐', '🔔', '🎁', '👼', '🐑', '🕯️', '🦌', '⛄', '🍪', '🧦'];
  const LEVELS = { little: [3, 2, 'Little'], medium: [4, 3, 'Medium'], big: [4, 4, 'Big'] };
  let level = null;

  App.register('memory', {
    title: 'Matching Game',
    render(root, extra) {
      level = level || App.state.best.memLevel || 'little';
      Object.keys(LEVELS).forEach((k) => {
        extra.appendChild(h('<button class="tab' + (k === level ? ' on' : '') + '" data-l="' + k + '">' + LEVELS[k][2] + '</button>'));
      });
      extra.addEventListener('click', (e) => {
        const t = e.target.closest('.tab');
        if (!t) return;
        level = t.dataset.l;
        App.state.best.memLevel = level;
        App.save();
        App.sfx.pop();
        App.refresh();
      });

      let [cols, rows] = LEVELS[level];
      if (innerHeight > innerWidth) [cols, rows] = [Math.min(cols, rows), Math.max(cols, rows)];
      const pairs = cols * rows / 2;
      const deck = App.shuffle(App.shuffle(FACES).slice(0, pairs).concat([]).flatMap((f) => [f, f]));
      const grid = h('<div class="mem" style="grid-template-columns:repeat(' + cols + ',1fr);grid-template-rows:repeat(' + rows +
        ',1fr);max-width:calc((100vh - 130px) * ' + (cols / rows * 0.86).toFixed(2) + ')">' +
        deck.map((f, i) => '<button class="cardm" data-i="' + i + '" aria-label="Card"><span class="in">' +
          '<span class="b">❄️</span><span class="f">' + f + '</span></span></button>').join('') + '</div>');
      root.appendChild(grid);

      let up = [], busy = false, found = 0, turns = 0;
      grid.addEventListener('click', (e) => {
        const c = e.target.closest('.cardm');
        if (!c || busy || c.classList.contains('up')) return;
        c.classList.add('up');
        App.sfx.pop();
        up.push(c);
        if (up.length < 2) return;
        turns++;
        const [a, b] = up;
        up = [];
        if (deck[+a.dataset.i] === deck[+b.dataset.i]) {
          found++;
          a.classList.add('ok');
          b.classList.add('ok');
          setTimeout(() => {
            App.sfx.play('glock', 'E5', 0, 0.55); App.sfx.play('glock', 'G5', 0.1, 0.55);
            const r = b.getBoundingClientRect();
            App.burst(r.left + r.width / 2, r.top + r.height / 2, ['⭐', '✨'], 8);
          }, 250);
          if (found === pairs) {
            setTimeout(() => {
              App.party();
              App.say(App.LINES['found-all'], 'found-all');
              const card = App.modal('<div class="big-icon">🏆</div><h2>You found them all!</h2>' +
                '<p>You did it in <b>' + turns + '</b> turns.</p><button class="btn again">Play again</button>');
              $('.again', card).addEventListener('click', () => { App.closeModal(); App.refresh(); });
            }, 800);
          }
        } else {
          busy = true;
          setTimeout(() => {
            a.classList.remove('up');
            b.classList.remove('up');
            busy = false;
          }, 950);
        }
      });
    }
  });
})();
