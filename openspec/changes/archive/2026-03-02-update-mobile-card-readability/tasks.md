## 1. Research and Baseline
- [ ] 1.1 Verify current mobile card sizes and font sizes in `CardBase.tsx`.

## 2. Card UI Updates
- [ ] 2.1 Update `CardBase.tsx` to increase font sizes for mobile (no-breakpoint classes).
- [ ] 2.2 Increase default `sizeClass` for mobile (e.g., from `w-11 h-14` to `w-13 h-18`).
- [ ] 2.3 Ensure center suit icon and corner text are larger on mobile.

## 3. Layout Adjustments
- [ ] 3.1 Update `Hand.tsx` negative margins (`-ml-6`) to account for wider cards while keeping the same overlapping feel.
- [ ] 3.2 Update `RunDisplay.tsx` overlap classes (`ml-[-28px]`) to maintain the same visual stack density.
- [ ] 3.3 Ensure card corners (anchors) remain clearly visible.

## 4. Verification
- [ ] 4.1 Run the app in mobile view (simulated) to verify card readability.
- [ ] 4.2 Confirm standard and compact variants still work across all screen sizes.
