## ADDED Requirements
### Requirement: Discard Pile Selection
The system SHALL allow players to select a stack of cards from the top of the discard pile with clear visual feedback.

#### Scenario: Selecting a stack
- **WHEN** a player clicks a card in the discard pile dialog
- **THEN** that card and all cards above it are marked as "selected"
- **AND** the selected cards visually "pop up" (translate vertically) to indicate selection, similar to the hand UI.

### Requirement: Discard Pile Pick Action
The system SHALL provide a clear action to pick up the selected cards from the discard pile.

#### Scenario: Pick Button
- **WHEN** valid cards are selected in the discard pile
- **THEN** a "Pick" button is displayed/enabled.

#### Scenario: Invalid Pick Disabling
- **WHEN** the selection is invalid (according to gameplay rules)
- **THEN** the "Pick" button is disabled or shows an error when clicked.
