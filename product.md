# Product Specification: Dhappa Baaji Online

> **Version:** 1.0.0  
> **Status:** Draft / Prototyping Phase  
> **Last Updated:** 2026-01-23

## 1. Executive Summary
Dhappa Baaji is a high-strategy, team-based card game played with multiple decks. This project aims to digitize the experience into a Progressive Web App (PWA) that handles the complex rule enforcement (specifically "Flying" vs. "Static" wilds and strict turn sequences) while maintaining a fluid, tactile user experience for 4 or 6 players.

## 2. Rulebook

### 2.1 Terminology & Definitions
*   **The Dhappa:** A specific move where discarding a '2' removes the entire discard pile from the game.
*   **Pure Run:** A sequence of 3+ cards of the same suit with *no* wild cards.
*   **Flying Wild (Joker):** A Joker card. Can be swapped out of a run if a player possesses the natural card it represents.
*   **Static Wild (2):** A card of rank '2'. Once played in a run, it is locked to that run. It can move position within the run but cannot return to a hand.
*   **Opening:** The prerequisite of playing at least one Pure Run (or pure set of Aces/3s) before being allowed to interact with teammates' runs or use wild cards.
*   **N-Pick:** Picking the top $N$ cards from the discard pile.

### 2.2 Game Configuration & Setup
#### 2.2.1 Components
*   **Decks:** 3 Standard Decks + 6 Jokers (Total: 162 Cards).
*   **Players:** 
    *   **4-Player Mode:** 2 Teams of 2. Deal: 27 cards/player.
    *   **6-Player Mode:** 2 Teams of 3. Deal: 21 cards/player.
*   **Seating:** Alternating (A1, B1, A2, B2...).

#### 2.2.2 The Table State
*   **Draw Pile:** Face-down.
*   **Discard Pile:** Face-up, stack order preserved.
*   **Team Boards:** Runs are shared between teammates. Team A has a board; Team B has a board.

### 2.3 Turn Logic (The State Machine)
The game must enforce a strict unidirectional flow per turn.

1.  **Phase 1: Acquisition (The Pick)**
    *   **Option A:** Draw from Draw Pile.
    *   **Option B:** Draw from Discard Pile (N-Pick).
        *   *Constraint:* User selects a card at depth $N$.
        *   *Validation:* The card at depth $N$ (the bottom of the pick) *must* be immediately playable into a run. If not, the action is blocked.

2.  **Phase 2: Action (The Play)**
    *   *Actions:* Create Run, Add to Run, Meld Runs, Swap Joker.
    *   *Transaction State:* All actions in this phase are "Draft" actions until the turn is committed.
    *   *Undo Support:* Users must be able to Undo actions within this phase before finalizing.

3.  **Phase 3: Termination (The Discard)**
    *   *Action:* Place one card on the Discard Pile.
    *   *Effect:* This "Commits" the turn.
    *   *Special Rule (Dhappa):* If the discarded card is a '2', the Discard Pile is cleared (permanently removed).

### 2.4 Card Logic & Validation
#### 2.4.1 Run Construction
*   **Valid Sequence:** A-K-Q-J-10-9-8-7-6-5-4-3 (Descending).
*   **No Looping:** K-A-2 or 2-A-K is invalid.
*   **Uniqueness:** No duplicate cards (Suit + Rank) in the same run.
*   **Special Sets:** "Three of a Kind" is valid **only** for Aces and 3s.

#### 2.4.2 Wild Card Mechanics
*   **Flying Wilds (Jokers):**
    *   Can represent any card.
    *   **Swap Mechanic:** If a run contains `7♣ - Joker (8♣) - 9♣`, a player with the natural `8♣` can swap it for the Joker. The Joker returns to the player's hand.
*   **Static Wilds (2s):**
    *   Can represent any card.
    *   **Lock Mechanic:** Cannot be removed from the table.
    *   **Shift Mechanic:** If a run is `7♣ - 2 (8♣) - 9♣` and the natural `8♣` is added, the `2` must shift to `6♣` or `10♣`. If no valid spot exists, the move is invalid.
    *   **Cost:** A '2' always counts towards the Wild Card Limit for winning, even if the run is visually full of natural cards.

#### 2.4.3 The "Opening" Gate
*   **Global State:** `player.hasOpened` (Boolean).
*   **Condition:** Player must lay down a **Pure Run** (or Pure Set of A/3).
*   **Restrictions:** Until `hasOpened === true`:
    *   Cannot add to teammate's runs.
    *   Cannot use Wild Cards in their own new runs.
    *   Cannot swap Jokers.

### 2.5 Win Conditions
*   **The 3-Run Lock:** Team must identify 3 specific runs that meet strict purity standards:
    *   Max 2 Wilds per run.
    *   Max 4 Wilds total across all 3 runs.
*   **Going Out:** Meeting the Lock + Emptying Hand + Valid Final Discard.

## 3. Technical Architecture (Current Stack)

### 3.1 Frontend (Implemented)
*   **Framework:** React (Vite) + TypeScript.
*   **Styling:** Tailwind CSS (Local installation).
*   **State Management:** Zustand.
*   *Current Gap:* The `store.ts` currently treats Wilds generically. It needs refactoring to support `WildType.Flying` vs `WildType.Static` behavior during board manipulation.

### 3.2 Data Structures (Schema Draft)

```typescript
type Suit = 'H' | 'D' | 'S' | 'C';
type Rank = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2' | 'Jo';

interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  isWild: boolean;
  wildType?: 'FLYING' | 'STATIC'; // Critical distinction
}

interface Run {
  id: string;
  cards: Card[]; // Ordered array
  ownerTeam: 'A' | 'B';
  wildCount: number;
  isPure: boolean; // Computed property
}

interface TurnState {
  phase: 'PICK' | 'PLAY' | 'DISCARD';
  actionsLog: Action[]; // For Undo functionality
  pickedFromDiscard?: {
     depth: number;
     cardId: string;
     mustPlay: boolean;
  };
}
```

## 4. User Interface Guidelines
*   **Visual Hierarchy:**
    *   **Hand:** Bottom of screen, scrollable.
    *   **Table Center:** Draw/Discard piles (Actionable).
    *   **Active Board:** The current focus (My Team or Opponent Team).
*   **Interaction Design:**
    *   **Drag & Drop:** Primary method for moving cards from Hand to Runs.
    *   **Click-to-Select:** Fallback for accessibility and precision.
    *   **N-Pick Modal:** When clicking Discard pile, show top X cards in a fan or list to select pickup depth.

## 5. Implementation Roadmap
1.  **Phase 1: Core Engine (Current)**
    *   Basic Turn loop.
    *   Run creation/addition.
    *   Simple Wild card logic.
2.  **Phase 2: Advanced Logic (Next)**
    *   Implement "Strict Opening" rules.
    *   Differentiate Static vs Flying wilds.
    *   Implement N-Pick validation ("Deepest card must play").
3.  **Phase 3: Multiplayer**
    *   Integrate WebSockets (Socket.io or PartyKit).
    *   Sync state across clients.
4.  **Phase 4: Polish**
    *   Animations for Discard/Draw.
    *   "Undo" button implementation.
