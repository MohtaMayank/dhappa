import { test, expect } from '@playwright/test';
import { createRoom, joinRoom, discardCard } from '../helpers/gameActions';
import { injectScenario } from '../helpers/stateInjector';

test.describe('Game End', () => {
  test('P1 can win the game by discarding their last card after meeting lock conditions', async ({ context }) => {
    const p1Page = await context.newPage();
    const roomId = await createRoom(p1Page, 'Player 1', '1234');
    
    const p2Page = await context.newPage();
    await joinRoom(p2Page, roomId, 'Player 2', '1234');

    await injectScenario(roomId, 'endgame');

    // In endgame scenario, P1 has 1 card (10 of Spades) and meets the 3-run lock condition.
    
    // Select the last card
    await p1Page.locator('data-testid=card-Spades-10').click();
    
    // Discard to win
    await p1Page.click('data-testid=discard-btn');

    // Verify winner overlay is shown
    await expect(p1Page.locator('data-testid=winner-overlay')).toBeVisible({ timeout: 10000 });
    await expect(p1Page.locator('text=Team A Wins!')).toBeVisible();
  });
});
