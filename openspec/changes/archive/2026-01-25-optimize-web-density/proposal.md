# Change: Optimize Web Density & Sorting

## Why
The current "Wide UI" improvements have uncovered gaps in extreme scenarios (e.g., 8-10 runs per player) where vertical scrolling is still required. Additionally, users on tablet-sized devices (or smaller desktops) are seeing compressed runs instead of the full view. Run sorting and internal card ordering also need strict enforcement.

## What Changes
- **Breakpoint Adjustment**: Lower the "Wide UI" trigger from `lg` (1024px) to `md` (768px) to ensure tablets and small laptops get the optimized view.
- **Run Layout (Desktop)**:
  - Remove "Suit Grouping" in `PlayerBoard` on wide screens.
  - Flatten all runs into a single sorted list rendered in a `flex-wrap` container. This allows runs to flow efficiently, filling gaps and reducing vertical height.
- **Run Sorting**:
  - **Runs**: Sort primarily by "Highest Card Rank" (Descending), then by Suit if needed.
  - **Cards**: Force strict Descending order (High -> Low, K -> A) for display within a run.
- **Compression**:
  - Ensure `RunDisplay` disables compression on `md+`.
  - Fix any CSS leakage causing "green boxes" (compressed placeholders) to appear when uncompressed view is expected.

## Impact
- **Affected Specs**: `ui`
- **Affected Code**: `PlayerBoard.tsx`, `RunDisplay.tsx`, `App.tsx` (layout containers).
