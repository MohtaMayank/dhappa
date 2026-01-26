# Change: Re-implement Run Display with Correct Ordering and Representation

## Why
The previous implementation of the Run display was flawed:
1. `PlayerBoard.tsx` was manually sorting cards by raw rank, breaking the logical "In-Place" wildcard positioning provided by the game engine.
2. Wildcards did not explicitly store or display what they represented, making it hard for players to read the board.
3. The "Smart Stacking" visual was sometimes washed out due to excessive use of the `isStacked` overlay on anchor cards.

## What Changes
- **Logical Ordering**: Remove manual sorting in `PlayerBoard.tsx` to preserve the logical card order from the store.
- **Explicit Representation**: Ensure `CardDef.represents` is populated whenever a run is created or modified in the store.
- **Visual Indicators**: Update `Run.tsx` and `CardBase.tsx` to display the represented rank/suit on wildcards.
- **Refined Stacking**: Remove the `isStacked` overlay from Anchor cards in `Run.tsx` to ensure they are fully visible and clear.
- **Fixed Anchor Logic**: Ensure "Smart Stacking" correctly identifies gaps and preserves the integrity of the run's visual flow.

## Impact
- **Affected Specs**: `ui`, `gameplay`
- **Affected Code**: `PlayerBoard.tsx`, `store.ts`, `gameLogic.ts`, `Run.tsx`, `CardBase.tsx`.
