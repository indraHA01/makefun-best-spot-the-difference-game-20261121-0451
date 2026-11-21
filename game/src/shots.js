// The screenshot scenes behind ?shot=cover|market|workshop|victory.
// Each one plays the real rules forward from a fresh hunt: it clicks real
// differences through clickAt (the same function a player's mouse calls),
// so the frame is what a short game really looks like and the same seed
// always gives the same frame. The renderer paints it twice and main.js
// sets window.__shotReady for the screenshot.

import { SCREEN_PLAY, clickAt, createGame, currentDiffs, nextLevel, startGame, startLevel, useHint } from './game.js';

/** Click a difference by id on the left picture, through the real rules. */
function clickDiff(game, id) {
  const diff = currentDiffs(game).find((d) => d.id === id);
  if (!diff) return;
  clickAt(game, 24 + diff.x, 108 + diff.y);
}

/** Stage the named scene on `game` and return the screen to draw. */
export function stageShot(name, game) {
  const finish = (screen) => {
    // Score popups age in the live loop, which never runs for a shot:
    // clear them so they do not sit frozen over the markers.
    game.floats = [];
    game.wrongFlash = null;
    return { screen };
  };
  startGame(game);
  if (name === 'market') {
    // Level 2, six found and a hint pulsing on a seventh.
    startLevel(game, 0);
    currentDiffs(game).forEach((d) => clickDiff(game, d.id));
    nextLevel(game);
    ['lantern-colour', 'fish-count', 'market-cat', 'apples', 'puddle', 'balloon'].forEach((id) => clickDiff(game, id));
    game.timeLeft = 121;
    useHint(game);
    return finish(SCREEN_PLAY);
  }
  if (name === 'workshop') {
    // Level 3, two found, one hint spent, clock under two minutes.
    startLevel(game, 0);
    currentDiffs(game).forEach((d) => clickDiff(game, d.id));
    nextLevel(game);
    currentDiffs(game).forEach((d) => clickDiff(game, d.id));
    nextLevel(game);
    ['gear-teeth', 'robot-eye'].forEach((id) => clickDiff(game, id));
    game.timeLeft = 98;
    useHint(game);
    return finish(SCREEN_PLAY);
  }
  if (name === 'victory') {
    // The whole hunt, won: every difference in every room, by the book.
    for (let level = 0; level < 3; level += 1) {
      startLevel(game, level);
      currentDiffs(game).forEach((d) => clickDiff(game, d.id));
      if (level < 2) nextLevel(game);
    }
    // No live loop ticks during a staged shot, so the clock never ran:
    // show the hunt as it looks after a real 5m 42s win with 47s to spare.
    game.timeLeft = 47;
    game.totalTime = 342;
    return finish(game.screen);
  }
  // Cover: level 1, four found, six still hiding, clock at 2:34.
  ['lamp-shade', 'moon', 'clock-hands', 'cat-tail'].forEach((id) => clickDiff(game, id));
  game.timeLeft = 154;
  return finish(SCREEN_PLAY);
}

/** A fresh game for a shot, with no stored best score to leak in. */
export function freshGameForShot() {
  return createGame(0);
}
