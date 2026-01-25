## ADDED Requirements
### Requirement: Draw Card Confirmation and Reveal
The system SHALL require confirmation before drawing a card and visually emphasize the drawn card.

#### Scenario: Requesting a Draw
- **WHEN** the user clicks the Draw Pile
- **THEN** a confirmation dialog appears ("Draw from Deck?")
- **AND** no card is revealed yet.

#### Scenario: Confirming the Draw
- **WHEN** the user confirms the draw dialog
- **THEN** the top card is revealed in a central overlay
- **AND** the card is fully visible (no clipping)
- **AND** the card remains visible for a short duration (e.g., 2 seconds).

#### Scenario: Visual Transfer to Hand
- **WHEN** the reveal duration ends
- **THEN** the card animates from the overlay position to the user's hand
- **AND** the overlay closes
- **AND** the game advances to the Action Phase (Play/Discard).
