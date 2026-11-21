// Pip's Mischief — the hunt itself: state, clicks, scoring, timer, hints.
// The game is pure logic over the scenes in scenes.js: it never draws
// anything itself, so the renderer can paint whatever state is here.

import {
  DIFFS_PER_LEVEL,
  HINTS_PER_LEVEL,
  HINT_REVEAL_SECONDS,
  HIT_RADIUS,
  LEVEL_TIME,
  LEVELS,
  PANELS,
  SCORE,
  WRONG_FLASH_SECONDS,
  WRONG_TIME_PENALTY,
} from './config.js';
import { SCENES } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL_DONE = 'level-done';
export const SCREEN_TIME_UP = 'time-up';
export const SCREEN_WIN = 'win';

/** A fresh hunt: title screen, no level started, best score from storage. */
export function createGame(best) {
  return {
    screen: SCREEN_TITLE,
    levelIndex: 0,
    found: new Set(),
    foundOrder: [],
    score: 0,
    streak: 0,
    bestStreak: 0,
    timeLeft: LEVEL_TIME[0],
    hintsLeft: HINTS_PER_LEVEL,
    hint: null,
    wrongFlash: null,
    floats: [],
    mistakes: 0,
    hintsUsed: 0,
    totalFound: 0,
    totalTime: 0,
    best: best || 0,
    message: 'Click a difference — on either picture.',
    // Keyboard crosshair, in logical coordinates; starts on the left panel.
    cursor: { x: PANELS.leftX + PANELS.width / 2, y: PANELS.y + PANELS.height / 2, visible: false },
    levelDoneBonus: 0,
  };
}

export function currentLevel(game) {
  return LEVELS[game.levelIndex];
}

export function currentScene(game) {
  return SCENES[game.levelIndex];
}

export function currentDiffs(game) {
  return currentScene(game).diffs;
}

export function remainingCount(game) {
  return DIFFS_PER_LEVEL - game.found.size;
}

export function changedSet(game) {
  // The right picture always shows every difference; the left shows none.
  return new Set(currentDiffs(game).map((d) => d.id));
}

/** Begin (or re-begin) a level: fresh finds, fresh timer, fresh hints. */
export function startLevel(game, index) {
  game.levelIndex = index;
  game.found = new Set();
  game.foundOrder = [];
  game.timeLeft = LEVEL_TIME[index];
  game.hintsLeft = HINTS_PER_LEVEL;
  game.hint = null;
  game.wrongFlash = null;
  game.floats = [];
  game.streak = 0;
  game.screen = SCREEN_PLAY;
  game.message = `Room ${index + 1} of 3 — find all ${DIFFS_PER_LEVEL} differences!`;
}

export function startGame(game) {
  game.score = 0;
  game.totalFound = 0;
  game.totalTime = 0;
  game.mistakes = 0;
  game.hintsUsed = 0;
  startLevel(game, 0);
}

function addFloat(game, x, y, text, colour) {
  game.floats.push({ x, y, text, colour, age: 0 });
}

/**
 * A click at logical (x, y). Either panel counts: a difference found on one
 * picture is ringed on both. Returns 'found' | 'wrong' | 'ignored'.
 */
export function clickAt(game, x, y) {
  if (game.screen !== SCREEN_PLAY) return 'ignored';
  const inLeft = x >= PANELS.leftX && x < PANELS.leftX + PANELS.width;
  const inRight = x >= PANELS.rightX && x < PANELS.rightX + PANELS.width;
  const inRow = y >= PANELS.y && y < PANELS.y + PANELS.height;
  if ((!inLeft && !inRight) || !inRow) return 'ignored';
  const panelX = inLeft ? x - PANELS.leftX : x - PANELS.rightX;
  const panelY = y - PANELS.y;
  const diffs = currentDiffs(game);
  for (let i = 0; i < diffs.length; i += 1) {
    const d = diffs[i];
    if (game.found.has(d.id)) continue;
    const dx = panelX - d.x;
    const dy = panelY - d.y;
    if (dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS) {
      game.found.add(d.id);
      game.foundOrder.push(d);
      game.totalFound += 1;
      game.streak += 1;
      game.bestStreak = Math.max(game.bestStreak, game.streak);
      const gained = SCORE.find + SCORE.streakBonus * (game.streak - 1);
      game.score += gained;
      addFloat(game, x, y - 18, `+${gained}`, '#ffd76a');
      game.message = `Found it — ${d.label}! ${remainingCount(game)} to go.`;
      if (game.found.size === DIFFS_PER_LEVEL) finishLevel(game);
      return 'found';
    }
  }
  game.streak = 0;
  game.mistakes += 1;
  game.score = Math.max(0, game.score + SCORE.wrong);
  game.timeLeft = Math.max(0, game.timeLeft - WRONG_TIME_PENALTY);
  game.wrongFlash = { x, y, age: 0 };
  addFloat(game, x, y - 18, `−5s  ${SCORE.wrong}`, '#ff7a6a');
  game.message = 'Not a difference — look closer. (−5 seconds)';
  return 'wrong';
}

