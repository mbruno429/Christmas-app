'use strict';
/* Bethlehem: a tap-and-say nativity scene. Kind deeds add straw to the manger. */
(function () {
  const { h, esc } = App;
  const ROBE = 'M-40 0 Q-44 -72 -20 -100 Q0 -112 20 -100 Q44 -72 40 0 Z';

  // Every figure: a soft shadow on the ground, then the part that hops when tapped.
  function fig(key, o, inner) {
    const f = App.FIGS[key];
    return '<g class="fig" data-key="' + key + '" data-label="' + esc(f.label) + '" data-note="' + (o.note || 'C5') +
      '" transform="translate(' + o.x + ' ' + o.y + ') scale(' + (o.s || 1) + ')">' +
      (o.shadow === 0 ? '' : '<ellipse cx="0" cy="3" rx="' + (o.shadow || 46) + '" ry="9" fill="#000" opacity=".22"/>') +
      '<g class="hop">' + inner + '</g></g>';
  }

  function person(key, o) {
    const skin = o.skin || '#c99a6b';
    return fig(key, o,
      (o.wings ? '<ellipse cx="-46" cy="-78" rx="34" ry="54" fill="#fff" transform="rotate(-18 -46 -78)"/>' +
        '<ellipse cx="46" cy="-78" rx="34" ry="54" fill="#fff" transform="rotate(18 46 -78)"/>' +
        '<ellipse cx="-46" cy="-78" rx="34" ry="54" fill="url(#shade)" transform="rotate(-18 -46 -78)"/>' +
        '<ellipse cx="46" cy="-78" rx="34" ry="54" fill="url(#shade)" transform="rotate(18 46 -78)"/>' : '') +
      (o.halo ? '<circle cx="0" cy="-124" r="54" fill="url(#haloGlow)"/><circle cx="0" cy="-124" r="37" fill="#ffd166"/>' +
        '<circle cx="0" cy="-124" r="37" fill="none" stroke="#fff3c4" stroke-width="3"/>' : '') +
      '<path d="' + ROBE + '" fill="' + o.robe + '"/>' +
      (o.trim ? '<path d="M-9 -104 L9 -104 L12 0 L-12 0 Z" fill="' + o.trim + '"/>' : '') +
      '<path d="' + ROBE + '" fill="url(#shade)"/>' +
      (o.veil ? '<path d="M-29 -112 Q-34 -157 0 -157 Q34 -157 29 -112 L37 -46 Q20 -70 15 -100 L-15 -100 Q-20 -70 -37 -46 Z" fill="' + o.veil + '"/>' +
        '<path d="M-29 -112 Q-34 -157 0 -157 Q34 -157 29 -112 L37 -46 Q20 -70 15 -100 L-15 -100 Q-20 -70 -37 -46 Z" fill="url(#shade)"/>' : '') +
      (o.hair ? '<circle cx="0" cy="-128" r="26" fill="' + o.hair + '"/>' : '') +
      '<circle cx="0" cy="-122" r="23" fill="' + skin + '"/><circle cx="0" cy="-122" r="23" fill="url(#ball)"/>' +
      (o.beard ? '<path d="M-23 -122 Q-24 -90 0 -86 Q24 -90 23 -122 Q12 -108 0 -109 Q-12 -108 -23 -122 Z" fill="' + o.beard + '"/>' : '') +
      '<circle cx="-13" cy="-116" r="5" fill="#e8756a" opacity=".3"/><circle cx="13" cy="-116" r="5" fill="#e8756a" opacity=".3"/>' +
      '<circle cx="-8" cy="-126" r="2.8" fill="#2b1d14"/><circle cx="8" cy="-126" r="2.8" fill="#2b1d14"/>' +
      '<circle cx="-7" cy="-127" r="1" fill="#fff"/><circle cx="9" cy="-127" r="1" fill="#fff"/>' +
      '<path d="M-6 -116 Q0 -111 6 -116" stroke="#2b1d14" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
      (o.hands ? '<path d="M-26 -78 Q-10 -62 0 -66 Q10 -62 26 -78" stroke="' + (o.sleeve || o.robe) + '" stroke-width="13" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="0" cy="-67" rx="9" ry="8" fill="' + skin + '"/>' : '') +
      (o.crown ? '<path d="M-19 -142 L-19 -164 L-9 -153 L0 -168 L9 -153 L19 -164 L19 -142 Z" fill="#ffd166" stroke="#c9972b" stroke-width="2"/>' +
        '<circle cx="0" cy="-150" r="3" fill="#e63946"/><circle cx="-11" cy="-148" r="2.4" fill="#2f6fd6"/><circle cx="11" cy="-148" r="2.4" fill="#2f6fd6"/>' : '') +
      (o.extra || ''));
  }

  function sheep(key, o) {
    return fig(key, o,
      '<rect x="-26" y="-14" width="9" height="20" rx="3" fill="#3b2f2f"/><rect x="-8" y="-14" width="9" height="20" rx="3" fill="#3b2f2f"/>' +
      '<rect x="10" y="-14" width="9" height="20" rx="3" fill="#3b2f2f"/><rect x="24" y="-14" width="9" height="20" rx="3" fill="#3b2f2f"/>' +
      '<ellipse cx="2" cy="-36" rx="44" ry="27" fill="#fdfaf3"/>' +
      '<circle cx="-30" cy="-50" r="15" fill="#fdfaf3"/><circle cx="-8" cy="-60" r="17" fill="#fdfaf3"/>' +
      '<circle cx="16" cy="-60" r="16" fill="#fdfaf3"/><circle cx="36" cy="-48" r="14" fill="#fdfaf3"/>' +
      '<ellipse cx="2" cy="-30" rx="44" ry="22" fill="#b9ad98" opacity=".28"/>' +
      '<ellipse cx="2" cy="-40" rx="40" ry="20" fill="#fdfaf3"/>' +
      '<ellipse cx="50" cy="-52" rx="17" ry="15" fill="#3b2f2f"/>' +
      '<ellipse cx="38" cy="-62" rx="8" ry="4" fill="#3b2f2f" transform="rotate(-30 38 -62)"/>' +
      '<circle cx="54" cy="-56" r="3.4" fill="#fff"/><circle cx="55" cy="-56" r="1.6" fill="#000"/>' +
      '<circle cx="46" cy="-76" r="10" fill="#fdfaf3"/>');
  }

  function ox(key, o) {
    return fig(key, o,
      '<ellipse cx="-30" cy="-52" rx="72" ry="44" fill="#8b5a3c"/><ellipse cx="-30" cy="-52" rx="72" ry="44" fill="url(#shade)"/>' +
      '<path d="M20 -128 Q8 -150 -10 -146" stroke="#f5efe0" stroke-width="9" fill="none" stroke-linecap="round"/>' +
      '<path d="M76 -128 Q88 -150 106 -146" stroke="#f5efe0" stroke-width="9" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="12" cy="-112" rx="14" ry="8" fill="#7a4d31" transform="rotate(-20 12 -112)"/>' +
      '<ellipse cx="84" cy="-112" rx="14" ry="8" fill="#7a4d31" transform="rotate(20 84 -112)"/>' +
      '<ellipse cx="48" cy="-92" rx="36" ry="40" fill="#a06a45"/><ellipse cx="48" cy="-92" rx="36" ry="40" fill="url(#ball)"/>' +
      '<ellipse cx="48" cy="-66" rx="26" ry="18" fill="#f1c9a9"/>' +
      '<circle cx="39" cy="-66" r="3.5" fill="#6b3d2a"/><circle cx="57" cy="-66" r="3.5" fill="#6b3d2a"/>' +
      '<circle cx="34" cy="-100" r="4.4" fill="#2b1d14"/><circle cx="62" cy="-100" r="4.4" fill="#2b1d14"/>' +
      '<circle cx="35" cy="-101.5" r="1.4" fill="#fff"/><circle cx="63" cy="-101.5" r="1.4" fill="#fff"/>');
  }

  function donkey(key, o) {
    return fig(key, o,
      '<ellipse cx="30" cy="-52" rx="72" ry="42" fill="#8f8f9c"/><ellipse cx="30" cy="-52" rx="72" ry="42" fill="url(#shade)"/>' +
      '<ellipse cx="-66" cy="-150" rx="10" ry="32" fill="#7c7c8a" transform="rotate(-12 -66 -150)"/>' +
      '<ellipse cx="-30" cy="-150" rx="10" ry="32" fill="#7c7c8a" transform="rotate(12 -30 -150)"/>' +
      '<ellipse cx="-66" cy="-148" rx="4.5" ry="22" fill="#e7b9b0" transform="rotate(-12 -66 -148)"/>' +
      '<ellipse cx="-30" cy="-148" rx="4.5" ry="22" fill="#e7b9b0" transform="rotate(12 -30 -148)"/>' +
      '<ellipse cx="-48" cy="-90" rx="30" ry="42" fill="#a3a3b0"/><ellipse cx="-48" cy="-90" rx="30" ry="42" fill="url(#ball)"/>' +
      '<ellipse cx="-48" cy="-62" rx="22" ry="18" fill="#f3efe6"/>' +
      '<circle cx="-56" cy="-62" r="3" fill="#555"/><circle cx="-40" cy="-62" r="3" fill="#555"/>' +
      '<circle cx="-60" cy="-102" r="4.4" fill="#2b1d14"/><circle cx="-36" cy="-102" r="4.4" fill="#2b1d14"/>' +
      '<circle cx="-59" cy="-103.5" r="1.4" fill="#fff"/><circle cx="-35" cy="-103.5" r="1.4" fill="#fff"/>');
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
      ? '<circle cx="-30" cy="-62" r="40" fill="url(#haloGlow)"/><circle cx="-30" cy="-62" r="22" fill="#ffd166"/>' +
        '<ellipse cx="6" cy="-56" rx="40" ry="16" fill="#fffdf5"/><ellipse cx="6" cy="-56" rx="40" ry="16" fill="url(#shade)"/>' +
        '<path d="M-20 -62 L40 -50 M-14 -48 L44 -60" stroke="#e8dcc0" stroke-width="3"/>' +
        '<circle cx="-30" cy="-62" r="14" fill="#d9a878"/><circle cx="-30" cy="-62" r="14" fill="url(#ball)"/>' +
        '<circle cx="-35" cy="-64" r="1.8" fill="#2b1d14"/><circle cx="-26" cy="-64" r="1.8" fill="#2b1d14"/>' +
        '<path d="M-34 -57 Q-30 -54 -26 -57" stroke="#2b1d14" stroke-width="1.6" fill="none" stroke-linecap="round"/>'
      : '';
    return fig(baby ? 'baby' : 'manger', o,
      '<path d="M-46 -6 L40 40 M46 -6 L-40 40" stroke="#6b431f" stroke-width="10" stroke-linecap="round"/>' +
      straw +
      '<path d="M-66 -40 L66 -40 L50 2 L-50 2 Z" fill="#8a5a2b"/><path d="M-66 -40 L66 -40 L50 2 L-50 2 Z" fill="url(#shade)"/>' +
      '<path d="M-58 -22 L58 -22" stroke="#6b431f" stroke-width="2" opacity=".5"/>' +
      '<path d="M-66 -40 L66 -40" stroke="#a9743c" stroke-width="7" stroke-linecap="round"/>' +
      child);
  }

  function star() {
    return '<g class="fig" data-key="star" data-label="' + esc(App.FIGS.star.label) + '" data-note="C6" transform="translate(500 62)">' +
      '<path class="beam" d="M-10 0 L-80 250 L80 250 L10 0 Z" fill="url(#beam)"/>' +
      '<circle class="pulse" r="92" fill="url(#starGlow)"/>' +
      '<g class="hop twinkle">' +
      '<path d="M0 -62 L10 -12 L60 0 L10 12 L0 62 L-10 12 L-60 0 L-10 -12 Z" fill="#ffe08a"/>' +
      '<path d="M0 -32 L7 -7 L32 0 L7 7 L0 32 L-7 7 L-32 0 L-7 -7 Z" fill="#fff" transform="rotate(45)"/>' +
      '<circle r="9" fill="#fff"/></g></g>';
  }

  // The little town on the hills, with lamps lit in the windows.
  function town() {
    const house = (x, y, w, hgt, dome) => '<rect x="' + x + '" y="' + (y - hgt) + '" width="' + w + '" height="' + hgt + '" fill="#1c3760"/>' +
      (dome ? '<path d="M' + (x + w * 0.2) + ' ' + (y - hgt) + ' a' + (w * 0.3) + ' ' + (w * 0.3) + ' 0 0 1 ' + (w * 0.6) + ' 0 Z" fill="#1c3760"/>' : '') +
      '<rect x="' + (x + w * 0.3) + '" y="' + (y - hgt * 0.65) + '" width="' + Math.max(4, w * 0.16) + '" height="' + (hgt * 0.3) + '" rx="2" fill="#ffd166" opacity=".85"/>';
    return house(28, 462, 34, 30, 0) + house(66, 452, 44, 44, 1) + house(114, 442, 30, 30, 0) + house(148, 436, 40, 46, 1) +
      house(192, 438, 28, 26, 0) + house(770, 432, 36, 34, 1) + house(810, 428, 28, 24, 0) + house(842, 426, 46, 46, 1) +
      house(892, 424, 30, 28, 0) + house(926, 422, 38, 38, 1);
  }

  function scene(straws, baby) {
    const gift = (c) => '<rect x="-14" y="-78" width="28" height="24" rx="4" fill="' + c + '" stroke="#7a5a12" stroke-width="2"/>' +
      '<rect x="-14" y="-78" width="28" height="24" rx="4" fill="url(#shade)"/>' +
      '<circle cx="0" cy="-80" r="6" fill="' + c + '" stroke="#7a5a12" stroke-width="2"/>';
    let planks = '';
    for (let px = 330; px < 700; px += 34) planks += '<path d="M' + px + ' 262 L' + px + ' 540" stroke="#3d2610" stroke-width="2" opacity=".28"/>';
    return '<svg class="scene" viewBox="0 0 1000 620" preserveAspectRatio="xMidYMax meet">' +
      '<defs>' +
        '<radialGradient id="glow" cx="50%" cy="72%" r="68%"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".55" stop-color="#b9813f"/><stop offset="1" stop-color="#5e3b1c"/></radialGradient>' +
        '<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a" stop-opacity=".6"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></linearGradient>' +
        '<linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>' +
        '<radialGradient id="ball" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></radialGradient>' +
        '<radialGradient id="haloGlow"><stop offset=".55" stop-color="#ffd166" stop-opacity=".55"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="starGlow"><stop offset="0" stop-color="#fff3c4" stop-opacity=".75"/><stop offset=".4" stop-color="#ffd166" stop-opacity=".3"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8b67a"/><stop offset="1" stop-color="#a98249"/></linearGradient>' +
        '<linearGradient id="roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6a3a"/><stop offset="1" stop-color="#6b431f"/></linearGradient>' +
        '<clipPath id="inside"><rect x="311" y="60" width="378" height="486"/></clipPath>' +
      '</defs>' +
      '<path d="M-2000 470 L0 470 Q160 400 330 455 T640 440 T1000 420 L3000 420 L3000 720 L-2000 720 Z" fill="#132a4d"/>' +
      town() +
      '<path d="M-2000 520 L0 520 Q250 470 500 505 T1000 500 L3000 500 L3000 720 L-2000 720 Z" fill="url(#sand)"/>' +
      '<path d="M-2000 562 L0 562 Q300 527 600 557 T1000 547 L3000 547 L3000 720 L-2000 720 Z" fill="#000" opacity=".08"/>' +
      star() +
      '<rect x="295" y="262" width="410" height="278" fill="url(#glow)"/>' + planks +
      '<ellipse cx="500" cy="540" rx="200" ry="16" fill="#e9c35c" opacity=".55"/>' +
      '<rect x="285" y="255" width="26" height="290" rx="6" fill="#5b3a1c"/><rect x="689" y="255" width="26" height="290" rx="6" fill="#5b3a1c"/>' +
      '<rect x="285" y="255" width="26" height="290" rx="6" fill="url(#shade)"/><rect x="689" y="255" width="26" height="290" rx="6" fill="url(#shade)"/>' +
      '<path d="M228 272 L500 126 L772 272 L744 294 L500 164 L256 294 Z" fill="url(#roof)" stroke="#4a2f18" stroke-width="5" stroke-linejoin="round"/>' +
      '<path d="M262 276 L500 148 L738 276" fill="none" stroke="#e0a82e" stroke-width="9" stroke-dasharray="3 13" stroke-linecap="round" opacity=".75"/>' +
      '<path d="M228 272 L500 126 L772 272" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>' +
      '<g clip-path="url(#inside)">' +
      ox('ox', { x: 345, y: 470, s: 0.85, note: 'C4', shadow: 0 }) +
      donkey('donkey', { x: 660, y: 468, s: 0.85, note: 'D4', shadow: 0 }) +
      '</g>' +
      person('mary', { x: 420, y: 548, s: 1.05, robe: '#f4f7ff', veil: '#2f6fd6', sleeve: '#2f6fd6', hands: true, halo: true, skin: '#d9a878', note: 'A4' }) +
      person('joseph', { x: 598, y: 548, s: 1.18, robe: '#8a5a2b', trim: '#c98f4e', hair: '#4a2f18', beard: '#4a2f18', halo: true, note: 'F4',
        extra: '<path d="M52 0 L52 -150" stroke="#5b3a1c" stroke-width="7" stroke-linecap="round"/>' }) +
      manger({ x: 508, y: 560, s: 1, note: 'C5', shadow: 62 }, straws, baby) +
      person('shepherd', { x: 135, y: 580, s: 1.05, robe: '#4f7d4a', trim: '#e9dcc0', veil: '#c98f4e', beard: '#6b4a2b', note: 'E4',
        extra: '<path d="M-52 0 L-52 -150 Q-52 -178 -32 -172" stroke="#5b3a1c" stroke-width="7" fill="none" stroke-linecap="round"/>' }) +
      sheep('sheep', { x: 232, y: 596, s: 0.95, note: 'G4', shadow: 50 }) +
      sheep('lamb', { x: 60, y: 606, s: 0.6, note: 'B4', shadow: 50 }) +
      person('king1', { x: 790, y: 580, s: 1.02, robe: '#7b4bb3', trim: '#ffd166', beard: '#f1f1f1', crown: true, skin: '#e0b48a', note: 'E5', extra: gift('#ffd166') }) +
      person('king2', { x: 868, y: 596, s: 1.02, robe: '#c8323f', trim: '#ffd166', beard: '#3b2a1e', crown: true, skin: '#7a4d31', note: 'F5', extra: gift('#f4a3bd') }) +
      person('king3', { x: 946, y: 580, s: 1.02, robe: '#1b8a7a', trim: '#ffd166', beard: '#5b3a1c', crown: true, skin: '#b5835a', note: 'G5', extra: gift('#8ecae6') }) +
      person('angel', { x: 800, y: 235, s: 0.85, robe: '#fffdf5', trim: '#ffd166', hair: '#e0a82e', halo: true, wings: true, skin: '#f0c8a0', note: 'A5', shadow: 0 }) +
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
        App.sfx.play('box', f.dataset.note, 0, 0.6);
        App.say(App.FIGS[f.dataset.key].say, 'fig-' + f.dataset.key);
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
