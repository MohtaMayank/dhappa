# Change: Enforce N-Pick Play Constraint

## Why
The N-Pick rule states that when a player picks a stack from the discard pile, they MUST immediately play the bottom-most card of that stack. Currently, the system does not forcibly enforce this after the pick action is complete, nor does it provide explicit instructions to the user.

## What Changes
- **Logic:** Enforce that the picked bottom card remains selected and MUST be played before ending the turn.
- **UI:** Lock the selection of the required card.
- **UI:** Display specific instructions (e.g., "Add [Card] to a new or existing run") when this constraint is active.
- **Logic:** Prevent the "Discard" action until the constraint is satisfied.

## Impact
- **Affected Specs:** `gameplay`, `ui`
- **Affected Code:** `store.ts`, `App.tsx`
