## ADDED Requirements
### Requirement: Card Readability on Mobile
The system SHALL ensure card information (rank and suit) is clearly legible on mobile devices.

#### Scenario: Mobile Font Sizes
- **WHEN** the application is viewed on a mobile device
- **THEN** the card rank font size MUST be at least 14px (equivalent to `text-sm` or larger)
- **AND** the suit symbol in the center MUST be clearly distinguishable.

#### Scenario: Overlap Preservation
- **WHEN** card dimensions are increased for readability
- **THEN** the negative margins in overlapping UI (Hand, Run Display) MUST be adjusted to preserve the same visual density and "stacking" appearance.
- **AND** the top corner of each card (the "Anchor") MUST remain fully visible for easy identification.
