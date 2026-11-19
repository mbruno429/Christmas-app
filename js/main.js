'use strict';
(function () {
  addEventListener('popstate', App.route);
  // Long-press menus get in the way of small fingers; keep them only for text boxes.
  document.addEventListener('contextmenu', (e) => {
    if (!e.target.closest('input')) e.preventDefault();
  });
  App.startEmoji();
  App.startSnow();
  App.route();
  // Sound is only allowed after a touch, so the first tap wakes up the instruments and the music.
  const wake = () => { App.loadSamples(); App.music.kick(); };
  document.addEventListener('pointerdown', wake, { capture: true });
  document.addEventListener('keydown', wake, { capture: true });

  const local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || local) && !/[?&]nosw/.test(location.search)) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
