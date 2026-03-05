# Spec: Networking & Persistence - Share & Rejoin

## Server-Side Authentication Logic

### 1. `RoomAuth` Mapping
Each room in Redis will have an `auth` mapping:
```typescript
interface PlayerAuth {
  name: string;
  passcode: string; // 4-6 digit chosen by user
  token: string;    // Random UUID
}
type RoomAuth = Record<number, PlayerAuth>; // seatIndex -> PlayerAuth
```

### 2. `join_room` Parameters
```typescript
socket.on('join_room', async (roomId: string, name: string, passcode: string, token?: string) => { ... })
```

### 3. Join Validation Logic
1.  **Check Token**: If `token` is provided, find a seat where `auth[i].token === token`. If found, re-seat the player at index `i`.
2.  **Check Passcode**: If no token match, but a seat `i` has `auth[i].name === name` AND `auth[i].passcode === passcode`:
    *   Re-seat player at index `i`.
    *   Issue a **new token** and send it back to the client via `auth_success`.
3.  **New Join**: If seat `i` is empty and `name` is unique in the room:
    *   Set `auth[i] = { name, passcode, token: uuid() }`.
    *   Send `auth_success` with `token` and `index`.

## Client-Side Authentication Logic

### 1. Persistence
- Key: `dhappa_auth`
- Format: `Record<roomId, { token: string, name: string }>`

### 2. Initialization
- On mount, `App.tsx` reads `dhappa_auth`.
- If a token exists for the current `roomId`, it calls `initGame(name, roomId, null, token)`.
- If token is invalid/not found, it redirects to the `Lobby`.

### 3. Handlers
- `auth_success(token, index)`: Save token to `localStorage` and set local state.
- `auth_error(message)`: Clear invalid token from `localStorage` and show Lobby.
