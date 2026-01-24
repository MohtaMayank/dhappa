# Change: Improve Hand Selection Visibility

## Why
The current hand interface uses tight negative margins. Selecting a card previously boosted its Z-index, which caused it to obscure the card to its right, making multi-card selection difficult.

## What Changes
- **Refined Selection Pop-out:** Selected cards now translate vertically ("pop out") without changing their stacking order (Z-index). This ensures they remain visible without covering neighboring cards.

## Impact
- **Affected Specs:** `ui`
- **Affected Components:** `Hand.tsx`, `CardBase.tsx`