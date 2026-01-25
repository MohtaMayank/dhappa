## 1. Layout & Container
- [x] 1.1 Update `App.tsx` root container to switch from `max-w-md` to `w-full` (or `max-w-7xl`) on `lg` breakpoint.
- [x] 1.2 Refactor `App.tsx` main render loop to conditionally show `PlayerBoard` *alongside* `TableCenter` on `lg+` screens, removing the overlay behavior for desktop.
- [x] 1.3 Ensure `TableCenter` remains centered, with Player Boards positioning to the sides or top on large screens.

## 2. Card & Run Visuals
- [x] 2.1 Update `RunDisplay.tsx` to accept a `compressed` prop (default true), controlled by media query (false only on `lg+`).
- [x] 2.2 Update `RunDisplay.tsx`, `CardBase.tsx`, and `Hand.tsx` to use responsive classes for width/height and margins (less overlap on `lg`).
- [x] 2.3 Verify `Hand` scrolling/wrapping behaves correctly on wider screens.

## 3. Consistency & Controls
- [x] 3.1 Adapt the bottom "Action Bar" in `App.tsx` to sit comfortably on a wide screen (e.g., centered, not full width if too wide) while maintaining button order.
- [x] 3.2 Ensure "My Team" / "Opponents" buttons on large screens either smooth-scroll to the relevant section or are hidden if sections are already visible.
- [x] 3.3 Verify touch targets and click interactions work seamlessly across both layouts.

## 4. Stress Testing & High Density
- [ ] 4.1 Add `MANY_RUNS` scenario to `scenarios.ts` with 8-10 runs per player (some long) for stress testing.
- [ ] 4.2 Optimize `PlayerBoard` and `RunDisplay` for high density on desktop:
    - Tune vertical gap between runs.
    - Tune horizontal overlap for long runs (ensure 20 cards fit).
    - Consider smaller card variants for "Board" vs "Hand" on desktop.