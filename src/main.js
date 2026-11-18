import html2canvas from 'html2canvas';

/* =========================================================
   CONSTANTS & DATA
   ========================================================= */

const STORAGE_KEY = 'squadcrafter:v2';
const MAX_SLOTS = 11; // 1 GK + up to 10 outfield

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
const toBn = (n) => String(n).replace(/\d/g, (d) => BN_DIGITS[d]);
const fromBn = (s) => s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
const clone = (v) => JSON.parse(JSON.stringify(v));

const defaultPlayers = [
  { id: 1, name: 'ই. মার্টিনেজ', number: 1, role: 'GK', photo: null, isCaptain: false },
  { id: 2, name: 'এ. রবার্টসন', number: 26, role: 'DEF', photo: null, isCaptain: false },
  { id: 3, name: 'ভি. ভ্যান ডাইক', number: 4, role: 'DEF', photo: null, isCaptain: false },
  { id: 4, name: 'ডব্লিউ. সালিবা', number: 12, role: 'DEF', photo: null, isCaptain: false },
  { id: 5, name: 'এ. হাকিমি', number: 2, role: 'DEF', photo: null, isCaptain: false },
  { id: 6, name: 'কে. ডি ব্রুইনা', number: 17, role: 'MID', photo: null, isCaptain: false },
  { id: 7, name: 'রদ্রি', number: 16, role: 'MID', photo: null, isCaptain: false },
  { id: 8, name: 'জে. বেলিংহাম', number: 5, role: 'MID', photo: null, isCaptain: false },
  { id: 9, name: 'এল. মেসি', number: 10, role: 'FWD', photo: null, isCaptain: true },
  { id: 10, name: 'ই. হালান্ড', number: 9, role: 'FWD', photo: null, isCaptain: false },
  { id: 11, name: 'কে. এমবাপ্পে', number: 7, role: 'FWD', photo: null, isCaptain: false }
];

const GENERIC_NAMES = ['কাহন', 'রাইহান', 'সোহেল', 'সাকিব', 'তামিম', 'মুশফিক', 'রিয়াদ', 'তাসকিন', 'মোস্তাফিজ', 'লিটন', 'মিরাজ'];

// Team sizes (players per side, GK included) and the formations offered for each.
const FORMATS = [
  { size: 11, formations: ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '5-3-2'] },
  { size: 10, formations: ['4-4-1', '4-3-2', '3-4-2'] },
  { size: 8, formations: ['3-3-1', '3-2-2', '2-3-2'] },
  { size: 7, formations: ['2-3-1', '3-2-1', '2-2-2'] },
  { size: 6, formations: ['2-2-1', '3-1-1', '2-1-2', '1-3-1', '1-2-2'] },
  { size: 5, formations: ['2-1-1', '1-2-1', '2-2'] }
];

// Hand-tuned layouts (x: 0–100 left→right, y: 0–100 top→bottom). Anything not listed is generated.
const PRESET_LAYOUTS = {
  '4-3-3': [
    ['GK', 50, 88], ['DEF', 15, 72], ['DEF', 38, 75], ['DEF', 62, 75], ['DEF', 85, 72],
    ['MID', 25, 52], ['MID', 50, 56], ['MID', 75, 52], ['FWD', 20, 25], ['FWD', 50, 20], ['FWD', 80, 25]
  ],
  '4-4-2': [
    ['GK', 50, 88], ['DEF', 15, 72], ['DEF', 38, 75], ['DEF', 62, 75], ['DEF', 85, 72],
    ['MID', 15, 48], ['MID', 38, 52], ['MID', 62, 52], ['MID', 85, 48], ['FWD', 35, 22], ['FWD', 65, 22]
  ],
  '3-5-2': [
    ['GK', 50, 88], ['DEF', 25, 75], ['DEF', 50, 77], ['DEF', 75, 75],
    ['MID', 12, 50], ['MID', 33, 52], ['MID', 50, 56], ['MID', 67, 52], ['MID', 88, 50], ['FWD', 35, 22], ['FWD', 65, 22]
  ],
  '4-2-3-1': [
    ['GK', 50, 88], ['DEF', 15, 72], ['DEF', 38, 75], ['DEF', 62, 75], ['DEF', 85, 72],
    ['MID', 35, 58], ['MID', 65, 58], ['MID', 22, 38], ['MID', 50, 36], ['MID', 78, 38], ['FWD', 50, 20]
  ],
  '5-3-2': [
    ['GK', 50, 88], ['DEF', 12, 70], ['DEF', 30, 75], ['DEF', 50, 77], ['DEF', 70, 75], ['DEF', 88, 70],
    ['MID', 28, 50], ['MID', 50, 54], ['MID', 72, 50], ['FWD', 35, 22], ['FWD', 65, 22]
  ]
};

const KIT_PRESETS = [
  ['#e11d48', '#ffffff'],
  ['#1d4ed8', '#ffffff'],
  ['#15803d', '#fde047'],
  ['#111827', '#f59e0b'],
  ['#7c3aed', '#f5f5f5'],
  ['#f97316', '#111827'],
  ['#0ea5e9', '#0f172a'],
  ['#ffffff', '#b91c1c']
];

const DEFAULTS = {
  teamName: 'আমার দল',
  kit1: '#e11d48',
  kit2: '#ffffff',
  gkKit: '#facc15',
  theme: 'classic',
  formation: '4-3-3'
};

/* =========================================================
   FORMATION LAYOUTS
   ========================================================= */

function parseFormation(str) {
  const clean = fromBn(String(str)).replace(/[,\s.]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!/^\d+(-\d+)*$/.test(clean)) return null;
  const parts = clean.split('-').map(Number);
  if (parts.some((n) => n < 1)) return null;
  const sum = parts.reduce((a, b) => a + b, 0);
  if (sum < 1 || sum > MAX_SLOTS - 1) return null;
  return { name: parts.join('-'), parts };
}

