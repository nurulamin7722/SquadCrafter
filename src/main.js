import html2canvas from 'html2canvas';

// Default Squad Data
const defaultPlayers = [
  { id: 1, name: "ই. মার্টিনেজ", number: 1, role: "GK", photo: null },
  { id: 2, name: "এ. রবার্টসন", number: 26, role: "DEF", photo: null },
  { id: 3, name: "ভি. ভ্যান ডাইক", number: 4, role: "DEF", photo: null },
  { id: 4, name: "ডব্লিউ. সালিবা", number: 2, role: "DEF", photo: null },
  { id: 5, name: "এ. হাকিমি", number: 2, role: "DEF", photo: null },
  { id: 6, name: "কে. ডি ব্রুইনা", number: 17, role: "MID", photo: null },
  { id: 7, name: "রদ্রি", number: 16, role: "MID", photo: null },
  { id: 8, name: "জে. বেলিংহাম", number: 5, role: "MID", photo: null },
  { id: 9, name: "এল. মেসি", number: 10, role: "FWD", photo: null },
  { id: 10, name: "ই. হালান্ড", number: 9, role: "FWD", photo: null },
  { id: 11, name: "কে. এমবাপ্পে", number: 7, role: "FWD", photo: null }
];

// Deep copy of default players for runtime edits
let players = JSON.parse(JSON.stringify(defaultPlayers));

