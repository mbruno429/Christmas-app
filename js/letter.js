'use strict';
/* Letter to Santa: a few wishes, something to give, and a gift for Baby Jesus. */
(function () {
  const { $, h, esc } = App;
  const GOOD = ['kind', 'helpful', 'a good listener', 'brave', 'patient', 'thankful', 'good at sharing'];
  const WISHES = ['🧸', '🚲', '⚽', '🎨', '📚', '🧩', '🚂', '🎲', '🎮', '🛴', '🦖', '🎸', '👗', '🤖', '🚗', '🏀'];
  const JESUS = ['say my prayers', 'share my toys', 'help at home', 'be kind to everyone', 'say thank you', 'sing at Mass'];
  const MAX_WISHES = 3;
  let who = 1;

  const blank = () => ({ good: [], wishes: [], other: '', give: '', jesus: [], sealed: false });
  function join(list) {
    if (list.length < 2) return list.join('');
    return list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1];
  }

  function sealedView(L, name) {
    const wishBits = L.wishes.slice();
    const wishLine = wishBits.length || L.other
      ? '<p>For Christmas I wish for:</p><p class="wish-line">' + wishBits.join(' ') +
        (L.other ? ' <span class="other">' + (wishBits.length ? 'and ' : '') + esc(L.other) + '</span>' : '') + '</p>'
      : '';
    return '<div class="paper sealed">' +
      '<div class="stamp">🎅</div>' +
      '<p>Dear Santa,</p>' +
      '<p>My name is ' + esc(name) + '.' + (L.good.length ? ' This year I tried to be ' + esc(join(L.good)) + '.' : '') + '</p>' +
      wishLine +
      (L.give ? '<p>A gift I want to give someone: ' + esc(L.give) + '.</p>' : '') +
      (L.jesus.length ? '<p>My gift for Baby Jesus: I will ' + esc(join(L.jesus)) + '.</p>' : '') +
      '<p>Thank you, Santa. Merry Christmas!</p>' +
      '<p class="sign">Love, ' + esc(name) + ' ❤️</p>' +
      '<div class="letter-btns"><button class="btn ghost edit">✏️ Change my letter</button>' +
      '<button class="btn ghost read">🔊 Read to me</button></div>' +
      '</div>';
  }

  function formView(L) {
    const chips = (list, key) => list.map((v) =>
      '<button class="opt' + (L[key].includes(v) ? ' on' : '') + '" data-k="' + key + '" data-v="' + esc(v) + '">' + esc(v) + '</button>').join('');
    return '<div class="paper form">' +
      '<h2>Dear Santa…</h2>' +
      '<div class="q">This year I tried to be:</div><div class="opts">' + chips(GOOD, 'good') + '</div>' +
      '<div class="q">I wish for (pick up to ' + MAX_WISHES + '):</div><div class="opts">' +
        WISHES.map((v) => '<button class="opt em' + (L.wishes.includes(v) ? ' on' : '') + '" data-k="wishes" data-v="' + v + '">' + v + '</button>').join('') +
      '</div>' +
      '<div class="q">Or something else:</div><input type="text" maxlength="60" data-f="other" value="' + esc(L.other) + '" placeholder="Type it here">' +
      '<div class="q">A gift I want to GIVE someone:</div><input type="text" maxlength="80" data-f="give" value="' + esc(L.give) + '" placeholder="A drawing for Grandma…">' +
      '<div class="q">My gift for Baby Jesus. I will:</div><div class="opts">' + chips(JESUS, 'jesus') + '</div>' +
      '<div class="letter-btns"><button class="btn seal">💌 Seal my letter</button></div>' +
      '</div>';
  }

  App.register('letter', {
    title: 'Letter to Santa',
    render(root, extra) {
      const st = App.state;
      st.names.forEach((n, i) => {
        extra.appendChild(h('<button class="tab' + (i === who ? ' on' : '') + '" data-who="' + i + '">' + esc(n) + '</button>'));
      });
      extra.addEventListener('click', (e) => {
        const t = e.target.closest('.tab');
        if (!t) return;
        who = +t.dataset.who;
        App.sfx.pop();
        App.refresh();
      });

      const L = st.letters[who] = Object.assign(blank(), st.letters[who] || {});
      const name = st.names[who];
      const scr = h('<div class="letter-screen">' + (L.sealed ? sealedView(L, name) : formView(L)) + '</div>');
      root.appendChild(scr);

      scr.addEventListener('input', (e) => {
        const f = e.target.dataset.f;
        if (!f) return;
        L[f] = e.target.value.trim();
        App.save();
      });
      scr.addEventListener('click', (e) => {
        const opt = e.target.closest('.opt');
        if (opt) {
          const arr = L[opt.dataset.k];
          const v = opt.dataset.v;
          const at = arr.indexOf(v);
          if (at >= 0) arr.splice(at, 1);
          else if (opt.dataset.k === 'wishes' && arr.length >= MAX_WISHES) {
            App.sfx.nope();
            App.toast('Just ' + MAX_WISHES + ' wishes! Tap one to swap it.');
            return;
          } else arr.push(v);
          opt.classList.toggle('on', at < 0);
          App.sfx.pop();
          App.save();
          return;
        }
        if (e.target.closest('.seal')) {
          L.sealed = true;
          App.save();
          App.party();
          App.toast(App.LINES['letter-sent']);
          App.say(App.LINES['letter-sent'], 'letter-sent');
          App.refresh();
          return;
        }
        if (e.target.closest('.edit')) { L.sealed = false; App.save(); App.sfx.pop(); App.refresh(); return; }
        if (e.target.closest('.read')) {
          App.say($('.sealed', scr).innerText.replace(/Change my letter|Read to me/g, ''));
        }
      });
    }
  });
})();
