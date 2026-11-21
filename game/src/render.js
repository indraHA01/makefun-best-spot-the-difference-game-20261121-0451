// Pip's Mischief — the painter: HUD, the two pictures, markers, screens.
// The renderer owns no rules; it only paints the state game.js holds, so
// the same frame the screenshots stage is the frame a player sees.

import { FIELD, HUD, LEVELS, PANELS } from './config.js';
import {
  SCREEN_LEVEL_DONE,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TIME_UP,
  SCREEN_TITLE,
  SCREEN_WIN,
  changedSet,
  currentLevel,
  currentScene,
  remainingCount,
} from './game.js';
import { circle, line, rect, text } from './scenes.js';

export { SCREEN_LEVEL_DONE, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TIME_UP, SCREEN_TITLE, SCREEN_WIN };

/** Fit the fixed 1280x720 field into the window, letterboxed, and return the scale. */
export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  return { canvas, ctx };
}

export function fitCanvas(renderer) {
  const scale = Math.min(window.innerWidth / FIELD.width, window.innerHeight / FIELD.height);
  renderer.canvas.width = FIELD.width;
  renderer.canvas.height = FIELD.height;
  renderer.canvas.style.width = `${Math.floor(FIELD.width * scale)}px`;
  renderer.canvas.style.height = `${Math.floor(FIELD.height * scale)}px`;
  return scale;
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function drawHud(renderer, game) {
  const { ctx } = renderer;
  rect(ctx, 0, 0, FIELD.width, HUD.height, '#141021');
  rect(ctx, 0, HUD.height - 3, FIELD.width, 3, '#e8b64c');
  text(ctx, '🐾  PIP’S MISCHIEF', 24, 34, 30, '#ffd76a', 'left');
  text(ctx, 'a spot-the-difference hunt', 24, 66, 15, '#b8a8d8', 'left');
  // Room tabs.
  LEVELS.forEach((level, i) => {
    const x = 440 + i * 142;
    const active = i === game.levelIndex && game.screen !== SCREEN_TITLE;
    const done = i < game.levelIndex || game.screen === SCREEN_WIN;
    rect(ctx, x, 22, 132, 52, active ? '#e8b64c' : done ? '#3fa796' : '#2a2438');
    ctx.strokeStyle = '#e8b64c';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, 22, 132, 52);
    text(ctx, done ? '✓ ' : `${i + 1}. `, x + 10, 48, 16, active ? '#141021' : '#f6ead2', 'left');
    text(ctx, level.short, x + 30, 48, 14, active ? '#141021' : '#f6ead2', 'left');
  });
  // The counter the hunt is about: how many remain.
  const remain = remainingCount(game);
  const found = game.found.size;
  text(ctx, `FOUND  ${found} / 10`, 1000, 34, 24, '#f6ead2');
  text(ctx, remain === 0 ? 'all found!' : `${remain} still hiding`, 1000, 64, 16, remain <= 3 ? '#ffd76a' : '#b8a8d8');
  // Timer, score, hints.
  const low = game.timeLeft <= 30 && game.screen === SCREEN_PLAY;
  text(ctx, `⏱ ${formatTime(game.timeLeft)}`, 1185, 34, 24, low ? '#ff7a6a' : '#f6ead2');
  text(ctx, `★ ${game.score}`, 1185, 64, 16, '#ffd76a');
  text(ctx, `💡 hints: ${game.hintsLeft}`, 1000, 88, 13, '#b8a8d8');
  if (game.best > 0) text(ctx, `best ${game.best}`, 1185, 88, 13, '#b8a8d8');
}

function drawPanelFrame(renderer, game, side) {
  const { ctx } = renderer;
  const x = side === 'left' ? PANELS.leftX : PANELS.rightX;
  rect(ctx, x - 4, PANELS.y - 30, PANELS.width + 8, PANELS.height + 34, '#141021');
  ctx.strokeStyle = '#e8b64c';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 4, PANELS.y - 30, PANELS.width + 8, PANELS.height + 34);
  text(ctx, side === 'left' ? 'ORIGINAL' : 'PIP’S VERSION', x + PANELS.width / 2, PANELS.y - 14, 15, '#ffd76a');
}

