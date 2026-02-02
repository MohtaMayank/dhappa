## ADDED Requirements
### Requirement: Run Data Integrity
Generated runs in test scenarios SHALL conform to the game engine's internal data structures.

#### Scenario: Sequence Ordering
- **WHEN** a Sequence run is generated in a scenario
- **THEN** its cards MUST be ordered by rank in Ascending order (e.g., 3, 4, 5... to Ace).
