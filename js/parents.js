'use strict';
/* Grown-up corner, opened by pressing and holding the gear on the home screen. */
(function () {
  const { $, $$, esc } = App;

  App.openParents = function () {
    const st = App.state;
    const sw = (key, label, note) =>
      '<div class="row"><div><b>' + label + '</b>' + (note ? '<small>' + note + '</small>' : '') + '</div>' +
      '<button class="switch' + (st[key] ? ' on' : '') + '" data-key="' + key + '" role="switch" aria-checked="' + !!st[key] + '">' +
      (st[key] ? 'On' : 'Off') + '</button></div>';

    const card = App.modal(
      '<h2>For grown-ups</h2>' +
      '<div class="row"><div><b>Younger child</b></div><input type="text" maxlength="14" data-name="0" value="' + esc(st.names[0]) + '"></div>' +
      '<div class="row"><div><b>Older child</b></div><input type="text" maxlength="14" data-name="1" value="' + esc(st.names[1]) + '"></div>' +
      sw('sound', 'Sounds', 'Bells and jingles') +
      sw('voice', 'Read aloud', 'Uses the tablet\'s own voice') +
      sw('preview', 'Preview everything', 'Unlocks all 25 doors and shows Baby Jesus in the manger') +
      '<div class="notes"><b>Good to know</b><ul>' +
        '<li>The door for <b>December 5</b> invites the kids to leave shoes out for St. Nicholas. You may want a small treat ready.</li>' +
        '<li>Each "I did it!" on a kind deed adds straw to the manger in Bethlehem. Baby Jesus appears there on Christmas Day.</li>' +
        '<li>Everything is saved on this tablet only. Nothing is sent anywhere.</li>' +
        '<li>To keep a little one inside the app, turn on <b>App pinning</b> in Android Settings, under Security.</li>' +
      '</ul></div>' +
      '<button class="btn ghost wipe">Erase everything and start fresh</button>',
      { cls: 'parents', onClose: () => App.refresh() });

    card.addEventListener('input', (e) => {
      const i = e.target.dataset.name;
      if (i === undefined) return;
      st.names[+i] = e.target.value.trim() || (i === '0' ? 'Little One' : 'Big Kid');
      App.save();
    });
    $$('.switch', card).forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.key;
      st[k] = !st[k];
      App.save();
      b.classList.toggle('on', st[k]);
      b.textContent = st[k] ? 'On' : 'Off';
      b.setAttribute('aria-checked', String(st[k]));
      if (st[k]) App.sfx.pop();
    }));
    let armed = false;
    $('.wipe', card).addEventListener('click', (e) => {
      if (!armed) { armed = true; e.target.textContent = 'Tap again to erase everything'; return; }
      App.reset();
      App.closeModal();
      App.toast('All cleared');
    });
  };
})();
