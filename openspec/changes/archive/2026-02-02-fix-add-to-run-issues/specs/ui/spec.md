## ADDED Requirements
### Requirement: Player Board Rendering
The system SHALL render each player's runs clearly and without duplication.

#### Scenario: No Duplicate Runs
- **WHEN** a player has multiple runs
- **THEN** each run appears exactly once on the board.
- **AND** runs containing wildcards are not duplicated across different suit groups.

### Requirement: Add to Run Availability
The system SHALL indicate when "Add to Run" is available based on game rules.

#### Scenario: Disabled before Opening
- **WHEN** the player has not yet Opened
- **THEN** the "Add to Run" button is disabled/greyed out.