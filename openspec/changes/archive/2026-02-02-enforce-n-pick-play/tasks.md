## 1. Store Logic
- [x] 1.1 Add `mustPlayCard` (string | null) to `GameStore` state.
- [x] 1.2 Update `pickFromDiscard` to set `mustPlayCard` to the ID of the bottom picked card.
- [x] 1.3 Update `selectCard` to prevent deselecting the `mustPlayCard`.
- [x] 1.4 Update `createRun` and `addToRun` to clear `mustPlayCard` if the card is played.
- [x] 1.5 Update `discardCard` to prevent action if `mustPlayCard` is set.

## 2. UI Updates
- [x] 2.1 Update `App.tsx` header/footer instructions to explicitly state "Add [Card Name] to a new or existing run" when `mustPlayCard` is active.
- [x] 2.2 Show a toast/message if the user attempts to deselect the locked card or discard prematurely.