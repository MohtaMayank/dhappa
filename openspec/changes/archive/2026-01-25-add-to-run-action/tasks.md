## 1. Core Logic (Store)
- [x] 1.1 Implement `validateAddToRun(cards, runId)` helper.
    - Checks if cards extend the run (head or tail).
    - Checks for Wildcard replacement scenarios.
- [x] 1.2 Implement `replaceFlyingWild` logic.
    - Swaps natural card for Joker.
    - Returns Joker to player's hand.
- [x] 1.3 Implement `replaceStaticWild` logic.
    - Swaps natural card for '2'.
    - Moves '2' to the valid end (head/tail).
    - Handles ambiguity (if '2' can move to both ends, require input).
- [x] 1.4 Update `addToRun` action in store to handle the commit phase.

## 2. User Interface
- [x] 2.1 Add "Add to Run" button in the footer actions.
    - Enabled only when valid cards are selected and it's player's turn.
- [x] 2.2 Implement "Target Selection Mode".
    - When "Add to Run" is clicked, highlight valid target runs on the board.
    - Dim invalid runs.
- [x] 2.3 Implement Wildcard Ambiguity Modal.
    - If a Static Wild can move to either end, prompt user to choose "Left" or "Right".
- [x] 2.4 Add feedback messages (Toasts/Alerts).
    - "No valid runs found."
    - "Joker returned to hand."

## 3. Integration & Testing
- [x] 3.1 Verify adding single cards to ends of runs.
- [x] 3.2 Verify adding sequences to ends of runs.
- [x] 3.3 Verify Flying Wild swap (Joker back to hand).
- [x] 3.4 Verify Static Wild displacement (2 moves).