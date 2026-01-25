# Change: Add Test Game States

## Why
To ensure the UI handles various game phases (Opening, Mid-game, End-game) correctly, we need deterministic game states for testing. Currently, developers must play through the game manually to reach these states, which is time-consuming and inconsistent.

## What Changes
- Adds a "Debug Menu" to the application interface.
- Implements a `loadScenario` action in the game store to hydrate the state from a preset.
- Defines three core scenarios:
    - **Initial:** Standard game start.
    - **Mid-Game:** Some runs opened, discard pile populated.
    - **End-Game:** Teams near winning conditions (3 runs), closing required.
- Adds "God Mode" (Hotseat) to the Debug Menu, allowing the local user to control all players.

## Impact
- **Specs:** `ui` (Debug Menu), `dev` (Scenario Logic).
- **Code:**
    - `store.ts`: Add `loadScenario` and `toggleGodMode`.
    - `scenarios.ts`: New file defining the deterministic states.
    - `App.tsx`: UI for the Debug Menu.
