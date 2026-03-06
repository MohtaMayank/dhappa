# End-to-End Testing

The project uses **Playwright** for E2E testing. 

1. Install Playwright browsers:
   `npx playwright install`
2. Run all tests:
   `npm run test:e2e`

### Useful Test Commands

| Command | Description |
| :--- | :--- |
| `npm run test:e2e -- --headed` | Run tests in a visible browser window |
| `npx playwright test --ui` | Open Playwright UI mode (interactive dashboard) |
| `npx playwright test <path-to-file>` | Run only a specific test file |
| `npx playwright test -g "test name"` | Run a specific test case by name |

Tests cover lobby mechanics, turn loops, game rules (including wildcards and N-Pick), and win conditions.
Scenarios for testing can be found in `scenarios.ts`.