/** A golden ring with the find's number, drawn on both pictures at once. */
function drawFoundMarker(ctx, diff, index, panelX) {
  const x = panelX + diff.x;
  const y = PANELS.y + diff.y;
  ctx.beginPath();
  ctx.arc(x, y, 26, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffd76a';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, 31, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,215,106,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
  circle(ctx, x, y - 30, 11, '#e8b64c');
  text(ctx, String(index + 1), x, y - 29, 13, '#141021');
}

function drawPanels(renderer, game) {
  const { ctx } = renderer;
  const scene = currentScene(game);
  drawPanelFrame(renderer, game, 'left');
  drawPanelFrame(renderer, game, 'right');
  const changed = changedSet(game);
  ctx.save();
  ctx.beginPath();
  ctx.rect(PANELS.leftX, PANELS.y, PANELS.width, PANELS.height);
  ctx.clip();
  ctx.translate(PANELS.leftX, PANELS.y);
  scene.draw(ctx, new Set());
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.rect(PANELS.rightX, PANELS.y, PANELS.width, PANELS.height);
  ctx.clip();
  ctx.translate(PANELS.rightX, PANELS.y);
  scene.draw(ctx, changed);
  ctx.restore();
  // Markers on both pictures, in find order.
  game.foundOrder.forEach((diff, i) => {
    drawFoundMarker(ctx, diff, i, PANELS.leftX);
    drawFoundMarker(ctx, diff, i, PANELS.rightX);
  });
  // Hint: a pulsing ring around one unfound difference, on both pictures.
  if (game.hint) {
    const pulse = 24 + Math.sin(game.hint.age * 6) * 5;
    [PANELS.leftX, PANELS.rightX].forEach((panelX) => {
      ctx.beginPath();
      ctx.arc(panelX + game.hint.diff.x, PANELS.y + game.hint.diff.y, pulse, 0, Math.PI * 2);
      ctx.strokeStyle = '#7ae8ff';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }
  // Wrong click: a red X where the player clicked.
  if (game.wrongFlash) {
    const a = 1 - game.wrongFlash.age / 0.6;
    ctx.globalAlpha = Math.max(0, a);
    line(ctx, game.wrongFlash.x - 14, game.wrongFlash.y - 14, game.wrongFlash.x + 14, game.wrongFlash.y + 14, '#ff7a6a', 5);
    line(ctx, game.wrongFlash.x + 14, game.wrongFlash.y - 14, game.wrongFlash.x - 14, game.wrongFlash.y + 14, '#ff7a6a', 5);
    ctx.globalAlpha = 1;
  }
  // Floating score popups.
  game.floats.forEach((f) => {
    ctx.globalAlpha = Math.max(0, 1 - f.age / 1.1);
    text(ctx, f.text, f.x, f.y, 20, f.colour);
    ctx.globalAlpha = 1;
  });
  // Keyboard crosshair.
  if (game.cursor.visible && game.screen === SCREEN_PLAY) {
    const { x, y } = game.cursor;
    circle(ctx, x, y, 3, '#ffd76a');
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawFooter(renderer, game) {
  const { ctx } = renderer;
  rect(ctx, 0, HUD.footerY, FIELD.width, HUD.footerHeight, '#141021');
  rect(ctx, 0, HUD.footerY, FIELD.width, 3, '#e8b64c');
  text(ctx, game.message, 24, HUD.footerY + 26, 17, '#f6ead2', 'left');
  const level = currentLevel(game);
  text(ctx, `${level.name}  •  click a difference on either picture  •  H hint  •  P pause  •  R restart  •  arrows + Enter play by keyboard`, 24, HUD.footerY + 56, 14, '#b8a8d8', 'left');
}

function dimScreen(renderer) {
  const { ctx } = renderer;
  rect(ctx, 0, 0, FIELD.width, FIELD.height, 'rgba(10,8,20,0.72)');
}

function panelCard(renderer, title, lines, accent) {
  const { ctx } = renderer;
  dimScreen(renderer);
  const w = 640;
  const h = 130 + lines.length * 30;
  const x = (FIELD.width - w) / 2;
  const y = (FIELD.height - h) / 2;
  rect(ctx, x, y, w, h, '#1d1830');
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);
  text(ctx, title, FIELD.width / 2, y + 46, 30, accent);
  lines.forEach((lineText, i) => {
    text(ctx, lineText, FIELD.width / 2, y + 96 + i * 30, 17, '#f6ead2');
  });
  return { x, y, w, h };
}

function drawTitle(renderer, game) {
  const { ctx } = renderer;
  // The study behind the title, unplayed and calm.
  drawPanels(renderer, { ...game, found: new Set(), foundOrder: [], hint: null, wrongFlash: null, floats: [], cursor: { visible: false } });
  dimScreen(renderer);
  text(ctx, '🐾  PIP’S MISCHIEF', FIELD.width / 2, 180, 52, '#ffd76a');
  text(ctx, 'A spot-the-difference hunt in three rooms', FIELD.width / 2, 232, 22, '#f6ead2');
  text(ctx, 'Pip the lighthouse cat has been nudging things out of place.', FIELD.width / 2, 266, 17, '#b8a8d8');
  text(ctx, 'Find all 10 differences in each room before the clock runs out.', FIELD.width / 2, 292, 17, '#b8a8d8');
  text(ctx, 'Click on either picture — a wrong click costs 5 seconds.', FIELD.width / 2, 318, 17, '#b8a8d8');
  rect(ctx, FIELD.width / 2 - 170, 350, 340, 56, '#e8b64c');
  text(ctx, '▶  START THE HUNT  (Enter)', FIELD.width / 2, 379, 20, '#141021');
  text(ctx, 'Rooms:  1 · The Keeper’s Study   2 · Lantern Night Market   3 · The Clockwork Workshop', FIELD.width / 2, 440, 16, '#f6ead2');
  text(ctx, 'H hint (−50)  •  P pause  •  R restart  •  arrows + Enter play by keyboard', FIELD.width / 2, 472, 15, '#b8a8d8');
  if (game.best > 0) text(ctx, `Best score so far: ${game.best}`, FIELD.width / 2, 506, 16, '#ffd76a');
  text(ctx, 'All art drawn in code — no pictures were harmed, only nudged.', FIELD.width / 2, 560, 14, '#8a7ba8');
}

/** Paint the whole frame for the game's current screen. */
export function draw(renderer, game) {
  const { ctx } = renderer;
  ctx.clearRect(0, 0, FIELD.width, FIELD.height);
  rect(ctx, 0, 0, FIELD.width, FIELD.height, '#141021');
  if (game.screen === SCREEN_TITLE) {
    drawTitle(renderer, game);
    return;
  }
  drawHud(renderer, game);
  drawPanels(renderer, game);
  drawFooter(renderer, game);
  if (game.screen === SCREEN_PAUSED) {
    panelCard(renderer, '⏸  PAUSED', ['Pip is waiting patiently…', 'Press P or Esc to keep hunting.'], '#e8b64c');
  } else if (game.screen === SCREEN_LEVEL_DONE) {
    const level = currentLevel(game);
    panelCard(renderer, `✓  ${level.name} — cleared!`, [
      `All 10 differences found. Time bonus +${game.levelDoneBonus}.`,
      `Score ${game.score}  •  best streak ${game.bestStreak}  •  mistakes ${game.mistakes}`,
      'Press N or Enter for the next room — Pip has been busy there too.',
    ], '#3fa796');
  } else if (game.screen === SCREEN_TIME_UP) {
    panelCard(renderer, '⏱  OUT OF TIME', [
      `Pip got away with ${remainingCount(game)} differences still hiding.`,
      'Press R or Enter to try the room again.',
    ], '#ff7a6a');
  } else if (game.screen === SCREEN_WIN) {
    const minutes = Math.floor(game.totalTime / 60);
    const seconds = Math.round(game.totalTime % 60);
    panelCard(renderer, '🏆  PIP IS CAUGHT!', [
      'All 30 differences found across the three rooms.',
      `Final score ${game.score}  •  best ${game.best}  •  ${minutes}m ${seconds}s of hunting`,
      `Best streak ${game.bestStreak}  •  ${game.mistakes} wrong clicks  •  ${game.hintsUsed} hints used`,
      'Press R or Enter to hunt again — Pip is already planning new mischief.',
    ], '#ffd76a');
  }
}
