// Rewrites the list of files in sw.js that are saved for offline use, and bumps the cache name
// so tablets pick up changes. Run after adding or changing files:   node tools/build-sw.js
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.join(__dirname, '..');
const files = ['./', 'index.html', 'styles.css', 'manifest.webmanifest'];
const hash = crypto.createHash('sha1');
function walk(dir) {
  fs.readdirSync(path.join(root, dir)).sort().forEach((name) => {
    const rel = dir + '/' + name;
    if (fs.statSync(path.join(root, rel)).isDirectory()) walk(rel);
    else if (!/\.(txt|svg|md)$/.test(name)) files.push(rel);
  });
}
['js', 'icons', 'fonts', 'img', 'audio/notes', 'audio/voice'].forEach(walk);
files.slice(1).forEach((f) => hash.update(f).update(fs.readFileSync(path.join(root, f))));
const version = hash.digest('hex').slice(0, 10);
let sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
sw = sw.replace(/const CACHE = '[^']*';/, "const CACHE = 'our-christmas-" + version + "';");
sw = sw.replace(/\/\* FILES:START[^]*FILES:END \*\//,
  '/* FILES:START (written by tools/build-sw.js) */\nconst FILES = ' + JSON.stringify(files, null, 1) + ';\n/* FILES:END */');
fs.writeFileSync(path.join(root, 'sw.js'), sw);
console.log(files.length + ' files, cache our-christmas-' + version);