// Formations Coordinates Layouts (values in percentage x, y)
// x is left-to-right (0 to 100), y is top-to-bottom (0 to 100)
const formations = {
  '4-3-3': [
    { role: 'GK', x: 50, y: 88 },
    { role: 'DEF', x: 15, y: 72 },
    { role: 'DEF', x: 38, y: 75 },
    { role: 'DEF', x: 62, y: 75 },
    { role: 'DEF', x: 85, y: 72 },
    { role: 'MID', x: 25, y: 52 },
    { role: 'MID', x: 50, y: 56 },
    { role: 'MID', x: 75, y: 52 },
    { role: 'FWD', x: 20, y: 25 },
    { role: 'FWD', x: 50, y: 20 },
    { role: 'FWD', x: 80, y: 25 }
  ],
  '4-4-2': [
    { role: 'GK', x: 50, y: 88 },
    { role: 'DEF', x: 15, y: 72 },
    { role: 'DEF', x: 38, y: 75 },
    { role: 'DEF', x: 62, y: 75 },
    { role: 'DEF', x: 85, y: 72 },
    { role: 'MID', x: 15, y: 48 },
    { role: 'MID', x: 38, y: 52 },
    { role: 'MID', x: 62, y: 52 },
    { role: 'MID', x: 85, y: 48 },
    { role: 'FWD', x: 35, y: 22 },
    { role: 'FWD', x: 65, y: 22 }
  ],
  '3-5-2': [
    { role: 'GK', x: 50, y: 88 },
    { role: 'DEF', x: 25, y: 75 },
    { role: 'DEF', x: 50, y: 77 },
    { role: 'DEF', x: 75, y: 75 },
    { role: 'MID', x: 12, y: 50 },
    { role: 'MID', x: 33, y: 52 },
    { role: 'MID', x: 50, y: 56 },
    { role: 'MID', x: 67, y: 52 },
    { role: 'MID', x: 88, y: 50 },
    { role: 'FWD', x: 35, y: 22 },
    { role: 'FWD', x: 65, y: 22 }
  ],
  '4-2-3-1': [
    { role: 'GK', x: 50, y: 88 },
    { role: 'DEF', x: 15, y: 72 },
    { role: 'DEF', x: 38, y: 75 },
    { role: 'DEF', x: 62, y: 75 },
    { role: 'DEF', x: 85, y: 72 },
    { role: 'MID', x: 35, y: 58 },
    { role: 'MID', x: 65, y: 58 },
    { role: 'MID', x: 22, y: 38 },
    { role: 'MID', x: 50, y: 36 },
    { role: 'MID', x: 78, y: 38 },
    { role: 'FWD', x: 50, y: 20 }
  ],
  '5-3-2': [
    { role: 'GK', x: 50, y: 88 },
    { role: 'DEF', x: 12, y: 70 },
    { role: 'DEF', x: 30, y: 75 },
    { role: 'DEF', x: 50, y: 77 },
    { role: 'DEF', x: 70, y: 75 },
    { role: 'DEF', x: 88, y: 70 },
    { role: 'MID', x: 28, y: 50 },
    { role: 'MID', x: 50, y: 54 },
    { role: 'MID', x: 72, y: 50 },
    { role: 'FWD', x: 35, y: 22 },
    { role: 'FWD', x: 65, y: 22 }
  ],
  '4-4-1': [
    { role: 'GK', x: 50, y: 88 },
    { role: 'DEF', x: 15, y: 72 },
    { role: 'DEF', x: 38, y: 75 },
    { role: 'DEF', x: 62, y: 75 },
    { role: 'DEF', x: 85, y: 72 },
    { role: 'MID', x: 15, y: 48 },
    { role: 'MID', x: 38, y: 52 },
    { role: 'MID', x: 62, y: 52 },
    { role: 'MID', x: 85, y: 48 },
    { role: 'FWD', x: 50, y: 22 }
  ],
  '4-3-2': [
    { role: 'GK', x: 50, y: 88 },
    { role: 'DEF', x: 15, y: 72 },
    { role: 'DEF', x: 38, y: 75 },
    { role: 'DEF', x: 62, y: 75 },
    { role: 'DEF', x: 85, y: 72 },
    { role: 'MID', x: 25, y: 52 },
    { role: 'MID', x: 50, y: 56 },
    { role: 'MID', x: 75, y: 52 },
    { role: 'FWD', x: 35, y: 22 },
    { role: 'FWD', x: 65, y: 22 }
  ],
  '3-4-2': [
    { role: 'GK', x: 50, y: 88 },
    { role: 'DEF', x: 25, y: 75 },
    { role: 'DEF', x: 50, y: 77 },
    { role: 'DEF', x: 75, y: 75 },
    { role: 'MID', x: 15, y: 48 },
    { role: 'MID', x: 38, y: 52 },
    { role: 'MID', x: 62, y: 52 },
    { role: 'MID', x: 85, y: 48 },
    { role: 'FWD', x: 35, y: 22 },
    { role: 'FWD', x: 65, y: 22 }
  ],
  '2-3-1': [
    { role: 'GK', x: 50, y: 88 },
    { role: 'DEF', x: 30, y: 72 },
    { role: 'DEF', x: 70, y: 72 },
    { role: 'MID', x: 20, y: 48 },
    { role: 'MID', x: 50, y: 52 },
    { role: 'MID', x: 80, y: 48 },
    { role: 'FWD', x: 50, y: 22 }
  ],
  '3-2-1': [
    { role: 'GK', x: 50, y: 88 },
    { role: 'DEF', x: 25, y: 72 },
    { role: 'DEF', x: 50, y: 75 },
    { role: 'DEF', x: 75, y: 72 },
    { role: 'MID', x: 32, y: 48 },
    { role: 'MID', x: 68, y: 48 },
    { role: 'FWD', x: 50, y: 22 }
  ],
  '2-2-2': [
    { role: 'GK', x: 50, y: 88 },
    { role: 'DEF', x: 30, y: 72 },
    { role: 'DEF', x: 70, y: 72 },
    { role: 'MID', x: 32, y: 48 },
    { role: 'MID', x: 68, y: 48 },
    { role: 'FWD', x: 35, y: 22 },
    { role: 'FWD', x: 65, y: 22 }
  ],
  '2-1-1': [
    { role: 'GK', x: 50, y: 88 },
    { role: 'DEF', x: 30, y: 72 },
    { role: 'DEF', x: 70, y: 72 },
    { role: 'MID', x: 50, y: 48 },
    { role: 'FWD', x: 50, y: 22 }
  ],
  '1-2-1': [
    { role: 'GK', x: 50, y: 88 },
    { role: 'DEF', x: 50, y: 72 },
    { role: 'MID', x: 33, y: 48 },
    { role: 'MID', x: 67, y: 48 },
    { role: 'FWD', x: 50, y: 22 }
  ]
};

// Global App State
let currentFormation = '4-3-3';
let currentTheme = 'classic';
let is3DEnabled = false;
let teamName = "আমার দল";
let primaryColor = "#e11d48";
let secondaryColor = "#ffffff";

// Editing Session Variables
let editingPlayerId = null;
let editingPlayerPhoto = null;

// Drag and Drop State Variables
let activeDragNode = null;
let dragStartX = 0;
let dragStartY = 0;
let pitchRect = null;

