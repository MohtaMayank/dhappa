## ADDED Requirements
### Requirement: Debug Menu
The system SHALL provide a Debug Menu accessible to developers to manipulate the game state.

#### Scenario: Accessing Debug Menu
- **WHEN** the user presses the debug shortcut (e.g., `Ctrl+Shift+D`) or clicks the debug icon
- **THEN** the Debug Menu overlay appears
- **AND** it lists available Test Scenarios
- **AND** it provides a toggle for "God Mode".

### Requirement: God Mode
The system SHALL allow a single user to control all players for testing purposes.

#### Scenario: Enabling God Mode
- **WHEN** "God Mode" is enabled
- **THEN** the local user is considered the "Active Player" regardless of whose turn it is
- **AND** the UI allows interaction (Draw, Play, Discard) for the current active player index.
