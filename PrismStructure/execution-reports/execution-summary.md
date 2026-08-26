# Execution summary — 2026-08-26

- **Date:** 2026-08-26
- **Working directory:** `PrismStructure/`
- **Command:** `npx playwright test`
- **Result:** **14 passed** (7 UI + 7 API)
- **Duration:** 1.1m
- **Workers:** 2
- **Local retries:** 0 (config was not changed to hide public-SUT flakes)
- **HTML report:** [`playwright-html/index.html`](playwright-html/index.html) (copy of generated `PrismStructure/playwright-report/` after this green run)
- **Screenshots:** none. Playwright `screenshot` is `only-on-failure`; this run had no failures, so `test-results/` had no PNG artifacts.

Local `playwright-report/` and `test-results/` stay gitignored and are regenerated on the next run. This folder is the committed snapshot.

## Counts

| Type | Listed | Passed |
| --- | --- | --- |
| UI (`npx playwright test tests/ui --list`) | 7 | 7 |
| API (`npx playwright test tests/api --list`) | 7 | 7 |
| Full suite | 14 | 14 |

## Manual mapping used on 2026-08-26

| Manual ID | Spec | Test title |
| --- | --- | --- |
| TC-M-01 | `tests/ui/auth.spec.js` | `@smoke unique customer can register, log in, and see matching profile` |
| TC-M-02 | `tests/ui/auth.spec.js` | `@regression login with wrong password is rejected` |
| TC-M-03 | `tests/ui/purchase.spec.js` | `@smoke @regression unique customer can search, update cart, checkout COD, and see invoice` (search + product open) |
| TC-M-04 | `tests/ui/purchase.spec.js` | same purchase E2E (two distinct cart lines) |
| TC-M-05 | `tests/ui/cart.spec.js` | `@regression cart quantity clamps below 1 and above 99` |
| TC-M-06 | `tests/ui/purchase.spec.js` | same purchase E2E (COD Confirm twice) |
| TC-M-07 | `tests/ui/purchase.spec.js` | same purchase E2E (My invoices + Details) |
| TC-M-08 | `tests/ui/purchase.spec.js` | `@regression a single Confirm on COD checkout does not create an invoice` |
