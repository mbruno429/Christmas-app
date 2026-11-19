/* Offline support: serve from the saved copy right away, refresh it in the background. */
const CACHE = 'our-christmas-v1';
const FILES = [
  './', 'index.html', 'styles.css', 'manifest.webmanifest',
  'js/core.js', 'js/data.js', 'js/home.js', 'js/calendar.js', 'js/nativity.js', 'js/tree.js',
  'js/bells.js', 'js/memory.js', 'js/catch.js', 'js/letter.js', 'js/parents.js', 'js/main.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(req, { ignoreSearch: true });
      const fresh = fetch(req)
        .then((res) => {
          if (res && res.ok) cache.put(req.url.split('?')[0], res.clone());
          return res;
        })
        .catch(() => hit);
      return hit || fresh;
    })
  );
});
