// DAPUR KILAT — world: state, orders, stations and every rule of the rush.
// Take / chop / cook / plate / serve, scoring, hearts, the shift timer.
import { CONFIG, DISHES, DISH_IDS, STATIONS, PLAYER_START, KITCHEN } from './config.js';
import { makeRng } from './random.js';

export function createWorld(seed) {
  const rng = makeRng(seed >>> 0);
  return {
    seed: seed >>> 0,
    rng,
    screen: 'title',
    time: 0,
    timeLeft: CONFIG.shiftSeconds,
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    hearts: CONFIG.maxHearts,
    served: 0,
    expired: 0,
    wrong: 0,
    burned: 0,
    best: 0,
    player: {
      x: PLAYER_START.x,
      y: PLAYER_START.y,
      dir: 'down',
      carrying: null,
      chopProgress: 0,
      chopping: false,
    },
    orders: [],
    nextOrderId: 1,
    spawnTimer: CONFIG.orderFirstDelay,
    wok: emptyCooker(),
    grill: emptyCooker(),
    board: { progress: 0, chopping: false },
    plating: { dish: null },
    particles: [],
    popups: [],
    shake: 0,
    flash: null,
    message: null,
    messageTimer: 0,
    stats: { dishesCooked: 0 },
  };
}

export function emptyCooker() {
  return { items: [], cooking: 0, dishId: null, done: false, burn: 0, burnt: false };
}

export function dishFor(items, cookerKind) {
  const sorted = [...items].sort();
  for (const id of DISH_IDS) {
    const dish = DISHES[id];
    if (dish.cooker !== cookerKind) continue;
    if ([...dish.needs].sort().join('|') === sorted.join('|')) return id;
  }
  return null;
}

export function orderInterval(world) {
  const t = world.time / CONFIG.shiftSeconds;
  return CONFIG.orderIntervalStart + (CONFIG.orderIntervalEnd - CONFIG.orderIntervalStart) * t;
}

export function orderPatience(world) {
  const t = world.time / CONFIG.shiftSeconds;
  return CONFIG.patienceStart + (CONFIG.patienceEnd - CONFIG.patienceStart) * t;
}

export function spawnOrder(world, dishId) {
  if (world.orders.length >= CONFIG.maxOrders) return null;
  const id = dishId || world.rng.pick(DISH_IDS);
  const patience = orderPatience(world);
  const order = { id: world.nextOrderId++, dishId: id, patience, maxPatience: patience };
  world.orders.push(order);
  return order;
}

export function stationCenter(station) {
  return { x: station.x + station.w / 2, y: station.y + station.h / 2 };
}

export function nearestStation(world) {
  const p = world.player;
  let best = null;
  let bestD = Infinity;
  for (const st of STATIONS) {
    const c = stationCenter(st);
    const d = Math.hypot(p.x - c.x, p.y - c.y);
    if (d < bestD) {
      bestD = d;
      best = st;
    }
  }
  return bestD <= CONFIG.interactRange + Math.max(best.w, best.h) / 2 ? best : null;
}

export function carryingLabel(world) {
  const c = world.player.carrying;
  if (!c) return null;
  if (c.kind === 'ing') return c.id === 'ayam_cincang' ? 'Ayam Cincang' : c.id;
  if (c.kind === 'dish') return DISHES[c.dishId].name + (c.plated ? ' (Piring)' : '');
  return null;
}

function addPopup(world, x, y, text, color) {
  world.popups.push({ x, y, text, color: color || '#2b1d12', life: 1.4 });
}

function burst(world, x, y, color, n) {
  for (let i = 0; i < (n || 10); i++) {
    const a = world.rng.next() * Math.PI * 2;
    const sp = 40 + world.rng.next() * 90;
    world.particles.push({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 40,
      life: 0.6 + world.rng.next() * 0.5,
      color: color || '#f2a541',
      size: 2 + world.rng.next() * 4,
    });
  }
}

