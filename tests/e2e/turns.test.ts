import { test, expect } from '@playwright/test';
import { createRoom, joinRoom, drawFromDeck, discardCard } from '../helpers/gameActions';
import { injectScenario } from '../helpers/stateInjector';

test.describe('Turn Loop', () => {
  test('P1 can draw and discard, passing turn to P2', async ({ context }) => {
    const p1Page = await context.newPage();
    const roomId = await createRoom(p1Page, 'Player 1', '1234');
    
    // Players join
    const p2Page = await context.newPage();
    await joinRoom(p2Page, roomId, 'Player 2', '1234');
    
    // Inject initial scenario to ensure predictable hands
    await injectScenario(roomId, 'initial');

    // Wait for state to sync
    await expect(p1Page.locator('text=PHASE: DRAW')).toBeVisible();

    // P1 Turn
    await drawFromDeck(p1Page);
    await expect(p1Page.locator('text=PHASE: PLAY')).toBeVisible();

    // Select first card in hand and discard
    const firstCard = await p1Page.locator('data-testid^=card-').first();
    const cardId = await firstCard.getAttribute('data-testid');
    const [_, suit, value] = cardId!.split('-');
    
    await discardCard(p1Page, suit, value);
    
    // Verify Phase changes back to DRAW for P2
    await expect(p1Page.locator('text=Waiting for Player 2')).toBeVisible();
    await expect(p2Page.locator('text=PHASE: DRAW')).toBeVisible();
    await expect(p2Page.locator('text=Draw a card')).toBeVisible();
  });

  test('Hand Redaction: P1 cannot see P2 cards', async ({ context }) => {
    const p1Page = await context.newPage();
    const roomId = await createRoom(p1Page, 'Player 1', '1234');
    
    const p2Page = await context.newPage();
    await joinRoom(p2Page, roomId, 'Player 2', '1234');
    
    // Check if P1 can see P2's hand (PlayerAvatar displays card count)
    // Actually PlayerAvatar displays current player info if it's their turn
    // Based on App.tsx, other players are in PlayerAvatar components.
    
    // P1 sees P2 on the right
    const p2Avatar = p1Page.locator('data-testid=player-avatar >> text=Player 2');
    await expect(p2Avatar).toBeVisible();
    
    // Card count should be visible
    const cardCount = p1Page.locator('data-testid=player-avatar >> text=15 cards'); // Initial deal is 15?
    await expect(cardCount).toBeVisible();
    
    // Verify no card details for P2 in P1's page
    // Cards for other players should NOT be in data-testid=card-suit-value format
    // Only in local hand: data-testid=player-hand
    const p2Cards = await p1Page.locator('data-testid^=card-').all();
    // All cards should belong to Player 1.
    // We can't easily verify this unless we know P1's cards.
    // Let's check how many cards are in data-testid=player-hand
    const myCards = await p1Page.locator('data-testid=player-hand >> data-testid^=card-').count();
    const totalCards = await p1Page.locator('data-testid^=card-').count();
    
    expect(totalCards).toBe(myCards);
  });
});
