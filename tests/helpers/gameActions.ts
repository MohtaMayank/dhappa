import { Page, expect } from '@playwright/test';

export async function joinRoom(page: Page, roomId: string, playerName: string, passcode: string) {
  await page.goto(`/room/${roomId}`);
  await page.fill('input[placeholder="Enter your name"]', playerName);
  await page.fill('input[placeholder="Choose a passcode"]', passcode);
  await page.click('button:has-text("Join Existing Game")');
  // Wait for the game to load
  await expect(page.locator('data-testid=player-hand')).toBeVisible({ timeout: 10000 });
}

export async function createRoom(page: Page, playerName: string, passcode: string) {
  await page.goto('/');
  await page.fill('input[placeholder="Enter your name"]', playerName);
  await page.fill('input[placeholder="Choose a passcode"]', passcode);
  await page.click('button:has-text("Create New Game")');
  await expect(page.locator('data-testid=player-hand')).toBeVisible({ timeout: 10000 });
  
  // Get Room ID from URL
  const url = page.url();
  const roomId = url.split('/room/')[1];
  return roomId;
}

export async function drawFromDeck(page: Page) {
  await page.click('data-testid=draw-pile');
  await page.click('button:has-text("Confirm Draw")');
  // Wait for overlay to disappear
  await expect(page.locator('button:has-text("Confirm Draw")')).not.toBeVisible();
}

export async function selectCard(page: Page, suit: string, value: string) {
  const cardSelector = `data-testid=card-${suit}-${value}`;
  await page.click(cardSelector);
}

export async function discardCard(page: Page, suit: string, value: string) {
  await selectCard(page, suit, value);
  await page.click('data-testid=discard-btn');
}

export async function openRun(page: Page) {
  await page.click('data-testid=open-run-btn');
}

export async function addToRun(page: Page, runIndex: number = 0) {
  await page.click('data-testid=add-to-run-btn');
  // Click on the run in the team board. 
  // We might need a more specific locator for runs.
  await page.locator('[data-testid^="run-"]').nth(runIndex).click();
}

export async function pickFromDiscard(page: Page, n: number) {
  await page.click('data-testid=discard-pile');
  // In DiscardNPicker, we select depth
  await page.locator(`[data-testid=n-pick-option-${n}]`).click();
  await page.click('button:has-text("Pick Cards")');
}
