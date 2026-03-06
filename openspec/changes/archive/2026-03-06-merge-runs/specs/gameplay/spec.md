## ADDED Requirements

### Requirement: Merge Runs Action
The system SHALL allow players to merge two existing runs into one during their turn.

#### Scenario: Merging own runs
- **WHEN** a player has two validly mergeable runs in their own area
- **AND** they use the Merge Runs action
- **THEN** the two runs are combined into one on the table.

#### Scenario: Attempting to merge team runs
- **WHEN** a player tries to merge one of their runs with a teammate's run
- **THEN** the system SHALL reject the merge as invalid.

#### Scenario: Merging during opponents' turn
- **WHEN** it is NOT the player's turn
- **THEN** the Merge Runs action is disabled or SHALL be rejected by the system.
