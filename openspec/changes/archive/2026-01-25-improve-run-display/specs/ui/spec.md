## ADDED Requirements

### Requirement: In-Place Wildcard Display
The system SHALL display wildcards within a run at the position corresponding to the rank they represent.

#### Scenario: Wildcard Positioning
- **WHEN** a run is rendered
- **THEN** every wildcard appears in the visual sequence at the index matching its rank order (e.g., between King and Jack if representing Queen).

### Requirement: Smart Run Stacking
The system SHALL collapse sequences of natural cards to conserve space, using wildcards and run boundaries as visibility anchors.

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