# AI Prompts – Automation and Debugging

Prompts used for automation structure, assertions, and analyzing failures/logs.

---

## Entry 1 — Prompt 7: Framework setup

**Date:** 2026-08-25

### Prompt

Set up the minimum Playwright JavaScript structure required for UI and API testing of Practice Software Testing Toolshop.

Requirements: follow existing Prism conventions; reusable page objects and API helpers; test data separate from test logic; `@smoke` and `@regression` tags; HTML execution reports; environment variables for URLs; no hardcoded credentials or tokens; no unnecessary dependencies.

Context honored: put the project inside `PrismStructure/`; Playwright (Prism) + Cursor only; POM `*Page` classes and API helpers like `authApiPage.js`; minimum framework, not the full 7 UI + 7 API cases; unique emails; `.env` gitignored; `.env.example` URLs only; no dotenv/faker/Selenium/Allure; pin `@playwright/test` and generate `package-lock.json`; JavaScript; Windows-safe scripts.

### AI Response Summary

Created a Playwright JS scaffold under `PrismStructure/`: `package.json` (scripts for full / smoke / regression / HTML report), `playwright.config.js` (`ui` + `api` projects, HTML reporter to `playwright-report`, `open: 'never'`), env loader via `fs`/`path`, page objects, API helpers, fixtures, and `src/data/` factories from `ai-prompts/test-data.md`. Two `@smoke` wiring tests (homepage Sign in; `GET /products`). Root `README.md` documents setup and smoke vs regression commands. No git commit.

### Debugging Outcome (how it helped or misled you)

Helped: pinning `@playwright/test` 1.62.1, quoting `@smoke` in npm scripts for Windows, and `--pass-with-no-tests` on regression so the empty regression grep does not fail the scaffold. First UI wiring run timed out on `page.goto` waiting for full `load`; switching homepage (and other page `open()` methods) to `waitUntil: 'domcontentloaded'` made the UI smoke pass (3.4s). API `GET /products` passed on the first run. Wiring tests are probes only and should be replaced when UI-01..07 / API-01..07 land so the 5–8 cap is not exceeded.

---

## Entry 2 — Prompt 8: Registration and login UI tests

**Date:** 2026-08-25

### Prompt

Implement Playwright UI tests for (1) successful registration and login and (2) invalid login validation. Use the existing Prism page-object pattern. Generate unique, valid user data at runtime. Use stable accessible locators and explicit assertions. Tag successful authentication as `@smoke` and invalid login as `@regression`. Do not use fixed waits. Prefer one smoke test covering register → login → profile plus one regression test for invalid login. Replace/remove `tests/ui/ui-wiring.spec.js` so the UI count stays in the 5–8 cap.

### AI Response Summary

Added `PrismStructure/tests/ui/auth.spec.js`: one `@smoke` test (unique customer registers, logs in, My profile matches name/email) covering UI-01+UI-02 / TC-M-01, and one `@regression` test (API-seeded unique user, wrong password → “Invalid email or password”, no user menu) covering UI-05 / TC-M-02. Deleted the homepage UI wiring spec. Strengthened Register/Login/Profile page objects (`data-test` locators; live SUT house number is `house_number`). Unique email + password from `users.createUniqueCustomer()`. No git commit.

### Debugging Outcome (how it helped or misled you)

Helped: Sprint 5 GitHub HTML (no house-number field) misled the first fill — the live v2.4 form requires `data-test="house_number"` and shows “House number is required” without it. `waitForURL` defaulted to `waitUntil: 'load'` and hung the same way homepage `goto` did; switched to `expect(page).toHaveURL` / `domcontentloaded`. Register then returned **422** with “The given password has appeared in a data leak. Please choose a different password.” — `Welcome1!` is HIBP-blocked on the public API, so runtime passwords now come from `uniquePassword()` (`Aa1!` + hex) unless `TEST_PASSWORD` is set. After those fixes: smoke **passed (9.7s)** and regression **passed (5.8s)**.

---

## Entry 3 — Prompt 9: Purchase flow UI E2E

**Date:** 2026-08-25

### Prompt

Implement a Playwright end-to-end UI test for Practice Software Testing Toolshop.

Flow: Log in with a registered user; browse or search products; add multiple products to the cart; update product quantity; verify cart values; complete checkout using Cash on Delivery; handle the required double confirmation safely; open My Invoices; verify the generated invoice.

Follow existing Prism conventions, use reusable page methods, stable locators, and meaningful assertions. Tag the test `@smoke` and `@regression`.

### AI Response Summary

Added `PrismStructure/tests/ui/purchase.spec.js` (`@smoke @regression unique customer can search, update cart, checkout COD, and see invoice`). API-seeds a unique customer, UI-logs in, searches two catalog products, adds both, raises pliers qty to 2, COD checkout with Confirm twice, then My invoices. Strengthened Cart/Checkout/Home/Product/Invoices page objects. No extra purchase variants. UI count is 3 tests. No git commit.

### Debugging Outcome (how it helped or misled you)

Helped: Sprint 5 source locators were accurate (`product-title`, `finish`, `payment-success-message`, `#order-confirmation`). My invoices **Details** has no `data-test="invoice-details"` — it is a link named Details. Failures before green:

1. Cart showed only Thor Hammer: `addToCart` waited for the first `POST /carts` (create) and navigated home before the add-item POST (`product_id` body) finished. Wait for the add-item response + toast.
2. Invoice POST **422**: `Austria` + `1234AA` is an invalid country/postcode pair. Checkout billing uses **NL** + `1234AA`. Overwriting lookup with “Utrecht” also 422’d (“city does not belong to the selected country”). `fillBilling` now lets postcode lookup fill street/city/state.
3. Confirm-twice: wait `/payment/check` + `payment-success-message`, then second click, then `POST /invoices` (any status, then assert ok). A waiter that required `res.ok()` hid the 422.

**Playwright:** purchase spec **passed (17.2s)**; `--repeat-each=2` **2 passed**. Latest greps: `tests/ui --grep "@smoke"` **2 passed (23.4s)** — auth 9.1s + E2E 18.6s; `tests/ui --grep "@regression"` **2 passed (43.8s)** — invalid login 27.1s + E2E 40.3s. No `waitForTimeout`.
