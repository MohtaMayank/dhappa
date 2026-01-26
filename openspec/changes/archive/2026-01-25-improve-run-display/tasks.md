## 1. Implementation
- [x] 1.1 Update `Run.tsx` to calculate card positions including "virtual" positions for wildcards based on what they represent.
- [x] 1.2 Implement a "Stack" component or rendering logic to collapse sequences of >4 natural cards.
- [x] 1.3 Ensure the stacking logic preserves the leftmost and rightmost cards of the collapsed segment.
- [x] 1.4 Update `CardBase` or `Run` to display the "represented" value on the wildcard if needed (or just rely on position).
- [x] 1.5 Verify that wildcards "break" the stacking sequence (i.e., a wild card is never hidden inside a stack).
- [x] 1.6 Verify edge cases: Run exactly 4 cards (no stack), Run 5 cards (stack), Stack with wilds at boundaries.