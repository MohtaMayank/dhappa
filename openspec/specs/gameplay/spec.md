# gameplay Specification

## Purpose
TBD - created by archiving change add-to-run-action. Update Purpose after archive.
## Requirements
### Requirement: Add Cards to Existing Runs
Players SHALL be able to add one or more cards from their hand to their team's existing runs during their turn, provided they have "Opened".

#### Scenario: Extending a run with multiple cards
- **WHEN** a player selects multiple cards that legally extend a run (e.g., `4H, 5H` to a `6H, 7H` run)
- **AND** the player has Opened
- **THEN** the cards are removed from the hand and appended/prepended to the run.

#### Scenario: Restriction before Opening
- **WHEN** a player has NOT "Opened" (played their first Pure Run/Set)
- **THEN** they CANNOT add cards to any existing runs (their own or teammates).
- **AND** the "Add to Run" action is disabled or blocked.

#### Scenario: Teammate Interaction
- **WHEN** a player has Opened
- **THEN** they can add cards to ANY run belonging to their team (their own or their teammate's).

### Requirement: Flying Wildcard Replacement
Players SHALL be able to replace a Flying Wild (Joker) in a run with the natural card it represents.

#### Scenario: Swapping a Joker
- **WHEN** a run contains a Joker representing a specific rank/suit
- **AND** the player plays the natural card for that rank/suit
- **THEN** the natural card takes the Joker's place
- **AND** the Joker is returned to the player's hand.

### Requirement: Static Wildcard Displacement
Players SHALL be able to displace a Static Wild ('2') in a run with the natural card it represents, pushing the '2' to an adjacent position.

#### Scenario: Displacing a 2
- **WHEN** a run contains a '2' representing a specific rank/suit
- **AND** the player plays the natural card
- **THEN** the natural card takes the '2's place
- **AND** the '2' moves to the start or end of the run to represent the next valid rank.

#### Scenario: Displacing a 2 with Ambiguity
- **WHEN** the displaced '2' can validly move to EITHER the start OR the end of the run
- **THEN** the player MUST choose which direction the '2' moves.

### Requirement: N-Pick Validation
The system SHALL validate that the bottom-most card of a selected discard pile stack can be legally played before allowing the pick.

#### Scenario: Valid N-Pick (Existing Run)
- **GIVEN** a selected stack from the discard pile
- **AND** the bottom-most card of that stack can be legally added to an existing run belonging to the player's team
- **THEN** the pick is permitted.

#### Scenario: Valid N-Pick (New Run)
- **GIVEN** a selected stack from the discard pile
- **AND** the bottom-most card can form a new valid run (e.g., completes a Pure Run/Set if opening is required)
- **THEN** the pick is permitted.

#### Scenario: Invalid N-Pick
- **GIVEN** a selected stack where the bottom-most card CANNOT be played on any existing run AND CANNOT form a new valid run
- **THEN** the pick is forbidden.

