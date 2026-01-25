# Change: Add "Add to Run" Action

## Why
Currently, players can only create new runs but cannot extend existing runs on the board. This is a core mechanic of Dhappa (Rummy-style games) allowing players to offload cards and manipulate the board state.

## What Changes
- Adds a new "Add to Run" action to the main game controls.
- Implements the logic to validate if selected cards can be legally added to specific runs.
- Implements the interactive flow where users select a target run after choosing cards.
- Handles complex Wildcard interactions:
    - **Flying Wilds (Jokers):** Swapping natural cards for Jokers (Joker returns to hand).
    - **Static Wilds (2s):** Displacing 2s to either end of the run when a natural card replaces them.

## Impact
- **New Capability:** `gameplay` for core rules.
- **Modified Capability:** `ui` for the new action and interaction flow.
- **Code:**
    - `store.ts`: New actions (`addToRun`, `replaceWild`), validation logic.
    - `App.tsx`: UI button and mode switching.
    - `PlayerBoard.tsx` / `Run.tsx`: Click handlers and visual highlights for targetable runs.
