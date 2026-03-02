# Change: Update Mobile Card Readability

## Why
User feedback indicates that the fonts on cards are too tiny to read on phones. Improving readability on mobile is crucial for a better user experience.

## What Changes
- Increase the font size of the corner rank and suit on cards for mobile.
- Increase the font size of the center suit/icon for mobile.
- Slightly increase the overall card dimensions on mobile to accommodate larger fonts while maintaining the same overlapping structure.
- Adjust negative margins in `Hand.tsx` and `RunDisplay.tsx` to preserve the visual overlapping of larger cards.

## Impact
- Affected specs: `ui`
- Affected code: `components/CardBase.tsx`, `components/Hand.tsx`, `components/RunDisplay.tsx`
