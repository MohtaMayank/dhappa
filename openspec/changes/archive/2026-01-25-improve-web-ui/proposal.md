# Change: Improve Web UI for Wider Screens

## Why
The current UI is strictly constrained to a mobile-width column (`max-w-md`) and uses modal views for player boards, which is inefficient on large screens. We want to utilize the available space on laptops/tablets to show more game state simultaneously (e.g., seeing the board and hand together) while strictly preserving the mobile "portrait" experience on smaller devices.

## What Changes
- **Root Layout**:
  - Remove the `max-w-md` restriction on `lg+` (1024px) screens, allowing the game canvas to expand.
  - Maintain the felt background and centered game table.
- **Simultaneous Views (Large Screens)**:
  - Instead of toggling between "Hand", "My Team", and "Opponents", the `lg+` layout will display the **Player Board** (Runs) alongside the **Table Center** and **Hand**.
  - "My Team" and "Opponents" sections will be visible simultaneously or easily scrollable without hiding the hand.
- **Run Display**:
  - **Large Screens**: Show runs uncompressed (all cards visible) next to player avatars.
  - **Mobile/Small**: Keep existing compressed (dotted) view.
- **Hand & Card Styling**:
  - Increase card size and reduce overlap (negative margins) on `lg+` screens for better legibility.
- **Action Consistency**:
  - Keep the "Action Bar" (buttons) and "Hand" anchored at the bottom, but potentially widen the bar or adjust button layout to fit the wider screen without stretching.

## Impact
- **Affected Specs**: `ui`
- **Affected Code**: `App.tsx`, `PlayerBoard.tsx`, `RunDisplay.tsx`, `Run.tsx`, `CardBase.tsx`, `Hand.tsx`, `TableCenter.tsx`.
