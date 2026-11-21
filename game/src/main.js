// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps, and the renderer paints what is there. The game moves
// between six screens: title, play, paused, level done, time up and win.
//
// ?seed=N is accepted for future use; ?shot=cover|market|workshop|victory
// (with &seed=N) stages that scene instead of running the loop, paints it
// twice and sets window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import {
  SCREEN_LEVEL_DONE,
  SCREEN_PLAY,
  SCREEN_TIME_UP,
  SCREEN_WIN,
  clickAt,
  createGame,
  handleKey,
  update,
} from './game.js';
import { createRenderer, draw, fitCanvas } from './render.js';
import { freshGameForShot, stageShot } from './shots.js';
import { playFound, playHint, playLevelDone, playTimeUp, playWin, playWrong } from './sound.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const renderer = createRenderer(canvas);
const game = shot ? freshGameForShot() : createGame(readBest());

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

/** Map a mouse event to logical field coordinates, through the letterbox. */
function toLogical(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function announce(text) {
  status.textContent = text;
}

canvas.addEventListener('pointerdown', (event) => {
  const { x, y } = toLogical(event);
  const before = game.screen;
  const result = clickAt(game, x, y);
  if (result === 'found') playFound();
  if (result === 'wrong') playWrong();
  if (game.screen === SCREEN_LEVEL_DONE && before === SCREEN_PLAY) playLevelDone();
  if (game.screen === SCREEN_WIN && before === SCREEN_PLAY) playWin();
  if (result !== 'ignored') announce(game.message);
});

canvas.addEventListener('pointermove', (event) => {
  const { x, y } = toLogical(event);
  game.cursor.x = x;
  game.cursor.y = y;
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') event.preventDefault();
  if (event.key === ' ' || event.key.startsWith('Arrow')) event.preventDefault();
  const before = game.screen;
  const result = handleKey(game, event.key);
  if (result === 'retry' || result === 'restart' || result === 'start') timeUpPlayed = false;
  if (result === 'found') playFound();
  if (result === 'wrong') playWrong();
  if (result === 'hint') playHint();
  if (game.screen === SCREEN_LEVEL_DONE && before === SCREEN_PLAY) playLevelDone();
  if (game.screen === SCREEN_WIN && before === SCREEN_PLAY) playWin();
  if (game.screen === SCREEN_TIME_UP && before === SCREEN_PLAY) playTimeUp();
  if (result === 'start') announce('The hunt begins — find all 10 differences!');
  else if (result !== 'ignored') announce(game.message);
});

window.addEventListener('resize', () => fitCanvas(renderer));

/** The main loop: fixed-step updates, one paint per frame. */
let last = performance.now();
let accumulator = 0;
function frame(now) {
  const elapsed = Math.min(0.25, (now - last) / 1000);
  last = now;
  accumulator += elapsed;
  while (accumulator >= STEP) {
    update(game, STEP);
    accumulator -= STEP;
  }
  if (game.screen === SCREEN_TIME_UP) playTimeUpOnce();
  draw(renderer, game);
  requestAnimationFrame(frame);
}

let timeUpPlayed = false;
function playTimeUpOnce() {
  if (timeUpPlayed) return;
  timeUpPlayed = true;
  playTimeUp();
  saveBest(game.best);
}

if (shot) {
  // A staged screenshot: paint the scene twice, then signal readiness.
  stageShot(shot, game);
  fitCanvas(renderer);
  draw(renderer, game);
  draw(renderer, game);
  window.__shotReady = true;
} else {
  fitCanvas(renderer);
  announce('Pip’s Mischief — press Enter to start the hunt.');
  requestAnimationFrame(frame);
}
