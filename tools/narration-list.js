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
process.stdout.write(JSON.stringify(out, null, 1));
