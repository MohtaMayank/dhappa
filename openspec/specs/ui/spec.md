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

### Requirement: Add to Run Workflow
The system SHALL provide a dedicated workflow for adding cards to runs.

#### Scenario: Initiating Add to Run
- **WHEN** the player selects card(s) and clicks "Add to Run"
- **THEN** the system enters "Target Selection Mode"
- **AND** the player's team board becomes visible/focused.

#### Scenario: No valid targets
- **WHEN** "Add to Run" is clicked but no existing runs can accept the selected cards
- **THEN** the player's team board becomes visible / focues and a message "No valid runs found" is displayed.
- **AND** the mode is not entered.

### Requirement: Run Selection and Prominence
The system SHALL clearly indicate which runs are valid targets for the selected cards.

#### Scenario: Highlighting targets
- **WHEN** in "Target Selection Mode"
- **THEN** runs that can validly accept the selected cards are highlighted (e.g., brighter, pulsing, or specific border)
- **AND** invalid runs are visually diminished (e.g., dimmed or grayscale).

### Requirement: Wildcard Choice UI
The system SHALL present a choice when a Static Wildcard move is ambiguous.

#### Scenario: Choosing 2 direction
- **WHEN** a Static Wildcard replacement requires a directional choice
- **THEN** a modal or overlay appears asking "Move '2' to Start or End?"
- **AND** the action completes only after selection.

### Requirement: Run Inspection
Players SHALL be able to inspect the details of any run on the table.

#### Scenario: Opening Inspector
- **WHEN** the user taps on a run
- **AND** the user has no cards selected in their hand
- **THEN** the system displays the Run Inspector overlay showing all cards in that run.

#### Scenario: Visualizing Active Wildcards
- **WHEN** the inspected run contains wildcards that are part of the valid sequence or set
- **THEN** the overlay displays the wildcard with an indicator of the Rank and Suit it represents.

#### Scenario: Visualizing Excess Cards
- **WHEN** the inspected run contains cards that do not fit into the valid sequence or set (e.g., extra wildcards at the end)
- **THEN** these cards are displayed visually separated from the active run cards
- **AND** are labeled as "Unused" or similar.

### Requirement: In-Place Wildcard Display
The system SHALL display wildcards within a run at the position corresponding to the rank they represent within the run sequence, preserving the logical order determined by the game engine.

#### Scenario: Wildcard Positioning
- **WHEN** a run is rendered
- **THEN** every wildcard appears in the visual sequence at the index matching its rank order (e.g., between King and Jack if representing Queen).

#### Scenario: Logical Ordering Preservation
- **GIVEN** a run in the store with logical order: `3H, 4H, Jo(5H), 6H`
- **WHEN** the run is rendered on the `PlayerBoard`
- **THEN** the cards MUST appear in that exact order (`3H`, then `4H`, then `Jo`, then `6H`)
- **AND** NO secondary sorting by raw rank should be applied.

### Requirement: Smart Run Stacking
The system SHALL collapse sequences of natural cards to conserve space, using wildcards and run boundaries as visibility anchors. Anchors MUST be fully visible and distinguishable.

#### Scenario: Defining Anchors
- **The following cards are defined as "Anchors" and MUST always be visible:**
    - The first card of the run.
    - The last card of the run.
    - Any wildcard.

#### Scenario: Collapsing Gaps
- **WHEN** there is a sequence of natural cards between two Anchors
- **AND** the sequence length is 2 or more cards
- **THEN** the entire sequence is replaced by a single "Stack" visual element.

#### Scenario: Preserving Small Gaps
- **WHEN** there is a sequence of natural cards between two Anchors
- **AND** the sequence length is exactly 1 card
- **THEN** the card remains visible and is NOT stacked.

#### Scenario: Example Rendering
- **GIVEN** a run: `AH, KH, 2W(QH), JH, 10H, 9H, 8H, JoW(7H), 6H, 5H, 4H`
- **AND** Anchors are: `AH` (First), `2W` (Wild), `JoW` (Wild), `4H` (Last)
- **THEN** the rendering is:
    - `AH` (Anchor)
    - `KH` (Gap of 1: Visible)
    - `2W` (Anchor)
    - `[Stack]` (Gap of 4: Collapsed `JH, 10H, 9H, 8H`)
    - `JoW` (Anchor)
    - `[Stack]` (Gap of 2: Collapsed `6H, 5H`)
    - `4H` (Anchor)

#### Scenario: Anchor Visibility
- **GIVEN** a collapsed run
- **THEN** all Anchors (First, Last, Wildcards) MUST NOT have the "stacked" washed-out overlay
- **AND** they MUST be rendered as primary visual elements.

### Requirement: Wildcard Representation Display
The system SHALL clearly display what rank and suit a wildcard represents when it is part of a run.

#### Scenario: Represented Rank and Suit
- **WHEN** a wildcard is rendered in a run
- **THEN** it MUST display its represented rank and suit (e.g., a "Jo" representing "5 of Hearts" should show "5H" indicators).
- **AND** the `represents` field in `CardDef` MUST be populated by the store logic.

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