// Spread each outfield line across the pitch, from defence (bottom) to attack (top).
function buildLayout(parts) {
  const layout = [{ role: 'GK', x: 50, y: 88 }];
  const rows = parts.length;
  const bottom = 73;
  const top = rows >= 4 ? 19 : 22;
  const spreadFor = { 1: 0, 2: 20, 3: 28, 4: 35, 5: 39 };

  parts.forEach((count, i) => {
    const y = rows === 1 ? 50 : bottom - (i * (bottom - top)) / (rows - 1);
    let role;
    if (rows === 1) role = 'MID';
    else if (i === 0) role = 'DEF';
    else if (i === rows - 1) role = 'FWD';
    else role = y > 60 ? 'DEF' : y < 35 ? 'FWD' : 'MID';

    const spread = spreadFor[count] ?? 41;
    for (let j = 0; j < count; j++) {
      const t = count === 1 ? 0 : (j / (count - 1)) * 2 - 1; // -1 … 1
      const lift = role === 'FWD' ? 0 : Math.abs(t) * 3; // wide players sit slightly higher
      layout.push({ role, x: Math.round(50 + t * spread), y: Math.round(y - lift) });
    }
  });
  return layout;
}

function layoutFor(formationName) {
  const preset = PRESET_LAYOUTS[formationName];
  if (preset) return preset.map(([role, x, y]) => ({ role, x, y }));
  const parsed = parseFormation(formationName);
  return parsed ? buildLayout(parsed.parts) : null;
}

/* =========================================================
   STATE
   ========================================================= */

let state = freshState();

function freshState() {
  return {
    ...DEFAULTS,
    edited: false, // true once a player has been dragged off the preset spot
    coords: layoutFor(DEFAULTS.formation),
    players: clone(defaultPlayers)
  };
}

let is3D = false;
let editingPlayerId = null;
let editingPhoto = null;

const activeCount = () => state.coords.length;
const starters = () => state.players.slice(0, activeCount());
const benchPlayers = () => state.players.slice(activeCount());

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.players) || !Array.isArray(saved.coords)) return;
    if (saved.coords.length < 1 || saved.coords.length > MAX_SLOTS) return;
    state = { ...freshState(), ...saved };
  } catch {
    /* ignore corrupt / unavailable storage */
  }
}

let saveFlashTimer = null;
function flashSaved() {
  const el = document.getElementById('save-status');
  if (!el) return;
  el.classList.add('saved');
  el.querySelector('.save-text').textContent = 'সংরক্ষিত';
  clearTimeout(saveFlashTimer);
  saveFlashTimer = setTimeout(() => {
    el.classList.remove('saved');
    el.querySelector('.save-text').textContent = 'অটো-সেভ চালু';
  }, 1400);
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    flashSaved();
  } catch {
    // Photos can exceed the quota — fall back to saving without them.
    try {
      const lite = { ...state, players: state.players.map((p) => ({ ...p, photo: null })) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lite));
    } catch {
      /* storage unavailable */
    }
  }
}

function ensureSquadSize(min) {
  while (state.players.length < min) addPlayerToState();
}

function addPlayerToState() {
  const nextId = state.players.length ? Math.max(...state.players.map((p) => p.id)) + 1 : 1;
  const used = new Set(state.players.map((p) => p.number));
  let number = nextId;
  while (used.has(number) && number < 99) number++;
  state.players.push({
    id: nextId,
    name: `${GENERIC_NAMES[(nextId - 1) % GENERIC_NAMES.length]} ${toBn(nextId)}`,
    number,
    role: 'MID',
    photo: null,
    isCaptain: false
  });
}

/* =========================================================
   SVG HELPERS
   ========================================================= */

// Colours are written inline (not CSS vars) so html2canvas exports them correctly.
// Each SVG gets its own gradient id: shared ids break when the first copy is display:none.
let svgUid = 0;
const SHIRT = 'M32 10 L20 14 L6 28 L16 40 L24 34 L24 90 L76 90 L76 34 L84 40 L94 28 L80 14 L68 10 C64 18 36 18 32 10 Z';

function jerseySvg(main, trim, number = '') {
  const id = `jg${++svgUid}`;
  const size = String(number).length > 1 ? 31 : 35;
  const num = number === '' ? '' : `
    <text x="50" y="69.5" text-anchor="middle" font-family="'Barlow Condensed','Arial Narrow',sans-serif" font-weight="700" font-size="${size}" fill="rgba(0,0,0,0.22)">${number}</text>
    <text x="50" y="68" text-anchor="middle" font-family="'Barlow Condensed','Arial Narrow',sans-serif" font-weight="700" font-size="${size}" fill="${trim}">${number}</text>`;
  return `<svg class="jersey" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.30"/>
        <stop offset="0.45" stop-color="#ffffff" stop-opacity="0"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0.32"/>
      </linearGradient>
    </defs>
    <path d="${SHIRT}" fill="${main}"/>
    <path d="M6 28 L16 40 L20 37 L9.5 24.5 Z" fill="${trim}"/>
    <path d="M94 28 L84 40 L80 37 L90.5 24.5 Z" fill="${trim}"/>
    <path d="M32 10 C36 18 64 18 68 10 L64 9 C60 15 40 15 36 9 Z" fill="${trim}"/>
    <path d="M24 34 L24 90 L28 90 L28 38 Z M76 34 L76 90 L72 90 L72 38 Z" fill="rgba(0,0,0,0.12)"/>
    <path d="${SHIRT}" fill="url(#${id})"/>
    <path d="${SHIRT}" fill="none" stroke="rgba(0,0,0,0.4)" stroke-width="1.5" stroke-linejoin="round"/>
    ${num}
  </svg>`;
}

let toastTimer = null;
function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

function kitFor(player, slotRole) {
  return slotRole === 'GK' ? [state.gkKit, readableOn(state.gkKit)] : [state.kit1, state.kit2];
}

// Pick black or white text for a given background colour.
function readableOn(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#111111' : '#ffffff';
}

