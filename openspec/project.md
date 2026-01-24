# Project Context

## Purpose
The goal of this project is to digitize "Dhappa Baaji," a high-strategy, team-based card game played with multiple decks, into a Progressive Web App (PWA). The application must enforce complex rule sets (specifically "Flying" vs. "Static" wilds, strict turn sequences, and N-Pick validation) while providing a fluid, tactile user experience for 4 or 6 players.

## Tech Stack
- **Frontend Framework:** React 19 (via Vite)
- **Language:** TypeScript (~5.8)
- **Styling:** Tailwind CSS 3.4
- **State Management:** Zustand 5.0
- **Package Manager:** npm
- **Backend / Real-time:** TBD (Planned: WebSockets via Socket.io or PartyKit)
- **Database:** TBD

## Project Conventions

### Code Style
- **Formatting:** Prettier (implied standard).
- **Naming:** PascalCase for components (`CardBase.tsx`), camelCase for functions/variables.
- **Typing:** Strict TypeScript usage. Interfaces for state and domain models.
- **Imports:** Absolute imports configured via `@/*` pointing to project root.

### Architecture Patterns
- **State Management:** Centralized store using Zustand (`store.ts`) handling game state (players, deck, turn phases).
- **Component Structure:** Functional components with hooks.
- **Logic Separation:** Game logic (validation, turn transitions) should ideally be separated from UI components, likely within the store actions or utility helpers.

### Testing Strategy
- **Current Status:** Not yet established.
- **Future Requirement:** Unit tests for complex game logic (Wild card validation, Run purity checks) are critical.

### Git Workflow
- Standard feature branch workflow.
- Commit messages should be descriptive.

## Domain Context

### Dhappa Baaji: Official Rulebook & Logic Specifications

This rulebook has been restructured for a **Product Requirement Document (PRD)**. It is designed to be a definitive reference for developers and QA engineers to build the game logic, UI constraints, and validation rules.

#### 1. Game Foundation & Setup

This section defines the core environment and initialization parameters for the digital game.

* **Player Configuration:** 4 or 6 players, split into two equal teams (Team A and Team B).
* **Seating Logic:** Alternating team order (A1 → B1 → A2 → B2 → [A3 → B3]).
* **Card Inventory:** 162 cards total (3 standard 52-card decks + 6 Jokers).
* **The Deal:**
* **4-Player:** 27 cards per player.
* **6-Player:** 21 cards per player.


* **Game Assets:**
* **Draw Pile:** Face-down deck containing remaining cards.
* **Discard Pile:** Face-up stack where players end their turns.
* **Table Area:** The shared space where teams build "Runs."

#### 2. The Individual "Opening"

A player is restricted from interacting with the board until they have "Opened."

* **Requirement:** To Open, a player must play at least one **Pure Run** or **Pure Set** from their hand.
* **Restrictions Before Opening:**
* Cannot add cards to a teammate’s existing runs.
* Cannot use Wild Cards (Jokers or 2s) to facilitate the opening sequence.


* **Valid Opening Types:**
* **Pure Run:** A sequence of 3+ cards of the same suit (e.g., ).
* **Pure Set:** A "Three of a Kind" of either **3s** or **Aces** (e.g., ).

#### 3. Run Construction & Validation

A "Run" is the primary unit of play. The system must validate every card placement against these rules.

* **Sequence Rules:** Cards must follow the order: .
* **Invalid Moves:**
* **No Looping:**  is an invalid sequence.
* **No Duplicates:** A run cannot contain two identical cards (e.g.,  is illegal).


* **Special Sets:** "Sets" (3s or Aces) are the only runs where values are identical rather than sequential.
* *Example:* After a Pure Set of Aces is opened, players may add more Aces or Wild Cards to it.

#### 4. Wild Card Mechanics

There are two distinct types of Wild Cards with different programmatic behaviors.

##### A. Flying Wild Cards (Jokers)

* **Behavior:** Flexible/Retrievable.
* **The Swap Rule:** If a Joker is representing a specific card (e.g., a Joker in  represents the ), any player who holds the natural  may:
1. Replace the Joker with the natural .
2. Return the Joker to their **own hand** to be used elsewhere.

##### B. Static Wild Cards (All 2s)

* **Behavior:** Permanent/Fixed.
* **The No-Retrieval Rule:** Once a '2' is played on the table, it can **never** return to a player’s hand.
* **The Shift Rule:** If a player adds the natural card the '2' was representing, the '2' must stay in that run. The player must shift it to either end of the sequence to represent a new value.
* *Example:* A run is  (where 2 is acting as a 4). If a player plays the , the '2' must be moved to represent the  or the .


* **The "Once a Wild, Always a Wild" Rule:** Even if a run is eventually completed with all natural cards, if a '2' is part of it, it still counts toward the Wild Card limit for that run.

#### 5. Turn Logic (The Game Loop)

Every turn must proceed through three mandatory phases.

##### Phase 1: The Pick

A player must choose one of two ways to start their turn:

1. **Draw:** Take the top card from the Draw Pile.
2. **N-Pick (Discard Pile):** Take the **entire** discard pile or a specific top section ( cards).
* **The Constraint:** To take the pile, the player **must** immediately play the deepest card of the picked stack into a valid run (new or existing). If the card cannot be played, the pick is illegal.

##### Phase 2: The Play

The player may perform multiple actions:

* Lay down new runs (if meeting opening requirements).
* Add cards to their team's existing runs.
* **Melding:** If a card bridges two separate runs (e.g., a  connecting a  run and a  run), the player may merge them into one long run.

##### Phase 3: The Discard

A player ends their turn by placing one card face-up on the Discard Pile.

* **The Dhappa Rule:** If a player discards a **'2'**, the entire discard pile is immediately "burnt" (removed from the game). It can no longer be picked up.

#### 6. Win Conditions & Primary Goal

A team cannot "Go Out" (win) until they achieve the **3-Run Lock**.

##### The Primary Goal (The Lock)

The team must have three runs on the table that satisfy these combined limits:

* **Per Run Limit:** Maximum 2 Wilds per run.
* **Global Limit:** Maximum 4 Wilds total across these three specific runs.
* *Note:* Any additional runs (4th, 5th, etc.) have no Wild Card restrictions.

##### "Going Out"

A player wins the round for their team by:

1. Having the **3-Run Lock** completed by their team.
2. Emptying their hand completely by playing cards on the table.
3. Placing their final card in the Discard Pile.

##### Draw Condition

If the Draw Pile is exhausted:

* The player who draws the final card finishes their turn.
* If no one "Goes Out" on that final turn, the game is declared a **Draw**.

#### Summary Logic Table for PRD

| Feature | Rule Logic |
| --- | --- |
| **Duplicates** | Not allowed in sequential runs; allowed only in Sets (3s/Aces). |
| **Discarding a 2** | Triggers "Dhappa"—clears the discard pile from the game. |
| **Discard Pick-up** | Valid only if the deepest card is played immediately. |
| **Static 2s** | Cannot be retrieved; movement is restricted to the ends of the run. |
| **Opening** | Must be a Pure Run or Pure Set (no Wilds allowed). |
| **The Lock** | 3 Runs: Max 2 Wilds per run AND Max 4 Wilds total. |


## External Dependencies
- None currently beyond standard npm packages.
