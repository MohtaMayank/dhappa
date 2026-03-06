import { test, expect } from '@playwright/test';
import { createRoom, joinRoom, selectCard, addToRun } from '../helpers/gameActions';
import { injectScenario } from '../helpers/stateInjector';

test.describe('Wild Card Mechanics', () => {
  test('P1 can swap a flying Joker with a natural card', async ({ context }) => {
    const p1Page = await context.newPage();
    const roomId = await createRoom(p1Page, 'Player 1', '1234');
    
    const p2Page = await context.newPage();
    await joinRoom(p2Page, roomId, 'Player 2', '1234');

    await injectScenario(roomId, 'midgame');

    // In midgame, P1 (Team A) has a Hearts run: 10, 9, Jo(8), 7, 6, 5
    // P1 hand has natural 8H (forced in scenario)
    
    // Switch to My Team board (if on mobile, but tests are Desktop Chrome)
    // Actually, on desktop, PlayerBoard is visible.
    
    await expect(p1Page.locator('text=PHASE: DRAW')).toBeVisible();
    // Must draw first to enter PLAY phase
    await p1Page.click('data-testid=draw-pile');
    await p1Page.click('button:has-text("Confirm Draw")');

    // Select 8 of Hearts
    await selectCard(p1Page, 'Hearts', '8');
    
    // Add to the Hearts run (it's the second run of P1 in midgame)
    // Let's use nth(1) for the second run
    await addToRun(p1Page, 1);

    // Verify Joker is returned to hand
    // Joker should be in hand now. Testid for joker is card-None-Jo-wild
    await expect(p1Page.locator('data-testid=card-None-Jo-wild')).toBeVisible();
    
    // Verify run now has natural 8 of Hearts instead of Joker
    // We can check if the Joker is still in the run (it shouldn't be)
    const heartsRun = p1Page.locator('[data-testid^="run-"]').nth(1);
    await expect(heartsRun.locator('data-testid=card-None-Jo-wild')).not.toBeVisible();
  });

  test('P1 can shift a static wild by adding a natural card', async ({ context }) => {
    const p1Page = await context.newPage();
    const roomId = await createRoom(p1Page, 'Player 1', '1234');
    
    const p2Page = await context.newPage();
    await joinRoom(p2Page, roomId, 'Player 2', '1234');

    await injectScenario(roomId, 'midgame');

    // In midgame, P1 (Team A) has a Spades run with a static wild at pos 10.
    // Represents 3S or 4S.
    // P1 hand has natural 3S (forced in scenario)
    
    await p1Page.click('data-testid=draw-pile');
    await p1Page.click('button:has-text("Confirm Draw")');

    // Select 3 of Spades
    await selectCard(p1Page, 'Spades', '3');
    
    // Add to the Spades run (it's the first run of P1)
    await addToRun(p1Page, 0);

    // Verify static wild ('2') is still in the run but shifted
    const spadesRun = p1Page.locator('[data-testid^="run-"]').nth(0);
    await expect(spadesRun.locator('data-testid=card-Spades-2-wild')).toBeVisible();
    // And natural 3S is also in the run
    await expect(spadesRun.locator('data-testid=card-Spades-3')).toBeVisible();
  });
});
