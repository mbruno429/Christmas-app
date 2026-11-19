'use strict';
/* Christmas bells: free play for little hands, follow-the-glow songs for bigger ones. */
(function () {
  const { $, $$, h } = App;
  const BELLS = [
    ['C4', '#e63946', 'C'], ['D4', '#f77f00', 'D'], ['E4', '#ffb703', 'E'], ['F4', '#43aa5b', 'F'],
    ['G4', '#1b9aaa', 'G'], ['A4', '#2f6fd6', 'A'], ['B4', '#8e44ad', 'B'], ['C5', '#ff7eb6', 'C']
  ];
  const IDX = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6, c: 7 };
  const SONGS = {
    jingle: { name: 'Jingle Bells',
      seq: 'E E E E E E E G C D E F F F F F E E E E E D D E D G E E E E E E E G C D E F F F F F E E E E G G F D C' },
    joy: { name: 'Joy to the World',
      seq: 'c B A G F E D C G A A B B c c c B A G G F E c c B A G G F E' }
  };

  function bellSVG(color) {
    return '<svg viewBox="0 0 100 118" aria-hidden="true">' +
      '<rect x="47" y="0" width="6" height="14" fill="#e9dcc0"/>' +
      '<rect x="42" y="10" width="16" height="12" rx="6" fill="#c9972b"/>' +
      '<circle cx="50" cy="104" r="10" fill="#c9972b"/>' +
      '<path d="M50 18 C28 18 22 40 22 62 C22 80 12 88 9 98 L91 98 C88 88 78 80 78 62 C78 40 72 18 50 18 Z" fill="' + color + '"/>' +
      '<path d="M40 30 C32 38 30 52 30 64" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".45"/>' +
      '<rect x="9" y="92" width="82" height="9" rx="4.5" fill="#000" opacity=".18"/></svg>';
  }

  App.register('bells', {
    title: 'Christmas Bells',
    render(root) {
      let seq = null, pos = 0;
      const scr = h(
        '<div class="bells-screen">' +
          '<div class="rack"><div class="rail"></div>' +
          '<div class="bell-row">' +
            BELLS.map((b, i) => '<button class="bell" data-i="' + i + '" style="max-width:' + (190 - i * 8) + 'px" aria-label="Bell ' + b[2] + '">' +
              bellSVG(b[1]) + '<span class="nm">' + b[2] + '</span></button>').join('') +
          '</div></div>' +
          '<div class="song-panel">' +
            '<div class="hint">Tap the bells to make music!</div>' +
            '<div class="progress hidden"><i></i></div>' +
            '<div class="song-row">' +
              '<button class="btn gold" data-song="jingle">🎵 Teach me Jingle Bells</button>' +
              '<button class="btn gold" data-song="joy">🎵 Teach me Joy to the World</button>' +
              '<button class="btn ghost hidden" data-song="">Just play</button>' +
            '</div>' +
          '</div>' +
        '</div>');
      root.appendChild(scr);
      const bells = $$('.bell', scr);
      const hint = $('.hint', scr);
      const bar = $('.progress', scr);

      function paint() {
        bells.forEach((b, i) => b.classList.toggle('next', !!seq && seq[pos] === i));
        bar.classList.toggle('hidden', !seq);
        $('[data-song=""]', scr).classList.toggle('hidden', !seq);
        if (seq) bar.firstElementChild.style.width = (pos / seq.length * 100) + '%';
      }
      function start(key) {
        if (!key) { seq = null; hint.textContent = 'Tap the bells to make music!'; paint(); return; }
        seq = SONGS[key].seq.split(' ').map((c) => IDX[c]);
        pos = 0;
        hint.textContent = SONGS[key].name + ': tap the glowing bell!';
        paint();
      }

      $('.bell-row', scr).addEventListener('pointerdown', (e) => {
        const b = e.target.closest('.bell');
        if (!b) return;
        e.preventDefault();
        const i = +b.dataset.i;
        App.sfx.play('bell', BELLS[i][0], 0, 0.85);
        b.classList.remove('ring');
        void b.offsetWidth;
        b.classList.add('ring');
        if (seq && seq[pos] === i) {
          pos++;
          if (pos >= seq.length) {
            seq = null;
            hint.textContent = 'You played the whole song! 🎉';
            setTimeout(() => { App.party(); App.say(App.LINES['song-done'], 'song-done'); }, 600);
          }
          paint();
        }
      });
      $('.song-row', scr).addEventListener('click', (e) => {
        const b = e.target.closest('[data-song]');
        if (b) { App.sfx.pop(); start(b.dataset.song); }
      });
      paint();
      App.music.block(true); // let the children hear their own playing
    },
    leave() { App.music.block(false); }
  });
})();
