## 1. UI & State Logic
- [ ] 1.1 Update `App.tsx` / `store.ts` to introduce a `isConfirmingDraw` state.
    - Triggered when clicking the Draw Pile.
- [ ] 1.2 Update `DrawCardOverlay` to strictly separate "Confirmation" vs "Reveal" modes.
    - Ensure `overflow-hidden` is removed or adjusted so the card is not clipped.
- [ ] 1.3 Implement the "Confirm" handler.
    - Calls the actual `drawFromDeck` action.
    - Transitions Overlay to "Reveal" mode.

## 2. Animation & Polish
- [ ] 2.1 Implement the "Reveal" timer.
    - Keep card visible for ~2 seconds.
- [ ] 2.2 Implement "Fly to Hand" animation.
    - Animate the card element translating from center screen to the Hand component's position.
    - Close overlay after animation completes.