function setMessage(world, text) {
  world.message = text;
  world.messageTimer = 2.2;
}

function clearCooker(cooker) {
  cooker.items = [];
  cooker.cooking = 0;
  cooker.dishId = null;
  cooker.done = false;
  cooker.burn = 0;
  cooker.burnt = false;
}

function cookerTick(world, cooker, dt) {
  if (cooker.done) {
    cooker.burn += dt;
    if (cooker.burn >= CONFIG.burnSeconds) {
      cooker.burnt = true;
      cooker.done = false;
      cooker.dishId = null;
      world.burned++;
      setMessage(world, 'Gosong! Buang ke tong sampah.');
    }
    return;
  }
  if (cooker.dishId) {
    cooker.cooking += dt;
    if (cooker.cooking >= CONFIG.cookSeconds) {
      cooker.done = true;
      cooker.burn = 0;
      world.stats.dishesCooked++;
    }
  }
}

export function takeFromCrate(world, station) {
  const p = world.player;
  if (p.carrying) return false;
  p.carrying = { kind: 'ing', id: station.item };
  return true;
}

export function interact(world) {
  const st = nearestStation(world);
  if (!st) return;
  const p = world.player;
  if (st.kind === 'crate') {
    if (!takeFromCrate(world, st)) setMessage(world, 'Tangan penuh! Letakkan dulu.');
    return;
  }
  if (st.kind === 'board') {
    if (p.carrying && p.carrying.kind === 'ing' && p.carrying.id === 'ayam') {
      p.chopping = true;
    } else if (p.carrying) {
      setMessage(world, 'Talenan hanya untuk mencincang ayam.');
    }
    return;
  }
  if (st.kind === 'wok' || st.kind === 'grill') {
    const cooker = st.kind === 'wok' ? world.wok : world.grill;
    if (cooker.burnt) {
      setMessage(world, 'Gosong! Buang ke tong sampah.');
      return;
    }
    if (cooker.done) {
      if (!p.carrying) {
        p.carrying = { kind: 'dish', dishId: cooker.dishId, plated: false };
        clearCooker(cooker);
      } else {
        setMessage(world, 'Tangan penuh!');
      }
      return;
    }
    if (p.carrying && p.carrying.kind === 'ing') {
      if (cooker.dishId) {
        setMessage(world, 'Sedang dimasak!');
        return;
      }
      if (cooker.items.length >= 3) {
        setMessage(world, 'Kompor penuh!');
        return;
      }
      cooker.items.push(p.carrying.id);
      p.carrying = null;
      const match = dishFor(cooker.items, st.kind);
      if (match && cooker.items.length === 3) {
        cooker.dishId = match;
        cooker.cooking = 0;
        burst(world, stationCenter(st).x, stationCenter(st).y - 20, '#f2a541', 12);
      }
      return;
    }
    if (!p.carrying && cooker.items.length > 0 && !cooker.dishId) {
      setMessage(world, 'Resep belum lengkap — tambah bahan.');
    }
    return;
  }
  if (st.kind === 'trash') {
    if (p.carrying) {
      p.carrying = null;
      p.chopProgress = 0;
      setMessage(world, 'Dibuang.');
      return;
    }
    if (world.wok.items.length || world.wok.burnt || world.wok.dishId) {
      clearCooker(world.wok);
      setMessage(world, 'Wajan dikosongkan.');
      return;
    }
    if (world.grill.items.length || world.grill.burnt || world.grill.dishId) {
      clearCooker(world.grill);
      setMessage(world, 'Panggangan dikosongkan.');
    }
    return;
  }
  if (st.kind === 'plating') {
    if (p.carrying && p.carrying.kind === 'dish' && !p.carrying.plated) {
      p.carrying.plated = true;
      return;
    }
    if (p.carrying && p.carrying.kind === 'dish' && p.carrying.plated && !world.plating.dish) {
      world.plating.dish = p.carrying.dishId;
      p.carrying = null;
      return;
    }
    if (!p.carrying && world.plating.dish) {
      p.carrying = { kind: 'dish', dishId: world.plating.dish, plated: true };
      world.plating.dish = null;
    }
    return;
  }
  if (st.kind === 'window') {
    if (p.carrying && p.carrying.kind === 'dish' && p.carrying.plated) {
      serveDish(world, p.carrying.dishId);
      p.carrying = null;
    } else if (p.carrying && p.carrying.kind === 'dish') {
      setMessage(world, 'Tata dulu di Meja Plating!');
    } else {
      setMessage(world, 'Bawa piring hidangan ke sini.');
    }
  }
}

