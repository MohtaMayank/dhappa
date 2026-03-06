import { test, expect } from '@playwright/test';
import { createRoom, joinRoom, pickFromDiscard, discardCard, drawFromDeck, selectCard } from '../helpers/gameActions';
import { injectScenario } from '../helpers/stateInjector';

test.describe('N-Pick Mechanics', () => {
  test('N-Pick validation and must-play enforcement', async ({ context }) => {
    const p1Page = await context.newPage();
    const roomId = await createRoom(p1Page, 'Player 1', '1234');
    
    const p2Page = await context.newPage();
    await joinRoom(p2Page, roomId, 'Player 2', '1234');
    
    const p3Page = await context.newPage();
    await joinRoom(p3Page, roomId, 'Player 3', '1234');
    
    const p4Page = await context.newPage();
    await joinRoom(p4Page, roomId, 'Player 4', '1234');
    
    // 1. First Turn Exception
    // Discard pile has 1 card.
    await p1Page.click('data-testid=discard-pile');
    await p1Page.locator('data-testid=n-pick-option-1').click();
    await expect(p1Page.locator('button:has-text("Pick Cards")')).toBeEnabled();
    await p1Page.click('button:has-text("Pick Cards")');
    
    // After picking first card, no must-play card
    const statusText = await p1Page.locator('footer >> p').textContent();
    expect(statusText).toContain('Play cards or Discard');
    
    // Discard to pass turn
    const p1Card = await p1Page.locator('data-testid^=card-').first();
    const p1CardId = await p1Card.getAttribute('data-testid');
    const [_, p1Suit, p1Value] = p1CardId!.split('-');
    await discardCard(p1Page, p1Suit, p1Value);

    // 2. N-Pick Validation (Unplayable)
    // P2 Turn
    await p2Page.bringToFront();
    // Inject a scenario where discard pile has something unplayable
    await injectScenario(roomId, 'initial');
    
    await p2Page.click('data-testid=discard-pile');
    await p2Page.locator('data-testid=n-pick-option-1').click();
    // Initially unplayable unless they have a match
    const pickBtn = p2Page.locator('button:has-text("Pick Cards")');
    // If unplayable, button should show "Invalid Pick" or be disabled
    // Based on DiscardNPicker.tsx:
    // {selectedIdx === null ? 'Select Cards to Pick' : isCurrentlyValid ? `Pick ${numFromTop} Cards` : 'Invalid Pick'}
    await expect(pickBtn).toContainText('Invalid Pick');
    await p2Page.click('button:has-text("Select Cards to Pick")'); // close picker
    
    // 3. Must-Play Enforcement
    // We need a scenario where we CAN pick
    await injectScenario(roomId, 'testing_runs');
    // P1 Turn (reset by scenario)
    await p1Page.bringToFront();
    // P1 has Hearts A, K, Q. 
    // Let's put J of Hearts in discard pile.
    // Wait, P1 is first. P1 draws and discards J of Hearts.
    await drawFromDeck(p1Page);
    // Find J of Hearts in hand? (No, P1 has A,K,Q. P3 has J, 10)
    // Let's use what's in P1's hand from testing_runs: 10, J, Q of Spades.
    await discardCard(p1Page, 'Spades', 'J');
    
    // P2 Turn (Skip)
    await p2Page.bringToFront();
    await drawFromDeck(p2Page);
    const p2Card = await p2Page.locator('data-testid^=card-').first();
    const p2CardId = await p2Card.getAttribute('data-testid');
    const [__, p2Suit, p2Value] = p2CardId!.split('-');
    await discardCard(p2Page, p2Suit, p2Value);
    
    // P3 Turn
    await p3Page.bringToFront(); 
    // Wait for p3 to be ready
    await expect(p3Page.locator('text=PHASE: DRAW')).toBeVisible();
    
    // Pick Spades J from discard
    await p3Page.click('data-testid=discard-pile');
    await p3Page.locator('data-testid=n-pick-option-1').click();
    await p3Page.click('button:has-text("Pick Cards")');
    
    // Now P3 MUST play Spades J
    // Verify status text
    await expect(p3Page.locator('footer >> p')).toContainText('Must play J of Spades');
    
    // Try to discard something else
    const anotherCard = p3Page.locator('data-testid^=card-').first();
    const acId = await anotherCard.getAttribute('data-testid');
    const [___, acSuit, acValue] = acId!.split('-');
    
    await discardCard(p3Page, acSuit, acValue);
    
    // Should show error
    await expect(p3Page.locator('text=You must play the card you picked')).toBeVisible();
  });
});
