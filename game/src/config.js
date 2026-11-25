// DAPUR KILAT — config: field, dishes, recipes, timings, palette.
// One job: every tunable number for the warung rush lives here.
export const CONFIG = {
  width: 1280,
  height: 720,
  shiftSeconds: 180,
  playerSpeed: 285,
  interactRange: 100,
  chopSeconds: 2.0,
  cookSeconds: 6,
  burnSeconds: 9,
  orderFirstDelay: 4,
  orderIntervalStart: 12,
  orderIntervalEnd: 8,
  patienceStart: 45,
  patienceEnd: 28,
  maxOrders: 4,
  maxHearts: 3,
  serveBaseScore: 100,
  serveBaseCoins: 12,
  wrongPenalty: 25,
  comboCap: 5,
  palette: {
    wall: '#0f766e',
    wallDark: '#0b5e57',
    floor: '#e8c98f',
    floorLine: '#d9b478',
    wood: '#8b5a2b',
    woodLight: '#a9713a',
    counter: '#c98f4e',
    steel: '#b8c4cc',
    cream: '#fff7e6',
    ink: '#2b1d12',
    red: '#d62828',
    green: '#2a9d3f',
    gold: '#f2a541',
    awningRed: '#d62828',
    awningWhite: '#fff7e6',
  },
};

// Ingredients: id -> label + draw colour.
export const INGREDIENTS = {
  nasi: { label: 'Nasi', color: '#fff7e6' },
  mie: { label: 'Mie', color: '#f2c14e' },
  ayam: { label: 'Ayam', color: '#e88ca0' },
  ayam_cincang: { label: 'Ayam Cincang', color: '#d96a7f' },
  telur: { label: 'Telur', color: '#fdf0c0' },
  cabai: { label: 'Cabai', color: '#d62828' },
  sayur: { label: 'Sayur', color: '#4caf50' },
  bumbu: { label: 'Bumbu', color: '#8d5a2b' },
};

// Dishes: 3 ingredients each, cooked on the wok or the grill, then plated.
export const DISHES = {
  nasi_goreng: {
    name: 'Nasi Goreng',
    short: 'NasGor',
    needs: ['nasi', 'telur', 'cabai'],
    cooker: 'wok',
    color: '#f2a541',
  },
  mie_goreng: {
    name: 'Mie Goreng',
    short: 'MieGor',
    needs: ['mie', 'ayam_cincang', 'sayur'],
    cooker: 'wok',
    color: '#e07b39',
  },
  sate_ayam: {
    name: 'Sate Ayam',
    short: 'Sate',
    needs: ['ayam_cincang', 'bumbu', 'cabai'],
    cooker: 'grill',
    color: '#c05621',
  },
};

export const DISH_IDS = ['nasi_goreng', 'mie_goreng', 'sate_ayam'];

// Stations on the kitchen floor. Crates give one raw ingredient per take.
export const STATIONS = [
  { id: 'crate_nasi', kind: 'crate', item: 'nasi', label: 'Beras', x: 336, y: 96, w: 108, h: 84 },
  { id: 'crate_mie', kind: 'crate', item: 'mie', label: 'Mie', x: 454, y: 96, w: 108, h: 84 },
  { id: 'crate_ayam', kind: 'crate', item: 'ayam', label: 'Ayam', x: 572, y: 96, w: 108, h: 84 },
  { id: 'crate_telur', kind: 'crate', item: 'telur', label: 'Telur', x: 690, y: 96, w: 108, h: 84 },
  { id: 'crate_cabai', kind: 'crate', item: 'cabai', label: 'Cabai', x: 808, y: 96, w: 108, h: 84 },
  { id: 'crate_sayur', kind: 'crate', item: 'sayur', label: 'Sayur', x: 926, y: 96, w: 108, h: 84 },
  { id: 'crate_bumbu', kind: 'crate', item: 'bumbu', label: 'Bumbu', x: 1044, y: 96, w: 108, h: 84 },
  { id: 'board', kind: 'board', label: 'Talenan', hint: 'Tahan E: cincang ayam', x: 360, y: 250, w: 160, h: 92 },
  { id: 'wok', kind: 'wok', label: 'Wajan', hint: 'Masak di wajan', x: 580, y: 250, w: 180, h: 92 },
  { id: 'grill', kind: 'grill', label: 'Panggangan', hint: 'Bakar sate', x: 820, y: 250, w: 180, h: 92 },
  { id: 'trash', kind: 'trash', label: 'Tong Sampah', hint: 'Buang bawaan / isi kompor', x: 1060, y: 250, w: 110, h: 92 },
  { id: 'plating', kind: 'plating', label: 'Meja Plating', hint: 'Tata di piring', x: 360, y: 430, w: 430, h: 96 },
  { id: 'window', kind: 'window', label: 'Jendela Saji', hint: 'Sajikan pesanan', x: 860, y: 430, w: 380, h: 110 },
];

export const PLAYER_START = { x: 800, y: 620 };
export const KITCHEN = { x0: 320, y0: 84, x1: 1252, y1: 692 };
