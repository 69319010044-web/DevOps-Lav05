const cols = 5;
const rows = 4;
const totalTiles = cols * rows;

const board = document.getElementById('board');
const tray = document.getElementById('tray');
const timerEl = document.getElementById('timer');
const statusText = document.getElementById('statusText');
const shuffleBtn = document.getElementById('shuffleBtn');
const resetBtn = document.getElementById('resetBtn');

let boardOrder = [];
let trayOrder = [];
let selectedTile = null;
let timer = 0;
let timerId = null;
let started = false;

function formatTime(value) {
  const minutes = String(Math.floor(value / 60)).padStart(2, '0');
  const seconds = String(value % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function buildTileStyle(tileIndex) {
  const row = Math.floor(tileIndex / cols);
  const col = tileIndex % cols;
  const x = (col / (cols - 1)) * 100;
  const y = (row / (rows - 1)) * 100;

  return {
    backgroundImage: 'url("car.webp")',
    backgroundSize: `${cols * 100}% ${rows * 100}%`,
    backgroundPosition: `${x}% ${y}%`
  };
}

function createPiece(tileIndex, containerType) {
  const tile = document.createElement('button');
  tile.type = 'button';
  tile.className = 'piece';
  tile.dataset.tileIndex = String(tileIndex);
  tile.dataset.container = containerType;

  const style = buildTileStyle(tileIndex);
  tile.style.backgroundImage = style.backgroundImage;
  tile.style.backgroundSize = style.backgroundSize;
  tile.style.backgroundPosition = style.backgroundPosition;

  tile.addEventListener('click', () => handleTileClick(tile));
  return tile;
}

function renderBoard() {
  board.innerHTML = '';

  boardOrder.forEach((tileIndex, slotIndex) => {
    const piece = createPiece(tileIndex, 'board');
    piece.dataset.slotIndex = String(slotIndex);

    if (selectedTile && selectedTile.container === 'board' && Number(selectedTile.slotIndex) === slotIndex) {
      piece.classList.add('selected');
    }

    board.appendChild(piece);
  });
}

function renderTray() {
  tray.innerHTML = '';

  trayOrder.forEach((tileIndex, index) => {
    const piece = createPiece(tileIndex, 'tray');
    piece.dataset.trayIndex = String(index);

    if (selectedTile && selectedTile.container === 'tray' && Number(selectedTile.trayIndex) === index) {
      piece.classList.add('selected');
    }

    tray.appendChild(piece);
  });
}

function updateTimer() {
  timerEl.textContent = formatTime(timer);
}

function setStatus(message) {
  statusText.textContent = message;
}

function startTimer() {
  if (timerId) clearInterval(timerId);

  timerId = setInterval(() => {
    if (!started) return;
    timer += 1;
    updateTimer();
  }, 1000);
}

function isSolved() {
  return boardOrder.every((value, index) => value === index);
}

function handleTileSelection(tile) {
  const nextSelected = {
    container: tile.dataset.container,
    slotIndex: tile.dataset.slotIndex,
    trayIndex: tile.dataset.trayIndex,
    value: Number(tile.dataset.tileIndex)
  };

  if (!selectedTile) {
    selectedTile = nextSelected;
    renderBoard();
    renderTray();
    setStatus('เลือกชิ้นส่วน');
    return;
  }

  if (
    selectedTile.container === nextSelected.container &&
    selectedTile.slotIndex === nextSelected.slotIndex &&
    selectedTile.trayIndex === nextSelected.trayIndex
  ) {
    selectedTile = null;
    renderBoard();
    renderTray();
    setStatus('ยกเลิกการเลือก');
    return;
  }

  if (selectedTile.container === 'tray' && nextSelected.container === 'board') {
    const trayIndex = Number(selectedTile.trayIndex);
    const boardIndex = Number(nextSelected.slotIndex);

    const selectedValue = trayOrder[trayIndex];
    const targetValue = boardOrder[boardIndex];

    trayOrder[trayIndex] = targetValue;
    boardOrder[boardIndex] = selectedValue;

    selectedTile = null;
    renderBoard();
    renderTray();

    if (!started) {
      started = true;
      startTimer();
    }

    if (isSolved()) {
      setStatus('ชนะแล้ว!');
      started = false;
      clearInterval(timerId);
    } else {
      setStatus('กำลังเล่น');
    }
  }

  if (selectedTile && selectedTile.container === 'board' && nextSelected.container === 'tray') {
    const boardIndex = Number(selectedTile.slotIndex);
    const trayIndex = Number(nextSelected.trayIndex);

    const selectedValue = boardOrder[boardIndex];
    const targetValue = trayOrder[trayIndex];

    boardOrder[boardIndex] = targetValue;
    trayOrder[trayIndex] = selectedValue;

    selectedTile = null;
    renderBoard();
    renderTray();

    if (!started) {
      started = true;
      startTimer();
    }

    if (isSolved()) {
      setStatus('ชนะแล้ว!');
      started = false;
      clearInterval(timerId);
    } else {
      setStatus('กำลังเล่น');
    }
  }
}

function handleTileClick(tile) {
  if (tile.dataset.container === 'board' && tile.dataset.slotIndex === undefined) {
    return;
  }

  if (tile.dataset.container === 'tray' && tile.dataset.trayIndex === undefined) {
    return;
  }

  handleTileSelection(tile);
}

function shuffleTray() {
  trayOrder = Array.from({ length: totalTiles }, (_, index) => index);

  for (let i = trayOrder.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [trayOrder[i], trayOrder[j]] = [trayOrder[j], trayOrder[i]];
  }
}

function shuffleTiles() {
  boardOrder = Array.from({ length: totalTiles }, (_, index) => index);
  shuffleTray();
  selectedTile = null;
  timer = 0;
  started = false;
  clearInterval(timerId);
  updateTimer();
  renderBoard();
  renderTray();
  setStatus('พร้อมเล่น');
}

function resetBoard() {
  boardOrder = Array.from({ length: totalTiles }, (_, index) => index);
  shuffleTray();
  selectedTile = null;
  timer = 0;
  started = false;
  clearInterval(timerId);
  updateTimer();
  setStatus('พร้อมเล่น');
  renderBoard();
  renderTray();
}

shuffleBtn.addEventListener('click', shuffleTiles);
resetBtn.addEventListener('click', resetBoard);

resetBoard();
