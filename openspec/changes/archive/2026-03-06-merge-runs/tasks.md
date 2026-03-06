## 1. Shared Game Logic

- [x] 1.1 Implement `canMergeSequences(runA, runB)` in `shared/gameLogic.ts`
- [x] 1.2 Implement `mergeSequences(runA, runB)` in `shared/gameLogic.ts` (using `arrangeRun` and `applyRepresentations`)
- [x] 1.3 Implement `findMergeablePairs(runs)` utility for UI and validation

## 2. Server Implementation

- [x] 2.1 Add `MERGE_RUNS` action type to `processGameAction` in `server/index.ts`
- [x] 2.2 Implement `MERGE_RUNS` logic: validation (turn, phase, mergeability) and state update

## 3. Store and Selection State

- [x] 3.1 Add `isMergingRuns` and `mergeAnchorId` to `GameStore` in `store.ts`
- [x] 3.2 Add `setMergingRuns(boolean)` and `selectRunForMerge(runId)` actions to `store.ts`
- [x] 3.3 Update `socket.on('state_update', ...)` to clear merge state if turn changes

## 4. UI Components

- [x] 4.1 Update `PlayerBoard` header to display "Merge Runs" button when valid pairs exist
- [x] 4.2 Update `PlayerBoard` and `Run` components to handle "Merge Selection Mode" highlights (Anchor, Target, Dimmed)
- [x] 4.3 Add prompt/instruction message in `App.tsx` footer when `isMergingRuns` is active

## 5. Testing and Validation

- [x] 5.1 Add E2E tests in `tests/e2e/runs.test.ts` for merging sequences (natural and with wildcards)
- [x] 5.2 Verify "3-Run Lock" correctly respects merged runs
- [x] 5.3 Implement `MERGE_CHOICE` scenario in `scenarios.ts` to test multiple valid targets in UI