// Fallback Jersey SVG Content
const getJerseySvgContent = () => `
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="jersey-fallback-svg">
    <!-- sleeves -->
    <path d="M15 32L30 20L38 30L25 45L15 32Z" fill="var(--secondary-color)" />
    <path d="M85 32L70 20L62 30L75 45L85 32Z" fill="var(--secondary-color)" />
    <!-- main torso -->
    <path d="M30 20H70V85H30V20Z" fill="var(--primary-color)" />
    <!-- collar -->
    <path d="M40 20C40 26 60 26 60 20H40Z" fill="var(--secondary-color)" />
    <!-- sleeve stripes -->
    <path d="M18 30L25 24" stroke="var(--primary-color)" stroke-width="2" />
    <path d="M82 30L75 24" stroke="var(--primary-color)" stroke-width="2" />
    <!-- center design stripes -->
    <path d="M48 25V85" stroke="var(--secondary-color)" stroke-width="4" opacity="0.8" />
    <path d="M52 25V85" stroke="var(--secondary-color)" stroke-width="4" opacity="0.8" />
  </svg>
`;

// Initialize Field & Player Elements
// Active field coordinates
let activeCoordinates = JSON.parse(JSON.stringify(formations[currentFormation]));

// Initialize Field & Player Elements
function initApp() {
  const container = document.getElementById('players-container');
  container.innerHTML = '';

  // Generate 11 persistent player cards for the 11 slots on the field
  for (let i = 0; i < 11; i++) {
    const node = document.createElement('div');
    node.className = 'player-node';
    node.id = `player-slot-${i}`;
    node.setAttribute('data-slot-index', i);

    node.innerHTML = `
      <div class="player-avatar-wrapper">
        <div class="player-role-indicator"></div>
        <div class="avatar-render-target"></div>
        <div class="player-number-badge"></div>
        <div class="player-edit-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"/></svg>
        </div>
      </div>
      <div class="player-name-badge">
        <span></span>
      </div>
    `;

    // Click handler to edit/swap this player
    node.addEventListener('click', (e) => {
      // Don't open modal if they dragged and let go
      if (node.classList.contains('was-dragged')) {
        node.classList.remove('was-dragged');
        return;
      }
      const playerId = parseInt(node.getAttribute('data-player-id'), 10);
      if (playerId) {
        openEditModal(playerId);
      }
    });

    container.appendChild(node);
  }

  // Apply colors to the pitch element variables
  updatePitchColors();
  
  // Attach DOM events
  setupEventListeners();

  // Enable manual drag-and-drop positioning
  enablePlayerDragging();

  // Render the current squad state (active players & bench)
  renderSquad();
}

// Calculate active outfield players + 1 GK
function getActivePlayerCount() {
  const cleanStr = currentFormation.replace(/,/g, '-').replace(/\s+/g, '');
  const parts = cleanStr.split('-').map(num => parseInt(num, 10));
  const outfieldSum = parts.reduce((a, b) => a + b, 0);
  return outfieldSum + 1;
}

// Render the squad state on the field slots and bench container
function renderSquad() {
  const activeCount = getActivePlayerCount();
  
  // 1. Render active players on the field slots
  for (let i = 0; i < 11; i++) {
    const node = document.getElementById(`player-slot-${i}`);
    if (!node) continue;

    if (i < activeCount && i < players.length) {
      node.style.display = 'flex';
      
      const player = players[i];
      const coords = activeCoordinates[i];
      
      node.setAttribute('data-player-id', player.id);
      node.style.left = `${coords.x}%`;
      node.style.top = `${coords.y}%`;

      // Update name & jersey number
      node.querySelector('.player-number-badge').textContent = player.number;
      node.querySelector('.player-name-badge span').textContent = player.name;

      // Update role indicator
      const roleIndicator = node.querySelector('.player-role-indicator');
      roleIndicator.className = `player-role-indicator ${coords.role}`;
      player.role = coords.role; // sync

      // Update avatar photo/jersey
      const target = node.querySelector('.avatar-render-target');
      if (player.photo) {
        target.innerHTML = `<img class="player-photo" src="${player.photo}" alt="${player.name}">`;
      } else {
        target.innerHTML = getJerseySvgContent();
      }
    } else {
      node.style.display = 'none';
      node.removeAttribute('data-player-id');
    }
  }

  // 2. Render bench players
  const benchList = document.getElementById('bench-list');
  const benchCountText = document.getElementById('bench-count');
  if (benchList && benchCountText) {
    benchList.innerHTML = '';

    const benchPlayers = players.slice(activeCount);
    benchCountText.textContent = `${benchPlayers.length} জন`;

    benchPlayers.forEach(player => {
      const card = document.createElement('div');
      card.className = 'bench-player-card';
      card.setAttribute('data-player-id', player.id);
      
      let avatarContent = '';
      if (player.photo) {
        avatarContent = `<img class="bench-player-photo" src="${player.photo}" alt="${player.name}">`;
      } else {
        avatarContent = `
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="bench-player-jersey" style="--primary-color: ${primaryColor}; --secondary-color: ${secondaryColor};">
            <path d="M15 32L30 20L38 30L25 45L15 32Z" fill="var(--secondary-color)" />
            <path d="M85 32L70 20L62 30L75 45L85 32Z" fill="var(--secondary-color)" />
            <path d="M30 20H70V85H30V20Z" fill="var(--primary-color)" />
            <path d="M40 20C40 26 60 26 60 20H40Z" fill="var(--secondary-color)" />
            <path d="M18 30L25 24" stroke="var(--primary-color)" stroke-width="2" />
            <path d="M82 30L75 24" stroke="var(--primary-color)" stroke-width="2" />
            <path d="M48 25V85" stroke="var(--secondary-color)" stroke-width="4" opacity="0.8" />
            <path d="M52 25V85" stroke="var(--secondary-color)" stroke-width="4" opacity="0.8" />
          </svg>
        `;
      }

      card.innerHTML = `
        <div class="bench-player-avatar">
          ${avatarContent}
          <div class="bench-player-number">${player.number}</div>
        </div>
        <div class="bench-player-name">${player.name}</div>
      `;

      card.addEventListener('click', () => {
        openEditModal(player.id);
      });

      benchList.appendChild(card);
    });
  }
}

