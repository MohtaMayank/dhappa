## ADDED Requirements

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
