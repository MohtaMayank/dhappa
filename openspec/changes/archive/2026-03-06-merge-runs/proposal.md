## Why

In Dhappa, players often end up with multiple small sequences of the same suit that could logically form a single long run. Merging these runs is a strategic move that helps manage the "3-Run Lock" (requiring 3 runs with specific wild limits to go out) and reduces visual clutter on the player's board. Currently, there is no way to combine existing runs, forcing players to plan their runs perfectly from the start.

## What Changes

- **New Merge Logic**: Implementation of server-side logic to validate and execute the merging of two sequences of the same suit.
- **Merge Selection Mode**: A new UI state that allows players to select two of their own runs to merge during their turn.
- **Header Action Button**: A "Merge Runs" button in the `PlayerBoard` header that only appears when the current player has valid merge options.
- **Validation Rules**: Restricting merges to `SEQUENCE + SEQUENCE` of the same suit where the ranks are adjacent (including gaps filled by wildcards).

## Capabilities

### New Capabilities
- `run-merging`: Core logic for identifying, validating, and executing the merging of two existing runs into a single valid run.

### Modified Capabilities
- `gameplay`: Update game action processing to include the `MERGE_RUNS` action and ensure it respects turn/phase constraints.
- `ui`: Update `PlayerBoard` and `App` to handle the new "Merge Selection Mode" and display the merge action button.

## Impact

- **Server (`server/index.ts`)**: New case in `processGameAction` for `MERGE_RUNS`.
- **Shared Logic (`shared/gameLogic.ts`)**: New utility functions `findMergeableRuns` and `mergeSequences`.
- **Store (`store.ts`)**: New state for `isMergingRuns` and `mergeSelection` (tracking first selected run).
- **Components**: `PlayerBoard` will need to handle selection highlights for merging; `App` will manage the transition into merge mode.