// Enable manual drag-and-drop for player cards
function enablePlayerDragging() {
  const container = document.getElementById('players-container');
  
  // Drag start handlers
  container.addEventListener('mousedown', startDrag);
  container.addEventListener('touchstart', startDrag, { passive: false });

  // Move & Drop global handlers
  document.addEventListener('mousemove', dragMove);
  document.addEventListener('touchmove', dragMove, { passive: false });

  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
  const node = e.target.closest('.player-node');
  if (!node) return;

  if (e.target.closest('.player-edit-icon') || e.target.closest('.player-name-badge')) {
    return;
  }

  e.preventDefault();

  activeDragNode = node;
  node.classList.add('dragging');
  node.classList.remove('was-dragged');

  // Cache pitch dimensions
  const pitch = document.getElementById('pitch');
  pitchRect = pitch.getBoundingClientRect();

  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

  // Calculate mouse offset from the center of the player node
  const nodeRect = node.getBoundingClientRect();
  dragStartX = clientX - (nodeRect.left + nodeRect.width / 2);
  dragStartY = clientY - (nodeRect.top + nodeRect.height / 2);
}

function dragMove(e) {
  if (!activeDragNode) return;
  e.preventDefault();

  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

  const xPixel = clientX - pitchRect.left - dragStartX;
  const yPixel = clientY - pitchRect.top - dragStartY;

  // Allow dragging slightly outside bounds for bench substitution drops
  let xPct = (xPixel / pitchRect.width) * 100;
  let yPct = (yPixel / pitchRect.height) * 100;

  xPct = Math.max(2, Math.min(98, xPct));
  yPct = Math.max(2, Math.min(108, yPct));

  activeDragNode.style.left = `${xPct}%`;
  activeDragNode.style.top = `${yPct}%`;
  activeDragNode.classList.add('was-dragged');
}

