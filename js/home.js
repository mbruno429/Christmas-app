'use strict';
/* Home screen: countdown, Advent wreath and the big buttons. */
(function () {
  const { $, h, esc } = App;

  function wreathSVG(lit, christmas) {
    const colors = ['#7b4bb3', '#7b4bb3', '#f4a3bd', '#7b4bb3'];
    const xs = [42, 80, 120, 158];
    const ys = [118, 128, 128, 118];
    let candles = '';
    xs.forEach((x, i) => {
      const on = i < lit;
      candles += '<rect x="' + (x - 9) + '" y="' + (ys[i] - 62) + '" width="18" height="62" rx="4" fill="' + colors[i] + '"/>' +
        '<rect x="' + (x - 9) + '" y="' + (ys[i] - 62) + '" width="6" height="62" rx="3" fill="#fff" opacity=".18"/>' +
        (on ? '<g class="flame"><ellipse cx="' + x + '" cy="' + (ys[i] - 76) + '" rx="8" ry="14" fill="#ffb703"/>' +
          '<ellipse cx="' + x + '" cy="' + (ys[i] - 72) + '" rx="4" ry="8" fill="#fff3b0"/></g>'
          : '<rect x="' + (x - 1) + '" y="' + (ys[i] - 68) + '" width="2" height="7" fill="#333"/>');
    });
    const christ = christmas
      ? '<rect x="89" y="40" width="22" height="80" rx="4" fill="#fffdf5"/>' +
        '<g class="flame"><ellipse cx="100" cy="24" rx="9" ry="16" fill="#ffb703"/><ellipse cx="100" cy="28" rx="4.5" ry="9" fill="#fff3b0"/></g>'
      : '';
    let berries = '';
    [[28, 132], [62, 150], [100, 156], [138, 150], [172, 132]].forEach(([x, y]) => {
      berries += '<circle cx="' + x + '" cy="' + y + '" r="5" fill="#e63946"/>';
    });
    return '<svg viewBox="0 0 200 170" aria-hidden="true">' +
      '<ellipse cx="100" cy="125" rx="80" ry="30" fill="none" stroke="#14613a" stroke-width="24"/>' +
      '<ellipse cx="100" cy="125" rx="80" ry="30" fill="none" stroke="#1f8a52" stroke-width="12" stroke-dasharray="10 9"/>' +
      christ + candles +
      '<path d="M20 125 A80 30 0 0 0 180 125" fill="none" stroke="#14613a" stroke-width="24" stroke-linecap="round"/>' +
      '<path d="M20 125 A80 30 0 0 0 180 125" fill="none" stroke="#1f8a52" stroke-width="12" stroke-dasharray="10 9"/>' +
      berries + '</svg>';
  }

  function wreathInfo(s) {
    if (s.isChristmas) {
      App.modal('<div class="big-icon">🕯️</div><h2>Christ is born!</h2>' +
        '<p>The white candle in the middle is the Christ candle. Jesus, the Light of the world, is here. Merry Christmas!</p>' +
        '<button class="btn ghost read">🔊 Read to me</button>')
        .querySelector('.read').addEventListener('click', () =>
          App.say('Christ is born! The white candle in the middle is the Christ candle. Jesus, the Light of the world, is here. Merry Christmas!'));
      return;
    }
    if (s.candles === 0) {
      const n = s.untilAdvent;
      App.modal('<div class="big-icon">🕯️</div><h2>The Advent wreath</h2>' +
        '<p>Advent begins in <b>' + n + '</b> ' + (n === 1 ? 'sleep' : 'sleeps') +
        '. Each Sunday we light one more candle while we wait for Jesus.</p>');
      return;
    }
    const w = App.WEEKS[s.candles];
    const card = App.modal('<div class="big-icon">🕯️</div>' +
      '<div class="kicker">Week ' + s.candles + ' of Advent</div><h2>' + esc(w.name) + '</h2>' +
      '<p>' + esc(w.text) + '</p><p class="prayer">Come, Lord Jesus!</p>' +
      '<button class="btn ghost read">🔊 Read to me</button>');
    card.querySelector('.read').addEventListener('click', () => App.say(w.name + '. ' + w.text + ' Come, Lord Jesus!'));
  }

  App.register('home', {
    render(root) {
      const s = App.season();
      let num = '', label = '';
      if (s.sleeps > 1) { num = s.sleeps; label = 'sleeps until Christmas!'; }
      else if (s.sleeps === 1) { num = 1; label = 'sleep until Christmas!'; }
      else if (s.sleeps === 0) { num = '🎄'; label = 'Merry Christmas! Jesus is born!'; }
      else { num = '🎄'; label = 'Merry Christmas! Day ' + (1 - s.sleeps) + ' of Christmas'; }

      let sub = '';
      if (!s.isChristmas) {
        if (s.candles === 0) sub = 'Advent begins in ' + s.untilAdvent + (s.untilAdvent === 1 ? ' sleep' : ' sleeps');
        else sub = 'Week ' + s.candles + ' of Advent: ' + App.WEEKS[s.candles].name;
      } else sub = 'Glory to God in the highest!';

      const opened = App.list('opened', s.y);
      const canOpen = App.state.preview ? 25 : s.doorDay;
      let waiting = 0;
      for (let d = 1; d <= canOpen; d++) if (!opened.includes(d)) waiting++;
      const calNote = waiting === 0
        ? (canOpen === 0 ? 'Doors open December 1st' : 'Come back tomorrow!')
        : (waiting === 1 ? 'A door is ready to open!' : waiting + ' doors are ready to open!');

      const tiles = [
        ['calendar', '🗓️', 'Advent Calendar', 'wide red', calNote],
        ['nativity', '🌟', 'Bethlehem', 'blue'],
        ['tree', '🎄', 'Decorate the Tree', 'green'],
        ['bells', '🔔', 'Christmas Bells', 'gold'],
        ['memory', '🧩', 'Matching Game', 'purple'],
        ['catch', '🎁', 'Catch the Presents', 'red'],
        ['letter', '💌', 'Letter to Santa', 'green']
      ];

      root.appendChild(h(
        '<div class="home">' +
          '<button class="gear" aria-label="For grown-ups: press and hold"><span>⚙️</span></button>' +
          '<div class="hero">' +
            '<div class="count">' +
              '<div class="num' + (typeof num === 'number' ? '' : ' emoji') + '">' + num + '</div>' +
              '<div class="lbl">' + esc(label) + '</div>' +
              '<div class="sub">' + esc(sub) + '</div>' +
            '</div>' +
            '<button class="wreath" aria-label="Advent wreath">' + wreathSVG(s.isChristmas ? 4 : s.candles, s.isChristmas) + '</button>' +
          '</div>' +
          '<nav class="tiles">' +
            tiles.map((t) =>
              '<button class="tile ' + t[3] + '" data-go="' + t[0] + '">' +
                '<span class="t-icon">' + t[1] + '</span>' +
                '<span class="t-text"><span class="t-name">' + t[2] + '</span>' +
                (t[4] ? '<span class="t-note">' + esc(t[4]) + '</span>' : '') + '</span>' +
              '</button>').join('') +
          '</nav>' +
        '</div>'));

      root.addEventListener('click', (e) => {
        const tile = e.target.closest('.tile');
        if (tile) { App.go(tile.dataset.go); return; }
        if (e.target.closest('.wreath')) { App.sfx.bell('G4'); wreathInfo(s); return; }
        if (e.target.closest('.gear')) return;
        // Anywhere else: a little sparkle for small fingers.
        App.sfx.sparkle();
        App.burst(e.clientX, e.clientY);
      });

      // Grown-up corner opens only with a long press.
      const gear = $('.gear', root);
      let timer = null;
      const cancel = () => { clearTimeout(timer); timer = null; gear.classList.remove('holding'); };
      gear.addEventListener('pointerdown', () => {
        gear.classList.add('holding');
        timer = setTimeout(() => { cancel(); App.openParents(); }, 1500);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => gear.addEventListener(ev, () => {
        if (timer) App.toast('Grown-ups: press and hold');
        cancel();
      }));
      gear.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  });
})();
