// DAPUR KILAT — shots: deterministic screenshot staging.
// A scripted autopilot plays the REAL rules forward (walk, take, chop,
// cook, plate, serve) for a fixed number of seconds, then the frame is shot.
import { CONFIG, STATIONS } from './config.js';
import { createWorld, startShift, spawnOrder, stationCenter, update } from './world.js';
import { createInput } from './input.js';

function stationById(id) {
  return STATIONS.find((s) => s.id === id);
}

function step(world, input, frames) {
  for (let i = 0; i < frames; i++) update(world, 1 / 60, input);
}

function stopKeys(input) {
  input.left = input.right = input.up = input.down = false;
  input.interact = false;
  input.moveTarget = null;
}

// Walk toward a station until close enough to use it.
function goTo(world, input, stationId) {
  const c = stationCenter(stationById(stationId));
  let guard = 0;
  while (guard++ < 900) {
    const dx = c.x - world.player.x;
    const dy = c.y - world.player.y;
    if (Math.hypot(dx, dy) < 30) break;
    input.left = dx < -8;
    input.right = dx > 8;
    input.up = dy < -8;
    input.down = dy > 8;
    update(world, 1 / 60, input);
  }
  stopKeys(input);
}

// Walk toward a station for a fixed time only — the cook is caught mid-route.
function walkToward(world, input, stationId, seconds) {
  const c = stationCenter(stationById(stationId));
  const frames = Math.round(seconds * 60);
  for (let i = 0; i < frames; i++) {
    const dx = c.x - world.player.x;
    const dy = c.y - world.player.y;
    if (Math.hypot(dx, dy) < 30) break;
    input.left = dx < -8;
    input.right = dx > 8;
    input.up = dy < -8;
    input.down = dy > 8;
    update(world, 1 / 60, input);
  }
  stopKeys(input);
}

function press(world, input) {
  input.interactPressed = true;
  update(world, 1 / 60, input);
  input.interactPressed = false;
}

function holdInteract(world, input, seconds) {
  input.interact = true;
  step(world, input, Math.round(seconds * 60));
  input.interact = false;
}

function waitFor(world, input, done, maxSeconds) {
  let guard = 0;
  const max = Math.round(maxSeconds * 60);
  while (guard++ < max && !done()) update(world, 1 / 60, input);
}

// Take one ingredient from a crate and drop it in a cooker.
function addIngredient(world, input, crateId, cookerId) {
  goTo(world, input, crateId);
  press(world, input);
  goTo(world, input, cookerId);
  press(world, input);
}

// Cook a full Sate Ayam on the grill and leave the plated dish on the counter.
function cookSateAndPlate(world, input) {
  goTo(world, input, 'crate_ayam');
  press(world, input);
  goTo(world, input, 'board');
  holdInteract(world, input, 2.4);
  goTo(world, input, 'grill');
  press(world, input);
  addIngredient(world, input, 'crate_bumbu', 'grill');
  addIngredient(world, input, 'crate_cabai', 'grill');
  waitFor(world, input, () => world.grill.done, 10);
  press(world, input);
  goTo(world, input, 'plating');
  press(world, input);
  press(world, input);
}

// Start a Nasi Goreng in the wok and leave it mid-cook.
function startNasiGoreng(world, input) {
  addIngredient(world, input, 'crate_nasi', 'wok');
  addIngredient(world, input, 'crate_telur', 'wok');
  addIngredient(world, input, 'crate_cabai', 'wok');
  step(world, input, Math.round(2.2 * 60));
}

function baseShift(world, input) {
  startShift(world);
  spawnOrder(world, 'sate_ayam');
  spawnOrder(world, 'nasi_goreng');
  spawnOrder(world, 'mie_goreng');
}

export function stageShot(name, seed) {
  const world = createWorld(seed === undefined ? 7 : seed);
  const input = createInput();
  if (name === 'start') {
    world.screen = 'title';
    return { world, screen: world.screen, best: world.best };
  }
  if (name === 'play') {
    baseShift(world, input);
    cookSateAndPlate(world, input);
    startNasiGoreng(world, input);
    goTo(world, input, 'crate_mie');
    press(world, input);
    walkToward(world, input, 'wok', 0.7);
    return { world, screen: world.screen, best: world.best };
  }
  if (name === 'serve') {
    baseShift(world, input);
    cookSateAndPlate(world, input);
    goTo(world, input, 'plating');
    press(world, input);
    goTo(world, input, 'window');
    press(world, input);
    step(world, input, 12);
    return { world, screen: world.screen, best: world.best };
  }
  if (name === 'end') {
    baseShift(world, input);
    cookSateAndPlate(world, input);
    goTo(world, input, 'plating');
    press(world, input);
    goTo(world, input, 'window');
    press(world, input);
    world.time = CONFIG.shiftSeconds - 0.4;
    step(world, input, Math.round(1.2 * 60));
    return { world, screen: world.screen, best: world.best };
  }
  return { world, screen: world.screen, best: world.best };
}
