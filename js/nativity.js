'use strict';
/* Bethlehem: a tap-and-say nativity scene. Kind deeds add straw to the manger. */
(function () {
  const { h, esc } = App;

  function fig(o, inner) {
    return '<g class="fig" data-say="' + esc(o.say) + '" data-label="' + esc(o.label) + '" data-note="' + (o.note || 'C5') +
      '" transform="translate(' + o.x + ' ' + o.y + ') scale(' + (o.s || 1) + ')"><g class="hop">' + inner + '</g></g>';
  }

  function person(o) {
    const skin = o.skin || '#c99a6b';
    return fig(o,
      (o.wings ? '<ellipse cx="-44" cy="-78" rx="34" ry="52" fill="#fff" opacity=".92" transform="rotate(-18 -44 -78)"/>' +
        '<ellipse cx="44" cy="-78" rx="34" ry="52" fill="#fff" opacity=".92" transform="rotate(18 44 -78)"/>' : '') +
      (o.halo ? '<circle cx="0" cy="-124" r="37" fill="#ffd166" opacity=".9"/>' : '') +
      '<path d="M-40 0 Q-44 -72 -20 -100 Q0 -112 20 -100 Q44 -72 40 0 Z" fill="' + o.robe + '"/>' +
      (o.trim ? '<path d="M-9 -104 L9 -104 L12 0 L-12 0 Z" fill="' + o.trim + '"/>' : '') +
      (o.veil ? '<path d="M-29 -112 Q-34 -157 0 -157 Q34 -157 29 -112 L37 -46 Q20 -70 15 -100 L-15 -100 Q-20 -70 -37 -46 Z" fill="' + o.veil + '"/>' : '') +
      (o.hair ? '<circle cx="0" cy="-128" r="26" fill="' + o.hair + '"/>' : '') +
      '<circle cx="0" cy="-122" r="23" fill="' + skin + '"/>' +
      (o.beard ? '<path d="M-23 -122 Q-24 -90 0 -86 Q24 -90 23 -122 Q12 -108 0 -109 Q-12 -108 -23 -122 Z" fill="' + o.beard + '"/>' : '') +
      '<circle cx="-8" cy="-126" r="2.8" fill="#2b1d14"/><circle cx="8" cy="-126" r="2.8" fill="#2b1d14"/>' +
      '<path d="M-6 -116 Q0 -111 6 -116" stroke="#2b1d14" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
      (o.crown ? '<path d="M-19 -142 L-19 -164 L-9 -153 L0 -168 L9 -153 L19 -164 L19 -142 Z" fill="#ffd166" stroke="#c9972b" stroke-width="2"/>' : '') +
      (o.extra || ''));
  }

  function sheep(o) {
    return fig(o,
      '<rect x="-26" y="-14" width="9" height="20" rx="3" fill="#3b2f2f"/><rect x="-8" y="-14" width="9" height="20" rx="3" fill="#3b2f2f"/>' +
      '<rect x="10" y="-14" width="9" height="20" rx="3" fill="#3b2f2f"/><rect x="24" y="-14" width="9" height="20" rx="3" fill="#3b2f2f"/>' +
      '<ellipse cx="2" cy="-36" rx="44" ry="27" fill="#fdfaf3"/>' +
      '<circle cx="-30" cy="-50" r="15" fill="#fdfaf3"/><circle cx="-8" cy="-60" r="17" fill="#fdfaf3"/>' +
      '<circle cx="16" cy="-60" r="16" fill="#fdfaf3"/><circle cx="36" cy="-48" r="14" fill="#fdfaf3"/>' +
      '<ellipse cx="50" cy="-52" rx="17" ry="15" fill="#3b2f2f"/>' +
      '<ellipse cx="38" cy="-62" rx="8" ry="4" fill="#3b2f2f" transform="rotate(-30 38 -62)"/>' +
      '<circle cx="54" cy="-56" r="3" fill="#fff"/><circle cx="55" cy="-56" r="1.4" fill="#000"/>' +
      '<circle cx="46" cy="-76" r="10" fill="#fdfaf3"/>');
  }

  function ox(o) {
    return fig(o,
      '<ellipse cx="-30" cy="-52" rx="72" ry="44" fill="#8b5a3c"/>' +
      '<path d="M20 -128 Q8 -150 -10 -146" stroke="#f5efe0" stroke-width="9" fill="none" stroke-linecap="round"/>' +
      '<path d="M76 -128 Q88 -150 106 -146" stroke="#f5efe0" stroke-width="9" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="12" cy="-112" rx="14" ry="8" fill="#7a4d31" transform="rotate(-20 12 -112)"/>' +
      '<ellipse cx="84" cy="-112" rx="14" ry="8" fill="#7a4d31" transform="rotate(20 84 -112)"/>' +
      '<ellipse cx="48" cy="-92" rx="36" ry="40" fill="#a06a45"/>' +
      '<ellipse cx="48" cy="-66" rx="26" ry="18" fill="#f1c9a9"/>' +
      '<circle cx="39" cy="-66" r="3.5" fill="#6b3d2a"/><circle cx="57" cy="-66" r="3.5" fill="#6b3d2a"/>' +
      '<circle cx="34" cy="-100" r="4" fill="#2b1d14"/><circle cx="62" cy="-100" r="4" fill="#2b1d14"/>');
  }

  function donkey(o) {
    return fig(o,
      '<ellipse cx="30" cy="-52" rx="72" ry="42" fill="#8f8f9c"/>' +
      '<ellipse cx="-66" cy="-150" rx="10" ry="32" fill="#7c7c8a" transform="rotate(-12 -66 -150)"/>' +
      '<ellipse cx="-30" cy="-150" rx="10" ry="32" fill="#7c7c8a" transform="rotate(12 -30 -150)"/>' +
      '<ellipse cx="-66" cy="-148" rx="4.5" ry="22" fill="#e7b9b0" transform="rotate(-12 -66 -148)"/>' +
      '<ellipse cx="-30" cy="-148" rx="4.5" ry="22" fill="#e7b9b0" transform="rotate(12 -30 -148)"/>' +
      '<ellipse cx="-48" cy="-90" rx="30" ry="42" fill="#a3a3b0"/>' +
      '<ellipse cx="-48" cy="-62" rx="22" ry="18" fill="#f3efe6"/>' +
      '<circle cx="-56" cy="-62" r="3" fill="#555"/><circle cx="-40" cy="-62" r="3" fill="#555"/>' +
      '<circle cx="-60" cy="-102" r="4" fill="#2b1d14"/><circle cx="-36" cy="-102" r="4" fill="#2b1d14"/>');
  }

  function manger(o, straws, baby) {
    let straw = '';
    // Deterministic "random" so the straw does not jump around between visits.
    for (let i = 0; i < straws; i++) {
      const a = (i * 53) % 110 - 55;
      const b = a + ((i * 29) % 34 - 17);
      const len = 10 + (i * 17) % 18;
      straw += '<path d="M' + a + ' -38 L' + b + ' ' + (-40 - len) + '" stroke="' + (i % 3 ? '#f2c94c' : '#e0a82e') +
        '" stroke-width="4" stroke-linecap="round"/>';
    }
    const child = baby
      ? '<circle cx="-30" cy="-62" r="22" fill="#ffd166" opacity=".9"/>' +
        '<ellipse cx="6" cy="-56" rx="40" ry="16" fill="#fffdf5"/>' +
        '<path d="M-20 -62 L40 -50 M-14 -48 L44 -60" stroke="#e8dcc0" stroke-width="3"/>' +
        '<circle cx="-30" cy="-62" r="14" fill="#d9a878"/>' +
        '<circle cx="-35" cy="-64" r="1.8" fill="#2b1d14"/><circle cx="-26" cy="-64" r="1.8" fill="#2b1d14"/>' +
        '<path d="M-34 -57 Q-30 -54 -26 -57" stroke="#2b1d14" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
      : '';
    return fig(o,
      '<path d="M-46 -6 L40 40 M46 -6 L-40 40" stroke="#6b431f" stroke-width="10" stroke-linecap="round"/>' +
      straw +
      '<path d="M-66 -40 L66 -40 L50 2 L-50 2 Z" fill="#8a5a2b"/>' +
      '<path d="M-66 -40 L66 -40" stroke="#a9743c" stroke-width="7" stroke-linecap="round"/>' +
      child);
  }

  function star() {
    return '<g class="fig" data-say="The star of Bethlehem" data-label="Star ⭐" data-note="C6" transform="translate(500 62)">' +
      '<path class="beam" d="M-10 0 L-70 240 L70 240 L10 0 Z" fill="url(#beam)"/>' +
      '<g class="hop twinkle"><circle r="46" fill="#ffd166" opacity=".25"/>' +
      '<path d="M0 -58 L10 -12 L56 0 L10 12 L0 58 L-10 12 L-56 0 L-10 -12 Z" fill="#ffe08a"/>' +
      '<path d="M0 -30 L7 -7 L30 0 L7 7 L0 30 L-7 7 L-30 0 L-7 -7 Z" fill="#fff" transform="rotate(45)"/></g></g>';
  }

  function scene(straws, baby) {
    const gift = (c) => '<rect x="-14" y="-78" width="28" height="24" rx="4" fill="' + c + '" stroke="#7a5a12" stroke-width="2"/>' +
      '<circle cx="0" cy="-80" r="6" fill="' + c + '" stroke="#7a5a12" stroke-width="2"/>';
    return '<svg class="scene" viewBox="0 0 1000 620" preserveAspectRatio="xMidYMax meet">' +
      '<defs>' +
        '<radialGradient id="glow" cx="50%" cy="70%" r="65%"><stop offset="0" stop-color="#ffdf8a"/><stop offset="1" stop-color="#7a4f2a"/></radialGradient>' +
        '<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a" stop-opacity=".55"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></linearGradient>' +
        '<clipPath id="inside"><rect x="311" y="60" width="378" height="486"/></clipPath>' +
      '</defs>' +
      '<path d="M-2000 470 L0 470 Q160 400 330 455 T640 440 T1000 420 L3000 420 L3000 720 L-2000 720 Z" fill="#132a4d"/>' +
      '<path d="M-2000 520 L0 520 Q250 470 500 505 T1000 500 L3000 500 L3000 720 L-2000 720 Z" fill="#c9a66b"/>' +
      '<path d="M-2000 560 L0 560 Q300 525 600 555 T1000 545 L3000 545 L3000 720 L-2000 720 Z" fill="#b8935a"/>' +
      star() +
      '<rect x="295" y="262" width="410" height="278" fill="url(#glow)"/>' +
      '<rect x="285" y="255" width="26" height="290" rx="6" fill="#5b3a1c"/><rect x="689" y="255" width="26" height="290" rx="6" fill="#5b3a1c"/>' +
      '<path d="M235 270 L500 130 L765 270 L740 290 L500 165 L260 290 Z" fill="#7a4f2a" stroke="#4a2f18" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M300 258 L500 152 L700 258" fill="none" stroke="#e0a82e" stroke-width="7" stroke-dasharray="4 14" stroke-linecap="round" opacity=".7"/>' +
      '<g clip-path="url(#inside)">' +
      ox({ x: 345, y: 470, s: 0.85, say: 'Ox! Moo!', label: 'Ox 🐂', note: 'C4' }) +
      donkey({ x: 660, y: 468, s: 0.85, say: 'Donkey! Hee haw!', label: 'Donkey', note: 'D4' }) +
      '</g>' +
      person({ x: 420, y: 548, s: 1.05, robe: '#f4f7ff', veil: '#2f6fd6', halo: true, skin: '#d9a878',
        say: 'Mary, the mother of Jesus', label: 'Mary 💙', note: 'A4' }) +
      person({ x: 598, y: 548, s: 1.18, robe: '#8a5a2b', trim: '#c98f4e', hair: '#4a2f18', beard: '#4a2f18', halo: true,
        say: 'Saint Joseph', label: 'Joseph', note: 'F4',
        extra: '<path d="M52 0 L52 -150" stroke="#5b3a1c" stroke-width="7" stroke-linecap="round"/>' }) +
      manger({ x: 508, y: 560, s: 1, note: 'C5',
        say: baby ? 'Baby Jesus! Happy birthday, Jesus!' : 'The manger is waiting for baby Jesus',
        label: baby ? 'Baby Jesus 💛' : 'Waiting for Jesus…' }, straws, baby) +
      person({ x: 135, y: 580, s: 1.05, robe: '#4f7d4a', trim: '#e9dcc0', veil: '#c98f4e', beard: '#6b4a2b',
        say: 'A shepherd', label: 'Shepherd', note: 'E4',
        extra: '<path d="M-52 0 L-52 -150 Q-52 -178 -32 -172" stroke="#5b3a1c" stroke-width="7" fill="none" stroke-linecap="round"/>' }) +
      sheep({ x: 232, y: 596, s: 0.95, say: 'Sheep! Baa!', label: 'Sheep 🐑', note: 'G4' }) +
      sheep({ x: 60, y: 606, s: 0.6, say: 'A little lamb! Baa!', label: 'Lamb 🐑', note: 'B4' }) +
      person({ x: 790, y: 580, s: 1.02, robe: '#7b4bb3', trim: '#ffd166', beard: '#f1f1f1', crown: true, skin: '#e0b48a',
        say: 'A wise man with gold', label: 'Wise man 👑', note: 'E5', extra: gift('#ffd166') }) +
      person({ x: 868, y: 596, s: 1.02, robe: '#c8323f', trim: '#ffd166', beard: '#3b2a1e', crown: true, skin: '#7a4d31',
        say: 'A wise man with frankincense', label: 'Wise man 👑', note: 'F5', extra: gift('#f4a3bd') }) +
      person({ x: 946, y: 580, s: 1.02, robe: '#1b8a7a', trim: '#ffd166', beard: '#5b3a1c', crown: true, skin: '#b5835a',
        say: 'A wise man with myrrh', label: 'Wise man 👑', note: 'G5', extra: gift('#8ecae6') }) +
      person({ x: 800, y: 235, s: 0.85, robe: '#fffdf5', trim: '#ffd166', hair: '#e0a82e', halo: true, wings: true, skin: '#f0c8a0',
        say: 'An angel! Glory to God!', label: 'Angel 👼', note: 'A5' }) +
      '</svg>';
  }

  App.register('nativity', {
    title: 'Bethlehem',
    render(root, extra) {
      const s = App.season();
      const deeds = App.list('deeds', s.y).length;
      const baby = s.isChristmas || App.state.preview;
      extra.appendChild(h('<div class="chip">🌾 ' + deeds + (deeds === 1 ? ' kind deed' : ' kind deeds') + '</div>'));
      const wrap = h('<div class="nativity">' + scene(4 + deeds * 3, baby) + '</div>');
      root.appendChild(wrap);
      wrap.addEventListener('click', (e) => {
        const f = e.target.closest('.fig');
        if (!f) {
          App.sfx.sparkle();
          App.burst(e.clientX, e.clientY, ['❄️', '✨', '⭐'], 7);
          return;
        }
        const hop = f.querySelector('.hop');
        hop.classList.remove('go');
        void hop.getBoundingClientRect();
        hop.classList.add('go');
        App.sfx.bell(f.dataset.note);
        App.say(f.dataset.say);
        const tag = h('<div class="name-tag"></div>');
        tag.textContent = f.dataset.label;
        tag.style.left = e.clientX + 'px';
        tag.style.top = e.clientY + 'px';
        document.body.appendChild(tag);
        tag.addEventListener('animationend', () => tag.remove());
      });
    }
  });
})();
