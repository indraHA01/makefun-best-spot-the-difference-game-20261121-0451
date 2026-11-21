// Pip's Mischief — a spot-the-difference hunt in three hand-drawn rooms.
// Every tuning number, colour and layout constant lives here, so no rule
// below depends on the screen size: the playfield is a fixed 1280x720
// logical area and the renderer scales it to the window.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second. */
export const STEP = 1 / 60;

/** The two picture panels, in logical coordinates. */
export const PANELS = {
  width: 604,
  height: 520,
  y: 108,
  leftX: 24,
  rightX: 652,
  gap: 24,
};

/** Header bar (title, counter, timer, score) and footer bar geometry. */
export const HUD = { height: 96, footerY: 640, footerHeight: 80 };

/** How many differences each room hides, and the hunt's time budget. */
export const DIFFS_PER_LEVEL = 10;
export const LEVEL_TIME = [180, 180, 150];

export const SCORE = {
  find: 100,
  streakBonus: 10,
  wrong: -25,
  hint: -50,
  timeBonusPerSecond: 5,
};

export const HINTS_PER_LEVEL = 3;
export const WRONG_TIME_PENALTY = 5;
export const HINT_REVEAL_SECONDS = 4;
export const WRONG_FLASH_SECONDS = 0.6;

/** The three rooms, easiest first: the hunt gets harder as Pip gets bolder. */
export const LEVELS = [
  {
    id: 'study',
    name: "The Keeper's Study",
    short: 'Study',
    subtitle: 'Pip napped on the rug — and nudged ten things out of place.',
    sky: '#1d2b4a',
    wall: '#7a5a3c',
    floor: '#5d4128',
  },
  {
    id: 'market',
    name: 'Lantern Night Market',
    short: 'Night Market',
    subtitle: 'Pip slipped between the stalls and swapped ten little things.',
    sky: '#141a38',
    wall: '#3c2a4a',
    floor: '#2e2138',
  },
  {
    id: 'workshop',
    name: 'The Clockwork Workshop',
    short: 'Workshop',
    subtitle: 'Pip chased a gear across the bench — ten things are not as they were.',
    sky: '#20242c',
    wall: '#4a4640',
    floor: '#33302b',
  },
];

export const BEST_KEY = 'pips-mischief-best';

/** Shared palette for the hand-drawn art: warm lamp-light against night blue. */
export const PALETTE = {
  cream: '#f6ead2',
  paper: '#efe3c2',
  ink: '#2b2118',
  gold: '#e8b64c',
  teal: '#3fa796',
  red: '#d9534f',
  green: '#5da271',
  blue: '#4a7fb5',
  woodDark: '#4a3220',
  wood: '#6e4a2c',
  brass: '#c9973f',
  night: '#10182e',
  star: '#ffe9a8',
};

/** How close a click must land to a difference's heart to count, in panel px. */
export const HIT_RADIUS = 34;

/** Keyboard bindings, shown on the title screen and the footer bar. */
export const KEYS = {
  hint: 'h',
  pause: 'p',
  restart: 'r',
  next: 'n',
  confirm: 'Enter',
  click: ' ',
};

export const SHOT_NAMES = ['cover', 'market', 'workshop', 'victory'];
