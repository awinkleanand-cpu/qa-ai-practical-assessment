# AI Prompts – Automation and Debugging

QA engineer supplied Prompts 7–9 and 12–16. Cursor implemented. Pass counts below are only those recorded in those sessions.

---

## Entry 1

### Prompt

(QA engineer — Prompt 7.) Set up minimum Playwright JavaScript structure for UI and API testing of Toolshop. Reusable page objects and API helpers; test data separate from logic; `@smoke` / `@regression`; HTML reports; env vars for URLs; no hardcoded credentials; no unnecessary dependencies. Put the project in `PrismStructure/`.

### AI Response Summary

Cursor created a Playwright JS scaffold under `PrismStructure/`: `package.json`, `playwright.config.js` (ui + api projects, HTML reporter), env loader via `fs`/`path`, page objects, API helpers, fixtures, and `src/data/` factories. Two `@smoke` wiring tests (homepage Sign in; `GET /products`) were added as probes and removed in later prompts so the 5–8 cap was not exceeded. No git commit on this prompt.

### Validation Notes

First UI `page.goto` timed out waiting for full `load`; `waitUntil: 'domcontentloaded'` unblocked homepage `open()`. API `GET /products` passed on the first run. `@playwright/test` pinned; `@smoke` quoted in npm scripts for Windows.

### Changes I Made

Added the Prism scaffold, `.env.example` (URLs only), `.env` gitignored. Wiring specs were temporary.

### Reason for Changes

Prompt 6 found only a stub README. Prompt 7 asked for minimum framework, not the full UI/API cases.

---

## Entry 2

### Prompt

(QA engineer — Prompt 8.) Implement Playwright UI tests for successful registration and login and invalid login. Unique valid user data at runtime. Tag successful auth `@smoke` and invalid login `@regression`. Prefer one smoke covering register → login → profile. Replace/remove UI wiring so the cap stays 5–8.

### AI Response Summary

Cursor added `tests/ui/auth.spec.js`: one `@smoke` (unique customer registers, logs in, My profile matches) and one `@regression` (wrong password). Deleted the homepage UI wiring spec. Combined UI-01+UI-02 into one smoke test (AI suggestion, accepted). Live form needs `house_number`. `Welcome1!` was rejected as a leaked password.

### Validation Notes

Sprint 5 HTML had no house-number field; live v2.4 does. After `uniquePassword()` and `domcontentloaded` URL waits, smoke and invalid-login regression passed. No `waitForTimeout`.

### Changes I Made

`auth.spec.js`, Register/Login/Profile page objects, unique password helper. Removed `ui-wiring.spec.js`.

### Reason for Changes

Cap: do not keep UI-01 and UI-02 as separate automated tests. Live SUT required house number and a non-leaked password.

---

## Entry 3

### Prompt

(QA engineer — Prompt 9.) Implement a Playwright E2E: log in, search, add multiple products, update qty, COD checkout, handle double confirmation safely, open My invoices, verify the invoice. Tag `@smoke` and `@regression`.

### AI Response Summary

Cursor added `tests/ui/purchase.spec.js` with both tags. API-seeds a unique customer, UI-logs in, searches two products, raises qty, COD with Confirm twice, then My invoices. Confirm twice waits for `/payment/check` and `payment-success-message`, then the second click and `POST /invoices`. UI count after this prompt was 3 tests.

### Validation Notes

`addToCart` had to wait for the add-item POST, not only cart create. Invoice 422 from Austria/Florida billing was fully fixed in Prompts 14–15 (see test-data). My invoices Details is a link named Details, not `data-test="invoice-details"`. No `waitForTimeout`.

### Changes I Made

`purchase.spec.js` and Cart/Checkout/Home/Product/Invoices page objects. No extra purchase variants.

### Reason for Changes

UI-AC2 E2E plus the assessment Confirm-twice rule (UI-only). Both tags live on this one test, inside the cap.

---

## Entry 4

### Prompt

(QA engineer — Prompt 12.) Implement Playwright API tests for the lifecycle: register unique user → login token → products → create cart → add products → verify cart → COD invoice → validate invoice. No hardcoded tokens/IDs. Honor Prompt 11 OpenAPI (documented invoice 200; GET cart schema `id` only; one POST). Replace API wiring. Target 2–4 API tests inside 5–8.

### AI Response Summary

Cursor added 3 API tests and deleted the wiring spec: lifecycle (API-01..04 combined, both tags), unauthenticated invoice 401, duplicate register 409. Live `POST /invoices` returned 201 (OpenAPI 200). Live GET cart includes extra-schema `cart_items`. Billing uses NL + lookup address (Utrecht + Netherlands 422’d).

### Validation Notes

`npx playwright test tests/api --list` → 3 tests in 2 files; `tests/api` → 3 passed. Duplicate register live 409. Unauthenticated invoice live 401. No Confirm-twice API test.

### Changes I Made

`tests/api/lifecycle.spec.js`, `tests/api/auth.spec.js`; removed `api-wiring.spec.js`. Helpers read paginated `body.data`. Invoice helper still one POST.