function endDrag(e) {
  if (!activeDragNode) return;

  const slotIndex = parseInt(activeDragNode.getAttribute('data-slot-index'), 10);
  const clientX = e.type.startsWith('touch') ? e.changedTouches[0].clientX : e.clientX;
  const clientY = e.type.startsWith('touch') ? e.changedTouches[0].clientY : e.clientY;

  activeDragNode.classList.remove('dragging');

  // Check if dropped inside the bench container bounding box
  const bench = document.querySelector('.bench-container');
  let droppedInBench = false;
  if (bench) {
    const benchRect = bench.getBoundingClientRect();
    droppedInBench = (
      clientX >= benchRect.left &&
      clientX <= benchRect.right &&
      clientY >= benchRect.top &&
      clientY <= benchRect.bottom
    );
  }

  const activeCount = getActivePlayerCount();

  if (droppedInBench && activeCount < players.length) {
    // Substitute active player with first bench player
    const temp = players[slotIndex];
    players[slotIndex] = players[activeCount];
    players[activeCount] = temp;

    activeDragNode = null;
    renderSquad();
    return;
  }

  // Otherwise, standard coordinate movement on the field
  let xPct = parseFloat(activeDragNode.style.left);
  let yPct = parseFloat(activeDragNode.style.top);

  // Constrain to field bounds
  xPct = Math.max(6, Math.min(94, xPct));
  yPct = Math.max(6, Math.min(94, yPct));

  activeCoordinates[slotIndex].x = xPct;
  activeCoordinates[slotIndex].y = yPct;

  // Update dynamic player role according to their pitch zone
  let calculatedRole = 'MID';
  if (yPct > 80) calculatedRole = 'GK';
  else if (yPct > 55) calculatedRole = 'DEF';
  else if (yPct > 30) calculatedRole = 'MID';
  else calculatedRole = 'FWD';

  activeCoordinates[slotIndex].role = calculatedRole;
  
  const player = players[slotIndex];
  if (player) {
    player.role = calculatedRole;
  }

  // Clear active formation preset button styling
  const activeBtn = document.querySelector('.formation-btn.active');
  if (activeBtn) {
    activeBtn.classList.remove('active');
  }

  activeDragNode = null;
  renderSquad();
}

// Shift player coordinates based on selected formation
function applyFormation(formationName) {
  currentFormation = formationName;
  const layout = formations[formationName];
  if (!layout) return;

  activeCoordinates = JSON.parse(JSON.stringify(layout));
  
  // Ensure we have enough players in squad for this formation
  const activeCount = getActivePlayerCount();
  while (players.length < activeCount) {
    addNewPlayerWithoutRender();
  }

  renderSquad();
}

// Setup all page events
function setupEventListeners() {
  // Team Name Input
  const teamInput = document.getElementById('team-name-input');
  teamInput.addEventListener('input', (e) => {
    teamName = e.target.value || "আমার দল";
    document.getElementById('pitch-team-title').textContent = teamName;
  });

  // Primary Color Picker
  const primColorInput = document.getElementById('primary-color');
  primColorInput.addEventListener('input', (e) => {
    primaryColor = e.target.value;
    e.target.nextElementSibling.textContent = primaryColor; // update hex text
    updatePitchColors();
  });

  // Secondary Color Picker
  const secColorInput = document.getElementById('secondary-color');
  secColorInput.addEventListener('input', (e) => {
    secondaryColor = e.target.value;
    e.target.nextElementSibling.textContent = secondaryColor; // update hex text
    updatePitchColors();
  });

  // Formation Buttons
  const formationBtns = document.querySelectorAll('.formation-btn');
  formationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      formationBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFormation(btn.getAttribute('data-formation'));

      // Clear custom formation UI states
      document.getElementById('custom-formation-input').value = '';
      document.getElementById('custom-formation-error').classList.add('hidden');
      document.getElementById('custom-formation-input').style.borderColor = '';
    });
  });

  // Custom Formation Event Listeners
  const customFormationBtn = document.getElementById('custom-formation-btn');
  const customFormationInput = document.getElementById('custom-formation-input');
  const customFormationError = document.getElementById('custom-formation-error');

  customFormationBtn.addEventListener('click', () => {
    const value = customFormationInput.value.trim();
    if (!value) return;

    const success = parseAndApplyCustomFormation(value);
    if (success) {
      customFormationError.classList.add('hidden');
      customFormationInput.style.borderColor = '';
    } else {
      customFormationError.classList.remove('hidden');
      customFormationInput.style.borderColor = '#ef4444';
    }
  });

  customFormationInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      customFormationBtn.click();
    }
  });

  // Theme Buttons
  const themeBtns = document.querySelectorAll('.theme-btn');
  const pitch = document.getElementById('pitch');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const theme = btn.getAttribute('data-theme');
      pitch.className = `football-pitch theme-${theme}`;
      currentTheme = theme;
    });
  });

  // 3D Perspective Toggle
  const perspectiveToggle = document.getElementById('perspective-toggle');
  const pitchViewport = document.querySelector('.pitch-viewport');
  perspectiveToggle.addEventListener('change', (e) => {
    is3DEnabled = e.target.checked;
    if (is3DEnabled) {
      pitchViewport.classList.add('mode-3d');
    } else {
      pitchViewport.classList.remove('mode-3d');
    }
  });

  // Reset Button
  document.getElementById('reset-btn').addEventListener('click', resetLineup);

  // Download Button
  document.getElementById('download-btn').addEventListener('click', exportPitchImage);

  // Edit Modal close handlers
  document.getElementById('modal-close').addEventListener('click', closeEditModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeEditModal);
  
  // Close modal when clicking outside the card
  const modalOverlay = document.getElementById('player-modal');
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeEditModal();
    }
  });

  // Modal Form Submission
  const editForm = document.getElementById('player-edit-form');
  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    savePlayerDetails();
  });

  // Image Upload Handling
  const photoInput = document.getElementById('player-photo-input');
  photoInput.addEventListener('change', handlePhotoUpload);

  // Remove Photo Button inside modal
  document.getElementById('remove-photo-btn').addEventListener('click', removeEditingPhoto);

  // Add Player Button
  const addPlayerBtn = document.getElementById('add-player-btn');
  if (addPlayerBtn) {
    addPlayerBtn.addEventListener('click', addNewPlayer);
  }

  // Delete Player Button inside modal
  const deletePlayerBtn = document.getElementById('modal-delete-btn');
  if (deletePlayerBtn) {
    deletePlayerBtn.addEventListener('click', () => {
      if (confirm("আপনি কি এই খেলোয়াড়কে দল থেকে বাদ দিতে চান?")) {
        const activeCount = getActivePlayerCount();
        if (players.length <= activeCount) {
          alert(`ফরমেশনের জন্য কমপক্ষে ${activeCount} জন খেলোয়াড় থাকতে হবে!`);
          return;
        }
        players = players.filter(p => p.id !== editingPlayerId);
        closeEditModal();
        renderSquad();
      }
    });
  }
}

