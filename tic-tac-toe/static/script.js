const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const themeToggle = document.getElementById("theme-toggle");
const modeSelect = document.getElementById("mode-select");
const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings-panel");

//===== Game State =====//
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let mode = modeSelect.value;

//===== Winning Conditions =====//
const winningThreeCombinations = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

//===== Settings Panel Toggle =====//
settingsBtn.addEventListener("click", () => {
  settingsPanel.classList.toggle("hidden");
});

//===== Game Logic =====//
cells.forEach(cell => cell.addEventListener("click", handleCellClick));

function handleCellClick() {
  const index = this.getAttribute("data-index");
  if (board[index] !== "" || !gameActive) return;

  board[index] = currentPlayer;
  this.textContent = currentPlayer;
  checkResult();

  if (gameActive && mode === "bot" && currentPlayer === "O") {
    setTimeout(botMove, 300);
  }
}

function checkResult() {
  for (let combo of winningThreeCombinations) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      statusText.textContent = `Player ${currentPlayer} wins!`;
      gameActive = false;
      return;
    }
  }

  if (!board.includes("")) {
    statusText.textContent = "It's a draw!";
    gameActive = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  currentPlayer = "X";
  statusText.textContent = "Player X's turn";
  cells.forEach(cell => cell.textContent = "");
}

//===== Bot Logic =====//
function findWinningMove(player) {
  for (let combo of winningThreeCombinations) {
    const [a, b, c] = combo;
    const values = [board[a], board[b], board[c]];

    if (values.filter(v => v === player).length === 2 && values.includes("")) {
      if (board[a] === "") return a;
      if (board[b] === "") return b;
      if (board[c] === "") return c;
    }
  }
  return null;
}

function botMove() {
  let move = findWinningMove("O");
  if (move === null) move = findWinningMove("X");

  if (move === null) {
    const emptyCells = board
      .map((val, idx) => (val === "" ? idx : null))
      .filter(val => val !== null);
    if (emptyCells.length === 0) return;
    move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  board[move] = "O";
  cells[move].textContent = "O";
  checkResult();
}

//===== Theme Toggle =====//
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});

// Load saved theme
window.addEventListener("load", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
});

//===== Mode Selector =====//
modeSelect.addEventListener("change", () => {
  mode = modeSelect.value;
  resetGame();
});