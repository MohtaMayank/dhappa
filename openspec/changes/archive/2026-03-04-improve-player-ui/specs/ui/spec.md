# Spec: UI Improvements - Player Status and Turn Indicator

## 1. Seat Status and Player Names
- If `player.name` is generic (e.g. `Player X`) or empty, the UI should show:
    - `Avatar`: A generic user icon instead of the first letter.
    - `Label`: `Waiting for player...` or `Seat [index] (Empty)`.
- If a player has joined, the `player.name` should be displayed prominently.

## 2. Enhanced Turn Indicator
- **PlayerAvatar**:
    - The ring around the active player should be thicker and use a gradient (e.g., `from-yellow-400 to-amber-500`).
    - Add a pulsating "ACTIVE" or "TURN" badge above the avatar's head.
    - Scale up the active player's avatar slightly more.

- **PlayerBoard**:
    - The header of the active player's section in the sidebars should be highlighted with a more intense border color and a "TURN" label.
    - Add a subtle background glow to the entire active player's section.

- **Central Turn Notification**:
    - In the `TableCenter` or directly in the middle of the game area, display a high-contrast message: `Current Turn: [Player Name]`.
    - This message should be part of a larger HUD element that's always visible.

- **Header Updates**:
    - The header can also show `NEXT: [Player Name]` to give more visibility into the upcoming turn.

## 3. Implementation Details
- `PlayerAvatar`: Update `isCurrentTurn` styles to use a more prominent CSS animation (e.g., a "glow" pulse).
- `PlayerBoard`: Pass `activePlayerIndex` and check if `index === activePlayerIndex`.
- `App.tsx`: Centralize the "Current Turn" notification in the middle of the screen (perhaps above the `TableCenter`).
