## Context

The current Dhappa game is a standalone React application using Zustand for state management. All game logic (deck creation, turn management, validation) is client-side. To enable multiplayer and multi-device play, we must migrate to a server-authoritative model where a Node.js server maintains the "Source of Truth" and synchronizes state via WebSockets (Socket.io), with Redis for persistence.

## Goals / Non-Goals

**Goals:**
- **Centralized Source of Truth:** Move game-critical state (deck, hands, turns) to a Node.js server.
- **Real-time Sync:** Use Socket.io to propagate state changes across all devices in a room.
- **Durable State:** Use Redis to ensure game sessions persist through server restarts.
- **Thin Client Architecture:** Refactor the frontend to act as a visual mirror of the server state.
- **Rule Enforcement:** Implement a server-side validation layer for all gameplay actions.

**Non-Goals:**
- **Local-Only Play:** The game will require a server connection for all modes.
- **Complex Auth:** Use Room IDs and temporary player names rather than a full user account system.

## Decisions

### 1. State Extraction & Authority
We will split the current `GameState` into two categories:
- **Server-Authoritative:** `players` (including redacted `hands`, `runs`, `hasOpened`), `currentPlayerIndex`, `drawPile` (count only on client), `discardPile`, `phase`, and `mustPlayCard`.
- **Client-Local (UI):** `selectedInHand`, `isNPickActive`, `godMode`, `isConfirmingDraw`, and local animations/transitions.

### 2. Service Interface (Socket.io Events)
**Client -> Server (Intents):**
- `JOIN_ROOM(roomId, playerName)`
- `GAME_ACTION(type, payload)`:
  - `DRAW_FROM_DECK`
  - `PICK_FROM_DISCARD(n)`
  - `DISCARD_CARD(cardId)`
  - `CREATE_RUN(cards, options)`
  - `ADD_TO_RUN(runId, cards, options)`

**Server -> Client (Broadcasts):**
- `STATE_UPDATE(fullGameState)`: Broadcasted to all players in the room after any valid action.
- `PLAYER_JOINED/LEFT`: Room-level events.
- `ERROR(message)`: Feedback for invalid moves.

### 3. Server-Side Validation Layer
The server will ingest `gameLogic.ts` (shared logic) to validate every `GAME_ACTION`.
- **Example:** For a `DISCARD_CARD` action, the server validates:
  1. Is it the player's turn?
  2. Is the player in the `play` phase?
  3. Does the player own that card?
  4. If `mustPlayCard` is set (N-Pick), has it been fulfilled?
Only after successful validation is the state updated in Redis and broadcasted.

### 4. Zustand Refactoring (The "Thin Client")
The Zustand store will be modified to:
- **`actions`** no longer mutate state. They call `socket.emit('GAME_ACTION', ...)`.
- **`listeners`** listen for `STATE_UPDATE` and call `set(serverState)` to replace the local state.
- **Optimistic UI:** Optional (not required for initial MVP) but can be added to reduce perceived latency for simple actions.

### 5. Persistence with Redis
- **Schema:** Store room state as a JSON string in Redis keyed by `room:<roomId>`.
- **TTL:** Rooms will have a Time-to-Live (e.g., 24 hours) to clear inactive sessions.
- **Rehydration:** On `JOIN_ROOM`, the server fetches the state from Redis. If it exists, it sends it to the client; otherwise, it initializes a new game.

## Risks / Trade-offs

- **[Risk] Latency:** Network delays may affect the feel of drawing or discarding.
  - **[Mitigation]** Use Socket.io's low-latency capabilities and prioritize state updates.
- **[Risk] State Desync:** If a client misses an event, they could be out of sync.
  - **[Mitigation]** Always broadcast the **Full State** on every mutation. Since the state is small (< 50KB), this is efficient and robust.
- **[Risk] Server Load:** Firebase App Hosting scaling.
  - **[Mitigation]** Leverage Redis for stateless horizontal scaling of the Node.js server.

## Migration Plan

1. **Setup Infrastructure:** Initialize Node.js server on Firebase App Hosting and connect Redis Cloud.
2. **Logic Extraction:** Create a shared package or directory for `gameLogic.ts` and `types.ts` that both client and server can import.
3. **Socket Implementation:** Implement the basic `JOIN_ROOM` and `STATE_UPDATE` loop.
4. **Action Migration (Phased):** Move actions one by one (Draw -> Discard -> Play) from client to server.
5. **Persistence Layer:** Integrate Redis into the server's update cycle.
6. **UI Refactoring:** Update React components to handle "Waiting for Server" states.