/** Spend a hint: one unfound difference pulses on both pictures. */
export function useHint(game) {
  if (game.screen !== SCREEN_PLAY) return false;
  if (game.hintsLeft <= 0) {
    game.message = 'No hints left in this room.';
    return false;
  }
  const rest = currentDiffs(game).filter((d) => !game.found.has(d.id));
  if (rest.length === 0) return false;
  const pick = rest[Math.floor(Math.random() * rest.length)];
  game.hintsLeft -= 1;
  game.hintsUsed += 1;
  game.score = Math.max(0, game.score + SCORE.hint);
  game.hint = { diff: pick, age: 0, ttl: HINT_REVEAL_SECONDS };
  game.message = `Hint: something changed near “${pick.label}”… (−50)`;
  return true;
}

function finishLevel(game) {
  const bonus = Math.round(game.timeLeft) * SCORE.timeBonusPerSecond;
  game.levelDoneBonus = bonus;
  game.score += bonus;
  game.totalTime += LEVEL_TIME[game.levelIndex] - game.timeLeft;
  if (game.levelIndex === LEVELS.length - 1) {
    game.screen = SCREEN_WIN;
    game.best = Math.max(game.best, game.score);
  } else {
    game.screen = SCREEN_LEVEL_DONE;
  }
}

/** Advance the clock: timer, hint pulse, wrong-click flash, floaters. */
export function update(game, dt) {
  if (game.screen === SCREEN_PLAY) {
    game.timeLeft -= dt;
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      game.screen = SCREEN_TIME_UP;
      game.message = 'Out of time! Pip got away with it — try the room again.';
      return;
    }
  }
  if (game.hint) {
    game.hint.age += dt;
    if (game.hint.age >= game.hint.ttl) game.hint = null;
  }
  if (game.wrongFlash) {
    game.wrongFlash.age += dt;
    if (game.wrongFlash.age >= WRONG_FLASH_SECONDS) game.wrongFlash = null;
  }
  for (let i = game.floats.length - 1; i >= 0; i -= 1) {
    game.floats[i].age += dt;
    game.floats[i].y -= dt * 24;
    if (game.floats[i].age > 1.1) game.floats.splice(i, 1);
  }
}

/** Move on after a finished room, or restart the hunt after a win. */
export function nextLevel(game) {
  if (game.screen === SCREEN_LEVEL_DONE) {
    startLevel(game, game.levelIndex + 1);
    return true;
  }
  return false;
}

export function retryLevel(game) {
  if (game.screen === SCREEN_TIME_UP) {
    startLevel(game, game.levelIndex);
    return true;
  }
  return false;
}

/** Keyboard play: arrows move the crosshair, Enter/Space clicks it. */
export function handleKey(game, key) {
  const cursor = game.cursor;
  if (game.screen === SCREEN_TITLE) {
    if (key === 'Enter' || key === ' ') { startGame(game); return 'start'; }
    if (key === '1' || key === '2' || key === '3') { startLevel(game, Number(key) - 1); return 'start'; }
    return 'ignored';
  }
  if (game.screen === SCREEN_LEVEL_DONE) {
    if (key === 'n' || key === 'N' || key === 'Enter' || key === ' ') return nextLevel(game) ? 'next' : 'ignored';
    return 'ignored';
  }
  if (game.screen === SCREEN_TIME_UP) {
    if (key === 'r' || key === 'R' || key === 'Enter' || key === ' ') return retryLevel(game) ? 'retry' : 'ignored';
    return 'ignored';
  }
  if (game.screen === SCREEN_WIN) {
    if (key === 'r' || key === 'R' || key === 'Enter' || key === ' ') { startGame(game); return 'start'; }
    return 'ignored';
  }
  if (game.screen === SCREEN_PAUSED) {
    if (key === 'p' || key === 'P' || key === 'Escape') { game.screen = SCREEN_PLAY; return 'resume'; }
    return 'ignored';
  }
  // SCREEN_PLAY
  if (key === 'p' || key === 'P' || key === 'Escape') { game.screen = SCREEN_PAUSED; return 'pause'; }
  if (key === 'h' || key === 'H') return useHint(game) ? 'hint' : 'ignored';
  if (key === 'r' || key === 'R') { startLevel(game, game.levelIndex); return 'restart'; }
  const step = key === 'Shift' ? 4 : 18;
  if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown') {
    cursor.visible = true;
    if (key === 'ArrowLeft') cursor.x -= step;
    if (key === 'ArrowRight') cursor.x += step;
    if (key === 'ArrowUp') cursor.y -= step;
    if (key === 'ArrowDown') cursor.y += step;
    cursor.x = Math.max(0, Math.min(1279, cursor.x));
    cursor.y = Math.max(0, Math.min(719, cursor.y));
    return 'move';
  }
  if (key === 'Enter' || key === ' ') {
    cursor.visible = true;
    return clickAt(game, cursor.x, cursor.y);
  }
  if (key === 'Tab') {
    cursor.visible = true;
    const inLeft = cursor.x < PANELS.rightX;
    cursor.x = inLeft ? cursor.x + (PANELS.rightX - PANELS.leftX) : cursor.x - (PANELS.rightX - PANELS.leftX);
    return 'move';
  }
  return 'ignored';
}
