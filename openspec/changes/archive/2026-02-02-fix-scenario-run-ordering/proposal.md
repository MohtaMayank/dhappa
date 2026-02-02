# Change: Fix Scenario Run Ordering and UI Display

## Why
The game engine strictly enforces Ascending rank order (3, 4, 5... A) for Sequence runs. The current test scenarios generate runs in Descending order (A, K, Q...), causing validation failures. However, the user explicitly desires the UI to display runs in Descending order (High to Low).

## What Changes
- **Data:** Update `scenarios.ts` helpers to generate runs in Ascending order (Logic fix).
- **UI:** Update `Run.tsx` (or `RunDisplay.tsx`) to visually reverse the card order, ensuring runs are presented Descending (High to Low) regardless of internal storage.

## Impact
- **Affected Specs:** `dev`, `ui`
- **Affected Code:** `scenarios.ts`, `components/Run.tsx`