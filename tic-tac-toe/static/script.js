const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const themeToggle = document.getElementById("theme-toggle");
const modeSelect = document.getElementById("mode-select");

const settingsBtn = document.getElementById("settings-btn");
const settingsPanel = document.getElementById("settings-panel");

const leaderboardBtn = document.getElementById("leaderboard-btn");
const leaderboardPanel = document.getElementById("leaderboard-panel");
const leaderboardList = document.getElementById("leaderboard-list");

/* ================= LEADERBOARD (DEMO) ================= */

// Demo data (replace later with DB/MySQL)
let leaderboardData = [
  { name: "Player 1", best: 3126 },
  { name: "Player 2", best: 2864 },
  { name: "Player 3", best: 2021 },
  { name: "Player 4", best: 1796 },
  { name: "Player 5", best: 1642 },
  { name: "Player 6", best: 1627 },
  { name: "Player 7", best: 1555 }
];

function renderLeaderboard() {
  if (!leaderboardList) return;

  const data = [...leaderboardData].sort((a, b) => b.best - a.best).slice(0, 10);

  leaderboardList.innerHTML = data
    .map((row, i) => {
      return `
        <div class="lb-item">
          <div class="lb-rank">${i + 1}</div>
          <div class="lb-name">${row.name}</div>
          <div class="lb-score">${row.best}</div>
        </div>
      `;
    })
    .join("");
}

/* ================= PANEL TOGGLE (MANUAL CONTROL) ================= */

function hidePanelsOnStart() {
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (leaderboardPanel) leaderboardPanel.classList.add("hidden");
}

// Toggle settings (does NOT auto-close leaderboard)
if (settingsBtn && settingsPanel) {
  settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    settingsPanel.classList.toggle("hidden");
  });

  settingsPanel.addEventListener("click", (e) => e.stopPropagation());
}

// Toggle leaderboard (does NOT auto-close settings)
if (leaderboardBtn && leaderboardPanel) {
  leaderboardBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    leaderboardPanel.classList.toggle("hidden");
  });

  leaderboardPanel.addEventListener("click", (e) => e.stopPropagation());
}

// Clicking outside closes BOTH
document.addEventListener("click", () => {
  if (settingsPanel) settingsPanel.classList.add("hidden");
  if (leaderboardPanel) leaderboardPanel.classList.add("hidden");
});

/* ================= GAME STATE ================= */

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let mode = modeSelect ? modeSelect.value : "2p";

/* ================= WIN CONDITIONS ================= */

const winningThreeCombinations = [
  [0, 1, 2],[3, 4, 5],[6, 7, 8],
  [0, 3, 6],[1, 4, 7],[2, 5, 8],
  [0, 4, 8],[2, 4, 6]
];

/* ================= SCOREBOARD ================= */

let scores = { player: 0, computer: 0, tie: 0 };

function updateScoreboard() {
  const p = document.getElementById("player-score");
  const c = document.getElementById("computer-score");
  const t = document.getElementById("tie-score");
  if (!p || !c || !t) return;

  p.textContent = scores.player;
  c.textContent = scores.computer;
  t.textContent = scores.tie;
}

function updateScoreLabels() {
  const leftLabel = document.getElementById("left-label");
  const rightLabel = document.getElementById("right-label");
  if (!leftLabel || !rightLabel) return;

  if (mode === "bot") {
    leftLabel.textContent = "Player";
    rightLabel.textContent = "Bot";
  } else {
    leftLabel.textContent = "Player X";
    rightLabel.textContent = "Player O";
  }
}

function updateTurnText() {
  if (!statusText) return;

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

  // Bot moves only when it's O's turn in bot mode
  if (gameActive && mode === "bot" && currentPlayer === "O") {
    setTimeout(botMove, 250);
  }
}

function checkResult() {
  // Win
  for (let combo of winningThreeCombinations) {
    const [a, b, c] = combo;

    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      gameActive = false;

      // scoring (both modes)
      if (currentPlayer === "X") scores.player++;
      else scores.computer++;

      if (mode === "bot") {
        statusText.textContent = currentPlayer === "X" ? "You win!" : "Bot wins!";
      } else {
        statusText.textContent = currentPlayer === "X" ? "Player X wins!" : "Player O wins!";
      }

      updateScoreboard();
      return;
    }
  }

  // Tie
  if (!board.includes("")) {
    gameActive = false;
    scores.tie++;
    statusText.textContent = "It's a tie!";
    updateScoreboard();
    return;
  }

  // Switch turn
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateTurnText();
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  currentPlayer = "X";
  updateTurnText();
  cells.forEach(cell => (cell.textContent = ""));
}

function resetScores() {
  scores = { player: 0, computer: 0, tie: 0 };
  updateScoreboard();
}

/* ================= BOT ================= */

function findWinningMove(player) {
  for (let combo of winningThreeCombinations) {
    const [a, b, c] = combo;
    const vals = [board[a], board[b], board[c]];

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
    const empty = board
      .map((v, i) => (v === "" ? i : null))
      .filter(v => v !== null);
    move = empty[Math.floor(Math.random() * empty.length)];
  }

  board[move] = "O";
  cells[move].textContent = "O";
  checkResult();
}

/* ================= THEME ================= */

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark") ? "dark" : "light"
    );
  });
}

/* ================= MODE ================= */

if (modeSelect) {
  modeSelect.addEventListener("change", () => {
    mode = modeSelect.value;
    resetGame();
    resetScores();
    updateScoreLabels();
    updateTurnText();
  });
}

/* ================= INIT ================= */

window.addEventListener("load", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
  }

  hidePanelsOnStart();
  renderLeaderboard();
  updateScoreLabels();
  updateTurnText();
  updateScoreboard();
});

// testing CodeQL PR scan
