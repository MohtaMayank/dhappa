## 1. Infrastructure & Shared Logic Setup

- [x] 1.1 Create a new `server/` directory for the Node.js backend.
- [x] 1.2 Initialize the server with `express`, `socket.io`, and `redis`.
- [x] 1.3 Move `gameLogic.ts` and `types.ts` to a shared location (e.g., `shared/`) so both client and server can import them.
- [x] 1.4 Configure Firebase App Hosting for the `server/` deployment.
- [x] 1.5 Setup Redis Cloud via GCP Marketplace and obtain credentials.

## 2. Server Implementation (Authoritative Logic)

- [x] 2.1 Implement the `Socket.io` server-side connection and room logic.
- [x] 2.2 Implement the `JOIN_ROOM` event to handle room creation and joining.
- [x] 2.3 Create a central `processGameAction` handler that validates moves using `gameLogic.ts`.
- [x] 2.4 Implement basic action handlers on the server: `DRAW_FROM_DECK`, `DISCARD_CARD`.
- [x] 2.5 Implement advanced action handlers: `CREATE_RUN`, `ADD_TO_RUN`.
- [x] 2.6 Implement state redaction logic (removing other players' hand content) before broadcast.

## 3. Persistence Layer (Redis Integration)

- [x] 3.1 Implement a Redis repository to save and load `GameState` by Room ID.
- [x] 3.2 Add a persistence step to every valid server-side state mutation.
- [x] 3.3 Implement the state rehydration flow for when a room is fetched from Redis.
- [x] 3.4 Set appropriate TTL (Time-To-Live) for Redis keys to clean up old rooms.

## 4. Client Refactoring (Zustand Thin Client)

- [x] 4.1 Install `socket.io-client`.
- [x] 4.2 Initialize the socket connection in the Zustand store (`store.ts`).
- [x] 4.3 Replace local mutations in `store.ts` actions with `socket.emit('GAME_ACTION', ...)` calls.
- [x] 4.4 Add a `STATE_UPDATE` listener to the store that calls `set(serverState)` to replace the entire local state.
- [x] 4.5 Update the Lobby UI to use the new `JOIN_ROOM` flow with unique Room IDs.

## 5. UI Enhancements & Latency Handling

- [x] 5.1 Add "Connecting..." and "Waiting for Server..." UI states.
- [x] 5.2 Handle socket errors and display feedback to the user (e.g., "Invalid Move").
- [x] 5.3 Implement an auto-reconnect strategy on the client.

## 6. Testing & Validation

- [x] 6.1 Verify that multiple clients in the same room see synchronized state.
- [x] 6.2 Verify that the server rejects invalid actions (e.g., drawing twice).
- [x] 6.3 Verify that game state persists after a server restart (manual Redis check).
- [x] 6.4 Verify that each client only sees their own hand in the broadcasted state.
