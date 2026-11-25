// DAPUR KILAT — render: every pixel of the warung, drawn in canvas.
// Kitchen, order board, tickets, stations, cook, HUD, and all four screens.
import { CONFIG, DISHES, INGREDIENTS, STATIONS } from './config.js';
import { stationCenter, nearestStation, carryingLabel } from './world.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align, weight) {
  ctx.fillStyle = color || CONFIG.palette.ink;
  ctx.font = `${weight || '700'} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function progressRing(ctx, x, y, r, frac, color) {
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(43,29,18,0.25)';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, frac));
  ctx.stroke();
}

export function drawIngredientIcon(ctx, id, x, y, s) {
  const ing = INGREDIENTS[id] || { color: '#ccc' };
  ctx.save();
  ctx.translate(x, y);
  if (id === 'nasi') {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 2, s * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2a541';
    ctx.beginPath();
    ctx.arc(0, 2, s * 0.55, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#fff7e6';
    ctx.fillRect(-s * 0.4, -s * 0.15, s * 0.8, s * 0.3);
  } else if (id === 'mie') {
    ctx.strokeStyle = '#f2c14e';
    ctx.lineWidth = s * 0.14;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, s * (0.25 + i * 0.16), 0.4, Math.PI * 1.7);
      ctx.stroke();
    }
  } else if (id === 'ayam' || id === 'ayam_cincang') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s * 0.34, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff7e6';
    ctx.lineWidth = s * 0.12;
    ctx.beginPath();
    ctx.moveTo(s * 0.35, s * 0.2);
    ctx.lineTo(s * 0.62, s * 0.42);
    ctx.stroke();
    if (id === 'ayam_cincang') {
      ctx.strokeStyle = '#2b1d12';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, -s * 0.2);
      ctx.lineTo(s * 0.2, s * 0.25);
      ctx.stroke();
    }
  } else if (id === 'telur') {
    ctx.fillStyle = '#fdf0c0';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.36, s * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2a541';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'cabai') {
    ctx.fillStyle = '#d62828';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s * 0.2, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2a9d3f';
    ctx.lineWidth = s * 0.1;
    ctx.beginPath();
    ctx.moveTo(s * 0.42, -s * 0.18);
    ctx.quadraticCurveTo(s * 0.6, -s * 0.4, s * 0.5, -s * 0.5);
    ctx.stroke();
  } else if (id === 'sayur') {
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.ellipse(-s * 0.2, 0, s * 0.3, s * 0.42, -0.3, 0, Math.PI * 2);
    ctx.ellipse(s * 0.2, 0, s * 0.3, s * 0.42, 0.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'bumbu') {
    ctx.fillStyle = '#8d5a2b';
    ctx.fillRect(-s * 0.3, -s * 0.4, s * 0.6, s * 0.8);
    ctx.fillStyle = '#f2a541';
    ctx.fillRect(-s * 0.3, -s * 0.4, s * 0.6, s * 0.18);
    ctx.fillStyle = '#fff7e6';
    ctx.fillRect(-s * 0.2, -s * 0.1, s * 0.4, s * 0.3);
  }
  ctx.restore();
}

function drawDishIcon(ctx, dishId, x, y, s) {
  const dish = DISHES[dishId];
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(0, s * 0.15, s * 0.62, s * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9a06a';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = dish.color;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.45, s * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  if (dishId === 'mie_goreng') {
    ctx.strokeStyle = '#f2c14e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (dishId === 'sate_ayam') {
    ctx.strokeStyle = '#8d5a2b';
    ctx.lineWidth = 3;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-s * 0.4, i * s * 0.14);
      ctx.lineTo(s * 0.4, i * s * 0.14);
      ctx.stroke();
      ctx.fillStyle = '#c05621';
      ctx.beginPath();
      ctx.arc(i * s * 0.2, i * s * 0.14, s * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawStation(ctx, world, st) {
  const p = CONFIG.palette;
  const near = world.screen === 'play' && nearestStation(world) === st;
  ctx.save();
  if (near) {
    ctx.shadowColor = '#ffd94d';
    ctx.shadowBlur = 18;
  }
  if (st.kind === 'crate') {
    ctx.fillStyle = p.wood;
    rr(ctx, st.x, st.y, st.w, st.h, 10);
    ctx.fill();
    ctx.fillStyle = p.woodLight;
    ctx.fillRect(st.x + 6, st.y + 6, st.w - 12, 10);
    drawIngredientIcon(ctx, st.item, st.x + st.w / 2, st.y + 38, 26);
    text(ctx, st.label, st.x + st.w / 2, st.y + st.h - 14, 15, '#fff7e6');
  } else if (st.kind === 'board') {
    ctx.fillStyle = '#e9d8a6';
    rr(ctx, st.x, st.y, st.w, st.h, 10);
    ctx.fill();
    ctx.strokeStyle = '#b08954';
    ctx.lineWidth = 3;
    ctx.stroke();
    text(ctx, st.label, st.x + st.w / 2, st.y + 18, 16, p.ink);
    if (world.player.chopProgress > 0) {
      progressRing(ctx, st.x + st.w / 2, st.y + 58, 18, world.player.chopProgress, '#d62828');
      text(ctx, 'CINCANG!', st.x + st.w / 2, st.y + 58, 11, '#d62828');
    } else {
      text(ctx, 'Ayam -> cincang', st.x + st.w / 2, st.y + 58, 13, '#7a5a34');
    }
  } else if (st.kind === 'wok' || st.kind === 'grill') {
    const cooker = st.kind === 'wok' ? world.wok : world.grill;
    ctx.fillStyle = '#3a3f44';
    rr(ctx, st.x, st.y, st.w, st.h, 10);
    ctx.fill();
    ctx.fillStyle = '#22262a';
    ctx.beginPath();
    ctx.ellipse(st.x + st.w / 2, st.y + 48, st.w / 2 - 14, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    if (cooker.dishId) {
      const frac = cooker.done ? 1 : cooker.cooking / CONFIG.cookSeconds;
      progressRing(ctx, st.x + st.w / 2, st.y + 48, 22, frac, cooker.done ? '#2a9d3f' : '#f2a541');
      text(ctx, cooker.done ? 'SIAP!' : 'MASAK...', st.x + st.w / 2, st.y + 48, 11, '#fff');
      if (!cooker.done && (cooker.cooking * 7) % 1 < 0.5) {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(st.x + st.w / 2 - 20, st.y + 22, 5, 0, Math.PI * 2);
        ctx.arc(st.x + st.w / 2 + 14, st.y + 16, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (cooker.burnt) {
      text(ctx, 'GOSONG!', st.x + st.w / 2, st.y + 48, 14, '#ff6b6b');
    } else if (cooker.items.length) {
      cooker.items.forEach((id, i) => {
        drawIngredientIcon(ctx, id, st.x + 34 + i * 56, st.y + 48, 20);
      });
      text(ctx, `${cooker.items.length}/3 bahan`, st.x + st.w / 2, st.y + 76, 12, '#ffd94d');
    } else {
      text(ctx, st.label, st.x + st.w / 2, st.y + 48, 16, '#e8e8e8');
    }
    text(ctx, st.label, st.x + st.w / 2, st.y + 16, 13, '#fff');
  } else if (st.kind === 'trash') {
    ctx.fillStyle = '#6c757d';
    rr(ctx, st.x, st.y, st.w, st.h, 10);
    ctx.fill();
    text(ctx, 'SAMPAH', st.x + st.w / 2, st.y + 34, 15, '#fff');
    text(ctx, 'buang', st.x + st.w / 2, st.y + 58, 13, '#e8e8e8');
  } else if (st.kind === 'plating') {
    ctx.fillStyle = p.counter;
    rr(ctx, st.x, st.y, st.w, st.h, 10);
    ctx.fill();
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 3;
    ctx.stroke();
    text(ctx, st.label, st.x + 70, st.y + 22, 16, '#fff7e6', 'left');
    if (world.plating.dish) {
      drawDishIcon(ctx, world.plating.dish, st.x + st.w - 90, st.y + 52, 40);
      text(ctx, 'SIAP SAJI', st.x + st.w - 90, st.y + 84, 12, '#2a9d3f');
    } else {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(st.x + st.w - 90, st.y + 52, 34, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      text(ctx, 'piring kosong', st.x + st.w - 90, st.y + 84, 12, '#fff7e6');
    }
  } else if (st.kind === 'window') {
    ctx.fillStyle = '#f4e3c2';
    rr(ctx, st.x, st.y, st.w, st.h, 10);
    ctx.fill();
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 3;
    ctx.stroke();
    text(ctx, st.label, st.x + st.w / 2, st.y + 22, 18, p.ink);
    text(ctx, 'Antar piring ke sini!', st.x + st.w / 2, st.y + 48, 14, '#7a5a34');
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath();
    ctx.moveTo(st.x + 30, st.y + st.h - 26);
    ctx.lineTo(st.x + 58, st.y + st.h - 26);
    ctx.lineTo(st.x + 44, st.y + st.h - 8);
    ctx.closePath();
    ctx.fill();
    text(ctx, 'SERVE ->', st.x + st.w - 60, st.y + st.h - 20, 14, p.ink, 'right');
  }
  ctx.restore();
}

function drawTicket(ctx, order, x, y, w, h) {
  const dish = DISHES[order.dishId];
  const frac = Math.max(0, order.patience / order.maxPatience);
  const barColor = frac > 0.5 ? '#2a9d3f' : frac > 0.25 ? '#f2a541' : '#d62828';
  ctx.save();
  ctx.fillStyle = '#fffdf5';
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = frac < 0.25 ? '#d62828' : '#d9c9a3';
  ctx.lineWidth = frac < 0.25 ? 3 : 2;
  ctx.stroke();
  drawDishIcon(ctx, order.dishId, x + 44, y + 34, 34);
  text(ctx, dish.name, x + 84, y + 24, 18, CONFIG.palette.ink, 'left');
  const recipe = dish.needs
    .map((n) => (n === 'ayam_cincang' ? 'Ayam Cinc.' : INGREDIENTS[n].label))
    .join(' + ');
  text(ctx, recipe, x + 84, y + 48, 12, '#7a5a34', 'left');
  ctx.fillStyle = '#e5dcc3';
  rr(ctx, x + 14, y + h - 18, w - 28, 10, 5);
  ctx.fill();
  ctx.fillStyle = barColor;
  rr(ctx, x + 14, y + h - 18, (w - 28) * frac, 10, 5);
  ctx.fill();
  text(ctx, `${Math.ceil(order.patience)}s`, x + w - 16, y + 24, 14, barColor, 'right');
  ctx.restore();
}

function drawPlayer(ctx, world) {
  const p = world.player;
  ctx.save();
  ctx.translate(p.x, p.y);
  if (world.shake > 0) {
    ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 26, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(0, 8, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2c14e';
  ctx.beginPath();
  ctx.arc(0, -14, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#d62828';
  ctx.beginPath();
  ctx.arc(0, -14, 13, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-4, -16, 4, 0, Math.PI * 2);
  ctx.arc(4, -16, 4, 0, Math.PI * 2);
  ctx.arc(0, -20, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2b1d12';
  ctx.beginPath();
  ctx.arc(-5, -13, 1.8, 0, Math.PI * 2);
  ctx.arc(5, -13, 1.8, 0, Math.PI * 2);
  ctx.fill();
  const c = p.carrying;
  if (c) {
    ctx.fillStyle = 'rgba(255,247,230,0.95)';
    ctx.beginPath();
    ctx.arc(0, -42, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (c.kind === 'ing') drawIngredientIcon(ctx, c.id, 0, -42, 18);
    else drawDishIcon(ctx, c.dishId, 0, -42, 20);
  }
  if (p.chopping) {
    progressRing(ctx, 0, -42, 20, p.chopProgress, '#d62828');
  }
  ctx.restore();
}

function drawHud(ctx, world) {
  const p = CONFIG.palette;
  ctx.fillStyle = p.ink;
  ctx.fillRect(0, 0, 1280, 64);
  const frac = world.timeLeft / CONFIG.shiftSeconds;
  ctx.fillStyle = '#3a3f44';
  rr(ctx, 16, 18, 420, 28, 8);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#2a9d3f' : frac > 0.25 ? '#f2a541' : '#d62828';
  rr(ctx, 16, 18, 420 * frac, 28, 8);
  ctx.fill();
  text(ctx, `⏱ ${Math.ceil(world.timeLeft)}s`, 226, 32, 18, '#fff');
  text(ctx, `Skor ${world.score}`, 520, 32, 20, '#ffd94d');
  text(ctx, `Koin ${world.coins}`, 660, 32, 20, '#fff7e6');
  text(ctx, `Combo x${Math.max(1, world.combo)}`, 800, 32, 20, world.combo >= 2 ? '#ffd94d' : '#fff7e6');
  let hearts = '';
  for (let i = 0; i < CONFIG.maxHearts; i++) hearts += i < world.hearts ? '♥ ' : '♡ ';
  text(ctx, hearts, 960, 32, 20, '#ff6b6b', 'left');
  text(ctx, `Saji: ${world.served}`, 1120, 32, 18, '#fff7e6');
}

function drawOrderBoard(ctx, world) {
  const p = CONFIG.palette;
  ctx.fillStyle = p.wallDark;
  rr(ctx, 16, 80, 288, 612, 12);
  ctx.fill();
  text(ctx, 'PESANAN', 160, 108, 22, '#ffd94d');
  text(ctx, 'Order Board', 160, 132, 13, '#fff7e6');
  if (!world.orders.length) {
    text(ctx, 'Belum ada pesanan...', 160, 300, 15, '#fff7e6');
    text(ctx, 'Siap-siap, warung buka!', 160, 330, 13, '#ffd94d');
  }
  world.orders.forEach((o, i) => {
    drawTicket(ctx, o, 32, 152 + i * 108, 256, 96);
  });
  text(ctx, 'E / Spasi: ambil • pakai', 160, 640, 13, '#fff7e6');
  text(ctx, 'WASD / panah: jalan', 160, 662, 13, '#fff7e6');
  text(ctx, 'P: jeda • M: suara', 160, 682, 13, '#fff7e6');
}

function drawKitchen(ctx, world) {
  const p = CONFIG.palette;
  ctx.fillStyle = p.wall;
  ctx.fillRect(0, 64, 1280, 656);
  for (let y = 64; y < 720; y += 48) {
    for (let x = 0; x < 1280; x += 48) {
      ctx.fillStyle = (x + y) % 96 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
      ctx.fillRect(x, y, 46, 46);
    }
  }
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 ? p.awningRed : p.awningWhite;
    ctx.fillRect(320 + i * 120, 64, 120, 18);
  }
  ctx.fillStyle = p.floor;
  ctx.fillRect(320, 84, 944, 612);
  ctx.strokeStyle = p.floorLine;
  ctx.lineWidth = 2;
  for (let x = 320; x <= 1264; x += 118) {
    ctx.beginPath();
    ctx.moveTo(x, 84);
    ctx.lineTo(x, 696);
    ctx.stroke();
  }
  for (let y = 84; y <= 696; y += 102) {
    ctx.beginPath();
    ctx.moveTo(320, y);
    ctx.lineTo(1264, y);
    ctx.stroke();
  }
  for (const st of STATIONS) drawStation(ctx, world, st);
  for (const pt of world.particles) {
    ctx.globalAlpha = Math.max(0, pt.life);
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
  }
  ctx.globalAlpha = 1;
  drawPlayer(ctx, world);
  for (const pop of world.popups) {
    ctx.globalAlpha = Math.min(1, pop.life);
    text(ctx, pop.text, pop.x, pop.y, 20, pop.color);
  }
  ctx.globalAlpha = 1;
  const st = nearestStation(world);
  if (st && world.screen === 'play') {
    text(ctx, `${st.label} — ${st.hint || 'E: pakai'}`, 792, 676, 14, '#fff7e6');
  }
  if (world.message) {
    ctx.fillStyle = 'rgba(43,29,18,0.9)';
    rr(ctx, 480, 636, 624, 30, 8);
    ctx.fill();
    text(ctx, world.message, 792, 651, 15, '#fff7e6');
  }
}

function overlay(ctx, alpha) {
  ctx.fillStyle = `rgba(20,12,6,${alpha})`;
  ctx.fillRect(0, 0, 1280, 720);
}

function drawTitle(ctx, world) {
  drawKitchen(ctx, { ...world, screen: 'play', orders: [], message: null });
  overlay(ctx, 0.55);
  text(ctx, 'DAPUR KILAT', 640, 190, 84, '#ffd94d', 'center', '900');
  text(ctx, 'Warung Rush — masak cepat, saji tepat!', 640, 260, 26, '#fff7e6');
  ctx.fillStyle = '#fffdf5';
  rr(ctx, 340, 300, 600, 210, 14);
  ctx.fill();
  text(ctx, 'CARA MAIN', 640, 330, 20, '#d62828');
  text(ctx, 'WASD / Panah — jalan • E / Spasi — ambil & pakai', 640, 366, 18, '#2b1d12');
  text(ctx, 'Ambil bahan di peti → cincang ayam di talenan', 640, 396, 18, '#2b1d12');
  text(ctx, 'Masak 3 bahan di wajan / panggangan → tata di piring', 640, 426, 18, '#2b1d12');
  text(ctx, 'Antar ke Jendela Saji sebelum pelanggan kabur!', 640, 456, 18, '#2b1d12');
  text(ctx, 'Shift 180 detik • 3 hati • kombo sampai x5', 640, 486, 18, '#7a5a34');
  text(ctx, 'TEKAN SPASI UNTUK MULAI', 640, 570, 26, '#ffd94d');
  text(ctx, 'Nasi Goreng • Mie Goreng • Sate Ayam — resep asli warung', 640, 620, 15, '#fff7e6');
  if (world.best > 0) text(ctx, `Skor terbaik: ${world.best}`, 640, 660, 18, '#fff7e6');
}

function drawPaused(ctx, world) {
  drawKitchen(ctx, world);
  overlay(ctx, 0.6);
  text(ctx, 'JEDA', 640, 320, 64, '#ffd94d', 'center', '900');
  text(ctx, 'Tekan P / Esc untuk lanjut', 640, 400, 22, '#fff7e6');
}

function drawOver(ctx, world) {
  drawKitchen(ctx, world);
  overlay(ctx, 0.65);
  text(ctx, 'SHIFT SELESAI!', 640, 170, 64, '#ffd94d', 'center', '900');
  ctx.fillStyle = '#fffdf5';
  rr(ctx, 390, 220, 500, 300, 14);
  ctx.fill();
  text(ctx, `Skor akhir: ${world.score}`, 640, 260, 30, '#2b1d12');
  text(ctx, `Hidangan disajikan: ${world.served}`, 640, 306, 20, '#2b1d12');
  text(ctx, `Koin: ${world.coins}   •   Kombo terbaik: x${Math.max(1, world.bestCombo)}`, 640, 342, 20, '#2b1d12');
  text(ctx, `Pesanan hangus: ${world.expired}   •   Salah saji: ${world.wrong}`, 640, 378, 20, '#2b1d12');
  text(ctx, `Masakan gosong: ${world.burned}`, 640, 414, 20, '#2b1d12');
  const isBest = world.score >= world.best && world.score > 0;
  text(ctx, isBest ? '★ SKOR TERBAIK BARU! ★' : `Skor terbaik: ${world.best}`, 640, 462, 22, isBest ? '#d62828' : '#7a5a34');
  text(ctx, 'Tekan Spasi untuk main lagi', 640, 560, 24, '#ffd94d');
}

export function draw(ctx, world) {
  ctx.clearRect(0, 0, 1280, 720);
  if (world.screen === 'title') {
    drawTitle(ctx, world);
    return;
  }
  // Kitchen first: its wall fill covers the whole canvas, so the order
  // board and HUD must be painted after it, not before.
  drawKitchen(ctx, world);
  drawOrderBoard(ctx, world);
  drawHud(ctx, world);
  if (world.screen === 'paused') drawPaused(ctx, world);
  if (world.screen === 'over') drawOver(ctx, world);
}
