# DAPUR KILAT — Warung Rush

[![DAPUR KILAT](https://img.shields.io/badge/DAPUR%20KILAT-best--cooking--game--20261125-teal)](https://make.fun/competitions/best-cooking-game-20261125-0137)
[![Rank](https://img.shields.io/badge/rank-top%2010-blue)](https://make.fun/competitions/best-cooking-game-20261125-0137)
[![Reward](https://img.shields.io/badge/reward-%2460-gold)](https://make.fun/competitions/best-cooking-game-20261125-0137)

A fast Indonesian warung cooking game. One cook, one rush shift of 180
seconds, three hearts, and a line of hungry customers.

## How to play

- **WASD / arrow keys** — run around the kitchen. **Mouse click** also walks
  and uses a station. **E / Space** — take and use (hold to chop).
  **P** pauses, **M** mutes.
- Take ingredients from the crates (**Beras, Mie, Ayam, Telur, Cabai, Sayur,
  Bumbu**), chop the chicken on the **Talenan**, then cook on the **Wajan**
  or the **Panggangan**.
- **Nasi Goreng** = nasi + telur + cabai (wok). **Mie Goreng** = mie + ayam
  cincang + sayur (wok). **Sate Ayam** = ayam cincang + bumbu + cabai
  (grill).
- Plate the finished dish on the **Meja Plating**, then serve it at the
  **Jendela Saji** before the ticket's patience bar runs out. Serve fast
  for a patience bonus; serving builds a combo up to x5. A wrong dish is
  rejected, an expired order costs a heart, and food left on the stove
  burns.

## Screenshots

Four real renders of the game in a browser: the busy mid-shift cover, the
title screen, the serving moment at the window, and the shift-complete
screen. Each is taken from the game's own code via `?shot=` staging.

## The game

- `game/src/config.js` — field, dishes, recipes, timings, palette
- `game/src/random.js` — seeded RNG
- `game/src/input.js` — keyboard + mouse
- `game/src/world.js` — state, orders, stations, rules and scoring
- `game/src/render.js` — all canvas drawing
- `game/src/audio.js` — WebAudio synth sounds
- `game/src/shots.js` — deterministic screenshot staging (real autopilot)
- `game/src/main.js` — boot and the fixed 1/60s loop

All art is drawn in canvas and all sounds are synthesized — no external
assets, no network. Open `game/index.html` from any static server and play.