function avatarEl(player, role, withNumber) {
  if (player.photo) {
    const img = document.createElement('img');
    img.className = 'avatar-photo';
    img.src = player.photo;
    img.alt = '';
    return img;
  }
  const [main, trim] = kitFor(player, role);
  const wrap = document.createElement('div');
  wrap.className = 'avatar-jersey';
  wrap.innerHTML = jerseySvg(main, trim, withNumber ? player.number : '');
  return wrap;
}

/* =========================================================
   RENDERING
   ========================================================= */

const $ = (id) => document.getElementById(id);

function buildPlayerNodes() {
  const container = $('players-container');
  container.innerHTML = '';
  for (let i = 0; i < MAX_SLOTS; i++) {
    const node = document.createElement('div');
    node.className = 'player-node';
    node.id = `player-slot-${i}`;
    node.dataset.slotIndex = i;
    node.innerHTML = `
      <div class="player-avatar">
        <div class="avatar-target"></div>
        <span class="player-number-badge"></span>
        <span class="captain-badge">C</span>
      </div>
      <div class="player-name-plate"><span class="role-dot"></span><span class="player-name"></span></div>
      <div class="player-detail-card">
        <div class="detail-top"><span class="role-pill"></span><span class="detail-number"></span></div>
        <div class="detail-avatar"></div>
        <div class="detail-name"></div>
        <div class="detail-captain">CAPTAIN</div>
      </div>`;
    node.addEventListener('click', (e) => onPlayerNodeClick(e, node));
    container.appendChild(node);
  }
}

function render() {
  renderHeader();
  renderControls();
  renderPitch();
  renderBench();
  renderSquadPanel();
  refreshCarousel();
  saveState();
}

function renderHeader() {
  $('pitch-team-title').textContent = state.teamName || DEFAULTS.teamName;
  const captain = starters().find((p) => p.isCaptain);
  const meta = [`${toBn(activeCount())} জনের দল`];
  if (captain) meta.push(`অধিনায়ক: ${captain.name}`);
  $('pitch-meta').textContent = meta.join('  ·  ');
  $('match-formation').textContent = state.edited ? `${state.formation}*` : state.formation;
  $('crest').innerHTML = jerseySvg(state.kit1, state.kit2);
  $('capture-date').textContent = new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderControls() {
  const count = activeCount();

  // Team size chips
  document.querySelectorAll('.size-chip').forEach((chip) => {
    const active = Number(chip.dataset.size) === count;
    chip.classList.toggle('active', active);
    chip.setAttribute('aria-checked', active);
  });
  const isPresetSize = FORMATS.some((f) => f.size === count);
  $('size-note').textContent = isPresetSize
    ? `১ জন গোলকিপার + ${toBn(count - 1)} জন আউটফিল্ড খেলোয়াড়`
    : `কাস্টম: ১ জন গোলকিপার + ${toBn(count - 1)} জন আউটফিল্ড খেলোয়াড়`;

  // Formation buttons for the current size
  const grid = $('formations-grid');
  const format = FORMATS.find((f) => f.size === count);
  grid.innerHTML = '';
  if (format) {
    format.formations.forEach((name) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'formation-btn';
      btn.classList.toggle('active', name === state.formation && !state.edited);
      btn.innerHTML = `${miniFormationSvg(name)}<span>${name}</span>`;
      btn.addEventListener('click', () => applyFormation(name));
      grid.appendChild(btn);
    });
  } else {
    grid.innerHTML = `<p class="empty-note">কাস্টম ফরমেশন: <strong>${state.formation}</strong></p>`;
  }

  // Theme buttons
  document.querySelectorAll('.theme-btn').forEach((b) => b.classList.toggle('active', b.dataset.theme === state.theme));

  // Kit inputs
  [['primary-color', 'primary-hex', 'kit1'], ['secondary-color', 'secondary-hex', 'kit2'], ['gk-color', 'gk-hex', 'gkKit']]
    .forEach(([input, hex, key]) => {
      $(input).value = state[key];
      $(hex).textContent = state[key].toUpperCase();
    });
  document.querySelectorAll('.kit-preset').forEach((b) => {
    b.classList.toggle('active', b.dataset.kit1 === state.kit1 && b.dataset.kit2 === state.kit2);
  });

  if (document.activeElement !== $('team-name-input')) $('team-name-input').value = state.teamName;
}

// Tiny dot diagram of a formation, used on the formation buttons.
function miniFormationSvg(name) {
  const dots = layoutFor(name)
    .map((c) => `<circle cx="${(c.x * 0.4 + 2).toFixed(1)}" cy="${(c.y * 0.5 + 1).toFixed(1)}" r="2.4"${c.role === 'GK' ? ' class="gk"' : ''}/>`)
    .join('');
  return `<svg class="mini-formation" viewBox="0 0 44 50" aria-hidden="true"><rect x="1" y="1" width="42" height="48" rx="3"/>${dots}</svg>`;
}

function renderPitch() {
  const count = activeCount();
  const pitch = $('pitch');
  pitch.className = `football-pitch theme-${state.theme}${count <= 7 ? ' pitch-small' : ''}${carousel.active ? ' carousel-on' : ''}`;

  for (let i = 0; i < MAX_SLOTS; i++) {
    const node = $(`player-slot-${i}`);
    const player = state.players[i];
    if (i >= count || !player) {
      node.style.display = 'none';
      delete node.dataset.playerId;
      continue;
    }
    const coord = state.coords[i];
    player.role = coord.role;
    node.style.display = '';
    node.dataset.playerId = player.id;
    node.dataset.role = coord.role;
    node.style.left = `${coord.x}%`;
    node.style.top = `${coord.y}%`;
    node.classList.toggle('has-photo', !!player.photo);
    node.classList.toggle('is-captain', !!player.isCaptain);

    const target = node.querySelector('.avatar-target');
    target.replaceChildren(avatarEl(player, coord.role, true));
    node.querySelector('.player-number-badge').textContent = player.number;
    node.querySelector('.player-name').textContent = player.name;

    const card = node.querySelector('.player-detail-card');
    const pill = card.querySelector('.role-pill');
    pill.textContent = coord.role;
    pill.className = `role-pill ${coord.role}`;
    card.querySelector('.detail-number').textContent = `#${player.number}`;
    card.querySelector('.detail-name').textContent = player.name;
    card.querySelector('.detail-avatar').replaceChildren(avatarEl(player, coord.role, false));
  }
}

