# Tasks: E2E Testing for Dhappa

## 1. Setup & Infrastructure
- [x] Install Playwright and dependencies.
- [x] Configure `playwright.config.ts` for local dev (Vite + Node Server).
- [x] Create `stateInjector.ts` to trigger `LOAD_SCENARIO` via Socket.IO.
- [x] Create `gameActions.ts` for common UI interactions (select card, click button, drag-and-drop simulation).

## 2. Phase 1: Basic Interactions & Multiplayer
- [x] **Lobby & Connection:** 4 players join, verify team assignments (P1/P3 Team A, P2/P4 Team B).
- [x] **Basic Turn Loop:** 
    - P1: Draw from deck -> Select card -> Discard. 
    - Verify turn passes to P2.
    - Verify phase changes (Draw -> Play -> Draw).
- [x] **Hand Redaction:** Verify P1 cannot see P2's hand (only card counts).

## 3. Phase 2: Game Rules Enforcement
- [x] **The Opening Gate:**
    - [x] **Opening with Pure Run:** Create a sequence with no wilds, verify `hasOpened` becomes true.
    - [x] **Blocked Wild Opening:** Attempt to create first run with a Joker/2, verify error message.
    - [x] **Teammate Addition Restriction:** Verify P3 cannot add to P1's run *before* P3 has opened.
- [x] **N-Pick Mechanics:**
    - [x] **N-Pick Validation:** Attempt picking where bottom card is unplayable, verify rejection.
    - [x] **Must-Play Enforcement:** Pick from discard, attempt to discard a different card without playing the bottom card, verify rejection.
    - [x] **First Turn Exception:** Pick first card of game from discard, verify no "must-play" restriction.
- [x] **Run Construction & Manipulation:**
    - [x] **Sequence Validation:** Attempt invalid sequence (e.g. 7-5-4), verify rejection.
    - [x] **Duplicate Card Check:** Attempt adding duplicate rank/suit to a run, verify rejection.
    - [x] **Ambiguity Resolution:** Create run that triggers HEAD/TAIL modal, resolve it, verify board state.
    - [x] **Merge Runs:** Create two runs (9-8-7 and 5-4-3) and merge with a connector (natural 6 or wild 2).
- [x] **Wild Card Mechanics:**
    - [x] **Wild Swapping (Flying):** Replace a Joker in a run with its natural equivalent from hand, verify Joker returns to hand.
    - [x] **Static Wild Shifting (2s):** Add natural card to a run containing a '2', verify '2' shifts position or triggers ambiguity.
    - [x] **Sequential Wilds:** Build a run with multiple 2s and Jokers.

## 4. Phase 3: Advanced Rules & Win Conditions
- [x] **Special Sets:**
    - [x] **Aces & 3s:** Create "Three of a Kind" for Aces and 3s, verify they are valid runs.
    - [x] **Invalid Sets:** Attempt "Three of a Kind" for 4s, verify rejection (unless the rule is broader).
- [x] **The Dhappa:** Discard a '2', verify the entire discard pile is cleared from the game.
- [x] **Winning the Game (Lock Condition):**
    - [x] **3-Run Lock Validation:** Verify player can only "Go Out" if team has 3 runs meeting lock standards (max 2 wilds per run, max 4 total).
    - [x] **Going Out Requirement:** Verify player cannot go out by playing last card into a run; a final discard is MANDATORY.
    - [x] **Win Detection:** Verify game ends and winner is declared when a player goes out.

## 5. CI & Documentation
- [x] Add `test:e2e` script to `package.json`.
- [x] Update `README.md` with instructions on running tests and using scenarios for debugging.
- [x] Ensure tests run in CI (GitHub Actions).
