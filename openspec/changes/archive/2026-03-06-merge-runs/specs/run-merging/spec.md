## ADDED Requirements

### Requirement: Merge Sequence Runs
The system SHALL allow merging two sequence runs into one if they are of the same suit and their ranks are adjacent or connected by wildcards.

#### Scenario: Valid Sequence Merge (Natural)
- **WHEN** a player has two sequences of Hearts: [4, 5, 6] and [7, 8, 9]
- **THEN** merging them results in a single Hearts sequence: [4, 5, 6, 7, 8, 9]

#### Scenario: Valid Sequence Merge (with Wildcards)
- **WHEN** a player has Hearts sequences: [4, 5, 6] and [8, 9, 10] and has a Joker available to bridge the gap (7)
- **THEN** merging them (including the Joker) results in [4, 5, 6, Joker(7), 8, 9, 10]

#### Scenario: Invalid Suit Merge
- **WHEN** a player tries to merge a Hearts sequence and a Spades sequence
- **THEN** the system SHALL reject the merge as invalid

#### Scenario: Invalid Rank Merge
- **WHEN** a player tries to merge [4, 5, 6] and [10, J, Q] without a way to fill the gap
- **THEN** the system SHALL reject the merge as invalid
