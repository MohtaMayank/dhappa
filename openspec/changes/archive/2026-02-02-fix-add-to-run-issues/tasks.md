## 1. Gameplay Logic
- [x] 1.1 Update `validateAddToRun` in `gameLogic.ts` to support adding multiple cards to a `SEQUENCE`.
    - Logic: Check if the sorted sequence of `cardsToAdd` fits at the HEAD or TAIL (or both) of the target sequence.
    - Handle wildcards correctly within the multi-card sequence.
- [x] 1.2 Update `App.tsx` and/or `store.ts` to explicitly prevent "Add to Run" if the player has not `hasOpened`.

## 2. UI Fixes
- [x] 2.1 Fix `PlayerBoard.tsx` rendering logic to prevent duplicate runs.
    - Issue: The suit grouping filter uses `||` which catches runs in multiple groups if they contain/represent multiple suits (e.g. wildcards).
    - Fix: Assign each run to a *single* primary suit group (e.g. based on the first *natural* card, or a strict priority).
- [x] 2.2 Verify "Add to Run" button state in `App.tsx`:
    - Disabled if `!hasOpened`.
    - Disabled if `selectedInHand` is empty.

## 3. Verification
- [x] 3.1 Verify adding multiple cards to a sequence works.
- [x] 3.2 Verify adding to teammate's runs works (after opening).
- [x] 3.3 Verify no duplicate runs on UI.