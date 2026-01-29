const { getWinner, isTie } = require("../static/script.js");

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    console.error(`❌ ${msg}\n   expected: ${expected}\n   got: ${actual}`);
    process.exit(1);
  }
}

function assertTrue(cond, msg) {
  if (!cond) {
    console.error(`❌ ${msg}`);
    process.exit(1);
  }
}

console.log("Running tic-tac-toe logic tests...");

// X wins row
assertEqual(
  getWinner(["X","X","X","","","","","",""]),
  "X",
  "X should win on top row"
);

// O wins diagonal
assertEqual(
  getWinner(["O","","","", "O","", "", "", "O"]),
  "O",
  "O should win on diagonal"
);

// No winner
assertEqual(
  getWinner(["X","O","X","X","O","O","O","X","X"]),
  null,
  "Should be no winner in this board"
);

// Tie board
assertTrue(
  isTie(["X","O","X","X","O","O","O","X","X"]),
  "Board should be a tie"
);

// Not tie (has empty)
assertTrue(
  !isTie(["X","O","X","","O","O","O","X","X"]),
  "Board with empty cell should not be tie"
);

console.log("✅ All tests passed!");
process.exit(0);