### Reason for Changes

Stay in the cap by combining the happy path. Assert live 201 and extra-schema `cart_items` without inventing request fields.

---

## Entry 5

### Prompt

(QA engineer — Prompt 13.) Add high-value negative API tests. Keep the existing 3. Target 6 or 7, max 8. Assert status and error body. Do not assume codes without checking docs or live. Do not duplicate the missing-token 401.

### AI Response Summary

Cursor added 4 `@regression` tests (wrong-password login; malformed bearer; GET unknown cart 404; invoice missing `cart_id` 422). Suite became 7/8. Live login is 401 `{ error: "Unauthorized" }` (undocumented in OpenAPI). Skipped GET product 404, invalid product_id add-item, and register-missing-fields (live 422 vs documented 400).

### Validation Notes

`tests/api --list` → 7 tests in 3 files; `tests/api` → 7 passed after a transient public-SUT 500 on first try. Missing vs malformed bearer are both 401 with different bodies.

### Changes I Made

Negatives in `tests/api/auth.spec.js` and `tests/api/cart.spec.js`. Fake cart id `00000000-0000-0000-0000-000000000000`.

### Reason for Changes

Fill remaining cap slots with live-probed negatives. Do not hard-code undocumented statuses from the spec alone.

---

## Entry 6

### Prompt

(QA engineer — Prompt 14.) Run the `@smoke` Playwright tests. For every failure, classify product/test/test-data/locator/environment. Do not weaken assertions. Quote `--grep "@smoke"` on PowerShell. Do not git commit unless asked.

### AI Response Summary

Three `@smoke` tests. First run: 2 failed, 1 passed. Purchase 422 classified as a test defect: Austria lookup left a Florida city on NL checkout. Auth `goto('/auth/register')` timeout classified environment (public SUT). After waiting for `/postcode-lookup?country=NL`, smoke recorded 3 passed.

### Validation Notes

Evidence: invoice 422 with `billing_city=East Jamisonbury`, `billing_state=Florida`, `billing_country=NL`. Live NL lookup is Idaerd / de Bruijnsingel / Limburg. Isolated auth later passed; did not loosen profile asserts.

### Changes I Made

`CheckoutPage.fillBilling` waits for the NL lookup and writes that street/city/state. Strengthened purchase asserts on country/city/street. No `waitForTimeout`, no extra retries, `@smoke` kept on titles.

### Reason for Changes

Selecting NL while keeping the Austria-lookup city is a test defect. Invoice success must still reject 422.

---

## Entry 7

### Prompt

(QA engineer — Prompt 15.) Analyze the Playwright failure from error, trace, screenshot, and source. Smallest reliable fix. No arbitrary timeouts, force clicks, or broad try/catch.

### AI Response Summary

First Prompt 15 analysis subagent timed out. Retry kept Prompt 14’s NL `waitForResponse`. A follow-up wait for country not-empty was a false signal: profile country `"Austria"` is not a select option value, so the control stays empty after the Florida lookup. That wait was removed. `LoginPage.login` waits for `nav-menu` only after a successful login. Smoke recorded 3 passed.

### Validation Notes

Screenshot showed country visually empty, postal `1234AA`, house `1`, street Karelle Forest, city East Jamisonbury. `goto('/auth/register')` hang stayed classified environment; no timeout added. Invoice/profile asserts were not loosened.

### Changes I Made

Dropped country-not-empty expect. Wait for postal/house filled + lookup loading hidden, then select NL and apply the NL body. Success-only `nav-menu` wait after `POST /users/login`.

### Reason for Changes

Waiting for `"Austria"` to appear in the country select can never succeed. Auth menu race is `GET /users/me`, not a missing locator.

---

## Entry 8

### Prompt

(QA engineer — Prompt 16.) Run the complete UI and API regression suite. Confirm commands, HTML reports, no secrets in committed files, and 5–8 counts per type. Smallest signal-based fix only for a clear test defect.

### AI Response Summary

Counts: manual 8, UI 6, API 7. Combination Pliers OOS caused a locator test defect (substring “Pliers”). After exact-heading fix, full suite recorded 13 passed on retry. Public SUT register 500 and `connect ETIMEDOUT` were reported, not patched with retries. HTML report generated under `PrismStructure/playwright-report/` (gitignored).

### Validation Notes

Recorded command results: `npm test` first 12 passed / 1 failed (ETIMEDOUT), retry 13 passed; smoke 3 passed; regression 12 passed; `test:ui` first 4 passed / 2 failed then 6 passed; `test:api` 7 passed. Secret scan: no hardcoded JWT; `.env` gitignored; `.env.example` URLs only. `Welcome1!` only as a manual example.

### Changes I Made

Exact heading locators for in-stock products (see test-data Entry 3). Did not add retries for 500/ETIMEDOUT. No git commit on this prompt.

### Reason for Changes

OOS Combination Pliers is product data; clicking it via substring is a test defect. Environment 500/ETIMEDOUT must not be hidden.
