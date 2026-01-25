# ui Specification

## Purpose
TBD - created by archiving change improve-hand-ui. Update Purpose after archive.
## Requirements
### Requirement: Card Selection Visibility
The system SHALL ensure selected cards are visually distinct and do not obscure neighboring cards in the hand.

#### Scenario: Selection in Overlap
- **WHEN** a card is selected
- **THEN** it translates vertically (pops up)
- **AND** it maintains its original stacking order relative to its neighbors
- **AND** neighboring cards remain fully accessible for selection.

### Requirement: Debug Menu
The system SHALL provide a Debug Menu accessible to developers to manipulate the game state.

#### Scenario: Accessing Debug Menu
- **WHEN** the user navigates to "Debug" within the Game Menu
- **THEN** the Debug Menu controls appear (Scenarios, God Mode).

### Requirement: Game Menu
The system SHALL provide a unified Game Menu accessible via a persistent UI element on all devices.

#### Scenario: Opening Game Menu
- **WHEN** the user taps/clicks the "Menu" button (e.g., hamburger icon or gear)
- **THEN** an overlay appears listing options: "New Game", "Share", and "Debug"
- **AND** the game interaction behind the menu is paused/blocked.

### Requirement: God Mode
The system SHALL allow a single user to control all players for testing purposes.

#### Scenario: Enabling God Mode
- **WHEN** "God Mode" is enabled
- **THEN** the local user is considered the "Active Player" regardless of whose turn it is
- **AND** the UI allows interaction (Draw, Play, Discard) for the current active player index.

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

