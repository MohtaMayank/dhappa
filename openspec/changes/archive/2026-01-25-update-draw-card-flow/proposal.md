# Change: Update Draw Card Flow

## Why
Currently, clicking the draw pile immediately draws and reveals a card. This leads to accidental draws. Furthermore, the revealed card is often visually clipped (top/bottom cut off) due to layout constraints, and the transition to the hand is instant, lacking visual feedback.

## What Changes
- **Interaction:** Split the draw action into two steps: Request (Dialog) -> Confirm (Action).
- **Visuals:** Fix the "Card Reveal" overlay to ensure the card is fully visible (remove clipping).
- **Feedback:** Add a delay after revealing the card before it moves to the hand.
- **Animation:** Animate the card moving from the reveal position to the player's hand.
- **State:** Automatically transition the turn phase to "Action" (Play) once the draw is complete.

## Impact
- **Specs:** `ui` (Draw interaction).
- **Code:**
    - `App.tsx`: Manage "Requesting Draw" state separate from "Card Drawn" state.
    - `DrawCardOverlay.tsx`: Refactor to handle the two-step state explicitly and fix CSS clipping.
    - `store.ts`: Update draw actions if necessary to support the flow (or manage purely in UI state).
