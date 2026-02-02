## ADDED Requirements
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