function renderBench() {
  const list = $('bench-list');
  const bench = benchPlayers();
  $('bench-count').textContent = `${toBn(bench.length)} জন`;
  list.replaceChildren();

  if (!bench.length) {
    const empty = document.createElement('p');
    empty.className = 'bench-empty';
    empty.textContent = 'বেঞ্চ খালি — মাঠ থেকে খেলোয়াড় এখানে টেনে আনুন';
    list.appendChild(empty);
    return;
  }

  bench.forEach((player) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'bench-player';
    card.dataset.playerId = player.id;

    const av = document.createElement('div');
    av.className = 'bench-avatar';
    av.appendChild(avatarEl(player, player.role, !player.photo));
    if (player.photo) {
      const num = document.createElement('span');
      num.className = 'bench-number';
      num.textContent = player.number;
      av.appendChild(num);
    }
    if (player.isCaptain) {
      const c = document.createElement('span');
      c.className = 'captain-badge show';
      c.textContent = 'C';
      av.appendChild(c);
    }
    const name = document.createElement('span');
    name.className = 'bench-name';
    name.textContent = player.name;

    card.append(av, name);
    card.addEventListener('click', () => openEditModal(player.id));
    list.appendChild(card);
  });
}

function renderSquadPanel() {
  const fill = (listId, players, startIndex) => {
    const list = $(listId);
    list.replaceChildren();
    players.forEach((player, idx) => {
      const role = startIndex === 0 ? state.coords[idx].role : player.role;
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'squad-row';

      const num = document.createElement('span');
      num.className = 'squad-avatar';
      num.appendChild(avatarEl(player, role, true));

      const name = document.createElement('span');
      name.className = 'squad-name';
      name.textContent = player.name;
      if (player.isCaptain) {
        const c = document.createElement('span');
        c.className = 'squad-captain';
        c.textContent = 'C';
        name.appendChild(c);
      }

      const pill = document.createElement('span');
      pill.className = `role-pill ${role}`;
      pill.textContent = role;

      btn.append(num, name, pill);
      btn.addEventListener('click', () => openEditModal(player.id));
      li.appendChild(btn);
      list.appendChild(li);
    });
  };

  fill('starters-list', starters(), 0);
  fill('bench-squad-list', benchPlayers(), activeCount());
  $('starters-count').textContent = `(${toBn(starters().length)})`;
  $('bench-list-count').textContent = `(${toBn(benchPlayers().length)})`;
  $('bench-empty').classList.toggle('hidden', benchPlayers().length > 0);
  $('squad-total').textContent = `মোট ${toBn(state.players.length)} জন`;
}

/* =========================================================
   ACTIONS
   ========================================================= */

function applyFormation(name) {
  const layout = layoutFor(name);
  if (!layout) return false;
  state.formation = name;
  state.coords = layout;
  state.edited = false;
  ensureSquadSize(layout.length);
  render();
  fitStage();
  return true;
}

function setTeamSize(size) {
  const format = FORMATS.find((f) => f.size === size);
  if (!format) return;
  const keep = activeCount() === size && format.formations.includes(state.formation) && !state.edited;
  if (!keep) applyFormation(format.formations[0]);
}

function resetAll() {
  showConfirm('রিসেট নিশ্চিত করুন', 'দল, রং, ফরমেশন ও সব খেলোয়াড়ের পরিবর্তন মুছে শুরুর অবস্থায় ফিরবে।', () => {
    stopSlideshow();
    state = freshState();
    render();
    fitStage();
    toast('সবকিছু রিসেট করা হয়েছে');
  });
}

/* =========================================================
   DRAG & DROP
   ========================================================= */

let drag = null;

function enableDragging() {
  const container = $('players-container');
  container.addEventListener('mousedown', startDrag);
  container.addEventListener('touchstart', startDrag, { passive: false });
  document.addEventListener('mousemove', moveDrag);
  document.addEventListener('touchmove', moveDrag, { passive: false });
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);
}

const pointOf = (e) => (e.changedTouches ? e.changedTouches[0] : e);

function startDrag(e) {
  const node = e.target.closest('.player-node');
  if (!node || (e.button !== undefined && e.button !== 0)) return;
  e.preventDefault();
  if (carousel.active) {
    // During the carousel, tapping a player jumps to their slide.
    carouselGo(Number(node.dataset.slotIndex));
    return;
  }

  const pt = pointOf(e);
  const rect = node.getBoundingClientRect();
  drag = {
    node,
    pitchRect: $('pitch').getBoundingClientRect(),
    offX: pt.clientX - (rect.left + rect.width / 2),
    offY: pt.clientY - (rect.top + rect.height / 2),
    startX: pt.clientX,
    startY: pt.clientY,
    moved: false
  };
}

function moveDrag(e) {
  if (!drag) return;
  const pt = pointOf(e);
  if (!drag.moved && Math.hypot(pt.clientX - drag.startX, pt.clientY - drag.startY) < 4) return;
  e.preventDefault();
  if (!drag.moved) {
    drag.moved = true;
    drag.node.classList.add('dragging');
  }
  const { pitchRect } = drag;
  const x = ((pt.clientX - pitchRect.left - drag.offX) / pitchRect.width) * 100;
  const y = ((pt.clientY - pitchRect.top - drag.offY) / pitchRect.height) * 100;
  drag.node.style.left = `${Math.max(2, Math.min(98, x))}%`;
  drag.node.style.top = `${Math.max(2, Math.min(118, y))}%`;

  const bench = document.querySelector('.bench-container');
  bench.classList.toggle('drop-target', isOver(bench, pt) && benchPlayers().length > 0);
}

const isOver = (el, pt) => {
  const r = el.getBoundingClientRect();
  return pt.clientX >= r.left && pt.clientX <= r.right && pt.clientY >= r.top && pt.clientY <= r.bottom;
};

