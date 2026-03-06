import { test, expect } from '@playwright/test';
import { createRoom, joinRoom, discardCard } from '../helpers/gameActions';
import { injectScenario } from '../helpers/stateInjector';

test.describe('Special Rules', () => {
  test('The Dhappa rule: discarding a 2 clears the discard pile', async ({ context }) => {
    const p1Page = await context.newPage();
    const roomId = await createRoom(p1Page, 'Player 1', '1234');
    
    const p2Page = await context.newPage();
    await joinRoom(p2Page, roomId, 'Player 2', '1234');

    await injectScenario(roomId, 'dhappa');
    
    // Check initial discard pile count (from scenario: 10)
    await expect(p1Page.locator('text=Discard (10)')).toBeVisible();

    // Discard 2 of Hearts
    await discardCard(p1Page, 'Hearts', '2');

    // Verify discard pile is cleared (count should be 0)
    await expect(p1Page.locator('text=Discard (0)')).toBeVisible();
  });
});
