## ADDED Requirements

### Requirement: Room Isolation
The system SHALL manage game states independently for each unique Room ID.

#### Scenario: Separate Room States
- **WHEN** actions occur in Room A
- **THEN** they MUST NOT affect the state of Room B.

### Requirement: Authoritative Validation
The server SHALL validate every `GAME_ACTION` against the "Dhappa Baaji" rules before applying the update.

#### Scenario: Invalid Move Rejection
- **WHEN** a player attempts a move (e.g., Draw) when it is not their turn
- **THEN** the server rejects the action
- **AND** sends an `ERROR` message back to the client.

### Requirement: State Redaction
The system SHALL redact sensitive information (e.g., other players' hands, draw pile cards) before broadcasting the `STATE_UPDATE`.

#### Scenario: Hand Privacy
- **WHEN** broadcasting the game state
- **THEN** each client only receives the card IDs for their own hand
- **AND** only the card count for other players' hands.
