# Our Christmas

A family Advent and Christmas app for an Android tablet. It is a plain web app with no build step, no accounts, no ads and no tracking. Everything the kids do is saved on the tablet only.

## What is inside

- **Countdown** of sleeps until Christmas, with an Advent wreath that lights one more candle each Sunday.
- **Advent calendar**: a door for each day from December 1 to 25, with a piece of the Christmas story or a saint's day, a kind deed, and sometimes a joke.
- **Bethlehem**: a nativity scene where every figure can be tapped and named aloud. Each kind deed adds straw to the manger, and Baby Jesus appears on Christmas Day.
- **Decorate the Tree**: one tree per child.
- **Christmas Bells**: free play, or follow the glowing bell to play Jingle Bells and Joy to the World.
- **Matching Game** in three sizes, and **Catch the Presents** in two speeds.
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

After changing any file, bump the `CACHE` name at the top of `sw.js` so tablets pick up the new version.
