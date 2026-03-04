## ADDED Requirements

### Requirement: State Persistence
The system SHALL store the current state of each active game room in Redis.

#### Scenario: Persistent State Write
- **WHEN** the server successfully updates a room's state
- **THEN** the updated state is written to Redis keyed by `room:<roomId>`.

### Requirement: State Rehydration
The system SHALL attempt to restore the game state from Redis on room reconnection.

#### Scenario: Server Instance Reboot
- **WHEN** a server instance restarts and a client connects to Room ID
- **THEN** the server fetches the state from Redis and initializes the session.

### Requirement: Session Expiration
The system SHALL automatically expire game rooms after a specified duration of inactivity.

#### Scenario: Expired Room Cleanup
- **WHEN** a room has no activity for 24 hours
- **THEN** the Redis key is deleted.
