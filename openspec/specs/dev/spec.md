# dev Specification

## Purpose
TBD - created by archiving change add-test-game-states. Update Purpose after archive.
## Requirements
### Requirement: Deterministic Test Scenarios
The system SHALL support loading predefined, deterministic game states.

#### Scenario: Loading Initial State
- **WHEN** "Initial State" is loaded
- **THEN** all players have full hands (27/21 cards)
- **AND** no runs are on the board
- **AND** the discard pile has exactly 1 card.

#### Scenario: Loading Mid-Game State
- **WHEN** "Mid-Game State" is loaded
- **THEN** each team has at least one complete run (Ace to 3)
- **AND** each team has additional mid-sized runs (4-8 cards) containing wildcards
- **AND** smaller runs (3-4 cards) are present on the board
- **AND** players have approximately 18 cards in hand
- **AND** the discard pile contains ~15 cards.

#### Scenario: Loading End-Game State
- **WHEN** "End-Game State" is loaded
- **THEN** both teams have met the "3-Run Lock" condition (3 pure/valid runs)
- **AND** the runs are complete sequences from Ace to 3, containing mixed static and flying wildcards
- **AND** teammates (Players 2 & 3) have additional smaller runs containing static wildcards
- **AND** all players have between 3 to 6 cards remaining in their hands.

### Requirement: Deck Consistency
All loaded scenarios MUST maintain deck integrity.

#### Scenario: Conservation of Cards
- **WHEN** any scenario is loaded
- **THEN** the total count of cards (Hands + Draw Pile + Discard Pile + Board Runs) MUST equal the total deck size (162 cards).
- **AND** no duplicate card IDs shall exist.

