## MODIFIED Requirements
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
