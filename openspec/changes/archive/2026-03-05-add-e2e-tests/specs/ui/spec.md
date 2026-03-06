# UI Spec: E2E Testing

## 1. Locators & Interactions
Tests should use stable locators where possible:
- **Cards:** `[data-testid="card-{suit}-{value}"]` or similar.
- **Player Hand:** `[data-testid="player-hand"]`.
- **Discard Pile:** `[data-testid="discard-pile"]`.
- **Modals:** `[data-testid="ambiguity-modal"]`, `[data-testid="npick-modal"]`.
- **Buttons:** By text (e.g., "Draw", "Create Run", "Discard").

## 2. Scenario-Specific UI Expectations

### 2.1 Ambiguity Modal
- When `runCreationAmbiguity` is active, the `AmbiguityModal` must be visible.
- Buttons "Place at Head" and "Place at Tail" must be clickable.
- Clicking a button must close the modal and update the team board.

### 2.2 N-Pick Modal
- Clicking the discard pile at depth $N > 1$ should open the `DiscardNPicker`.
- Confirming the pick should put cards in hand and set `mustPlayCard`.
- The UI should highlight the `mustPlayCard`.

### 2.3 Hand Management
- Selected cards should have a visual "lift" or border.
- "Create Run" button should only be enabled when 3+ cards are selected.

### 2.4 Special Rules UI
- **Dhappa:** When a '2' is discarded, the discard pile UI should immediately empty.
- **Merge Runs:** When a connector card is played that links two existing runs, the two run components should merge into a single visual block on the board.

### 2.5 Multi-Player Verification
- When Player A discards, Player B's UI must update immediately (Discard pile, Next Turn indicator).
- Team boards must stay synced across all teammates. P1 and P3 must see the same "Team A" board.
