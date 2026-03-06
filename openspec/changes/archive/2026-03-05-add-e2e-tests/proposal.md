# Proposal: E2E Testing for Dhappa

## 1. Goal
Implement a robust end-to-end (E2E) testing suite using **Playwright** to verify critical user journeys, game rule enforcement, and UI interactions. The suite will support multiplayer scenarios and state injection via predefined scenarios.

## 2. Technical Approach
*   **Framework:** Playwright (Node.js).
*   **Multiple Players:** Use Playwright's `browserContext` to simulate 2+ players in the same room.
*   **State Injection:** Leverage the existing `loadScenario` mechanism. Add a `TESTING` scenario or allow arbitrary state injection if needed.
*   **UI Coverage:** Test modals (Ambiguity, N-Pick), card selection, drag-and-drop (if applicable), and player status updates.

## 3. Test Categories
*   **Lobby & Connection:** Multi-player joining, room persistence, and team-based UI verification (P1/P3 vs P2/P4).
*   **Core Turn Loop:** Draw (Deck/Discard) -> Play -> Discard.
*   **Rule Enforcement:** Opening requirements, N-Pick "must play" rule, and the "First Turn Exception" for discard picks.
*   **Complex Actions:** 
    *   Ambiguity resolution (HEAD/TAIL).
    *   Wild card swapping (Flying) and shifting (Static).
    *   Sequential wild card additions (2(9) -> Jo(5) -> 2(4)).
    *   **Meld/Merge Runs:** Combining two runs of the same suit using a connector card (natural or wild).
*   **Special Rules:**
    *   **The Dhappa:** Discarding a '2' results in clearing the entire discard pile.
*   **Validation:** Blocking invalid N-Pick attempts where the bottom card is not immediately playable.
*   **Game End:** Win condition detection.

## 4. Proposed File Structure
```text
tests/
├── e2e/
│   ├── lobby.test.ts
│   ├── turns.test.ts
│   ├── runs.test.ts
│   ├── wilds.test.ts
│   └── npick.test.ts
└── helpers/
    ├── gameActions.ts
    └── stateInjector.ts
```
