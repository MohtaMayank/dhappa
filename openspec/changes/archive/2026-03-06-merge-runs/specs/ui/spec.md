## ADDED Requirements

### Requirement: Merge Runs Workflow
The system SHALL provide a dedicated workflow for merging two existing runs.

#### Scenario: Initiating Merge Runs
- **WHEN** the player clicks "Merge Runs" in their Player Board header
- **THEN** the system enters "Merge Selection Mode"
- **AND** a prompt "Select first run to merge..." is displayed.

#### Scenario: Selection of First Run
- **WHEN** in "Merge Selection Mode" and the player selects the first run
- **THEN** that run is highlighted as the "Anchor"
- **AND** the prompt updates to "Select second run to merge...".

#### Scenario: Selection of Second Run
- **WHEN** the player selects a second run that is validly mergeable with the Anchor
- **THEN** the system executes the merge
- **AND** exits "Merge Selection Mode".

#### Scenario: Canceling Merge Mode
- **WHEN** in "Merge Selection Mode"
- **AND** the player clicks "Cancel" or clicks the "Merge Runs" button again
- **THEN** the system exits "Merge Selection Mode" without changes.

### Requirement: Merge Run Selection Visuals
The system SHALL clearly indicate which runs can be merged with the currently selected "Anchor" run.

#### Scenario: Highlighting Mergeable Targets
- **GIVEN** a first run (Anchor) is selected in "Merge Selection Mode"
- **WHEN** identifying potential second runs
- **THEN** runs that can validly merge with the Anchor are highlighted
- **AND** all other runs (invalid targets) are visually diminished (e.g., dimmed or grayscale).
