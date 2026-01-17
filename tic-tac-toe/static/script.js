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

//===== Scoreboard =====//
let scores = {
  player: 0,
  computer: 0,
  tie: 0
};

function updateScoreboard() {
  // These IDs must exist in your HTML
  document.getElementById("player-score").textContent = scores.player;
  document.getElementById("computer-score").textContent = scores.computer;
  document.getElementById("tie-score").textContent = scores.tie;
}

//===== Settings Panel Toggle =====//
settingsBtn.addEventListener("click", () => {
  // If display hasn't been set yet, treat it like "none" when hidden via CSS
  const isHidden = getComputedStyle(settingsPanel).display === "none";
  settingsPanel.style.display = isHidden ? "flex" : "none";
});

//===== Game Logic =====//
cells.forEach(cell => cell.addEventListener("click", handleCellClick));

function handleCellClick() {
  const index = this.getAttribute("data-index");
  if (board[index] !== "" || !gameActive) return;

  board[index] = currentPlayer;
  this.textContent = currentPlayer;

  checkResult();

  // Bot move (only after player X moves, when it becomes O's turn)
  if (gameActive && mode === "bot" && currentPlayer === "O") {
    setTimeout(botMove, 300);
  }
}

/*
  Updated checkResult() with win/tie counts:
  - In bot mode: X = player, O = computer
  - In 2p mode: no scoreboard changes unless you want to track X/O
*/
function checkResult() {
  // 1) Check win
  for (let combo of winningThreeCombinations) {
    const [a, b, c] = combo;

    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      gameActive = false;

      if (mode === "bot") {
        if (currentPlayer === "X") {
          scores.player++;
          statusText.textContent = "You win!";
        } else {
          scores.computer++;
          statusText.textContent = "Computer wins!";
        }
      } else {
        statusText.textContent = `Player ${currentPlayer} wins!`;
      }

      updateScoreboard();
      return;
    }
  }

  // 2) Check tie
  if (!board.includes("")) {
    gameActive = false;
    scores.tie++;
    statusText.textContent = "It's a draw!";
    updateScoreboard();
    return;
  }

  // 3) Switch turn
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurnText();
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  currentPlayer = "X";
  updateTurnText();
  cells.forEach(cell => cell.textContent = "");

  // If bot mode and you ever decide bot starts first, you'd handle it here.
}

function resetScores() {
  scores.player = 0;
  scores.computer = 0;
  scores.tie = 0;
  updateScoreboard();
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

// Load saved theme + init scoreboard
window.addEventListener("load", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  mode = modeSelect.value;
  updateScoreLabels();
  updateTurnText();
  // Initialize scoreboard display
  updateScoreboard();

  // Ensure settings panel starts hidden (in case inline styles were used before)
  // If you're using CSS .hidden, you can remove this line.
  // settingsPanel.style.display = "none";
});

//===== Mode Selector =====//
modeSelect.addEventListener("change", () => {
  mode = modeSelect.value;

  resetGame();
  resetScores();
  updateScoreLabels();
  updateTurnText();
});

function updateScoreLabels() {
  const leftLabel = document.getElementById("left-label");
  const rightLabel = document.getElementById("right-label");

  if (mode === "bot") {
    leftLabel.textContent = "Player";
    rightLabel.textContent = "Computer";
  } else {
    leftLabel.textContent = "Player X";
    rightLabel.textContent = "Player O";
  }
}

function updateTurnText() {
  if (mode === "bot") {
    statusText.textContent =
      currentPlayer === "X" ? "Player X's turn" : "Computer's turn";
  } else {
    statusText.textContent =
      currentPlayer === "X" ? "Player X's turn" : "Player O's turn";
  }
}