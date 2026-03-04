## ADDED Requirements

### Requirement: Real-time Event Emission
The system SHALL support bi-directional communication between the client and server using Socket.io.

#### Scenario: Client sends action
- **WHEN** a player performs a gameplay action (e.g., Draw)
- **THEN** the client emits a `GAME_ACTION` event to the server with the action type and payload.

#### Scenario: Server broadcasts state
- **WHEN** the server updates the authoritative game state
- **THEN** it emits a `STATE_UPDATE` event to all connected clients in the room.

### Requirement: Connection Resilience
The system SHALL handle client disconnections and reconnections gracefully.

#### Scenario: Reconnection sync
- **WHEN** a client reconnects after a signal drop
- **THEN** it automatically sends a `JOIN_ROOM` event with its previous Room ID
- **AND** the server responds with the latest `STATE_UPDATE` from persistence.