export function serveDish(world, dishId) {
  const idx = world.orders.findIndex((o) => o.dishId === dishId);
  const win = STATIONS.find((s) => s.id === 'window');
  const cx = win.x + win.w / 2;
  const cy = win.y + win.h / 2;
  if (idx >= 0) {
    const order = world.orders[idx];
    world.orders.splice(idx, 1);
    world.combo = Math.min(world.combo + 1, CONFIG.comboCap);
    world.bestCombo = Math.max(world.bestCombo, world.combo);
    const patienceBonus = Math.round(50 * (order.patience / order.maxPatience));
    const gain = CONFIG.serveBaseScore * world.combo + patienceBonus;
    const coins = CONFIG.serveBaseCoins + Math.round(8 * (order.patience / order.maxPatience));
    world.score += gain;
    world.coins += coins;
    world.served++;
    addPopup(world, cx, cy - 40, `+${gain}  +${coins} koin`, '#2a9d3f');
    burst(world, cx, cy, '#ffd94d', 16);
    world.flash = 'serve';
  } else {
    world.combo = 0;
    world.wrong++;
    world.score = Math.max(0, world.score - CONFIG.wrongPenalty);
    addPopup(world, cx, cy - 40, `Salah! -${CONFIG.wrongPenalty}`, '#d62828');
    world.flash = 'wrong';
    setMessage(world, 'Tidak ada yang pesan itu — ditolak!');
  }
}

