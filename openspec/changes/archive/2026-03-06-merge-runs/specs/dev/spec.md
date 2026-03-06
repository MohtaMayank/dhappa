## ADDED Requirements

### Requirement: Merge Choice Test Scenario
The system SHALL provide a pre-configured game state to test complex merge scenarios.

#### Scenario: Multiple Mergeable Pairs
- **GIVEN** a player has three sequences: [4, 5, 6], [7, 8, 9], and [10, J, Q] (all same suit)
- **WHEN** the player enters "Merge Selection Mode" and selects the [7, 8, 9] run
- **THEN** both the [4, 5, 6] and [10, J, Q] runs MUST be highlighted as valid targets.

#### Scenario: Merge with Wildcard Bridge
- **GIVEN** a player has [4, 5, 6] and [8, 9, 10] and a floating Joker in their hand
- **WHEN** the player adds the Joker to the first run to make it [4, 5, 6, Jo(7)]
- **THEN** the system SHALL allow merging it with the [8, 9, 10] run.
