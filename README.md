# Our Christmas

A family Advent and Christmas app for an Android tablet. It is a plain web app with no build step, no accounts, no ads and no tracking. Everything the kids do is saved on the tablet only.

## What is inside

- **Background music**: thirteen Christmas carols and songs, with an on/off button, a next-song button and a volume setting.
- **Read aloud**: a recorded, natural-sounding voice reads every calendar door and names everyone in the nativity scene.
- **Countdown** of sleeps until Christmas, with an Advent wreath that lights one more candle each Sunday.
- **Advent calendar**: a door for each day from December 1 to 25, with a piece of the Christmas story or a saint's day, a kind deed, and sometimes a joke.
- **Bethlehem**: a nativity scene where every figure can be tapped and named aloud. Each kind deed adds straw to the manger, and Baby Jesus appears on Christmas Day.
- **Decorate the Tree**: one tree per child.
- **Christmas Bells**: free play, or follow the glowing bell to play Jingle Bells and Joy to the World.
- **Matching Game** in three sizes, and **Catch the Presents** in two speeds.
- **Word Search** in three sizes: drag across a word, or tap its first and last letter. Found words are said aloud.
- **Crossword** in two sizes, with picture clues, an A to Z keyboard on screen, a hint button and clues read aloud. Every puzzle is freshly made from the word list in `js/data.js`.
- **Letter to Santa**: three wishes, a gift to give someone else, and a gift for Baby Jesus.

## Put it on the tablet

1. Host this folder with GitHub Pages (repository Settings, then Pages, then deploy from the `main` branch, root folder).
2. Open the Pages address in Chrome on the tablet.
3. Open the Chrome menu and choose **Add to Home screen**, then **Install**.

After the first visit it works without internet.

## For grown-ups

Press and hold the gear on the home screen for about two seconds. There you can set the children's names, turn sound and read-aloud on or off, preview all the doors, and erase everything.

## Changing the words

All calendar text lives in `js/data.js`. To try a different day, add `?date=2026-12-14` to the address.

If you change any spoken text, record the voice clips again:

```bash
node tools/narration-list.js > lines.json
```

```bash
python tools/make-narration.py lines.json audio/voice path/to/model/folder
```

After changing or adding any file, refresh the offline list so tablets pick up the new version:

```bash
node tools/build-sw.js
```

A tablet that already has the app installed shows a new version the second time it is opened after the change.

## Credits

- Music: "Silent Night", "Adeste Fideles Waltz", "Angels We Have Heard on High", "Oh, Little Town of Bethlehem", "What Child is This", "Oh Holy Night", "Jingle Bells", "Jingle Bells (Calm)", "We Wish you a Merry Christmas", "Deck the Halls B", "Oh, Christmas Tree", "Up on a Housetop" and "Dance of the Sugar Plum Fairy" by Kevin MacLeod (incompetech.com). Licensed under Creative Commons: By Attribution 4.0 License, http://creativecommons.org/licenses/by/4.0/. The files were re-encoded at a lower bitrate and evened out in loudness.
- Bell, celesta, music box and glockenspiel notes: FluidR3 GM soundfont by Frank Wen, via gleitz/midi-js-soundfonts, Creative Commons Attribution 3.0.
- Picture icons: Fluent Emoji by Microsoft, MIT licence.
- Lettering: Fredoka by the Fredoka Project Authors, SIL Open Font Licence 1.1 (see `fonts/OFL.txt`).
- Reading voice: generated with the Kokoro voice model (Apache 2.0).