function endDrag(e) {
  if (!drag) return;
  const { node, moved } = drag;
  drag = null;
  node.classList.remove('dragging');
  const bench = document.querySelector('.bench-container');
  bench.classList.remove('drop-target');

  if (!moved) {
    openPlayerFromNode(node);
    return;
  }

  const slot = Number(node.dataset.slotIndex);
  const pt = pointOf(e);

  // Dropped on the bench → swap with the first substitute.
  if (isOver(bench, pt) && benchPlayers().length > 0) {
    const first = activeCount();
    [state.players[slot], state.players[first]] = [state.players[first], state.players[slot]];
    render();
    return;
  }

  const x = Math.max(6, Math.min(94, parseFloat(node.style.left)));
  const y = Math.max(6, Math.min(94, parseFloat(node.style.top)));
  const role = y > 80 ? 'GK' : y > 55 ? 'DEF' : y > 30 ? 'MID' : 'FWD';
  state.coords[slot] = { role, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  state.edited = true;
  render();
}

/* =========================================================
   PLAYER CLICK / 3D CARDS / SLIDESHOW
   ========================================================= */

function onPlayerNodeClick(e) {
  // Mouse/touch clicks are handled in endDrag; this covers keyboard activation.
  if (e.detail !== 0) e.stopPropagation();
}

function openPlayerFromNode(node) {
  const id = Number(node.dataset.playerId);
  if (!id) return;
  if (is3D && !node.classList.contains('show-detail-card')) {
    document.querySelectorAll('.player-node.show-detail-card').forEach((n) => n.classList.remove('show-detail-card'));
    node.classList.add('show-detail-card');
    return;
  }
  node.classList.remove('show-detail-card');
  openEditModal(id);
}

/* ---------- Player spotlight carousel ---------- */

const CAROUSEL_MS = 4500;
const ROLE_BN = { GK: 'গোলকিপার', DEF: 'ডিফেন্ডার', MID: 'মিডফিল্ডার', FWD: 'ফরোয়ার্ড' };

const carousel = {
  active: false,
  index: 0,
  timer: null,
  remaining: CAROUSEL_MS,
  startedAt: 0,
  hover: false,
  userPaused: false,
  held: false
};

function buildCarousel() {
  const track = $('carousel-track');
  const dots = $('carousel-dots');
  track.replaceChildren();
  dots.replaceChildren();

  starters().forEach((player, i) => {
    const role = state.coords[i].role;
    const slide = document.createElement('article');
    slide.className = 'slide';
    slide.setAttribute('aria-roledescription', 'slide');

    const big = document.createElement('span');
    big.className = 'slide-bignum';
    big.textContent = player.number;

    const avatar = document.createElement('div');
    avatar.className = 'slide-avatar';
    avatar.appendChild(avatarEl(player, role, true));

    const info = document.createElement('div');
    info.className = 'slide-info';
    const tags = document.createElement('div');
    tags.className = 'slide-tags';
    tags.innerHTML = `<span class="role-pill ${role}">${role}</span><span class="slide-pos">${ROLE_BN[role]}</span>`;
    if (player.isCaptain) tags.insertAdjacentHTML('beforeend', '<span class="slide-captain">অধিনায়ক</span>');

    const name = document.createElement('h3');
    name.className = 'slide-name';
    name.textContent = player.name;

    const meta = document.createElement('div');
    meta.className = 'slide-meta';
    meta.innerHTML = `<span><small>জার্সি</small><strong>${player.number}</strong></span><span><small>পজিশন</small><strong>${toBn(i + 1)}</strong></span>`;

    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'slide-edit';
    edit.textContent = 'এডিট করুন →';
    edit.addEventListener('click', () => {
      carousel.userPaused = true;
      carousel.editPause = true;
      updateHold();
      openEditModal(player.id);
    });

    info.append(tags, name, meta, edit);
    slide.append(big, avatar, info);
    track.appendChild(slide);

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `${player.name}`);
    dot.addEventListener('click', () => carouselGo(i));
    dots.appendChild(dot);
  });
}

function carouselGo(i) {
  const n = starters().length;
  if (!carousel.active || !n) return;
  carousel.index = ((i % n) + n) % n;
  const idx = carousel.index;

  $('carousel-track').style.transform = `translateX(${-idx * 100}%)`;
  document.querySelectorAll('.carousel-dot').forEach((d, j) => d.classList.toggle('active', j === idx));
  $('carousel-counter').textContent = `${toBn(String(idx + 1).padStart(2, '0'))} / ${toBn(String(n).padStart(2, '0'))}`;

  positionCarousel();

  document.querySelectorAll('.player-node.spotlight').forEach((el) => el.classList.remove('spotlight'));
  $(`player-slot-${idx}`)?.classList.add('spotlight');

  // Restart the progress bar animation.
  const bar = $('carousel-progress');
  bar.classList.remove('run');
  void bar.offsetWidth;
  bar.style.animationDuration = `${CAROUSEL_MS}ms`;
  bar.classList.add('run');

  clearTimeout(carousel.timer);
  carousel.remaining = CAROUSEL_MS;
  carousel.startedAt = performance.now();
  if (!carousel.held) carousel.timer = setTimeout(() => carouselGo(carousel.index + 1), CAROUSEL_MS);
}

// Pause while hovered or when the user pressed pause; resume with the time that was left.
function updateHold() {
  const hold = carousel.hover || carousel.userPaused;
  if (hold && !carousel.held) {
    clearTimeout(carousel.timer);
    carousel.remaining -= performance.now() - carousel.startedAt;
    carousel.held = true;
  } else if (!hold && carousel.held) {
    carousel.held = false;
    carousel.startedAt = performance.now();
    carousel.timer = setTimeout(() => carouselGo(carousel.index + 1), Math.max(300, carousel.remaining));
  }
  $('carousel').classList.toggle('paused', hold);
  $('carousel').classList.toggle('user-paused', carousel.userPaused);
  $('carousel-play').setAttribute('aria-label', carousel.userPaused ? 'চালু করুন' : 'থামান');
}

