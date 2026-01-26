# Change: Improve Run Display with In-Place Wildcards and Stacking

## Why
Long runs consume excessive screen space, making the board difficult to read. The current display also obscures the specific rank/suit a wildcard represents, increasing cognitive load for players trying to understand the board state.

## What Changes
- **In-Place Wildcards**: Wildcards are rendered at the exact index corresponding to the rank they represent within the run sequence.
- **Smart Stacking**: Sequences of natural cards are collapsed into a visual "stack" to save space, based on "Anchors".
- **Anchor Logic**: The first card, last card, and all wildcards are "Anchors" and always visible.
- **Collapse Rule**: Any sequence of 2 or more natural cards located *between* two Anchors is collapsed into a single stack element.

## Impact
- **Affected Specs**: `ui`
- **Affected Code**: `Run.tsx` rendering logic.