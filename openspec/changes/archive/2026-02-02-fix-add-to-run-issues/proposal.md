# Change: Fix Add to Run Issues

## Why
Users have reported several issues with the "Add to Run" functionality, including the inability to add multiple cards, confusion around opening rules, and visual bugs where runs appear twice. These changes aim to fix the validation logic, enforce rules correctly, and polish the UI.

## What Changes
- **Logic:** Update `validateAddToRun` to support adding *multiple* cards to a Sequence (currently only supports 1 card or Sets).
- **Logic:** Enforce the "Must Open First" rule: Players cannot use "Add to Run" until they have opened. The button will be disabled or validation will fail.
- **UI:** Fix `PlayerBoard` rendering to prevent runs from appearing twice (likely due to overlapping suit filters).
- **UI:** Ensure players can add cards to *teammate's* runs (which should be allowed after opening).

## Impact
- **Affected Specs:** `gameplay`, `ui`
- **Affected Code:** `gameLogic.ts`, `PlayerBoard.tsx`, `App.tsx`, `store.ts`