function startSlideshow() {
  if (!starters().length) return;
  Object.assign(carousel, { active: true, index: 0, hover: false, userPaused: false, held: false });
  $('slideshow-toggle').checked = true;
  document.querySelectorAll('.player-node.show-detail-card').forEach((n) => n.classList.remove('show-detail-card'));
  buildCarousel();
  $('pitch').classList.add('carousel-on');
  $('carousel').classList.add('show');
  setLaunchState(true);
  updateHold();
  carouselGo(0);
}

function stopSlideshow() {
  $('slideshow-toggle').checked = false;
  if (!carousel.active) return;
  carousel.active = false;
  clearTimeout(carousel.timer);
  $('pitch').classList.remove('carousel-on');
  $('carousel').classList.remove('show');
  setLaunchState(false);
  $('carousel').classList.remove('paused', 'user-paused');
  document.querySelectorAll('.player-node.spotlight').forEach((el) => el.classList.remove('spotlight'));
}

// Called after every render so the slides match the current squad.
function refreshCarousel() {
  if (!carousel.active) return;
  if (!starters().length) return stopSlideshow();
  buildCarousel();
  const idx = Math.min(carousel.index, starters().length - 1);
  if (carousel.held) {
    // Keep the paused state; just re-show the current slide.
    const wasRemaining = carousel.remaining;
    carousel.held = false;
    carouselGo(idx);
    updateHold();
    carousel.remaining = wasRemaining;
  } else {
    carouselGo(idx);
  }
}

// Place the card over the pitch in real screen pixels (outside the scaled/3D pitch),
// in the half away from the featured player. Integer px = no sub-pixel blur.
function positionCarousel() {
  if (!carousel.active) return;
  const stage = $('stage');
  const card = $('carousel');
  const s = stage.getBoundingClientRect();
  const p = $('pitch').getBoundingClientRect();

  const width = Math.round(Math.min(460, s.width - 24, Math.max(360, p.width * 0.95)));
  card.style.width = `${width}px`;
  card.classList.toggle('compact', width < 390);

  const h = card.offsetHeight;
  const y = state.coords[carousel.index]?.y ?? 50;
  const anchor = y >= 50 ? 0.27 : 0.73;
  const minTop = p.top - s.top + 8;
  const maxTop = p.bottom - s.top - h - 8;
  let top = p.top - s.top + p.height * anchor - h / 2;
  top = maxTop > minTop ? Math.min(Math.max(top, minTop), maxTop) : p.top - s.top + (p.height - h) / 2;
  const left = p.left - s.left + (p.width - width) / 2;

  card.style.left = `${Math.round(Math.max(12, left))}px`;
  card.style.top = `${Math.round(top)}px`;
}

function setLaunchState(on) {
  const btn = $('carousel-launch');
  btn.classList.toggle('active', on);
  $('carousel-launch-label').textContent = on ? 'ক্যারোসেল বন্ধ করুন' : 'প্লেয়ার ক্যারোসেল';
}

function setupCarousel() {
  $('carousel-launch').addEventListener('click', () => (carousel.active ? stopSlideshow() : startSlideshow()));
  $('carousel-close').addEventListener('click', stopSlideshow);
  $('carousel-backdrop').addEventListener('click', stopSlideshow);
  $('carousel-prev').addEventListener('click', () => carouselGo(carousel.index - 1));
  $('carousel-next').addEventListener('click', () => carouselGo(carousel.index + 1));
  $('carousel-play').addEventListener('click', () => {
    carousel.userPaused = !carousel.userPaused;
    updateHold();
  });

  const card = $('carousel');
  card.addEventListener('mouseenter', () => { carousel.hover = true; updateHold(); });
  card.addEventListener('mouseleave', () => { carousel.hover = false; updateHold(); });

  // Swipe between slides on touch / pen / mouse drag.
  const viewport = $('carousel-viewport');
  let swipeX = null;
  viewport.addEventListener('pointerdown', (e) => { swipeX = e.clientX; });
  viewport.addEventListener('pointerup', (e) => {
    if (swipeX === null) return;
    const dx = e.clientX - swipeX;
    swipeX = null;
    if (Math.abs(dx) > 40) carouselGo(carousel.index + (dx < 0 ? 1 : -1));
  });
  viewport.addEventListener('pointercancel', () => { swipeX = null; });

  window.addEventListener('keydown', (e) => {
    if (!carousel.active || document.querySelector('.modal-overlay.active')) return;
    if (e.target.closest?.('input, select, textarea, button')) return;
    if (e.key === 'ArrowRight') carouselGo(carousel.index + 1);
    else if (e.key === 'ArrowLeft') carouselGo(carousel.index - 1);
    else if (e.key === ' ') { e.preventDefault(); carousel.userPaused = !carousel.userPaused; updateHold(); }
  });
}

function set3D(on) {
  is3D = on;
  $('pitch-viewport').classList.toggle('mode-3d', on);
  setTimeout(positionCarousel, 950); // after the 3D tilt transition
}

/* =========================================================
   EDIT MODAL
   ========================================================= */

function openEditModal(playerId) {
  const index = state.players.findIndex((p) => p.id === playerId);
  if (index === -1) return;
  const player = state.players[index];
  const onPitch = index < activeCount();

  editingPlayerId = playerId;
  editingPhoto = player.photo;

  $('player-modal-title').textContent = onPitch ? 'মাঠের খেলোয়াড় এডিট' : 'বেঞ্চের খেলোয়াড় এডিট';
  $('player-name-input').value = player.name;
  $('player-number-input').value = player.number;
  $('player-role-input').value = onPitch ? state.coords[index].role : player.role;
  $('player-captain-input').checked = !!player.isCaptain;

  const select = $('player-swap-select');
  select.replaceChildren(new Option(onPitch ? '— বেঞ্চের কারো সাথে বদল করুন —' : '— মাঠের কারো সাথে বদল করুন —', ''));
  const pool = onPitch ? benchPlayers() : starters();
  pool.forEach((p) => select.appendChild(new Option(`#${p.number} ${p.name}`, p.id)));
  $('swap-label').textContent = onPitch ? 'সাবস্টিটিউশন (বেঞ্চ থেকে)' : 'মাঠে নামান (যার বদলে)';
  $('swap-player-field').classList.toggle('hidden', pool.length === 0);

  updateModalAvatar();
  $('player-modal').classList.add('active');
  setTimeout(() => $('player-name-input').focus(), 50);
}

