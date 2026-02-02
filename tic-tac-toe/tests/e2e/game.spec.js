// Jun Kai
const { test, expect } = require('@playwright/test');

test.describe('Tic-Tac-Toe E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Assuming the app is running on localhost:3306
    await page.goto('http://localhost:3306');
  });

  test('should load the game page', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Tic Tac Toe');
    await expect(page.locator('#board')).toBeVisible();
    await expect(page.locator('#status')).toHaveText('Player X\'s turn');
  });

  test('should allow players to make moves', async ({ page }) => {
    const cells = page.locator('.cell');

    // Player X makes a move
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveText('X');
    await expect(page.locator('#status')).toHaveText('Player O\'s turn');

    // Player O makes a move
    await cells.nth(1).click();
    await expect(cells.nth(1)).toHaveText('O');
    await expect(page.locator('#status')).toHaveText('Player X\'s turn');
  });

  test('should detect a win', async ({ page }) => {
    const cells = page.locator('.cell');

    // X wins with top row
    await cells.nth(0).click(); // X
    await cells.nth(3).click(); // O
    await cells.nth(1).click(); // X
    await cells.nth(4).click(); // O
    await cells.nth(2).click(); // X

    await expect(page.locator('#status')).toContainText('Player X wins');
  });

  test('should detect a tie', async ({ page }) => {
    // Reload to get fresh board
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const cells = page.locator('.cell');

    // Fill board for a true tie - specific click sequence to avoid any winner
    // Click order: 0(X), 1(O), 2(X), 4(O), 3(X), 5(O), 7(X), 6(O), 8(X)
    // Final board: X O X / X O O / O X X - no three in a row for either player
    await cells.nth(0).click(); // X
    await cells.nth(1).click(); // O
    await cells.nth(2).click(); // X
    await cells.nth(4).click(); // O
    await cells.nth(3).click(); // X
    await cells.nth(5).click(); // O
    await cells.nth(7).click(); // X
    await cells.nth(6).click(); // O
    await cells.nth(8).click(); // X

    await expect(page.locator('#status')).toHaveText('It\'s a tie!');
  });

  test('should toggle settings panel', async ({ page }) => {
    const settingsBtn = page.locator('#settings-btn');
    const settingsPanel = page.locator('#settings-panel');

    await expect(settingsPanel).toHaveClass(/hidden/);
    await settingsBtn.click();
    await expect(settingsPanel).not.toHaveClass(/hidden/);
    await settingsBtn.click();
    await expect(settingsPanel).toHaveClass(/hidden/);
  });

  test('should toggle leaderboard panel', async ({ page }) => {
    const leaderboardBtn = page.locator('#leaderboard-btn');
    const leaderboardPanel = page.locator('#leaderboard-panel');

    await expect(leaderboardPanel).toHaveClass(/hidden/);
    await leaderboardBtn.click();
    await expect(leaderboardPanel).not.toHaveClass(/hidden/);
    await expect(page.locator('#leaderboard-list')).toBeVisible();
  });

  test('should switch to bot mode', async ({ page }) => {
    // Reload page to get fresh game state
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Open settings panel first (mode-select is inside settings-panel)
    const settingsBtn = page.locator('#settings-btn');
    await settingsBtn.click();
    await page.waitForTimeout(300);

    const modeSelect = page.locator('#mode-select');
    await modeSelect.selectOption('bot');
    
    await page.waitForTimeout(500); // Wait for mode switch
    await expect(page.locator('#status')).toHaveText('Player X\'s turn');

    // Make a move and check if bot responds
    const cells = page.locator('.cell');
    await cells.nth(4).click(); // X at center
    await page.waitForTimeout(3000); // Wait longer for bot move and animation
    
    // Check board for O by counting cells with text
    const boardCells = page.locator('.cell');
    const cellsWithContent = await boardCells.filter({ hasNot: page.locator('text=') }).count();
    const cellsWithO = await boardCells.filter({ has: page.locator(':text("O")') }).count();
    
    // Bot should have made a move
    expect(cellsWithO).toBeGreaterThanOrEqual(1);
  });
});