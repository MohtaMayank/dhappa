## 1. Breakpoint & Layout Logic
- [ ] 1.1 Update `App.tsx` to use `md:` prefixes instead of `lg:` for layout switching (sidebar visibility, root container width).
- [ ] 1.2 Update `RunDisplay.tsx` to toggle compression on `md:` instead of `lg:`.
- [ ] 1.3 Update `CardBase.tsx` size variants to trigger on `md:`.

## 2. PlayerBoard Optimization
- [ ] 2.1 Refactor `PlayerBoard.tsx` to accept a `flatLayout` prop (or infer from media query/CSS strategy).
- [ ] 2.2 On Desktop (`md+`): Render a single `flex-wrap` container with all runs sorted by High Card -> Low Card.
- [ ] 2.3 On Mobile: Keep existing Suit-grouped layout.
- [ ] 2.4 Force `displayCards` to be strictly sorted Descending (K->A) before rendering.

## 3. Visual Tuning
- [ ] 3.1 Verify `RunDisplay` overlap logic for `md` (Compact Desktop).
- [ ] 3.2 Ensure "green box" dotted elements are strictly hidden on `md+`.
