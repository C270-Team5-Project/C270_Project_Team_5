const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const themeToggle = document.getElementById("theme-toggle");
const modeSelect = document.getElementById("mode-select");

const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings-panel");

const leaderboardBtn = document.getElementById("leaderboard-btn");
const leaderboardPanel = document.getElementById("leaderboard-panel");

/* ================= PANEL TOGGLE (INDEPENDENT) ================= */

settingsBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  settingsPanel.classList.toggle("hidden");
});

leaderboardBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  leaderboardPanel.classList.toggle("hidden");
});

// click outside closes BOTH
document.addEventListener("click", () => {
  settingsPanel.classList.add("hidden");
  leaderboardPanel.classList.add("hidden");
});

// prevent clicks inside panels from closing them
settingsPanel.addEventListener("click", (e) => e.stopPropagation());
leaderboardPanel.addEventListener("click", (e) => e.stopPropagation());

/* ================= GAME STATE ================= */

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let mode = modeSelect.value;

/* ================= WIN CONDITIONS ================= */

const winningThreeCombinations = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

/* ================= SCOREBOARD ================= */

let scores = { player: 0, computer: 0, tie: 0 };

function updateScoreboard() {
  document.getElementById("player-score").textContent = scores.player;
  document.getElementById("computer-score").textContent = scores.computer;
  document.getElementById("tie-score").textContent = scores.tie;
}

function updateScoreLabels() {
  const leftLabel = document.getElementById("left-label");
  const rightLabel = document.getElementById("right-label");

  if (mode === "bot") {
    leftLabel.textContent = "Player";
    rightLabel.textContent = "Bot";
  } else {
    leftLabel.textContent = "Player X";
    rightLabel.textContent = "Player O";
  }
}

function updateTurnText() {
  if (mode === "bot") {
    statusText.textContent =
      currentPlayer === "X" ? "Player X's turn" : "Bot's turn";
  } else {
    statusText.textContent =
      currentPlayer === "X" ? "Player X's turn" : "Player O's turn";
  }
}

/* ================= GAME LOGIC ================= */

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
    const [a,b,c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      gameActive = false;

      if (mode === "bot") {
        currentPlayer === "X" ? scores.player++ : scores.computer++;
      } else {
        currentPlayer === "X" ? scores.player++ : scores.computer++;
      }

      statusText.textContent = `Player ${currentPlayer} wins!`;
      updateScoreboard();
      return;
    }
  }

  if (!board.includes("")) {
    gameActive = false;
    scores.tie++;
    statusText.textContent = "It's a tie!";
    updateScoreboard();
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurnText();
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  currentPlayer = "X";
  updateTurnText();
  cells.forEach(cell => cell.textContent = "");
}

function resetScores() {
  scores = { player: 0, computer: 0, tie: 0 };
  updateScoreboard();
}

/* ================= BOT ================= */

function findWinningMove(player) {
  for (let combo of winningThreeCombinations) {
    const [a,b,c] = combo;
    const vals = [board[a],board[b],board[c]];
    if (vals.filter(v => v === player).length === 2 && vals.includes("")) {
      if (board[a] === "") return a;
      if (board[b] === "") return b;
      if (board[c] === "") return c;
    }
  }
  return null;
}

function botMove() {
  let move = findWinningMove("O") || findWinningMove("X");
  if (move === null) {
    const empty = board.map((v,i)=>v===""?i:null).filter(v=>v!==null);
    move = empty[Math.floor(Math.random()*empty.length)];
  }
  board[move] = "O";
  cells[move].textContent = "O";
  checkResult();
}

/* ================= THEME ================= */

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});

/* ================= MODE ================= */

modeSelect.addEventListener("change", () => {
  mode = modeSelect.value;
  resetGame();
  resetScores();
  updateScoreLabels();
  updateTurnText();
});

/* ================= INIT ================= */

window.addEventListener("load", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }
  settingsPanel.classList.add("hidden");
  leaderboardPanel.classList.add("hidden");
  updateScoreLabels();
  updateTurnText();
  updateScoreboard();
});