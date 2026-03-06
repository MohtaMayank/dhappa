## Context

Currently, the game state tracks player runs as independent entities. Adding cards to a run is the only way to modify it. There is no mechanism to combine two separate runs into one, even if they logically form a single sequence. This creates strategic friction and clutters the board.

## Goals / Non-Goals

**Goals:**
- Provide a clean UI to initiate and execute a run merge.
- Implement robust server-side validation to ensure only valid sequence merges occur.
- Maintain the "Max 2 Wilds per run" rule to ensure merged runs don't break "Go Out" eligibility logic.

**Non-Goals:**
- Automatic merging (merging must be a conscious player action).
- Merging Sets (same rank) - this is specifically for Sequences.
- Splitting runs (out of scope for this change).

## Decisions

### 1. Merging Logic Location (Shared Utility)
- **Decision:** Place the core merge validation and execution logic in `shared/gameLogic.ts`.
- **Rationale:** This allows the client to perform optimistic checks (e.g., highlighting mergeable runs) while the server uses the exact same logic for authoritative validation.
- **Alternatives:** Keeping it server-only would increase latency and make it harder to provide a reactive UI for selection.

### 2. UI Entry Point (Header Button)
- **Decision:** A "Merge Runs" button in the `PlayerBoard` header for the current player.
- **Rationale:** Keeps the individual `Run` components clean and avoid "button fatigue" on every run. The button only appears if `findMergeableRuns()` returns at least one valid pair.
- **Alternatives:** Context menu on runs (too many taps), drag-and-drop (complex to implement reliably on mobile).

### 3. Selection Flow (Two-Tap Process)
- **Decision:** When "Merge Mode" is active, the first run selected becomes the "Anchor." All other runs that *cannot* be merged with the anchor are dimmed.
- **Rationale:** Guides the user through a valid interaction and prevents errors before they reach the server.
- **Alternatives:** Multi-select checkboxes (feels less direct).

### 4. Merged Run ID and Ownership
- **Decision**: The merged run will inherit the ID of the first selected run (the "Anchor"). Ownership remains with the player who initiated the merge.
- **Rationale**: Simplifies state updates. Merging is restricted to a player's own runs to avoid complex ownership transfers.
- **Alternatives:** Generating a brand new ID might break client-side animations or tracking.

## Risks / Trade-offs

- **[Risk] Complexity of Sequence Reconstruction** → **Mitigation**: Use existing `arrangeRun` and `inferRunContext` utilities to ensure the final combined array of cards is valid and optimally arranged.
- **[Risk] Wildcard Limit** → **Mitigation**: Explicitly check that the resulting merged run does not exceed 2 wildcards if it is to remain "eligible" for the 3-run lock. If it exceeds 2, it's still a valid run but doesn't count towards the lock (existing logic handles this).
- **[Risk] Sync Issues** → **Mitigation**: The `MERGE_RUNS` action will be treated as an atomic operation on the server.
