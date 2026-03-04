## Why

The current game is local-only, which prevents true multiplayer, multi-device play and real-time synchronization. Moving the game logic to a server ensures a single source of truth, prevents cheating, and allows for persistent game sessions that survive client disconnections or server restarts.

## What Changes

- **Server-Authoritative State:** Move the canonical game state (deck, hands, turn, discard pile) from the client to a Node.js server.
- **Real-time Sync:** Implement Socket.io for bi-directional communication between the client and the server.
- **State Persistence:** Integrate Redis Cloud for session persistence, ensuring game state survives server reloads.
- **Client Refactoring:** Transform the Zustand store into a "Thin Client" that emits intents via sockets and updates based on server-broadcasted state.
- **Server Validation:** Implement a validation layer on the server to enforce "Dhappa Baaji" rules before updating the state.
- **BREAKING:** The client will no longer be able to play without a server connection. Local state mutations will be replaced by asynchronous socket events.

## Capabilities

### New Capabilities
- `networking-socket-io`: A communication layer for real-time game events and state updates.
- `server-state-management`: Server-side logic for managing multiple game rooms and their authoritative state.
- `redis-persistence`: Integration with Redis for durable game state storage.

### Modified Capabilities
- `gameplay`: All core gameplay actions (draw, play, discard) are now networked and validated on the server.
- `lobby-ui`: Must handle room creation, joining, and connection status in a networked environment.

## Impact

- **`store.ts`:** Complete refactor to remove local mutations and integrate with the Socket.io client.
- **`gameLogic.ts`:** Port or share these utilities with the Node.js server for authoritative validation.
- **Infrastructure:** Introduction of a Node.js server (Firebase App Hosting) and a Redis instance (GCP Marketplace).
- **`types.ts`:** Updates to include network-related types (Socket events, payloads).