function updateModalAvatar() {
  const img = $('modal-photo-preview');
  const placeholder = $('modal-photo-placeholder');
  const index = state.players.findIndex((p) => p.id === editingPlayerId);
  const role = index > -1 && index < activeCount() ? state.coords[index].role : $('player-role-input').value;

  img.classList.toggle('hidden', !editingPhoto);
  placeholder.classList.toggle('hidden', !!editingPhoto);
  $('remove-photo-btn').classList.toggle('hidden', !editingPhoto);
  if (editingPhoto) {
    img.src = editingPhoto;
  } else {
    img.removeAttribute('src');
    const [main, trim] = role === 'GK' ? [state.gkKit, readableOn(state.gkKit)] : [state.kit1, state.kit2];
    placeholder.innerHTML = jerseySvg(main, trim, $('player-number-input').value || '');
  }
}

function closeEditModal() {
  if (carousel.active && carousel.editPause) {
    carousel.editPause = false;
    carousel.userPaused = false;
    updateHold();
  }
  $('player-modal').classList.remove('active');
  editingPlayerId = null;
  editingPhoto = null;
  $('player-photo-input').value = '';
}

function savePlayer() {
  const index = state.players.findIndex((p) => p.id === editingPlayerId);
  if (index === -1) return closeEditModal();
  const player = state.players[index];

  player.name = $('player-name-input').value.trim() || player.name;
  player.number = Math.max(1, Math.min(99, parseInt($('player-number-input').value, 10) || player.number));
  player.photo = editingPhoto;

  const role = $('player-role-input').value;
  if (index < activeCount()) {
    if (state.coords[index].role !== role) {
      state.coords[index].role = role;
      state.edited = true;
    }
  } else {
    player.role = role;
  }

  if ($('player-captain-input').checked) state.players.forEach((p) => { p.isCaptain = p === player; });
  else player.isCaptain = false;

  const swapId = Number($('player-swap-select').value);
  if (swapId) {
    const swapIndex = state.players.findIndex((p) => p.id === swapId);
    if (swapIndex > -1) [state.players[index], state.players[swapIndex]] = [state.players[swapIndex], state.players[index]];
  }

  closeEditModal();
  render();
  toast(swapId ? 'সাবস্টিটিউশন সম্পন্ন' : 'খেলোয়াড়ের তথ্য সংরক্ষিত');
}

function deleteEditingPlayer() {
  if (state.players.length <= activeCount()) {
    showAlert('খেলোয়াড় কম', `এই ফরমেশনে কমপক্ষে ${toBn(activeCount())} জন খেলোয়াড় লাগবে। আগে নতুন খেলোয়াড় যোগ করুন বা ছোট দল বেছে নিন।`);
    return;
  }
  const id = editingPlayerId;
  showConfirm('খেলোয়াড় বাদ দিন', 'এই খেলোয়াড়কে স্কোয়াড থেকে বাদ দিতে চান? মাঠে থাকলে বেঞ্চের প্রথম জন তার জায়গায় নামবে।', () => {
    const index = state.players.findIndex((p) => p.id === id);
    if (index > -1 && index < activeCount()) {
      // Bring the first substitute into the vacated slot so the shape is kept.
      const [sub] = state.players.splice(activeCount(), 1);
      state.players[index] = sub;
    } else {
      state.players.splice(index, 1);
    }
    closeEditModal();
    render();
    toast('খেলোয়াড় বাদ দেওয়া হয়েছে');
  });
}

