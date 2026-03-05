# Tasks: Share & Rejoin Feature

## 1. Networking & Persistence (Auth-focused)

- [ ] **Server: Store Auth Data in Redis**
  - Add `auth: Record<number, { name: string, passcode: string, token: string }>` to the room's persistent state.
  - Update `loadRoomState` and `saveRoomState` to handle this auth mapping.

- [ ] **Server: Update `join_room` Action**
  - Handle three cases in `join_room(roomId, name, passcode, token?)`:
    1. **Token Match**: If `token` matches `auth[i].token`, re-seat the player at index `i`.
    2. **Passcode Match**: If `token` is missing/invalid but `name` and `passcode` match `auth[i]`, grant access to seat `i` and issue a new `token`.
    3. **New Join**: If seat `i` is empty and `name` is unique, set `auth[i]` with the provided `name` and `passcode`, generate a `token`, and grant access.

- [ ] **Client: Persistence & Sync**
  - Store `{ roomId, playerToken, playerName }` in `localStorage`.
  - Update `initGame` in `store.ts` to include `passcode` and `token`.

## 2. UI & Routing

- [ ] **Client: Add Routing to `App.tsx`**
  - Parse `roomId` from `/room/{roomId}`.
  - Auto-trigger `initGame` if `localStorage` has a token for that room.

- [ ] **Client: Update Lobby UI**
  - Unified form with "Name" and "Passcode" fields.
  - "Create New Game" button: Submits Name + Passcode, generates Room ID.
  - "Join Game" section: Shows "Room ID" input and "Join" button.
  - Display current players/seats (if Room ID is entered/pre-filled).

- [ ] **Client: Add "Share Room" Button**
  - Copy `/room/{roomId}` to the clipboard.
  - Add to Lobby and Game Menu.

## 3. Verification & Testing

- [ ] **Manual Test: Share URL**
  - Start a game, copy the URL, and open it in a new tab/browser.
  - Verify that the Room ID is pre-filled.

- [ ] **Manual Test: Rejoin on Refresh**
  - Join a game, refresh the page.
  - Verify the player is back in their original seat.

- [ ] **Manual Test: Disconnect & Reconnect**
  - Temporarily kill the server or simulate a network disconnect.
  - Verify the player re-joins successfully when the connection is restored.
