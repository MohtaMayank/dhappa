## ADDED Requirements
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
