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

    // Fill board for a tie - specific sequence to avoid any winning combination
    // Board positions (non-winning): X at 0,2,3,6,8 O at 1,4,5,7
    await cells.nth(0).click(); // X
    await cells.nth(1).click(); // O
    await cells.nth(2).click(); // X
    await cells.nth(4).click(); // O
    await cells.nth(3).click(); // X
    await cells.nth(5).click(); // O
    await cells.nth(6).click(); // X
    await cells.nth(7).click(); // O
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
    await page.waitForTimeout(500); // Extra wait for full render

    const modeSelect = page.locator('#mode-select');
    
    // Scroll to make element visible
    await modeSelect.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    
    // Wait for enabled state
    await modeSelect.waitFor({ state: 'enabled' });
    await modeSelect.selectOption('bot');
    
    await page.waitForTimeout(500); // Wait for mode switch
    await expect(page.locator('#status')).toHaveText('Player X\'s turn');

    // Make a move and check if bot responds
    const cells = page.locator('.cell');
    await cells.nth(0).click(); // X
    await page.waitForTimeout(2000); // Wait for bot move
    const oCells = await cells.locator(':has-text("O")').count();
    expect(oCells).toBe(1);
  });
});