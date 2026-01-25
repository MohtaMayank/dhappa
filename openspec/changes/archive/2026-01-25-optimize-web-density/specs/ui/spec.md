## MODIFIED Requirements

### Requirement: Responsive Player Board
The system SHALL adapt the player board layout based on available screen real estate.

#### Scenario: Wide Screen Layout (Updated)
- **WHEN** the viewport width exceeds the tablet breakpoint (e.g., > 768px)
- **THEN** player sections are arranged to utilize horizontal space
- **AND** runs are displayed in a flattened, efficient grid (not grouped by suit) to minimize vertical scrolling.

### Requirement: Expanded Run Visibility
The system SHALL maximize the visibility of cards in runs.

#### Scenario: Full Run Display (Tablet+)
- **WHEN** the viewport is tablet or larger (`md+`)
- **THEN** runs are displayed without compression (all cards visible)
- **AND** cards are strictly ordered High-to-Low (Left-to-Right).
