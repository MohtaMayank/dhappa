## ADDED Requirements

### Requirement: Responsive Canvas & Layout
The system SHALL adapt the root game container and view management based on available screen real estate.

#### Scenario: Large Screen Simultaneous View
- **WHEN** the viewport width exceeds the large breakpoint (e.g., > 1024px)
- **THEN** the application container expands beyond mobile width
- **AND** the Player Board (Team/Opponent runs) is displayed simultaneously with the Table Center and Hand, without requiring modal toggles.

#### Scenario: Mobile/Compact Constrained View
- **WHEN** the viewport is mobile (portrait or landscape) or small tablet width
- **THEN** the application restricts itself to a central column (max-width)
- **AND** Player Boards remain accessed via toggle/modal views to preserve focus.

### Requirement: Expanded Run Visibility
The system SHALL maximize the visibility of cards in runs ONLY on screens with sufficient space.

#### Scenario: Full Run Display (Large Screens)
- **WHEN** the viewport is large (`lg+`)
- **THEN** runs are displayed without compression (all cards visible)
- **AND** cards are rendered at a larger size.

#### Scenario: Compressed Run Display (Mobile)
- **WHEN** the viewport is mobile/compact
- **THEN** runs retain the compressed (dotted) view to fit within the viewport.

### Requirement: Cross-Device Consistency
The system SHALL maintain consistent positioning for primary game interactions across all layouts.

#### Scenario: Action Anchoring
- **WHEN** the layout changes between mobile and desktop sizes
- **THEN** the Draw Pile, Discard Pile, and Player Hand remain centrally anchored relative to the bottom of the active game area.