export function update(world, dt, input) {
  if (world.screen !== 'play') return;
  world.time += dt;
  world.timeLeft = Math.max(0, CONFIG.shiftSeconds - world.time);
  if (world.timeLeft <= 0) {
    world.screen = 'over';
    world.best = Math.max(world.best, world.score);
    return;
  }

  // Orders: spawn faster and lose patience faster as the shift goes on.
  world.spawnTimer -= dt;
  if (world.spawnTimer <= 0) {
    spawnOrder(world);
    world.spawnTimer = orderInterval(world);
  }
  for (let i = world.orders.length - 1; i >= 0; i--) {
    const o = world.orders[i];
    o.patience -= dt;
    if (o.patience <= 0) {
      world.orders.splice(i, 1);
      world.expired++;
      world.combo = 0;
      world.hearts--;
      world.shake = 0.5;
      addPopup(world, 160, 120, 'Pesanan hangus! -1 hati', '#d62828');
      if (world.hearts <= 0) {
        world.screen = 'over';
        world.best = Math.max(world.best, world.score);
        return;
      }
    }
  }

  // Movement.
  const p = world.player;
  let mx = 0;
  let my = 0;
  if (input.left) mx -= 1;
  if (input.right) mx += 1;
  if (input.up) my -= 1;
  if (input.down) my += 1;
  if (input.moveTarget) {
    const dx = input.moveTarget.x - p.x;
    const dy = input.moveTarget.y - p.y;
    if (Math.hypot(dx, dy) < 12) {
      input.moveTarget = null;
      if (input.pendingInteract) {
        input.pendingInteract = false;
        interact(world);
      }
    } else {
      mx = dx / Math.hypot(dx, dy);
      my = dy / Math.hypot(dx, dy);
    }
  }
  if (mx || my) {
    const len = Math.hypot(mx, my);
    p.x += (mx / len) * CONFIG.playerSpeed * dt;
    p.y += (my / len) * CONFIG.playerSpeed * dt;
    if (Math.abs(mx) > Math.abs(my)) p.dir = mx > 0 ? 'right' : 'left';
    else p.dir = my > 0 ? 'down' : 'up';
  }
  p.x = Math.max(KITCHEN.x0 + 14, Math.min(KITCHEN.x1 - 14, p.x));
  p.y = Math.max(KITCHEN.y0 + 14, Math.min(KITCHEN.y1 - 14, p.y));

  // Chopping: hold E beside the board with raw chicken.
  const st = nearestStation(world);
  const atBoard = st && st.kind === 'board';
  if (input.interact && atBoard && p.carrying && p.carrying.kind === 'ing' && p.carrying.id === 'ayam') {
    p.chopping = true;
    p.chopProgress += dt / CONFIG.chopSeconds;
    if (world.rng.next() < 0.3) burst(world, p.x, p.y - 30, '#d96a7f', 1);
    if (p.chopProgress >= 1) {
      p.carrying = { kind: 'ing', id: 'ayam_cincang' };
      p.chopProgress = 0;
      p.chopping = false;
      burst(world, p.x, p.y - 30, '#4caf50', 10);
    }
  } else {
    p.chopping = false;
    if (!atBoard) p.chopProgress = 0;
  }

  if (input.interactPressed) {
    // Consume the press here, inside the tick: clearing it in endFrameInput
    // would swallow taps whenever rAF runs faster than the 1/60s tick
    // (120Hz+ displays), because frames can end without an update running.
    input.interactPressed = false;
    interact(world);
  }

  cookerTick(world, world.wok, dt);
  cookerTick(world, world.grill, dt);

  // Particles, popups, shake, messages.
  for (let i = world.particles.length - 1; i >= 0; i--) {
    const pt = world.particles[i];
    pt.life -= dt;
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vy += 120 * dt;
    if (pt.life <= 0) world.particles.splice(i, 1);
  }
  for (let i = world.popups.length - 1; i >= 0; i--) {
    const pop = world.popups[i];
    pop.life -= dt;
    pop.y -= 30 * dt;
    if (pop.life <= 0) world.popups.splice(i, 1);
  }
  if (world.shake > 0) world.shake -= dt;
  if (world.messageTimer > 0) {
    world.messageTimer -= dt;
    if (world.messageTimer <= 0) world.message = null;
  }
  if (world.flash) world.flash = null;
}

export function startShift(world) {
  world.screen = 'play';
  world.time = 0;
  world.timeLeft = CONFIG.shiftSeconds;
  world.score = 0;
  world.coins = 0;
  world.combo = 0;
  world.served = 0;
  world.expired = 0;
  world.wrong = 0;
  world.burned = 0;
  world.hearts = CONFIG.maxHearts;
  world.orders = [];
  world.spawnTimer = CONFIG.orderFirstDelay;
  world.wok = emptyCooker();
  world.grill = emptyCooker();
  world.plating.dish = null;
  world.player.carrying = null;
  world.player.x = PLAYER_START.x;
  world.player.y = PLAYER_START.y;
}

export function gameState(world) {
  return {
    screen: world.screen,
    score: world.score,
    coins: world.coins,
    combo: world.combo,
    hearts: world.hearts,
    timeLeft: Math.round(world.timeLeft),
    served: world.served,
    expired: world.expired,
    orders: world.orders.map((o) => ({ dish: o.dishId, patience: Math.round(o.patience) })),
    player: {
      x: Math.round(world.player.x),
      y: Math.round(world.player.y),
      carrying: world.player.carrying,
    },
    wok: { items: world.wok.items, dish: world.wok.dishId, done: world.wok.done },
    grill: { items: world.grill.items, dish: world.grill.dishId, done: world.grill.done },
  };
}
