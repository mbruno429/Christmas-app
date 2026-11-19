'use strict';
/* Advent calendar: one door per day, each with a story, a kind deed and sometimes a joke. */
(function () {
  const { $, h, esc } = App;
  const COLORS = ['red', 'green', 'gold', 'blue'];

  function showDoor(d, s, aloud) {
    const door = App.DOORS[d];
    const deeds = App.list('deeds', s.y);
    const done = () => deeds.includes(d);
    const card = App.modal(
      '<button class="read speak" aria-label="Read to me">🔊</button>' +
      '<div class="big-icon">' + door.icon + '</div>' +
      '<div class="kicker">December ' + d + '</div>' +
      '<h2>' + esc(door.title) + '</h2>' +
      '<p class="door-text">' + esc(door.text) + '</p>' +
      (door.ref ? '<p class="ref">📖 ' + esc(door.ref) + '</p>' : '') +
      '<div class="deed"><div class="deed-h">Today\'s kind deed</div>' +
        '<p>' + esc(door.deed) + '</p>' +
        '<button class="btn did"></button></div>' +
      (door.joke ? '<div class="joke"><p>😄 ' + esc(door.joke[0]) + '</p>' +
        '<button class="btn ghost tell">Tell me!</button><p class="punch hidden">' + esc(door.joke[1]) + '</p></div>' : ''),
      { cls: 'door-card' });

    const did = $('.did', card);
    const paint = () => {
      did.textContent = done() ? '🌾 Straw added to the manger!' : 'I did it! ⭐';
      did.classList.toggle('done', done());
    };
    paint();
    did.addEventListener('click', (e) => {
      if (done()) { App.toast('Each kind deed makes the manger softer for Jesus'); return; }
      deeds.push(d);
      App.save();
      paint();
      App.sfx.win();
      App.say(App.LINES['deed-done'], 'deed-done');
      App.burst(e.clientX, e.clientY, ['🌾', '⭐', '💛'], 12);
    });
    const tell = $('.tell', card);
    if (tell) tell.addEventListener('click', () => {
      tell.classList.add('hidden');
      $('.punch', card).classList.remove('hidden');
      App.sfx.sparkle();
      App.say(door.joke[1], 'joke-' + d);
    });
    const readIt = () => App.say(door.title + '. ' + door.text + ' Today\'s kind deed: ' + door.deed +
      (door.joke ? ' And here\'s a joke. ' + door.joke[0] : ''), 'door-' + d);
    $('.read', card).addEventListener('click', readIt);
    if (aloud) readIt();
  }

  App.register('calendar', {
    title: 'Advent Calendar',
    render(root) {
      const s = App.season();
      const opened = App.list('opened', s.y);
      const limit = App.state.preview ? 25 : s.doorDay;
      const grid = h('<div class="doors"></div>');
      for (let d = 1; d <= 25; d++) {
        const isOpen = opened.includes(d);
        const ready = !isOpen && d <= limit;
        const b = h('<button class="door ' + (d === 25 ? 'last' : COLORS[(d * 7) % 4]) +
          (isOpen ? ' open' : '') + (ready ? ' ready' : '') + (d > limit ? ' locked' : '') +
          '" data-d="' + d + '" aria-label="December ' + d + '">' +
          '<span class="d-num">' + d + '</span>' +
          '<span class="d-icon">' + App.DOORS[d].icon + '</span></button>');
        grid.appendChild(b);
      }
      root.appendChild(grid);

      grid.addEventListener('click', (e) => {
        const b = e.target.closest('.door');
        if (!b) return;
        const d = +b.dataset.d;
        if (d > limit) {
          const first = new Date(s.y, 11, d);
          const n = Math.round((first - s.t) / 864e5);
          App.sfx.nope();
          App.say(App.LINES['not-yet'], 'not-yet');
          b.classList.remove('shake');
          void b.offsetWidth;
          b.classList.add('shake');
          App.toast('Not yet! ' + n + (n === 1 ? ' more sleep' : ' more sleeps'));
          return;
        }
        if (!opened.includes(d)) {
          opened.push(d);
          App.save();
          b.classList.remove('ready');
          b.classList.add('open', 'opening');
          App.sfx.win();
          const r = b.getBoundingClientRect();
          App.burst(r.left + r.width / 2, r.top + r.height / 2);
          setTimeout(() => showDoor(d, s, true), 650);
        } else {
          App.sfx.pop();
          showDoor(d, s, false);
        }
      });
    }
  });
})();
