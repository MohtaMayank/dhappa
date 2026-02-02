## ADDED Requirements
### Requirement: N-Pick Play Enforcement
The system SHALL enforce that the bottom-most card picked from the discard pile is played immediately.

#### Scenario: Locked Selection
- **GIVEN** a player has just performed an N-Pick
- **WHEN** the player attempts to deselect the bottom-most card of the picked stack
- **THEN** the system prevents the deselection
- **AND** optionally displays a message explaining the card must be played.

#### Scenario: Blocking Discard
- **GIVEN** a player has an active N-Pick constraint (card not yet played)
- **WHEN** the player attempts to Discard a card to end their turn
- **THEN** the system blocks the action.

#### Scenario: Clearing Constraint
- **GIVEN** a player has an active N-Pick constraint
- **WHEN** the player successfully adds the required card to a run (Create or Add)
- **THEN** the constraint is cleared
- **AND** the player may proceed with their turn normally (including Discarding).
