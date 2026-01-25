## ADDED Requirements
### Requirement: Deterministic Test Scenarios
The system SHALL support loading predefined, deterministic game states.

#### Scenario: Loading Initial State
- **WHEN** "Initial State" is loaded
- **THEN** all players have full hands (27/21 cards)
- **AND** no runs are on the board
- **AND** the discard pile has exactly 1 card.

#### Scenario: Loading Mid-Game State
- **WHEN** "Mid-Game State" is loaded
- **THEN** at least one player has `hasOpened = true`
- **AND** there are runs on the board
- **AND** the discard pile contains a known sequence of cards.

#### Scenario: Loading End-Game State
- **WHEN** "End-Game State" is loaded
- **THEN** one team has met the "3-Run Lock" condition (3 pure/valid runs)
- **AND** the current player has a hand that can potentially win (e.g., 1 card left to discard).

### Requirement: Deck Consistency
All loaded scenarios MUST maintain deck integrity.

#### Scenario: Conservation of Cards
- **WHEN** any scenario is loaded
- **THEN** the total count of cards (Hands + Draw Pile + Discard Pile + Board Runs) MUST equal the total deck size (162 cards).
- **AND** no duplicate card IDs shall exist.
