// Pip's Mischief — the three rooms, drawn entirely in code.
// Each scene is one function that paints a panel (604x520, panel-local
// coordinates) from primitives: no image is loaded, so the left and right
// pictures are the same drawing with a set of `changed` differences
// applied. A difference is a small, fair visual change with a fixed
// hotspot (x, y, r) the click test uses.

import { PALETTE as P } from './config.js';

/** Small canvas helpers so each scene reads like a sketch, not arithmetic. */
export function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

export function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

export function star(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    const rr = i % 2 === 0 ? r : r * 0.45;
    ctx[i === 0 ? 'moveTo' : 'lineTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

export function text(ctx, s, x, y, size, fill, align = 'center') {
  ctx.font = `bold ${size}px Georgia, serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fill;
  ctx.fillText(s, x, y);
}

function roomShell(ctx, wall, floor) {
  rect(ctx, 0, 0, 604, 380, wall);
  rect(ctx, 0, 380, 604, 140, floor);
  rect(ctx, 0, 372, 604, 8, '#3a2a1a');
  // floorboards
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 2;
  for (let y = 400; y < 520; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(604, y);
    ctx.stroke();
  }
}

function windowFrame(ctx, x, y, w, h) {
  rect(ctx, x - 8, y - 8, w + 16, h + 16, P.woodDark);
  rect(ctx, x, y, w, h, '#0e1a33');
  line(ctx, x + w / 2, y, x + w / 2, y + h, P.woodDark, 6);
  line(ctx, x, y + h / 2, x + w, y + h / 2, P.woodDark, 6);
}

function lighthouse(ctx, x, y, scale, beam) {
  // A striped tower with a lit lamp room, seen through the window.
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#e8e0cc';
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(-9, -72);
  ctx.lineTo(9, -72);
  ctx.lineTo(14, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = P.red;
  ctx.fillRect(-12, -26, 24, 12);
  ctx.fillRect(-10, -58, 20, 10);
  rect(ctx, -12, -84, 24, 12, P.ink);
  circle(ctx, 0, -78, 7, P.gold);
  if (beam) {
    ctx.fillStyle = 'rgba(255,233,168,0.35)';
    ctx.beginPath();
    ctx.moveTo(0, -78);
    ctx.lineTo(120, -100);
    ctx.lineTo(120, -56);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** Scene 1 — The Keeper's Study. Ten differences, the gentlest hunt. */
export const STUDY_DIFFS = [
  { id: 'lamp-shade', label: 'the lamp shade changed colour', x: 118, y: 296, r: 30 },
  { id: 'clock-hands', label: 'the clock shows a different time', x: 330, y: 92, r: 30 },
  { id: 'book-stack', label: 'a book vanished from the pile', x: 258, y: 330, r: 32 },
  { id: 'cup-steam', label: 'the tea stopped steaming', x: 424, y: 318, r: 26 },
  { id: 'moon', label: 'the moon changed shape', x: 92, y: 66, r: 28 },
  { id: 'plant-leaves', label: 'the plant lost a leaf', x: 568, y: 424, r: 32 },
  { id: 'map-pin', label: 'the red pin fell off the map', x: 292, y: 198, r: 24 },
  { id: 'cat-tail', label: "Pip's tail uncurled", x: 336, y: 482, r: 32 },
  { id: 'candle-flame', label: 'the candle went out', x: 198, y: 312, r: 24 },
  { id: 'picture', label: 'the framed picture changed', x: 522, y: 272, r: 32 },
];

export function drawStudy(ctx, changed) {
  roomShell(ctx, '#7a5a3c', '#5d4128');
  // Window: night sea, lighthouse, and the moon Pip keeps nudging.
  // The beam is clipped to the window so it never spills onto the wall.
  windowFrame(ctx, 40, 30, 190, 180);
  ctx.save();
  ctx.beginPath();
  ctx.rect(40, 30, 190, 180);
  ctx.clip();
  rect(ctx, 40, 160, 190, 50, '#16324f');
  lighthouse(ctx, 190, 205, 0.9, true);
  // moon: crescent normally, full when changed
  circle(ctx, 92, 66, 22, P.star);
  if (!changed.has('moon')) circle(ctx, 102, 60, 19, '#0e1a33');
  star(ctx, 70, 120, 5, P.star);
  star(ctx, 150, 100, 4, P.star);
  star(ctx, 205, 60, 4, P.star);
  // sea line
  line(ctx, 40, 160, 230, 160, '#2c5a7a', 3);
  ctx.restore();

  // Wall clock: 3 o'clock normally, half past four when changed.
  circle(ctx, 330, 92, 34, P.cream);
  circle(ctx, 330, 92, 34, 'rgba(0,0,0,0)');
  ctx.strokeStyle = P.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(330, 92, 34, 0, Math.PI * 2);
  ctx.stroke();
  if (changed.has('clock-hands')) {
    line(ctx, 330, 92, 330, 70, P.ink, 4);
    line(ctx, 330, 92, 312, 100, P.ink, 4);
  } else {
    line(ctx, 330, 92, 330, 70, P.ink, 4);
    line(ctx, 330, 92, 350, 92, P.ink, 4);
  }
  circle(ctx, 330, 92, 4, P.ink);

  // Map of the coast, with a red pin — unless Pip knocked it off.
  rect(ctx, 252, 158, 86, 84, P.paper);
  ctx.strokeStyle = P.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(252, 158, 86, 84);
  line(ctx, 258, 220, 290, 190, '#7a9cc6', 5);
  line(ctx, 290, 190, 330, 210, '#7a9cc6', 5);
  line(ctx, 262, 170, 300, 175, '#b5a06a', 4);
  if (!changed.has('map-pin')) {
    circle(ctx, 292, 198, 6, P.red);
    circle(ctx, 292, 198, 2, '#fff');
  }

  // Bookshelf, three shelves of sleepy books.
  rect(ctx, 380, 30, 200, 270, P.woodDark);
  const shelfBooks = ['#a34d3f', '#3f6d8e', '#5da271', '#c9973f', '#7a5a8e', '#4a7fb5'];
  for (let shelf = 0; shelf < 3; shelf += 1) {
    const y = 52 + shelf * 82;
    rect(ctx, 388, y + 62, 184, 8, P.wood);
    let bx = 392;
    for (let b = 0; b < 6; b += 1) {
      const w = 22 + ((b * 7 + shelf * 3) % 10);
      rect(ctx, bx, y + 8, w, 54, shelfBooks[(b + shelf) % shelfBooks.length]);
      bx += w + 4;
    }
  }

  // Framed picture: a lighthouse normally, a sailboat when changed.
  rect(ctx, 482, 232, 80, 80, P.gold);
  rect(ctx, 490, 240, 64, 64, '#274b6d');
  if (changed.has('picture')) {
    line(ctx, 522, 292, 522, 252, '#6e4a2c', 3);
    ctx.fillStyle = P.cream;
    ctx.beginPath();
    ctx.moveTo(522, 250);
    ctx.lineTo(542, 288);
    ctx.lineTo(502, 288);
    ctx.closePath();
    ctx.fill();
  } else {
    lighthouse(ctx, 522, 300, 0.42, false);
  }

  // Desk.
  rect(ctx, 60, 340, 480, 16, P.wood);
  rect(ctx, 76, 356, 14, 114, P.woodDark);
  rect(ctx, 510, 356, 14, 114, P.woodDark);
  rect(ctx, 60, 356, 480, 8, P.woodDark);

  // Lamp with a shade Pip repaints: teal normally, red when changed.
  rect(ctx, 112, 330, 12, 12, P.brass);
  line(ctx, 118, 330, 118, 306, P.brass, 4);
  ctx.fillStyle = changed.has('lamp-shade') ? P.red : P.teal;
  ctx.beginPath();
  ctx.moveTo(96, 306);
  ctx.lineTo(140, 306);
  ctx.lineTo(132, 282);
  ctx.lineTo(104, 282);
  ctx.closePath();
  ctx.fill();
  circle(ctx, 118, 312, 8, 'rgba(255,233,168,0.85)');

  // Candle: lit normally, its flame gone when changed.
  rect(ctx, 192, 322, 12, 20, P.cream);
  if (!changed.has('candle-flame')) {
    ellipse(ctx, 198, 314, 5, 9, '#ff9d2e');
    ellipse(ctx, 198, 316, 3, 5, '#ffe9a8');
  }

  // Pile of books: four normally, three when changed.
  const pile = changed.has('book-stack') ? 3 : 4;
  const pileCols = ['#a34d3f', '#3f6d8e', '#5da271', '#c9973f'];
  for (let i = 0; i < pile; i += 1) {
    rect(ctx, 232, 330 - i * 9, 58, 8, pileCols[i]);
  }

  // Teapot and cup; the cup steams unless Pip cooled it.
  ellipse(ctx, 400, 336, 22, 12, '#7a9cc6');
  line(ctx, 420, 330, 432, 322, '#7a9cc6', 4);
  rect(ctx, 388, 318, 10, 10, '#7a9cc6');
  ellipse(ctx, 424, 338, 12, 7, P.cream);
  if (!changed.has('cup-steam')) {
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(420, 326);
    ctx.quadraticCurveTo(414, 314, 420, 304);
    ctx.moveTo(430, 326);
    ctx.quadraticCurveTo(436, 314, 430, 304);
    ctx.stroke();
  }

  // Ink bottle and quill.
  rect(ctx, 468, 326, 16, 16, '#2b3a55');
  line(ctx, 486, 326, 500, 306, P.cream, 3);

  // Rug and Pip the cat, tail curled — unless it is not.
  ellipse(ctx, 300, 486, 150, 26, '#a34d3f');
  ellipse(ctx, 300, 486, 118, 18, '#c97b5a');
  ellipse(ctx, 282, 478, 34, 16, '#e8a34c');
  circle(ctx, 256, 470, 14, '#e8a34c');
  ctx.fillStyle = '#e8a34c';
  ctx.beginPath();
  ctx.moveTo(248, 460);
  ctx.lineTo(244, 448);
  ctx.lineTo(254, 456);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(262, 458);
  ctx.lineTo(264, 446);
  ctx.lineTo(268, 456);
  ctx.closePath();
  ctx.fill();
  if (changed.has('cat-tail')) {
    line(ctx, 312, 482, 348, 470, '#e8a34c', 7);
  } else {
    ctx.beginPath();
    ctx.arc(322, 478, 14, -0.4, Math.PI * 1.1);
    ctx.strokeStyle = '#e8a34c';
    ctx.lineWidth = 7;
    ctx.stroke();
  }

  // Potted plant by the desk: five leaves normally, four when changed.
  rect(ctx, 552, 452, 34, 30, '#a34d3f');
  const leaves = changed.has('plant-leaves') ? 4 : 5;
  for (let i = 0; i < leaves; i += 1) {
    const a = -Math.PI / 2 + (i - (leaves - 1) / 2) * 0.5;
    line(ctx, 569, 452, 569 + Math.cos(a) * 34, 452 + Math.sin(a) * 34, P.green, 7);
  }
}

/** Scene 2 — Lantern Night Market. Ten differences, a busier hunt. */
export const MARKET_DIFFS = [
  { id: 'lantern-colour', label: 'a lantern changed colour', x: 300, y: 72, r: 26 },
  { id: 'lantern-count', label: 'a lantern vanished from the string', x: 180, y: 72, r: 26 },
  { id: 'fish-count', label: 'a fish went missing from the stall', x: 480, y: 300, r: 28 },
  { id: 'banner-emblem', label: 'the banner emblem changed shape', x: 300, y: 200, r: 26 },
  { id: 'market-cat', label: 'the cat left its crate', x: 120, y: 420, r: 30 },
  { id: 'apples', label: 'an apple rolled away', x: 120, y: 300, r: 28 },
  { id: 'market-moon', label: 'the moon changed shape', x: 540, y: 60, r: 26 },
  { id: 'awning-stripes', label: 'the awning lost a stripe', x: 120, y: 182, r: 28 },
  { id: 'puddle', label: 'the puddle dried up', x: 330, y: 482, r: 30 },
  { id: 'balloon', label: 'a balloon floated away', x: 480, y: 92, r: 28 },
];

function lantern(ctx, x, y, colour) {
  line(ctx, x, y - 18, x, y - 8, '#d8c9a0', 2);
  ellipse(ctx, x, y, 16, 20, colour);
  rect(ctx, x - 6, y - 24, 12, 6, P.gold);
  rect(ctx, x - 6, y + 18, 12, 6, P.gold);
  circle(ctx, x, y, 5, 'rgba(255,233,168,0.9)');
}

export function drawMarket(ctx, changed) {
  roomShell(ctx, '#3c2a4a', '#2e2138');
  // Night sky above the stalls, stars and a moon Pip keeps reshaping.
  rect(ctx, 0, 0, 604, 150, '#141a38');
  star(ctx, 40, 40, 5, P.star);
  star(ctx, 120, 90, 4, P.star);
  star(ctx, 250, 30, 4, P.star);
  star(ctx, 380, 100, 5, P.star);
  star(ctx, 470, 30, 4, P.star);
  circle(ctx, 540, 60, 20, P.star);
  if (!changed.has('market-moon')) circle(ctx, 549, 54, 17, '#141a38');

  // String of paper lanterns across the street.
  ctx.strokeStyle = '#d8c9a0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 40);
  ctx.quadraticCurveTo(302, 90, 584, 40);
  ctx.stroke();
  const lanternXs = [60, 180, 300, 420, 540];
  const lanternCols = ['#d9534f', '#e8b64c', '#d9534f', '#3fa796', '#e8b64c'];
  lanternXs.forEach((x, i) => {
    if (changed.has('lantern-count') && i === 1) return;
    let colour = lanternCols[i];
    if (changed.has('lantern-colour') && i === 2) colour = P.green;
    lantern(ctx, x, 72, colour);
  });

  // A balloon that floats away when Pip bats at its string.
  if (!changed.has('balloon')) {
    line(ctx, 480, 116, 480, 150, '#d8c9a0', 2);
    ellipse(ctx, 480, 92, 18, 24, '#7a5a8e');
    ctx.beginPath();
    ctx.moveTo(480, 116);
    ctx.lineTo(474, 124);
    ctx.lineTo(486, 124);
    ctx.closePath();
    ctx.fillStyle = '#7a5a8e';
    ctx.fill();
  }

  // Left stall: striped awning, basket of apples.
  const stripes = changed.has('awning-stripes') ? 5 : 6;
  for (let i = 0; i < stripes; i += 1) {
    rect(ctx, 40 + i * (170 / stripes), 150, 170 / stripes, 34, i % 2 === 0 ? '#d9534f' : P.cream);
  }
  rect(ctx, 40, 184, 170, 8, P.woodDark);
  rect(ctx, 48, 192, 10, 140, P.woodDark);
  rect(ctx, 192, 192, 10, 140, P.woodDark);
  rect(ctx, 48, 320, 154, 12, P.wood);
  // apples: five normally, four when changed
  const apples = changed.has('apples') ? 4 : 5;
  for (let i = 0; i < apples; i += 1) {
    circle(ctx, 78 + i * 26, 306, 11, '#d9534f');
    line(ctx, 78 + i * 26, 296, 82 + i * 26, 288, P.green, 3);
  }
  text(ctx, 'APPLES', 125, 352, 14, P.cream);

  // Hanging banner between the stalls: a moon emblem, or a star.
  rect(ctx, 252, 170, 96, 64, '#274b6d');
  ctx.strokeStyle = P.gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(252, 170, 96, 64);
  if (changed.has('banner-emblem')) {
    star(ctx, 300, 202, 18, P.gold);
  } else {
    circle(ctx, 300, 202, 16, P.gold);
    circle(ctx, 306, 198, 13, '#274b6d');
  }

  // Right stall: the fishmonger, three fish on ice — or two.
  rect(ctx, 400, 150, 170, 34, '#3fa796');
  rect(ctx, 400, 184, 170, 8, P.woodDark);
  rect(ctx, 408, 192, 10, 140, P.woodDark);
  rect(ctx, 552, 192, 10, 140, P.woodDark);
  rect(ctx, 408, 320, 154, 12, P.wood);
  rect(ctx, 420, 260, 130, 60, '#bcd6e8');
  const fish = changed.has('fish-count') ? 2 : 3;
  for (let i = 0; i < fish; i += 1) {
    const fx = 448 + i * 44;
    ellipse(ctx, fx, 290, 18, 9, '#7a9cc6');
    ctx.fillStyle = '#7a9cc6';
    ctx.beginPath();
    ctx.moveTo(fx + 16, 290);
    ctx.lineTo(fx + 26, 282);
    ctx.lineTo(fx + 26, 298);
    ctx.closePath();
    ctx.fill();
    circle(ctx, fx - 10, 288, 2, P.ink);
  }
  text(ctx, 'FISH', 485, 352, 14, P.cream);

  // Crates, and the market cat — unless it wandered off.
  rect(ctx, 70, 420, 90, 52, '#6e4a2c');
  rect(ctx, 70, 420, 90, 10, '#8a6238');
  if (!changed.has('market-cat')) {
    ellipse(ctx, 115, 414, 26, 12, '#3a3a3a');
    circle(ctx, 94, 406, 11, '#3a3a3a');
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.moveTo(88, 398);
    ctx.lineTo(86, 388);
    ctx.lineTo(94, 394);
    ctx.closePath();
    ctx.fill();
    line(ctx, 138, 414, 158, 402, '#3a3a3a', 5);
  }

  // A puddle catching the lantern light — or dry cobbles.
  if (!changed.has('puddle')) {
    ellipse(ctx, 330, 482, 62, 12, 'rgba(122,156,198,0.55)');
    ellipse(ctx, 330, 482, 40, 7, 'rgba(255,233,168,0.35)');
  }
  // Cobbles.
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i += 1) {
    ctx.beginPath();
    ctx.arc(60 + i * 70, 440, 14, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/** Scene 3 — The Clockwork Workshop. Ten differences, the hardest hunt. */
export const WORKSHOP_DIFFS = [
  { id: 'gear-teeth', label: 'the big gear lost a tooth', x: 140, y: 120, r: 32 },
  { id: 'robot-eye', label: 'the robot winked', x: 330, y: 250, r: 26 },
  { id: 'bulb', label: 'the lamp went dark', x: 480, y: 90, r: 28 },
  { id: 'wrench', label: 'the wrench moved to the wall', x: 200, y: 400, r: 28 },
  { id: 'blueprint', label: 'the blueprint unrolled', x: 440, y: 420, r: 28 },
  { id: 'workshop-clock', label: 'the workshop clock changed', x: 520, y: 200, r: 28 },
  { id: 'oil-spout', label: 'the oil can points the other way', x: 290, y: 400, r: 26 },
  { id: 'screws-jar', label: 'half the screws are gone', x: 380, y: 400, r: 26 },
  { id: 'antenna-ball', label: "the robot's antenna changed colour", x: 330, y: 205, r: 22 },
  { id: 'poster', label: 'the poster changed picture', x: 90, y: 280, r: 30 },
];

function gear(ctx, x, y, r, teeth, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i += 1) {
    const a = (i * Math.PI) / teeth;
    const rr = i % 2 === 0 ? r : r * 0.78;
    ctx[i === 0 ? 'moveTo' : 'lineTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  circle(ctx, x, y, r * 0.32, '#33302b');
}

export function drawWorkshop(ctx, changed) {
  roomShell(ctx, '#4a4640', '#33302b');
  // Big wall gear: eight teeth normally, seven when changed.
  gear(ctx, 140, 120, 62, changed.has('gear-teeth') ? 7 : 8, P.brass);
  gear(ctx, 226, 176, 34, 6, '#8a7a5a');
  // Workshop poster: a gear normally, a star when changed.
  rect(ctx, 50, 240, 84, 84, P.paper);
  ctx.strokeStyle = P.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 240, 84, 84);
  if (changed.has('poster')) {
    star(ctx, 92, 282, 22, P.red);
  } else {
    gear(ctx, 92, 282, 24, 6, P.blue);
  }
  // Small window with a night sky.
  windowFrame(ctx, 440, 30, 130, 110);
  star(ctx, 470, 60, 4, P.star);
  star(ctx, 520, 90, 5, P.star);
  star(ctx, 545, 55, 4, P.star);

  // Hanging bulb: lit with a warm glow, or dark when changed.
  line(ctx, 480, 30, 480, 66, P.ink, 3);
  if (!changed.has('bulb')) {
    circle(ctx, 480, 88, 34, 'rgba(255,233,168,0.25)');
    circle(ctx, 480, 88, 22, 'rgba(255,233,168,0.5)');
  }
  circle(ctx, 480, 88, 14, changed.has('bulb') ? '#6a6a6a' : '#ffe9a8');
  rect(ctx, 472, 70, 16, 8, P.ink);

  // Workshop clock: ten past ten normally, twenty past four when changed.
  circle(ctx, 520, 200, 30, P.cream);
  ctx.strokeStyle = P.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(520, 200, 30, 0, Math.PI * 2);
  ctx.stroke();
  if (changed.has('workshop-clock')) {
    line(ctx, 520, 200, 520, 180, P.ink, 3);
    line(ctx, 520, 200, 534, 214, P.ink, 3);
  } else {
    line(ctx, 520, 200, 506, 184, P.ink, 3);
    line(ctx, 520, 200, 534, 186, P.ink, 3);
  }
  circle(ctx, 520, 200, 3, P.ink);

  // The wrench: on the bench normally, hung on the wall when changed.
  if (changed.has('wrench')) {
    line(ctx, 200, 250, 200, 300, '#b8b0a0', 6);
    circle(ctx, 200, 246, 10, '#b8b0a0');
    circle(ctx, 200, 246, 5, '#4a4640');
    rect(ctx, 194, 296, 12, 10, '#b8b0a0');
  }

  // Workbench.
  rect(ctx, 40, 380, 524, 16, P.wood);
  rect(ctx, 56, 396, 14, 76, P.woodDark);
  rect(ctx, 534, 396, 14, 76, P.woodDark);

  // Pip's robot, bolted together from spare parts.
  // Antenna ball: red normally, blue when changed.
  line(ctx, 330, 232, 330, 210, '#b8b0a0', 4);
  circle(ctx, 330, 205, 7, changed.has('antenna-ball') ? P.blue : P.red);
  // Head.
  rect(ctx, 296, 232, 68, 44, '#7a9cc6');
  rect(ctx, 296, 232, 68, 10, '#5a7ca6');
  // Eyes: both open normally, one winking when changed.
  circle(ctx, 316, 252, 7, P.cream);
  circle(ctx, 344, 252, 7, P.cream);
  circle(ctx, 316, 252, 3, P.ink);
  if (changed.has('robot-eye')) {
    line(ctx, 338, 252, 350, 252, P.ink, 3);
  } else {
    circle(ctx, 344, 252, 3, P.ink);
  }
  line(ctx, 318, 268, 342, 268, P.ink, 3);
  // Body with rivets and a gauge.
  rect(ctx, 292, 276, 76, 64, '#5da271');
  circle(ctx, 300, 284, 3, P.ink);
  circle(ctx, 360, 284, 3, P.ink);
  circle(ctx, 330, 308, 14, P.cream);
  line(ctx, 330, 308, 338, 298, P.red, 3);
  // Arms.
  line(ctx, 292, 292, 262, 320, '#b8b0a0', 8);
  line(ctx, 368, 292, 398, 320, '#b8b0a0', 8);
  circle(ctx, 262, 322, 8, '#b8b0a0');
  circle(ctx, 398, 322, 8, '#b8b0a0');
  // Legs.
  line(ctx, 312, 340, 312, 378, '#b8b0a0', 10);
  line(ctx, 348, 340, 348, 378, '#b8b0a0', 10);
  rect(ctx, 300, 374, 26, 8, P.ink);
  rect(ctx, 336, 374, 26, 8, P.ink);

  // Oil can: spout left normally, right when changed.
  rect(ctx, 272, 392, 34, 22, '#c9973f');
  if (changed.has('oil-spout')) {
    line(ctx, 306, 398, 322, 390, '#c9973f', 5);
  } else {
    line(ctx, 272, 398, 256, 390, '#c9973f', 5);
  }
  rect(ctx, 282, 384, 12, 10, '#c9973f');

  // Jar of screws: full normally, half empty when changed.
  rect(ctx, 362, 392, 36, 26, 'rgba(188,214,232,0.7)');
  ctx.strokeStyle = P.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(362, 392, 36, 26);
  const screwLevel = changed.has('screws-jar') ? 408 : 398;
  for (let i = 0; i < 8; i += 1) {
    circle(ctx, 368 + (i % 4) * 9, screwLevel + Math.floor(i / 4) * 8, 2.5, '#5a5a5a');
  }

  // Blueprint: rolled up normally, unrolled flat when changed.
  if (changed.has('blueprint')) {
    rect(ctx, 420, 404, 84, 26, P.paper);
    line(ctx, 430, 412, 494, 412, P.blue, 2);
    line(ctx, 430, 420, 470, 420, P.blue, 2);
    circle(ctx, 488, 420, 5, P.red);
  } else {
    ellipse(ctx, 462, 416, 34, 10, P.paper);
    line(ctx, 428, 416, 496, 416, '#b5a06a', 2);
  }

  // Spare gears and a mug on the bench.
  gear(ctx, 530, 400, 14, 6, '#8a7a5a');
  rect(ctx, 90, 396, 22, 20, P.red);
  line(ctx, 112, 402, 120, 402, P.red, 4);
}

/** Every room in play order: its art, its ten differences, its name. */
export const SCENES = [
  { draw: drawStudy, diffs: STUDY_DIFFS },
  { draw: drawMarket, diffs: MARKET_DIFFS },
  { draw: drawWorkshop, diffs: WORKSHOP_DIFFS },
];
