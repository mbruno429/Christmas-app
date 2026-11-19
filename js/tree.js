'use strict';
/* Decorate the tree: tap to hang an ornament, drag to move it, drag it off the tree to remove it. */
(function () {
  const { $, $$, h, esc } = App;
  const BAUBLES = ['#e63946', '#ffb703', '#2f6fd6', '#8e44ad', '#ff7eb6', '#f1f5f9'];
  const STICKERS = ['⭐', '🔔', '🍭', '🎀', '👼', '🕯️', '❄️', '🎁', '🧸', '🍪', '❤️', '🕊️'];
  const ALL = BAUBLES.concat(STICKERS);
  const MAX = 70;
  let who = 0;
  let selected = null; // null means "surprise me"

  function treeSVG() {
    const garlands = [[225, 195, 375, 215, 5], [200, 322, 400, 345, 6], [185, 455, 420, 480, 7], [120, 548, 480, 570, 9]];
    const colors = ['#ffe08a', '#ff7eb6', '#8ecae6', '#ff9f1c', '#b8f2a6'];
    let bulbs = '', wires = '', k = 0;
    garlands.forEach(([x1, y1, x2, y2, n]) => {
      wires += '<path d="M' + x1 + ' ' + y1 + ' Q' + (x1 + x2) / 2 + ' ' + ((y1 + y2) / 2 + 36) + ' ' + x2 + ' ' + y2 +
        '" fill="none" stroke="#0d3d24" stroke-width="3"/>';
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const x = (x1 + (x2 - x1) * t).toFixed(0);
        const y = (y1 + (y2 - y1) * t + 18 * Math.sin(Math.PI * t)).toFixed(0);
        const c = colors[k % 5];
        bulbs += '<g class="bulb" style="animation-delay:' + ((k * 0.37) % 1.6).toFixed(2) + 's">' +
          '<circle cx="' + x + '" cy="' + y + '" r="20" fill="' + c + '" opacity=".22"/>' +
          '<circle cx="' + x + '" cy="' + y + '" r="8" fill="' + c + '"/>' +
          '<circle cx="' + (x - 2.5) + '" cy="' + (y - 2.5) + '" r="2.6" fill="#fff" opacity=".8"/></g>';
        k++;
      }
    });
    // Each layer of branches: a scalloped lower edge, soft shading and a dusting of snow.
    const tier = (top, y, half, fill, id) => {
      const left = 300 - half, right = 300 + half, n = 6, w = (2 * half) / n;
      let edge = '';
      for (let i = 0; i < n; i++) edge += ' q' + (-w / 2) + ' 26 ' + (-w) + ' 0';
      const d = 'M300 ' + top + ' L' + right + ' ' + y + edge + ' Z';
      const b = (half * 0.72 / 3).toFixed(1); // three soft bumps of snow under the tip
      const snow = 'M300 ' + top + ' L' + (300 + half * 0.36) + ' ' + (top + (y - top) * 0.36) +
        (' q-' + b / 2 + ' 20 -' + b + ' 0').repeat(3) + ' Z';
      return '<path d="' + d + '" fill="' + fill + '" stroke="' + fill + '" stroke-width="16" stroke-linejoin="round"/>' +
        '<path d="' + d + '" fill="url(#tshade' + id + ')"/>' +
        (id === 3 ? '<path d="' + snow + '" fill="#f4faff" opacity=".92"/>' : '');
    };
    return '<svg viewBox="0 0 600 700" aria-hidden="true"><defs>' +
      '<linearGradient id="tshade1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/></linearGradient>' +
      '<linearGradient id="tshade2" href="#tshade1"/><linearGradient id="tshade3" href="#tshade1"/>' +
      '<radialGradient id="snowpile" cx="50%" cy="20%" r="80%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c9dcf2"/></radialGradient>' +
      '<linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a5a2b"/><stop offset="1" stop-color="#5b3a1c"/></linearGradient>' +
      '</defs>' +
      '<ellipse cx="300" cy="655" rx="280" ry="38" fill="url(#snowpile)"/>' +
      '<rect x="268" y="590" width="64" height="70" rx="8" fill="url(#trunk)"/>' +
      tier(300, 590, 226, '#14613a', 1) +
      tier(172, 410, 176, '#1b7f4b', 2) +
      tier(62, 250, 124, '#239a5c', 3) +
      '<ellipse cx="300" cy="664" rx="70" ry="12" fill="#fff"/>' +
      '<g class="lights">' + wires + bulbs + '</g></svg>';
  }

  function ornHTML(t) {
    return t[0] === '#' ? '<span class="bauble" style="--c:' + t + '"></span>' : t;
  }

  App.register('tree', {
    title: 'Decorate the Tree',
    render(root, extra) {
      const st = App.state;
      const items = () => st.trees[who];

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

      const scr = h(
        '<div class="tree-screen">' +
          '<div class="stage-wrap"><div class="stage">' + treeSVG() + '<div class="orns"></div></div></div>' +
          '<div class="palette">' +
            '<div class="pal-grid">' +
              '<button class="pal" data-t="" aria-label="Surprise">🎲</button>' +
              ALL.map((t) => '<button class="pal" data-t="' + t + '">' + ornHTML(t) + '</button>').join('') +
            '</div>' +
            '<div class="tools">' +
              '<button class="tool" data-a="lights">💡 Lights</button>' +
              '<button class="tool" data-a="undo">↩️ Undo</button>' +
              '<button class="tool" data-a="clear">🧹 Start over</button>' +
            '</div>' +
          '</div>' +
        '</div>');
      root.appendChild(scr);
      const wrap = $('.stage-wrap', scr);
      const stage = $('.stage', scr);
      const layer = $('.orns', scr);

      function fit() {
        const r = wrap.getBoundingClientRect();
        const w = Math.min(r.width, r.height * 6 / 7);
        stage.style.width = w + 'px';
        stage.style.height = (w * 7 / 6) + 'px';
        stage.style.setProperty('--u', (w / 100) + 'px');
      }
      function paint() {
        layer.innerHTML = items().map((o, i) =>
          '<div class="orn" data-i="' + i + '" style="left:' + o.x + '%;top:' + o.y + '%">' + ornHTML(o.t) + '</div>').join('');
        $('.lights', stage).style.display = st.lights[who] ? '' : 'none';
        $$('.pal', scr).forEach((b) => b.classList.toggle('sel', (b.dataset.t || null) === selected));
      }
      const pct = (e) => {
        const r = stage.getBoundingClientRect();
        return { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 };
      };

      let drag = null;
      stage.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const o = e.target.closest('.orn');
        if (o) {
          drag = { el: o, i: +o.dataset.i, sx: e.clientX, sy: e.clientY, moved: false };
          o.classList.add('drag');
          try { stage.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
          return;
        }
        const p = pct(e);
        const t = selected || App.pick(ALL);
        items().push({ t, x: +p.x.toFixed(1), y: +p.y.toFixed(1) });
        if (items().length > MAX) items().shift();
        App.save();
        paint();
        App.sfx.chime(App.pick(['C5', 'E5', 'G5', 'A5', 'C6']));
      });
      stage.addEventListener('pointermove', (e) => {
        if (!drag) return;
        if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) drag.moved = true;
        if (!drag.moved) return;
        const p = pct(e);
        drag.el.style.left = p.x + '%';
        drag.el.style.top = p.y + '%';
        drag.el.classList.toggle('off', p.x < 0 || p.x > 100 || p.y < 0 || p.y > 100);
      });
      const drop = (e) => {
        if (!drag) return;
        const d = drag;
        drag = null;
        if (d.moved) {
          const p = pct(e);
          if (p.x < 0 || p.x > 100 || p.y < 0 || p.y > 100) {
            items().splice(d.i, 1);
            App.sfx.nope();
          } else {
            items()[d.i].x = +p.x.toFixed(1);
            items()[d.i].y = +p.y.toFixed(1);
            App.sfx.pop();
          }
          App.save();
        } else {
          App.sfx.sparkle();
          App.burst(e.clientX, e.clientY, ['✨'], 5);
        }
        paint();
      };
      stage.addEventListener('pointerup', drop);
      stage.addEventListener('pointercancel', () => { drag = null; paint(); });

      scr.addEventListener('click', (e) => {
        const p = e.target.closest('.pal');
        if (p) {
          selected = p.dataset.t || null;
          App.sfx.pop();
          paint();
          return;
        }
        const tool = e.target.closest('.tool');
        if (!tool) return;
        const a = tool.dataset.a;
        if (a === 'lights') { st.lights[who] = !st.lights[who]; App.sfx.sparkle(); App.save(); paint(); }
        if (a === 'undo') { items().pop(); App.sfx.pop(); App.save(); paint(); }
        if (a === 'clear') {
          if (!items().length) return;
          const card = App.modal('<div class="big-icon">🧹</div><h2>Start over?</h2>' +
            '<p>This takes everything off the tree.</p>' +
            '<button class="btn yes">Yes, start over</button><button class="btn ghost no">Keep my tree</button>');
          $('.yes', card).addEventListener('click', () => { st.trees[who] = []; App.save(); App.closeModal(); paint(); });
          $('.no', card).addEventListener('click', App.closeModal);
        }
      });

      this._fit = fit;
      addEventListener('resize', fit);
      fit();
      paint();
    },
    leave() { removeEventListener('resize', this._fit); }
  });
})();
