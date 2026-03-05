# Tasks: Improving Player UI and Turn Clarity

## 1. Server-Side: Empty Seats
- [ ] **Update `initGameState`** in `server/index.ts` to initialize player names to `null` or a placeholder like `"Seat [i+1] (Empty)"`.
- [ ] **Ensure Name Updates** correctly when a player joins (already implemented, but verify it overwrites the empty state).

## 2. Client-Side: UI Enhancements
- [ ] **PlayerAvatar**: 
    - Add a "TURN" badge or a more prominent pulsating ring to the current player's avatar.
    - If the name is empty/placeholder, show a "Waiting..." label.
- [ ] **PlayerBoard**: 
    - Highlight the header of the current player's section in the sidebars.
    - Add a "CURRENT TURN" indicator to the header.
- [ ] **App.tsx**: 
    - Add a prominent "Current Player: [Name]" message in the center of the game area.
    - Ensure the footer turn message is consistently visible and readable.

## 3. Verification
- [ ] **Manual Test**: Join as multiple players and verify that the names are updated correctly.
- [ ] **Manual Test**: Verify the turn indicator follows the `currentPlayerIndex` across different views.
