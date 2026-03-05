# Proposal: Share & Rejoin Feature

## Context
Currently, players can only join a game by manually entering a Room ID. If a player refreshes their browser or loses connection, they may lose their seat if their socket ID changes, as room assignments are currently in-memory and tied to socket IDs. 

## Goals
- Allow players to join a room via a unique URL: `/room/{roomId}`.
- Enable seamless rejoining if a player refreshes or closes their browser.
- Ensure that once a seat is taken, it can only be reclaimed by the same player (using a persistent token).

## Proposed Solution

### 1. URL Routing
- The client will support `/room/{roomId}` in the URL.
- On landing, the app will parse the `roomId` from the path.

### 2. Player Authentication (Passcodes & Tokens)
- **Unified Auth**: Both the **Creator** and **Joiners** must provide a `playerName` and a **4-6 digit passcode** before entering a room.
- **Creation Flow**: When a user clicks "Create", they submit their Name + Passcode. The server generates a Room ID and assigns that user to the first seat (index 0) with their credentials.
- **Joining Flow**: When a user clicks "Join", they submit Name + Passcode + Room ID.
- **Internal Token**: The server generates a unique `playerToken` for that session.
- **Persistence**: Both the `passcode` and `playerToken` are stored in Redis on the server (mapped to the player's seat index).
- **Client Storage**: The client stores `{ roomId, playerToken, playerName }` in `localStorage`.

### 3. Join/Rejoin Logic
- **Auto-Rejoin (Same Browser)**: If the client has a `playerToken` for the `roomId`, it sends it to the server. The server grants access if the token matches a seat.
- **Manual Rejoin (Cross-Browser)**: If a player opens the room on a new device, they can select their previous seat/name and enter their `passcode`. The server validates the passcode and grants a new `playerToken` to that device.
- **Collision Prevention**: A player cannot join an empty seat with a name that is already taken in that room.

### 4. UI Enhancements
- **Lobby**: 
  - Pre-fill `Room ID` from URL.
  - Display current players/seats.
  - Allow joining empty seats (set Name + Passcode).
  - Allow rejoining occupied seats (requires Passcode).
- **Share**: Add a button to copy the room URL (`/room/{roomId}`) to the clipboard.

## Technical Details

### Server Changes (`server/index.ts`)
- Update `GameState` or a separate Redis key to store `playerTokens: Record<number, string>`.
- Modify `join_room` to accept `playerName` and `playerToken`.
- If `playerToken` matches an existing seat, reconnect. Otherwise, assign a new seat and generate a token.

### Client Changes (`store.ts`, `App.tsx`, `Lobby.tsx`)
- `store.ts`: Add `playerToken` to the store and handle `localStorage` persistence.
- `App.tsx`: Add logic to parse `roomId` from the URL and attempt auto-join.
- `Lobby.tsx`: Support pre-filling `roomId`.

## Success Criteria
- Sharing the URL allows another player to land directly on the Lobby with the correct Room ID.
- Refreshing the page during a game keeps the player in the same seat without re-entering their name.
- Opening the link on a different browser (without the token) requires joining as a new player.
