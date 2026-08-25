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

---

## Entry 4 — Prompt 10: Additional UI scenarios

**Date:** 2026-08-25

### Prompt

Review the current UI suite (3 tests) and add only the highest-value missing scenarios while keeping the total between 5 and 8 tests. Include suitable negative or edge coverage for search, cart, or checkout. Avoid duplicating the end-to-end flow. Classify each test with `@smoke` or `@regression`.

Highest-value gaps: UI-04 duplicate email; UI-06 cart qty clamp 0→1 and 100→99; UI-07 empty cart. Optional 7th (search no results) only if still under cap and cheap. Recommended final set: **6 UI tests**. JavaScript, Prism POM + fixtures, unique data, no `waitForTimeout`. Verify with `npx playwright test tests/ui --list` and `npx playwright test tests/ui`. Append this prompt here; update `test-design.md` UI count; light README if it still said 3 UI tests.

### AI Response Summary

Added **3** `@regression` tests (no second purchase E2E, no search-no-results, no confirm-once). UI automated count is **6 / 8**.

| Implemented spec | Title tag | Covers planned IDs | Maps to |
| --- | --- | --- | --- |
| `tests/ui/auth.spec.js` | `@smoke` | UI-01 + UI-02 | TC-M-01 |
| `tests/ui/auth.spec.js` | `@regression` | UI-05 | TC-M-02 |
| `tests/ui/auth.spec.js` | `@regression` register with an email already in use is rejected | **UI-04** | (auto-only; not in CSV) |
| `tests/ui/cart.spec.js` | `@regression` cart quantity clamps below 1 and above 99 | **UI-06** | TC-M-05 |
| `tests/ui/cart.spec.js` | `@regression` empty cart shows empty copy and hides proceed to checkout | **UI-07** | (auto-only; not in CSV) |
| `tests/ui/purchase.spec.js` | `@smoke` **and** `@regression` | UI-03 | TC-M-03..07 (combined) |

**Refused:** a second full COD E2E; dedicated confirm-once (already the wait-then-second-click inside UI-03); search no-results (optional 7th, left as spare slot).

### Debugging Outcome (how it helped or misled you)

Helped: live v2.4 copy and HTTP status differ from Sprint 5 `en.json`. Duplicate register returns **409** (not 422) and shows **“A customer with this email address already exists.”** (not “Email is already in use.”). Empty cart with no `cart_id` renders the stepper and **no** empty copy (`getCart()` is null); seeding an empty cart via `POST /carts` + `sessionStorage.cart_id` shows the documented empty message and hides Proceed. Qty clamp matched source (`0`→1, `100`→99 + toast “You can order at most 99 of this product.”); line total `$1,400.85` needs numeric compare because of the thousands separator. Six default workers against the public SUT caused Cloudflare/blank `goto` timeouts; `workers: 2` kept the 6-test run stable. No `waitForTimeout`.

**Playwright (from `PrismStructure/`):** `npx playwright test tests/ui --list` → **Total: 6 tests in 3 files**. `npx playwright test tests/ui` → **6 passed (51.7s)** (2 workers). Isolated new tests: **3 passed (34.6s)**.

---

## Entry 5 — Prompt 11: API documentation investigation

**Date:** 2026-08-26

### Prompt

(Same session as test-design Prompt 11.) Fetch live API docs; extract endpoints, bodies, auth, and status codes for register, login, products, cart create/add/GET, invoice. Do not write tests. Do not invent fields. Persist the contract table in `ai-prompts/test-design.md`.

### AI Response Summary

OpenAPI 3.2.0 Toolshop API v5.0.0 from `GET /docs`. Swagger UI is `/api/documentation`. Machine JSON is `/docs`; common `/openapi.json` / `/swagger.json` paths 404. Full per-flow contract is in `ai-prompts/test-design.md` Entry 8. No API tests written.

Investigation takeaways for the next API-coding prompt:

- Register/login/products/carts are **public**. Only invoices (and helper `GET /users/me`) need **Bearer**.
- `POST /invoices` success is documented **200**, not 201.
- `POST /users/login` documents **no** error statuses — do not hard-code 401 from the spec.
- `POST /users/register` documents **201 / 400 / 401 / 403 / 409**, not 422.
- GET cart schema is **`id` only** — cart line verification is undocumented.
- COD invoice body in the assessment PDF matches `InvoiceRequest` + empty `CashOnDeliveryDetails`. Confirm-twice is `POST /payment/check` (UI only).

### Debugging Outcome (how it helped or misled you)

Helped: pulling `/docs` instead of the Swagger UI HTML (UI fetch was chrome-only). Prior planning that assumed invoice **201**, login **401**, register **422**, and GET-cart line items would have produced false requirements. Existing helpers already match documented **paths** and the COD payload; they do not invent extra request fields. The risk is **assertions** on undocumented response fields (`cart_items`, invoice `payment_method`) and status codes the spec omits.

---

## Entry 6 — Prompt 12: API lifecycle tests

**Date:** 2026-08-26

### Prompt

Implement Playwright API tests for the Toolshop lifecycle: register a unique user; log in and extract the bearer token; retrieve products; create a cart; add selected products; verify cart contents; generate an invoice using Cash on Delivery; validate the invoice response.

