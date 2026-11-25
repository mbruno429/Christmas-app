// Prints every line the app speaks, as JSON { clipId: text }, read from js/data.js.
// Used by tools/make-narration.py to record the read-aloud clips.
'use strict';
global.App = {};
require('../js/data.js');
const A = global.App;
const out = {};
for (let d = 1; d <= 25; d++) {
  const door = A.DOORS[d];
  out['door-' + d] = door.title + '. ' + door.text + " Today's kind deed: " + door.deed +
    (door.joke ? " And here's a joke. " + door.joke[0] : '');
  if (door.joke) out['joke-' + d] = door.joke[1];
}
for (let w = 1; w <= 4; w++) out['week-' + w] = A.WEEKS[w].name + '. ' + A.WEEKS[w].text + ' Come, Lord Jesus!';
Object.keys(A.FIGS).forEach((k) => { out['fig-' + k] = A.FIGS[k].say; });
Object.keys(A.LINES).forEach((k) => { out[k] = A.LINES[k]; });
// Word games: each word said on its own, and its crossword clue.
// (A word on its own is too short for the voice to say reliably, so it gets a short lead-in.)
const NAMES = ['MARY', 'JOSEPH', 'JESUS', 'BETHLEHEM', 'ADVENT', 'SANTA', 'NOEL'];
A.WORDS.forEach((w) => {
  const said = NAMES.includes(w[0]) ? w[0].charAt(0) + w[0].slice(1).toLowerCase() : w[0].toLowerCase();
  out['word-' + w[0].toLowerCase()] = 'You found: ' + said + '!';
  out['clue-' + w[0].toLowerCase()] = w[2];
});
process.stdout.write(JSON.stringify(out, null, 1));
