const { JSDOM } = require('jsdom');

// Setup JSDOM for DOM-dependent tests
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

// Mock the leaderboard data and functions (copy from script.js)
let leaderboardData = [
  { name: "Player 1", best: 3126 },
  { name: "Player 2", best: 2864 },
  { name: "Player 3", best: 2021 },
  { name: "Player 4", best: 1796 },
  { name: "Player 5", best: 1642 },
  { name: "Player 6", best: 1627 },
  { name: "Player 7", best: 1555 }
];

function sortLeaderboard(data) {
  return [...data].sort((a, b) => b.best - a.best).slice(0, 10);
}

describe('Leaderboard', () => {
  test('sorts leaderboard by best score descending', () => {
    const sorted = sortLeaderboard(leaderboardData);
    expect(sorted[0].name).toBe('Player 1');
    expect(sorted[0].best).toBe(3126);
    expect(sorted[1].name).toBe('Player 2');
    expect(sorted[1].best).toBe(2864);
  });

  test('limits to top 10', () => {
    const largeData = Array.from({length: 15}, (_, i) => ({name: `Player ${i}`, best: 1000 - i}));
    const sorted = sortLeaderboard(largeData);
    expect(sorted.length).toBe(10);
  });
});

// Test win conditions
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

function findWinningMove(board, player) {
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

describe('Game Logic', () => {
  test('detects horizontal win', () => {
    const board = ['X', 'X', 'X', '', '', '', '', '', ''];
    expect(checkWin(board, 'X')).toBe(true);
  });

  test('detects vertical win', () => {
    const board = ['X', '', '', 'X', '', '', 'X', '', ''];
    expect(checkWin(board, 'X')).toBe(true);
  });

  test('detects diagonal win', () => {
    const board = ['X', '', '', '', 'X', '', '', '', 'X'];
    expect(checkWin(board, 'X')).toBe(true);
  });

  test('no win', () => {
    const board = ['X', 'O', 'X', 'O', 'X', 'O', '', '', ''];
    expect(checkWin(board, 'X')).toBe(false);
  });

  test('finds winning move', () => {
    const board = ['X', 'X', '', '', '', '', '', '', ''];
    expect(findWinningMove(board, 'X')).toBe(2);
  });

  test('finds blocking move', () => {
    const board = ['O', 'O', '', '', '', '', '', '', ''];
    expect(findWinningMove(board, 'X')).toBe(2);
  });

  test('no winning move', () => {
    const board = ['X', 'O', 'X', 'O', 'X', 'O', '', '', ''];
    expect(findWinningMove(board, 'X')).toBe(null);
  });
});