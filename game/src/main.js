// DAPUR KILAT — main: boot, fixed 1/60s loop, screens, and ?shot= staging.
// ?seed=N fixes randomness. ?shot=start|play|serve|end stages that scene,
// paints twice and sets window.__shotReady for the screenshot harness.
import { CONFIG } from './config.js';
import { createWorld, startShift, update, gameState } from './world.js';
import { draw } from './render.js';
import { createInput, attachInput, endFrameInput } from './input.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const seedParam = parseInt(params.get('seed') || '7', 10);
const seed = Number.isFinite(seedParam) ? seedParam : 7;
const shotName = params.get('shot');

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const input = createInput();
const sfx = createAudio();
attachInput(input, canvas);

function loadBest() {
  try {
    return parseInt(window.localStorage.getItem('dapur-kilat-best') || '0', 10) || 0;
  } catch (e) {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem('dapur-kilat-best', String(value));
  } catch (e) {
    // Storage may be unavailable; the best score is a bonus, not the game.
  }
}

function paint(world) {
  draw(ctx, world);
  if (statusEl) {
    const s = gameState(world);
    statusEl.textContent =
      `DAPUR KILAT — ${s.screen} — skor ${s.score} — koin ${s.coins} — ` +
      `saji ${s.served} — hati ${s.hearts} — sisa ${s.timeLeft}s`;
  }
  window.__gameState = gameState(world);
}

function handleMouseClick(world) {
  if (!input.mouseClicked) return;
  if (world.screen !== 'play') return;
  input.moveTarget = { x: input.mouseX, y: input.mouseY };
  input.pendingInteract = true;
  input.interactPressed = true;
}

if (shotName) {
  const staged = stageShot(shotName, seed);
  const world = staged.world;
  world.best = loadBest();
  paint(world);
  paint(world);
  window.__shotReady = true;
} else {
  const world = createWorld(seed);
  world.best = loadBest();
  paint(world);

  let last = performance.now();
  let acc = 0;
  const STEP = 1 / 60;

  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    acc += dt;

    if (input.mutePressed) {
      const muted = sfx.toggleMute();
      if (statusEl) statusEl.textContent = muted ? 'Suara mati (M)' : 'Suara hidup (M)';
    }
    if (input.pausePressed && (world.screen === 'play' || world.screen === 'paused')) {
      world.screen = world.screen === 'play' ? 'paused' : 'play';
      sfx.click();
    }
    if (world.screen === 'title' && input.anyKeyPressed) {
      startShift(world);
      sfx.click();
    } else if (world.screen === 'over' && input.anyKeyPressed) {
      startShift(world);
      sfx.click();
    }

    handleMouseClick(world);
    // Sound the press before the tick consumes it (update clears the flag).
    if (input.interactPressed && world.screen === 'play') sfx.chop();
    while (acc >= STEP) {
      const before = world.screen;
      update(world, STEP, input);
      if (world.screen === 'over' && before === 'play') {
        if (world.score >= world.best && world.score > 0) saveBest(world.score);
        world.best = Math.max(world.best, loadBest());
        sfx.ready();
      }
      acc -= STEP;
    }
    paint(world);
    endFrameInput(input);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
