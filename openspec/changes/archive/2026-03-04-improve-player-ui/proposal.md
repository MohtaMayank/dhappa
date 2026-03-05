# Proposal: Improving Player UI and Turn Clarity

## Context
Current player names for empty seats are generic ("Player 1", "Player 2", etc.), and the current turn indicator (a ring around the avatar) could be more prominent to ensure all users immediately know whose turn it is.

## Goals
- Replace generic "Player X" names with "Waiting..." for empty seats.
- Make the current turn indicator highly visible and dynamic.
- Ensure the name of the current player is clearly displayed to all users.

## Proposed Solution

### 1. Handling Empty Seats
- The server initializes `GameState` with `name: ""` (or another marker) instead of "Player X".
- The UI displays "Waiting for Player..." or just a placeholder if the name is empty.

### 2. Enhanced Turn Indicators
- **PlayerAvatar**: Add a pulsating "ACTIVE" or "TURN" badge to the current player's avatar.
- **PlayerBoard**: Add a subtle background glow or a "TURN" label to the header of the current player's section in the sidebars.
- **TableCenter**: Display a prominent "Turn: [Name]" message in the center game area.

### 3. Turn Announcements
- When the turn changes, show a brief, non-intrusive notification (e.g., a "It's [Name]'s Turn" banner).

## Technical Details

### UI Components
- `PlayerAvatar`: Update to include a `isCurrentTurn` indicator that is more visually distinct (e.g., a pulsating border or an icon).
- `PlayerBoard`: Add `isCurrentTurn` prop to highlight the active player's section.
- `App.tsx`: Centralize the turn display.

### Server Changes
- Update `initGameState` in `server/index.ts` to use empty names or a dedicated `isOccupied` flag in the `Player` object.

## Success Criteria
- Empty seats are clearly distinguished from joined players.
- Users can instantly identify the current player without searching.
- Real names are always used once a player has joined.
