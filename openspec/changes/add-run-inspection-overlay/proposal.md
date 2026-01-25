# Change: Add Run Inspection Overlay

## Why
Players cannot easily see all cards in a compressed run (e.g., "3...7"). They also need to understand:
1. Which cards are wildcards and what rank/suit they currently represent.
2. If there are any "excess" wildcards attached to the run that are no longer needed for the sequence/set but cannot be removed.

## What Changes
- **Interaction**: Tapping a run (when not in "Add to Run" mode) opens a full-screen or modal overlay.
- **RunInspector**:
    - Updates the existing `RunInspector` component to analyze the run structure.
    - Visualizes "Active" cards (part of the valid Set/Sequence) vs "Excess" cards.
    - Displays the represented Rank/Suit for active wildcards.
- **Game Logic**: Adds a utility to parse a run into `{ active: CardContext[], excess: CardDef[] }`, handling cases where `inferRunContext` might fail due to excess cards.

## Impact
- **Specs**: `specs/ui/spec.md`
- **Code**: 
    - `components/RunInspector.tsx`
    - `App.tsx` (state management)
    - `gameLogic.ts` (helper function)