function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) {
    showAlert('ফাইল অনেক বড়', 'অনুগ্রহ করে ৩ মেগাবাইটের কম সাইজের ছবি দিন।');
    e.target.value = '';
    return;
  }
  // Downscale to keep exports fast and localStorage small.
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const size = 512;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const s = Math.min(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      editingPhoto = canvas.toDataURL('image/jpeg', 0.9);
      updateModalAvatar();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

/* =========================================================
   CONFIRM / ALERT
   ========================================================= */

function showDialog({ title, message, okText, okClass, showCancel, onOk }) {
  const modal = $('confirm-modal');
  $('confirm-title').textContent = title;
  $('confirm-message').textContent = message;

  const oldOk = $('confirm-ok-btn');
  const oldCancel = $('confirm-cancel-btn');
  const ok = oldOk.cloneNode(false);
  const cancel = oldCancel.cloneNode(true);
  ok.textContent = okText;
  ok.className = `btn ${okClass}`;
  cancel.classList.toggle('hidden', !showCancel);
  oldOk.replaceWith(ok);
  oldCancel.replaceWith(cancel);

  const close = () => modal.classList.remove('active');
  ok.addEventListener('click', () => { close(); onOk?.(); });
  cancel.addEventListener('click', close);
  modal.onclick = (e) => { if (e.target === modal) close(); };
  modal.classList.add('active');
  ok.focus();
}

const showConfirm = (title, message, onOk) =>
  showDialog({ title, message, okText: 'হ্যাঁ, নিশ্চিত', okClass: 'btn-danger', showCancel: true, onOk });

const showAlert = (title, message) =>
  showDialog({ title, message, okText: 'ঠিক আছে', okClass: 'btn-accent', showCancel: false });

/* =========================================================
   EXPORT
   ========================================================= */

function exportImage() {
  const overlay = $('export-overlay');
  const viewport = $('pitch-viewport');
  const scaler = $('pitch-scale');
  overlay.classList.remove('hidden');
  stopSlideshow();

  // Render flat and unscaled for a crisp image.
  viewport.classList.remove('mode-3d');
  const prevTransform = scaler.style.transform;
  scaler.style.transform = 'none';
  document.body.classList.add('exporting');

  const restore = () => {
    scaler.style.transform = prevTransform;
    if (is3D) viewport.classList.add('mode-3d');
    document.body.classList.remove('exporting');
    overlay.classList.add('hidden');
  };

  setTimeout(() => {
    html2canvas($('capture-container'), { scale: 2, useCORS: true, logging: false, backgroundColor: '#0a0d14' })
      .then((canvas) => {
        const link = document.createElement('a');
        const safe = (state.teamName || 'lineup').trim().replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_');
        link.download = `${safe}_${state.formation}_lineup.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast('লাইনআপ ইমেজ ডাউনলোড হয়েছে');
      })
      .catch((err) => {
        console.error('Export failed:', err);
        showAlert('ডাউনলোড ব্যর্থ', 'ইমেজ তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      })
      .finally(restore);
  }, 450);
}

/* =========================================================
   RESPONSIVE PITCH FIT
   ========================================================= */

function fitStage() {
  const stage = $('stage');
  const fit = $('pitch-fit');
  const scaler = $('pitch-scale');
  const capture = $('capture-container');
  if (document.body.classList.contains('exporting')) return;

  const natW = capture.offsetWidth;
  const natH = capture.offsetHeight;
  const styles = getComputedStyle(stage);
  const padX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
  const availW = stage.clientWidth - padX;

  let scale = Math.min(1, availW / natW);
  if (window.innerWidth > 1024) {
    const hint = stage.querySelector('.stage-bar');
    const padY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    const availH = stage.clientHeight - padY - (hint ? hint.offsetHeight + 12 : 0);
    scale = Math.min(scale, availH / natH);
  }
  scale = Math.max(0.3, scale);

  scaler.style.transform = `scale(${scale})`;
  fit.style.width = `${natW * scale}px`;
  fit.style.height = `${natH * scale}px`;
  positionCarousel();
}

/* =========================================================
   WIRING
   ========================================================= */

function buildStaticControls() {
  const chips = $('size-chips');
  FORMATS.forEach(({ size }) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'size-chip';
    chip.dataset.size = size;
    chip.setAttribute('role', 'radio');
    chip.innerHTML = `<strong>${toBn(size)}</strong><span>জন</span>`;
    chip.addEventListener('click', () => setTeamSize(size));
    chips.appendChild(chip);
  });

  const presets = $('kit-presets');
  KIT_PRESETS.forEach(([k1, k2]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'kit-preset';
    b.dataset.kit1 = k1;
    b.dataset.kit2 = k2;
    b.title = `${k1} / ${k2}`;
    b.innerHTML = jerseySvg(k1, k2);
    b.addEventListener('click', () => {
      state.kit1 = k1;
      state.kit2 = k2;
      render();
    });
    presets.appendChild(b);
  });
}

function setupEvents() {
  $('team-name-input').addEventListener('input', (e) => {
    state.teamName = e.target.value;
    renderHeader();
    saveState();
  });

  [['primary-color', 'kit1'], ['secondary-color', 'kit2'], ['gk-color', 'gkKit']].forEach(([id, key]) => {
    $(id).addEventListener('input', (e) => {
      state[key] = e.target.value;
      render();
    });
  });

  $('custom-formation-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('custom-formation-input');
    const parsed = parseFormation(input.value);
    const ok = parsed && applyFormation(parsed.name);
    $('custom-formation-error').classList.toggle('hidden', !!ok);
    input.classList.toggle('invalid', !ok);
    if (ok) input.value = '';
  });

  $('themes-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('.theme-btn');
    if (!btn) return;
    state.theme = btn.dataset.theme;
    render();
  });

  $('perspective-toggle').addEventListener('change', (e) => set3D(e.target.checked));
  $('slideshow-toggle').addEventListener('change', (e) => (e.target.checked ? startSlideshow() : stopSlideshow()));

  $('reset-btn').addEventListener('click', resetAll);
  $('download-btn').addEventListener('click', exportImage);
  $('add-player-btn').addEventListener('click', () => {
    addPlayerToState();
    render();
    toast('নতুন খেলোয়াড় বেঞ্চে যোগ হয়েছে');
  });

  // Modal
  $('modal-close').addEventListener('click', closeEditModal);
  $('modal-cancel-btn').addEventListener('click', closeEditModal);
  $('player-modal').addEventListener('click', (e) => { if (e.target.id === 'player-modal') closeEditModal(); });
  $('player-edit-form').addEventListener('submit', (e) => { e.preventDefault(); savePlayer(); });
  $('player-photo-input').addEventListener('change', handlePhotoUpload);
  $('remove-photo-btn').addEventListener('click', () => {
    editingPhoto = null;
    $('player-photo-input').value = '';
    updateModalAvatar();
  });
  $('player-number-input').addEventListener('input', () => { if (!editingPhoto) updateModalAvatar(); });
  $('player-role-input').addEventListener('change', () => { if (!editingPhoto) updateModalAvatar(); });
  $('modal-delete-btn').addEventListener('click', deleteEditingPlayer);

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const modalOpen = document.querySelector('.modal-overlay.active');
    closeEditModal();
    $('confirm-modal').classList.remove('active');
    if (!modalOpen) stopSlideshow();
  });

  // Clicking empty space hides 3D detail cards.
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.player-node')) {
      document.querySelectorAll('.player-node.show-detail-card').forEach((n) => n.classList.remove('show-detail-card'));
    }
  });

  // Keep the pitch fitted to the available space.
  const ro = new ResizeObserver(() => fitStage());
  ro.observe($('stage'));
  ro.observe($('capture-container'));
  window.addEventListener('resize', fitStage);
  document.fonts?.ready.then(fitStage);
}

function init() {
  loadState();
  ensureSquadSize(activeCount());
  buildStaticControls();
  buildPlayerNodes();
  setupEvents();
  enableDragging();
  setupCarousel();
  render();
  fitStage();
}

window.addEventListener('DOMContentLoaded', init);