// Apply team colors as local CSS variables on the pitch container
function updatePitchColors() {
  const pitch = document.getElementById('pitch');
  pitch.style.setProperty('--primary-color', primaryColor);
  pitch.style.setProperty('--secondary-color', secondaryColor);
}

// Reset data to defaults
function resetLineup() {
  if (confirm("আপনি কি সমস্ত প্লেয়ার পরিবর্তন বাতিল করে রিসেট করতে চান?")) {
    players = JSON.parse(JSON.stringify(defaultPlayers));
    
    // Reset fields in UI
    teamName = "আমার দল";
    document.getElementById('team-name-input').value = teamName;
    document.getElementById('pitch-team-title').textContent = teamName;

    primaryColor = "#e11d48";
    secondaryColor = "#ffffff";
    
    document.getElementById('primary-color').value = primaryColor;
    document.getElementById('primary-color').nextElementSibling.textContent = primaryColor;
    
    document.getElementById('secondary-color').value = secondaryColor;
    document.getElementById('secondary-color').nextElementSibling.textContent = secondaryColor;

    updatePitchColors();

    // Re-apply and reset formation to 4-3-3
    currentFormation = '4-3-3';
    const formationBtns = document.querySelectorAll('.formation-btn');
    formationBtns.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-formation') === '4-3-3') {
        btn.classList.add('active');
      }
    });
    
    activeCoordinates = JSON.parse(JSON.stringify(formations[currentFormation]));
    renderSquad();
  }
}

