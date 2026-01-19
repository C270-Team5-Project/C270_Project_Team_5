// Note: These tests validate pure game logic functions from script.js
// Game state for testing
let board = ["", "", "", "", "", "", "", "", ""];

// Leaderboard data and functions (from script.js)
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
  const data = [...leaderboardData].sort((a, b) => b.best - a.best).slice(0, 10);
  return data;
}

describe('Leaderboard', () => {
  test('sorts leaderboard by best score descending', () => {
    const sorted = renderLeaderboard();
    expect(sorted[0].name).toBe('Player 1');
    expect(sorted[0].best).toBe(3126);
    expect(sorted[1].name).toBe('Player 2');
    expect(sorted[1].best).toBe(2864);
  });

  test('limits to top 10', () => {
    const largeData = Array.from({length: 15}, (_, i) => ({name: `Player ${i}`, best: 1000 - i}));
    leaderboardData = largeData;
    const sorted = renderLeaderboard();
    expect(sorted.length).toBe(10);
    leaderboardData = [
      { name: "Player 1", best: 3126 },
      { name: "Player 2", best: 2864 },
      { name: "Player 3", best: 2021 },
      { name: "Player 4", best: 1796 },
      { name: "Player 5", best: 1642 },
      { name: "Player 6", best: 1627 },
      { name: "Player 7", best: 1555 }
    ];
  });
});

// Win conditions and AI logic (from script.js)
const winningThreeCombinations = [
  [0, 1, 2],[3, 4, 5],[6, 7, 8],
  [0, 3, 6],[1, 4, 7],[2, 5, 8],
  [0, 4, 8],[2, 4, 6]
];

function checkWin(board, player) {
  for (let combo of winningThreeCombinations) {
    const [a, b, c] = combo;
    if (board[a] === player && board[b] === player && board[c] === player) {
      return true;
    }
  }
  return false;
}

function findWinningMove(player, boardState = board) {
  for (let combo of winningThreeCombinations) {
    const [a, b, c] = combo;
    const vals = [boardState[a], boardState[b], boardState[c]];

    if (vals.filter(v => v === player).length === 2 && vals.includes("")) {
      if (boardState[a] === "") return a;
      if (boardState[b] === "") return b;
      if (boardState[c] === "") return c;
    }
  }
  return null;
}

describe('Game Logic', () => {
  beforeEach(() => {
    board = ["", "", "", "", "", "", "", "", ""];
  });

  test('detects horizontal win', () => {
    const testBoard = ['X', 'X', 'X', '', '', '', '', '', ''];
    expect(checkWin(testBoard, 'X')).toBe(true);
  });

  test('detects vertical win', () => {
    const testBoard = ['X', '', '', 'X', '', '', 'X', '', ''];
    expect(checkWin(testBoard, 'X')).toBe(true);
  });

  test('detects diagonal win', () => {
    const testBoard = ['X', '', '', '', 'X', '', '', '', 'X'];
    expect(checkWin(testBoard, 'X')).toBe(true);
  });

  test('no win', () => {
    const testBoard = ['X', 'O', 'X', 'O', 'X', 'O', '', '', ''];
    expect(checkWin(testBoard, 'X')).toBe(false);
  });

  test('finds winning move', () => {
    const testBoard = ['X', 'X', '', '', '', '', '', '', ''];
    expect(findWinningMove('X', testBoard)).toBe(2);
  });

  test('finds blocking move', () => {
    const testBoard = ['O', 'O', '', '', '', '', '', '', ''];
    expect(findWinningMove('O', testBoard)).toBe(2);
  });

  test('no winning move', () => {
    const testBoard = ['X', 'O', '', 'O', 'X', '', '', '', 'O'];
    expect(findWinningMove('X', testBoard)).toBe(null);
  });
});