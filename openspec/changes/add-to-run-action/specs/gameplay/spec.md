## ADDED Requirements
### Requirement: Add Cards to Existing Runs
Players SHALL be able to add one or more cards from their hand to their team's existing runs during their turn.

#### Scenario: Extending a run
- **WHEN** a player selects card(s) that legally extend a run
- **AND** targets that run
- **THEN** the cards are removed from the hand and appended/prepended to the run.

#### Scenario: Invalid extension
- **WHEN** a player attempts to add card(s) that break the run's sequence or suit
- **THEN** the action is prevented.

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
