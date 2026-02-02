# Change: Improve Discard Pile UI and Validation

## Why
The current discard pile interaction lacks clear visual feedback for card selection and doesn't enforce the critical "N-Pick" rule validation before picking. Players need to see exactly which cards they are selecting and be prevented from picking if the move is illegal.

## What Changes
- **UI:** The Discard Pile dialog will support multi-card selection with visual "pop-up" feedback (consistent with Hand UI).
- **UI:** A "Pick" button will be added to the Discard Pile dialog.
- **Logic:** The system will validate that the bottom-most card of the selected stack can be legally played (added to an existing run or starting a new valid run) before allowing the pick.

## Impact
- **Affected Specs:** `ui`, `gameplay`
- **Affected Code:** Discard Pile components, Game Store (actions/validation).
