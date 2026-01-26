## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Wildcard Representation Display
The system SHALL clearly display what rank and suit a wildcard represents when it is part of a run.

#### Scenario: Represented Rank and Suit
- **WHEN** a wildcard is rendered in a run
- **THEN** it MUST display its represented rank and suit (e.g., a "Jo" representing "5 of Hearts" should show "5H" indicators).
- **AND** the `represents` field in `CardDef` MUST be populated by the store logic.