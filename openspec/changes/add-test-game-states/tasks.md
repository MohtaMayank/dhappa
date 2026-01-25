## 1. Scenario Logic
- [ ] 1.1 Create `utils/deckBuilder.ts` helper.
    - `getDeck()`: Returns 3 full decks + 6 jokers.
    - `distribute(deck, distribution)`: Helper to slice deck into hands/piles ensuring consistency.
- [ ] 1.2 Create `scenarios.ts` with definitions:
    - `SCENARIO_INITIAL`: Default start.
    - `SCENARIO_MIDGAME`: Player 1 has opened, discard pile has 10 cards.
    - `SCENARIO_ENDGAME`: Team A has 2 runs, Team B has 3 runs (winning), Player 1 has winning hand.
- [ ] 1.3 Update `store.ts`.
    - Add `loadScenario(scenarioKey)` action.
    - Add `godMode` boolean to state.
    - Update `isMyTurn` logic in UI components to respect `godMode`.

## 2. User Interface
- [ ] 2.1 Create `components/DebugMenu.tsx`.
    - Hidden by default, toggled via keyboard shortcut (e.g., `Ctrl + Shift + D`) or visible icon in dev build.
    - List available scenarios.
    - Toggle "God Mode" checkbox.
- [ ] 2.2 Integrate `DebugMenu` into `App.tsx`.
