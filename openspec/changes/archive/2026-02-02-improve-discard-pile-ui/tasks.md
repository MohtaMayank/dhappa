## 1. UI Implementation
- [x] 1.1 Update `DiscardNPicker` (or relevant Discard Dialog component) to render cards with selection state.
- [x] 1.2 Implement "pop-up" animation/transform for selected cards in the discard pile list.
- [x] 1.3 Add a "Pick" button that is disabled if selection is invalid or empty.

## 2. Logic & Validation
- [x] 2.1 Implement `validateNPick` helper function:
    - Input: Selected stack of cards.
    - Logic: Check if the *bottom* card can be added to any of the player's team's existing runs OR form a valid new opening (if applicable/supported by rule engine).
    - Note: Strictly enforce "bottom card must be played immediately" rule check.
- [x] 2.2 Connect "Pick" button to validation logic.

## 3. Integration
- [x] 3.1 Ensure picking cards moves them to hand (and potentially auto-plays the bottom one, or restricts next move).