// Open Player Edit Modal
function openEditModal(playerId) {
  const player = players.find(p => p.id === playerId);
  if (!player) return;

  editingPlayerId = playerId;
  editingPlayerPhoto = player.photo;

  // Set inputs
  document.getElementById('edit-player-id').value = playerId;
  document.getElementById('player-name-input').value = player.name;
  document.getElementById('player-number-input').value = player.number;
  document.getElementById('player-role-input').value = player.role;

  // Populate Substitutes / Swap select dropdown
  const activeCount = getActivePlayerCount();
  const playerIndex = players.findIndex(p => p.id === playerId);
  const swapSelect = document.getElementById('player-swap-select');
  const swapField = document.getElementById('swap-player-field');
  
  if (swapSelect && swapField) {
    swapSelect.innerHTML = '<option value="">-- খেলোয়াড় নির্বাচন করুন --</option>';
    
    if (playerIndex < activeCount) {
      // Active player -> list bench players for substitution
      const benchPlayers = players.slice(activeCount);
      if (benchPlayers.length === 0) {
        const opt = document.createElement('option');
        opt.textContent = "বেঞ্চে কোনো খেলোয়াড় নেই";
        opt.disabled = true;
        swapSelect.appendChild(opt);
      } else {
        benchPlayers.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = `${p.name} (জার্সি ${p.number}) - বেঞ্চ`;
          swapSelect.appendChild(opt);
        });
      }
    } else {
      // Bench player -> list active field players for substitution
      const activePlayers = players.slice(0, activeCount);
      activePlayers.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.name} (জার্সি ${p.number}) - মাঠ`;
        swapSelect.appendChild(opt);
      });
    }
  }

  // Update photo/jersey modal previews
  updateModalAvatarPreview();

  // Show Modal
  document.getElementById('player-modal').classList.add('active');
}

// Update the avatar representation in the modal card
function updateModalAvatarPreview() {
  const previewImg = document.getElementById('modal-photo-preview');
  const placeholder = document.getElementById('modal-photo-placeholder');
  const removeBtn = document.getElementById('remove-photo-btn');

  if (editingPlayerPhoto) {
    previewImg.src = editingPlayerPhoto;
    previewImg.classList.remove('hidden');
    placeholder.classList.add('hidden');
    removeBtn.classList.remove('hidden');
  } else {
    previewImg.src = '';
    previewImg.classList.add('hidden');
    placeholder.classList.remove('hidden');
    removeBtn.classList.add('hidden');

    // Fill placeholder with matching team color Jersey
    placeholder.innerHTML = `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="jersey-fallback-svg" style="--primary-color: ${primaryColor}; --secondary-color: ${secondaryColor};">
        <path d="M15 32L30 20L38 30L25 45L15 32Z" fill="var(--secondary-color)" />
        <path d="M85 32L70 20L62 30L75 45L85 32Z" fill="var(--secondary-color)" />
        <path d="M30 20H70V85H30V20Z" fill="var(--primary-color)" />
        <path d="M40 20C40 26 60 26 60 20H40Z" fill="var(--secondary-color)" />
        <path d="M18 30L25 24" stroke="var(--primary-color)" stroke-width="2" />
        <path d="M82 30L75 24" stroke="var(--primary-color)" stroke-width="2" />
        <path d="M48 25V85" stroke="var(--secondary-color)" stroke-width="4" opacity="0.8" />
        <path d="M52 25V85" stroke="var(--secondary-color)" stroke-width="4" opacity="0.8" />
      </svg>
    `;
  }
}

// Close Modal
function closeEditModal() {
  document.getElementById('player-modal').classList.remove('active');
  editingPlayerId = null;
  editingPlayerPhoto = null;
  // Clear file input cache
  document.getElementById('player-photo-input').value = '';
}

// Handle image upload and compression to Base64
function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Verify file size (restrict to 3MB)
  if (file.size > 3 * 1024 * 1024) {
    alert("অনুগ্রহ করে ৩ মেগাবাইটের কম সাইজের ছবি আপলোড করুন।");
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    editingPlayerPhoto = event.target.result;
    updateModalAvatarPreview();
  };
  reader.readAsDataURL(file);
}

// Remove picture in modal and fall back to jersey
function removeEditingPhoto() {
  editingPlayerPhoto = null;
  document.getElementById('player-photo-input').value = '';
  updateModalAvatarPreview();
}

// Save modal changes back to player state
function savePlayerDetails() {
  if (editingPlayerId === null) return;

  const playerIndex = players.findIndex(p => p.id === editingPlayerId);
  if (playerIndex === -1) return;

  const player = players[playerIndex];

  // Update basic details
  player.name = document.getElementById('player-name-input').value.trim() || player.name;
  player.number = parseInt(document.getElementById('player-number-input').value, 10) || 1;
  player.role = document.getElementById('player-role-input').value;
  player.photo = editingPlayerPhoto;

  // Handle Swap Substitution if selected
  const swapSelect = document.getElementById('player-swap-select');
  if (swapSelect && swapSelect.value) {
    const swapPlayerId = parseInt(swapSelect.value, 10);
    const swapIndex = players.findIndex(p => p.id === swapPlayerId);
    if (swapIndex !== -1) {
      const temp = players[playerIndex];
      players[playerIndex] = players[swapIndex];
      players[swapIndex] = temp;
    }
  }

  // Refresh visual elements
  renderSquad();
  
  closeEditModal();
}

// HTML2Canvas Image Export Functionality
function exportPitchImage() {
  const exportOverlay = document.getElementById('export-overlay');
  const captureTarget = document.getElementById('capture-container');
  const pitchViewport = document.querySelector('.pitch-viewport');

  // 1. Show loading spinner overlay
  exportOverlay.classList.remove('hidden');

  // 2. Temporarily disable 3D transform so the image compiles flat
  const was3DEnabled = is3DEnabled;
  if (was3DEnabled) {
    pitchViewport.classList.remove('mode-3d');
  }

  // 3. Brief timeout to let layout stabilize
  setTimeout(() => {
    html2canvas(captureTarget, {
      scale: 2, // Double resolution for ultra-sharp pixels
      useCORS: true, // Allow external image URLs
      logging: false,
      backgroundColor: null // Keep transparent outline
    }).then(canvas => {
      // 4. Download file
      const link = document.createElement('a');
      const filename = `${teamName.trim().replace(/\s+/g, '_')}_lineup.png`;
      
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();

      // 5. Cleanup: Restore 3D view if it was active
      if (was3DEnabled) {
        pitchViewport.classList.add('mode-3d');
      }

      // 6. Hide loader spinner
      exportOverlay.classList.add('hidden');
    }).catch(err => {
      console.error("Export failed: ", err);
      alert("ইমেজ ডাউনলোড করার সময় একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
      
      // Cleanup on error
      if (was3DEnabled) {
        pitchViewport.classList.add('mode-3d');
      }
      exportOverlay.classList.add('hidden');
    });
  }, 400); // 400ms is perfect for CSS transform transitions to end
}

// Add generic new player to list without rendering
function addNewPlayerWithoutRender() {
  const nextId = players.length > 0 ? Math.max(...players.map(p => p.id)) + 1 : 1;
  const genericNames = [
    "কাহন", "রাইহান", "সোহেল", "সাকিব", "তামিম", "মুশফিক", "রিয়াদ", "তাসকিন", "মোস্তাফিজ", "লিটন", "মিরাজ"
  ];
  const name = genericNames[(nextId - 1) % genericNames.length] + " (" + nextId + ")";
  players.push({
    id: nextId,
    name: name,
    number: nextId,
    role: "MID",
    photo: null
  });
}

// Add new player card and refresh squad bench
function addNewPlayer() {
  addNewPlayerWithoutRender();
  renderSquad();
}

// Parse and apply dynamically calculated outfield formations (e.g. 4-3-3, 4-1-4-1, 3-4-3)
function parseAndApplyCustomFormation(str) {
  // Clean input and allow comma or hyphen separation
  const cleanStr = str.replace(/,/g, '-').replace(/\s+/g, '');
  
  // Validate basic format: digits separated by hyphens (e.g. 4-3-3 or 4-1-4-1)
  if (!/^\d(-\d)+$/.test(cleanStr)) {
    return false;
  }

  const parts = cleanStr.split('-').map(num => parseInt(num, 10));
  const sum = parts.reduce((a, b) => a + b, 0);
  
  // Validate that outfield sum does not exceed 10 players
  if (sum > 10 || sum < 1) {
    return false;
  }

  // Generate coordinate layouts dynamically
  const layout = [];
  
  // GK is always first (at bottom center)
  layout.push({ role: 'GK', x: 50, y: 88 });

  const numRows = parts.length;

  parts.forEach((count, i) => {
    // Determine row y-coordinate (distributed from y: 75% for defenders to y: 20% for forwards)
    let y = 75;
    if (numRows > 1) {
      y = 75 - (i * (75 - 20) / (numRows - 1));
    }

    // Determine player role for this row
    let role = 'MID';
    if (i === 0) {
      role = 'DEF';
    } else if (i === numRows - 1) {
      role = 'FWD';
    } else {
      // Intermediate rows are classified based on vertical coordinates
      if (y > 60) role = 'DEF';
      else if (y < 35) role = 'FWD';
      else role = 'MID';
    }

    // Determine horizontal spacing margin
    let margin = 20;
    if (i === 0) margin = 15; // Defenders row spreads wider
    if (count === 2) margin = 32; // Dual lines are spaced tighter to center
    
    for (let j = 0; j < count; j++) {
      let x = 50;
      if (count > 1) {
        x = margin + (j * (100 - 2 * margin) / (count - 1));
      }
      
      layout.push({ 
        role: role, 
        x: Math.round(x), 
        y: Math.round(y) 
      });
    }
  });

  // Disable active states on standard preset buttons since it's custom
  const presetBtns = document.querySelectorAll('.formation-btn');
  presetBtns.forEach(btn => btn.classList.remove('active'));

  activeCoordinates = layout;
  currentFormation = cleanStr;

  // Ensure we have enough players in squad for this formation
  const activeCount = sum + 1;
  while (players.length < activeCount) {
    addNewPlayerWithoutRender();
  }

  renderSquad();
  return true;
}

// Start Application on Load
window.addEventListener('DOMContentLoaded', initApp);
