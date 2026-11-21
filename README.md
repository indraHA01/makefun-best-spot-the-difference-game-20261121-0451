[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/indraHA01/makefun-best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/indraHA01/makefun-best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

# 🐾 Pip's Mischief — A Spot-the-Difference Hunt

**Pip's Mischief** is an original spot-the-difference game built for the [make.fun](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451) **best-spot-the-difference-game-20261121-0451** bounty ("Make the best spot the difference game"). It plays offline in desktop Chrome from static files — no build step, no network request, no library.

Pip the lighthouse cat has been nudging things out of place. Hunt down all **10 differences in each of three hand-drawn rooms** — the Keeper's Study, the Lantern Night Market, and the Clockwork Workshop — before the clock runs out. Every picture is drawn in code (canvas primitives only): no borrowed art, no copied levels, no commercial characters.

## How to play

- **Two near-identical pictures, side by side.** Click a difference on either picture — a golden ring marks it on both, with a number showing the order you found it.
- **The counter never lies:** the header shows `FOUND 4 / 10` and how many are still hiding, so you always know where the hunt stands.
- **Wrong clicks cost you:** −25 points and −5 seconds, with a red X where you clicked.
- **Hints behave:** press **H** (3 per room, −50 points) and one unfound difference pulses on both pictures for a few seconds.
- **Time pressure you can feel:** each room has its own countdown (3:00 / 3:00 / 2:30); finishing fast pays a time bonus of +5 per second left.
- **Keyboard play:** arrow keys move a crosshair, Enter/Space clicks it, Tab jumps between pictures, P pauses, R restarts the room, N moves on.
- **Streaks pay:** consecutive finds without a miss add a growing bonus; the hunt tracks your best score locally.

## The three rooms

1. **The Keeper's Study** — a lamp that changes colour, a clock showing a different time, a book that vanished from the pile, tea that stopped steaming, a moon that changed shape, a plant short one leaf, a pin fallen off the map, a cat's tail uncurled, a candle gone out, and a framed picture that is no longer a lighthouse.
2. **Lantern Night Market** — a lantern that changed colour, one missing from its string, a fish gone from the stall, a banner emblem turned from moon to star, a cat that left its crate, a rolled-away apple, a moon reshaped, an awning short a stripe, a puddle dried up, and a balloon that floated away.
3. **The Clockwork Workshop** — the hardest room: a gear missing a tooth, a robot that winked, a lamp gone dark, a wrench moved to the wall, a blueprint unrolled, a clock changed, an oil can pointing the other way, a jar half empty of screws, an antenna ball repainted, and a poster with a new picture.

## Feel and polish

- A two-note chime on every find, a soft buzz on a miss, arpeggios for a cleared room and a fanfare for the win — all synthesized with WebAudio, no audio files.
- Floating `+100` popups, a pulsing hint ring, a red X flash on wrong clicks, and a level-clear card naming your score, best streak and mistakes.
- Sounds, art, names and story are all original to this entry.

## Run it

```sh
node serve.ts          # serves game/ on http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-game.ts`.

## Structure

- `game/index.html` — the page: a full-window canvas, nothing else.
- `game/src/config.js` — every tuning number, colour and layout constant.
- `game/src/scenes.js` — the three rooms, drawn in code, and their ten differences each.
- `game/src/game.js` — the hunt: state, clicks, scoring, timer, hints, keyboard.
- `game/src/render.js` — the painter: HUD, panels, markers, title and end screens.
- `game/src/sound.js` — WebAudio effects, synthesized, no audio files.
- `game/src/shots.js` — the staged screenshot scenes, played through the real click rules.
- `game/src/main.js` — boot, the fixed-step loop, mouse and keyboard input.
- `main.ts` — the hand-in program; `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
