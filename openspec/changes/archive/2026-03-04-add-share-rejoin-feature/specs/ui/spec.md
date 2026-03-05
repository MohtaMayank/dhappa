# Spec: UI - Share & Rejoin

## Lobby UI (`Lobby.tsx`)

### 1. Room Seat Status
- Instead of a generic "Join" button, show a list of **Seats** (1-4).
- For each seat:
    - **Status: Empty**: Shows "Join" button + Name & Passcode fields.
    - **Status: Occupied**: Shows "Player Name (Occupied)" + "Rejoin" button.
- If the current user has a token for a seat, it should be auto-selected.

### 2. Passcode Input
- A 4-digit numeric input.
- Masks characters like a password.
- Shown when joining a new seat or rejoining an occupied one.

### 3. Share URL
- Display the Room URL prominently.
- "Copy Link" button to copy `/room/{roomId}`.

## App Level Logic (`App.tsx`)

### 1. Room Header
- Add a "Copy Share Link" icon next to the Room ID in the header.

### 2. Auto-Rejoin Prompt
- If a valid token exists for the room, show a brief "Rejoining as [Name]..." overlay before entering the game.
