/* Offline support. The app itself is saved on first visit; songs are saved as they are first played. */
const CACHE = 'our-christmas-4e48e04119';
const MUSIC = 'our-christmas-music-v1';
/* FILES:START (written by tools/build-sw.js) */
const FILES = [
 "./",
 "index.html",
 "styles.css",
 "manifest.webmanifest",
 "js/bells.js",
 "js/calendar.js",
 "js/catch.js",
 "js/core.js",
 "js/data.js",
 "js/emoji.js",
 "js/home.js",
 "js/letter.js",
 "js/main.js",
 "js/memory.js",
 "js/nativity.js",
 "js/parents.js",
 "js/tree.js",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/icon-maskable-512.png",
 "fonts/fredoka.woff2",
 "img/e/artist_palette.webp",
 "img/e/automobile.webp",
 "img/e/baby.webp",
 "img/e/baby_angel.webp",
 "img/e/basketball.webp",
 "img/e/bell.webp",
 "img/e/bicycle.webp",
 "img/e/black_circle.webp",
 "img/e/blue_heart.webp",
 "img/e/books.webp",
 "img/e/broom.webp",
 "img/e/camel.webp",
 "img/e/candle.webp",
 "img/e/candy.webp",
 "img/e/christmas_tree.webp",
 "img/e/cookie.webp",
 "img/e/crescent_moon.webp",
 "img/e/crown.webp",
 "img/e/deer.webp",
 "img/e/dove.webp",
 "img/e/dress.webp",
 "img/e/elf.webp",
 "img/e/ewe.webp",
 "img/e/fire.webp",
 "img/e/game_die.webp",
 "img/e/gear.webp",
 "img/e/glowing_star.webp",
 "img/e/grinning_face_with_smiling_eyes.webp",
 "img/e/guitar.webp",
 "img/e/house.webp",
 "img/e/kick_scooter.webp",
 "img/e/light_bulb.webp",
 "img/e/locked.webp",
 "img/e/locomotive.webp",
 "img/e/lollipop.webp",
 "img/e/love_letter.webp",
 "img/e/mans_shoe.webp",
 "img/e/musical_note.webp",
 "img/e/musical_notes.webp",
 "img/e/musical_score.webp",
 "img/e/muted_speaker.webp",
 "img/e/next_track_button.webp",
 "img/e/open_book.webp",
 "img/e/ox.webp",
 "img/e/party_popper.webp",
 "img/e/pencil.webp",
 "img/e/puzzle_piece.webp",
 "img/e/red_heart.webp",
 "img/e/ribbon.webp",
 "img/e/right_arrow_curving_left.webp",
 "img/e/robot.webp",
 "img/e/rose.webp",
 "img/e/santa_claus.webp",
 "img/e/sheaf_of_rice.webp",
 "img/e/sled.webp",
 "img/e/snowflake.webp",
 "img/e/snowman.webp",
 "img/e/snowman_without_snow.webp",
 "img/e/soccer_ball.webp",
 "img/e/socks.webp",
 "img/e/sparkles.webp",
 "img/e/speaker_high_volume.webp",
 "img/e/spiral_calendar.webp",
 "img/e/star.webp",
 "img/e/stopwatch.webp",
 "img/e/t_rex.webp",
 "img/e/teddy_bear.webp",
 "img/e/trophy.webp",
 "img/e/video_game.webp",
 "img/e/wrapped_gift.webp",
 "img/e/yellow_heart.webp",
 "audio/notes/bell_A4.mp3",
 "audio/notes/bell_B4.mp3",
 "audio/notes/bell_C4.mp3",
 "audio/notes/bell_C5.mp3",
 "audio/notes/bell_D4.mp3",
 "audio/notes/bell_E4.mp3",
 "audio/notes/bell_F4.mp3",
 "audio/notes/bell_G4.mp3",
 "audio/notes/box_A4.mp3",
 "audio/notes/box_A5.mp3",
 "audio/notes/box_B4.mp3",
 "audio/notes/box_B5.mp3",
 "audio/notes/box_C4.mp3",
 "audio/notes/box_C5.mp3",
 "audio/notes/box_C6.mp3",
 "audio/notes/box_D4.mp3",
 "audio/notes/box_D5.mp3",
 "audio/notes/box_E4.mp3",
 "audio/notes/box_E5.mp3",
 "audio/notes/box_F4.mp3",
 "audio/notes/box_F5.mp3",
 "audio/notes/box_G4.mp3",
 "audio/notes/box_G5.mp3",
 "audio/notes/celesta_A4.mp3",
 "audio/notes/celesta_A5.mp3",
 "audio/notes/celesta_B4.mp3",
 "audio/notes/celesta_B5.mp3",
 "audio/notes/celesta_C4.mp3",
 "audio/notes/celesta_C5.mp3",
 "audio/notes/celesta_C6.mp3",
 "audio/notes/celesta_D4.mp3",
 "audio/notes/celesta_D5.mp3",
 "audio/notes/celesta_E4.mp3",
 "audio/notes/celesta_E5.mp3",
 "audio/notes/celesta_F4.mp3",
 "audio/notes/celesta_F5.mp3",
 "audio/notes/celesta_G4.mp3",
 "audio/notes/celesta_G5.mp3",
 "audio/notes/glock_A5.mp3",
 "audio/notes/glock_C5.mp3",
 "audio/notes/glock_C6.mp3",
 "audio/notes/glock_E5.mp3",
 "audio/notes/glock_G5.mp3",
 "audio/voice/deed-done.mp3",
 "audio/voice/door-1.mp3",
 "audio/voice/door-10.mp3",
 "audio/voice/door-11.mp3",
 "audio/voice/door-12.mp3",
 "audio/voice/door-13.mp3",
 "audio/voice/door-14.mp3",
 "audio/voice/door-15.mp3",
 "audio/voice/door-16.mp3",
 "audio/voice/door-17.mp3",
 "audio/voice/door-18.mp3",
 "audio/voice/door-19.mp3",
 "audio/voice/door-2.mp3",
 "audio/voice/door-20.mp3",
 "audio/voice/door-21.mp3",
 "audio/voice/door-22.mp3",
 "audio/voice/door-23.mp3",
 "audio/voice/door-24.mp3",
 "audio/voice/door-25.mp3",
 "audio/voice/door-3.mp3",
 "audio/voice/door-4.mp3",
 "audio/voice/door-5.mp3",
 "audio/voice/door-6.mp3",
 "audio/voice/door-7.mp3",
 "audio/voice/door-8.mp3",
 "audio/voice/door-9.mp3",
 "audio/voice/fig-angel.mp3",
 "audio/voice/fig-baby.mp3",
 "audio/voice/fig-donkey.mp3",
 "audio/voice/fig-joseph.mp3",
 "audio/voice/fig-king1.mp3",
 "audio/voice/fig-king2.mp3",
 "audio/voice/fig-king3.mp3",
 "audio/voice/fig-lamb.mp3",
 "audio/voice/fig-manger.mp3",
 "audio/voice/fig-mary.mp3",
 "audio/voice/fig-ox.mp3",
 "audio/voice/fig-sheep.mp3",
 "audio/voice/fig-shepherd.mp3",
 "audio/voice/fig-star.mp3",
 "audio/voice/found-all.mp3",
 "audio/voice/great-catching.mp3",
 "audio/voice/joke-1.mp3",
 "audio/voice/joke-11.mp3",
 "audio/voice/joke-14.mp3",
 "audio/voice/joke-17.mp3",
 "audio/voice/joke-18.mp3",
 "audio/voice/joke-19.mp3",
 "audio/voice/joke-3.mp3",
 "audio/voice/joke-7.mp3",
 "audio/voice/letter-sent.mp3",
 "audio/voice/not-yet.mp3",
 "audio/voice/song-done.mp3",
 "audio/voice/week-1.mp3",
 "audio/voice/week-2.mp3",
 "audio/voice/week-3.mp3",
 "audio/voice/week-4.mp3",
 "audio/voice/wreath-before.mp3",
 "audio/voice/wreath-christmas.mp3"
];
/* FILES:END */

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // One missing file must not stop the app from installing.
      .then((c) => Promise.all(FILES.map((f) => c.add(f).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== MUSIC).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Songs: answer from the saved copy, including the "give me bytes 1000-2000" requests audio players make.
async function song(req) {
  const cache = await caches.open(MUSIC);
  const hit = await cache.match(req.url.split('?')[0]);
  if (!hit) return fetch(req);
  const range = /bytes=(\d+)-(\d*)/.exec(req.headers.get('range') || '');
  if (!range) return hit;
  const blob = await hit.blob();
  const start = +range[1];
  const end = range[2] ? Math.min(+range[2], blob.size - 1) : blob.size - 1;
  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Range': 'bytes ' + start + '-' + end + '/' + blob.size,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes'
    }
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.includes('/audio/music/')) { e.respondWith(song(req)); return; }
  // Everything else: saved copy first, refreshed in the background.
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(req, { ignoreSearch: true });
      const fresh = fetch(req)
        .then((res) => {
          if (res && res.ok && res.status === 200) cache.put(req.url.split('?')[0], res.clone());
          return res;
        })
        .catch(() => hit);
      return hit || fresh;
    })
  );
});
