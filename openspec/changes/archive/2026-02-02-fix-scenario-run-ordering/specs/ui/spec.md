## ADDED Requirements
### Requirement: Run Display Order
The system SHALL display Sequence runs in Descending Rank order (High to Low), regardless of internal storage order.

#### Scenario: Visual Ordering
- **GIVEN** a run stored internally as `3H, 4H, 5H` (Ascending)
- **WHEN** it is rendered on the board
- **THEN** it appears as `5H, 4H, 3H` (Descending).
