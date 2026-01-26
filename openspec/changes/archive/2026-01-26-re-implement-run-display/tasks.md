## 1. Logic & Store Updates
- [ ] 1.1 Update `gameLogic.ts` to include `represents` population in `arrangeRun` or a similar helper.
- [ ] 1.2 Update `store.ts` to ensure `createRun` and `addToRun` populate the `represents` field for all wildcards.
- [ ] 1.3 Remove manual rank sorting from `PlayerBoard.tsx` (both Mobile and Desktop views).

## 2. Component Updates
- [ ] 2.1 Update `CardBase.tsx` to better support displaying `represents` data when `isWild` is true.
- [ ] 2.2 Refine `Run.tsx` rendering:
    - [ ] Remove `isStacked` prop from Anchor cards.
    - [ ] Ensure `overlapClass` is correctly applied to sequences.
- [ ] 2.3 Verify `RunInspector.tsx` still works and potentially shares representation logic with `CardBase`.

## 3. Verification
- [ ] 3.1 Create/Run tests for `gameLogic.ts` to ensure `represents` is correctly calculated.
- [ ] 3.2 Manual test in UI: Verify runs with wildcards are correctly ordered and labeled.
- [ ] 3.3 Manual test: Verify stacking logic with 2+ natural gaps.