Use reusable API helpers, dynamic IDs, isolated test data, and explicit status/schema/value assertions. Do not hardcode bearer tokens, user credentials, cart IDs, product IDs, or invoice IDs. Use `@smoke` and `@regression` tags.

Honor Prompt 11 OpenAPI facts (invoice **200** not 201 in the spec; GET cart schema is `id` only; Bearer required only on invoices; products are paginated `data`; API invoice is one POST). Replace/remove `tests/api/api-wiring.spec.js`. Target 2–4 API tests inside the 5–8 cap. JavaScript, no new deps, no git commit.

### AI Response Summary

Added **3** API tests and deleted the wiring spec. API automated count is **3 / 8**.

| Implemented spec | Title tag | Covers planned IDs |
| --- | --- | --- |
| `tests/api/lifecycle.spec.js` | `@smoke` **and** `@regression` unique customer can register, login, cart products, and create a COD invoice | **API-01..04** (combined) |
| `tests/api/auth.spec.js` | `@regression` POST /invoices without a bearer token is rejected | **API-07** |
| `tests/api/auth.spec.js` | `@regression` register with a duplicate email returns 409 | **API-05** |

Helpers: `findInStock` / `inStockFromPage` read paginated `body.data` only. `billing.invoicePayload` sends `billing_country: NL` plus postcode-lookup street/city/state (Utrecht + Netherlands 422s). Invoice helper still one POST; no Confirm-twice. All IDs come from prior responses. Unique user per run via `users.createUniqueCustomer()`.

**Not added:** API-06 bad login (OpenAPI documents no login error codes); extra GET-invoice-by-id; many tiny per-endpoint tests.

### Debugging Outcome (how it helped or misled you)

Helped: live probes before coding. GET cart **does** return `cart_items` even though OpenAPI lists only `id` — asserted as extra-schema, plus add-item 200 `{ result }` and GET `id` match. `POST /invoices` OpenAPI success is **200**; live v5 returned **201** with `id` / `invoice_number` / billing_* and **no** `payment_method` or `invoicelines` on the create body — tests assert live **201** and fields that exist. Invoice 422 on `Netherlands`+`Utrecht`+`1234AA`; NL lookup `Idaerd` / `de Bruijnsingel` / `Limburg` succeeded. Duplicate register live **409**. Unauthenticated invoice live **401**. No `waitForTimeout`.

**Playwright (from `PrismStructure/`):** `npx playwright test tests/api --list` → **Total: 3 tests in 2 files**. `npx playwright test tests/api` → **3 passed (7.0s)**. Quoted greps: `--grep "@smoke"` → **1 passed (6.0s)**; `--grep "@regression"` → **3 passed (7.0s)**.

---

## Entry 7 — Prompt 13: Negative API tests

**Date:** 2026-08-26

### Prompt

Add high-value negative API tests while keeping the complete API suite between 5 and 8 tests. Consider invalid login, missing or invalid bearer, invalid product or cart ID, invalid invoice payload, missing required fields. For every test, assert status and relevant error response. Do not assume status codes without checking the API or docs. Keep the existing 3 tests. Target 6 or 7 (3 existing + 3–4 new). Max 8. Do not duplicate the 401-without-token test. Login has no documented error codes — probe live. UnprocessableEntityResponse has no JSON schema — assert live keys. JavaScript, no new deps, no git commit, no waitForTimeout. Verify with `npx playwright test tests/api --list` and `npx playwright test tests/api`. Append this prompt here; update `test-design.md` API count.

### AI Response Summary

Added **4** `@regression` tests (API-06 bad login; malformed bearer on `POST /invoices`; GET unknown cart **404**; invoice missing `cart_id` **422**). Existing 3 kept. Suite is **7 / 8**. Helpers already return raw responses; `invoiceApi.create(payload, 'not-a-jwt')` sends `Authorization: Bearer not-a-jwt`. Unique users via `users.createUniqueCustomer()`. Fake cart id `00000000-0000-0000-0000-000000000000`.

**Skipped:** GET product 404 (same live 404 body as cart); optional add-item invalid `product_id` (live 422; would hit 8); register missing fields (live 422 vs documented 400). Did not duplicate missing-token 401.

### Debugging Outcome (how it helped or misled you)

Helped: live probes before coding. OpenAPI is silent on login errors; live wrong-password login is **401** `{ error: "Unauthorized" }` (not the UI string “Invalid email or password”, and not `{ message }`). Missing bearer vs malformed JWT are both **401**, but bodies differ (`message: "Unauthorized"` on malformed). Invoice missing `cart_id` is live **422** with Laravel-style `{ cart_id: ["The cart id field is required."] }` — no `message`/`errors` envelope, matching the spec’s lack of a 422 JSON schema. GET cart unknown id is documented **404** and live **404** `{ message: "Requested item not found" }`. Optional add-item invalid product_id is live **422** (not 404). Register missing fields is live **422** vs documented **400** — left untested. First `npx playwright test tests/api` hit a transient public-SUT **500** on register and `POST /carts` (GET cart 404 still passed); a follow-up probe returned 201 and the rerun was green. No `waitForTimeout`.

**Playwright (from `PrismStructure/`):** `npx playwright test tests/api --list` → **Total: 7 tests in 3 files**. `npx playwright test tests/api` → **7 passed (10.1s)**. Greps were not needed (ran `tests/api` directly; quote `@smoke` / `@regression` in PowerShell if used).

