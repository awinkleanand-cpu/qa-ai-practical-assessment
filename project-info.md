# Project Info

Primary AI Tool(s) Used: Cursor

Application Under Test: PracticeSoftwareTesting Toolshop – Checkout & Application Flow

Participant: Awinkle Anand

Assessment Start Date: 2026-08-25 / Submission Date: 2026-08-26

Public git: https://github.com/awinkleanand-cpu/qa-ai-practical-assessment

## Project Summary

I used Cursor to plan, design, automate, and debug a bounded QA suite for Practice Software Testing Toolshop (new-customer checkout and invoice verification). The repository has **8** manual cases, **6** Playwright UI tests, and **7** Playwright API tests — each type inside the 5–8 cap, with `@smoke` and `@regression` counted inside that cap. Confirm twice is UI-only; the API creates an invoice with one `POST /invoices`. HTML reports are generated locally under `PrismStructure/playwright-report/` and are gitignored; they are not committed as Passed evidence.

## Application under test

| Layer | URL |
| --- | --- |
| UI | https://practicesoftwaretesting.com |
| API | https://api.practicesoftwaretesting.com |
| API docs (Swagger UI) | https://api.practicesoftwaretesting.com/api/documentation |
| OpenAPI JSON | https://api.practicesoftwaretesting.com/docs (Toolshop API v5.0.0) |

The SUT is a shared public ecommerce shop (Sprint 5 / live v2.4–v5). Scope is **registered-user checkout + invoice**, not catalog, admin, guest checkout, or other payment methods. Core assessment wording about tickets/comments/state machines is mapped onto Toolshop entities (user, cart, product, invoice). There is no invented comment/ticket CRUD.

`.env.example` (URLs only):

```
UI_BASE_URL=https://practicesoftwaretesting.com
API_BASE_URL=https://api.practicesoftwaretesting.com
```

## Tools used

What is actually in this engagement:

- **Cursor** — primary AI for prompts 1–16 (planning, design, automation, validation, debugging) and this Prompt 17 rewrite
- **Playwright JavaScript** (`@playwright/test` **1.62.1**) in `PrismStructure/` — Prism page objects (`*Page`), API helpers (`*ApiPage`), fixtures, HTML reporter
- **Chromium** — `npx playwright install chromium`
- **GitHub** — https://github.com/awinkleanand-cpu/qa-ai-practical-assessment
- **npm** — scripts in `PrismStructure/package.json`

Not in the repo: Selenium, Cypress, REST Assured, Postman collections, Karate, Allure, faker, dotenv as a package. Env files are loaded with `fs`/`path` in `PrismStructure/src/utils/env.js`.

## Scope and acceptance criteria

**Hard cap:** ≤5–8 tests per type (manual / UI auto / API auto). `@smoke` and `@regression` live inside that cap.

| Type | Count | Location | In 5–8? |
| --- | --- | --- | --- |
| Manual | **8 / 8** | `FunctionalTestCase/functional-test-cases.csv` (`TC-M-01`…`TC-M-08`) | Yes |
| UI automation | **6 / 8** | `PrismStructure/tests/ui/` | Yes |
| API automation | **7 / 8** | `PrismStructure/tests/api/` | Yes |

`ActualResult` and `Status` on the CSV are blank (manual suite not executed in this repo). Wiring specs were removed so the cap is not exceeded.

### Acceptance criteria (Toolshop)

| ID | Source | Criterion |
| --- | --- | --- |
| **UI-AC1** | Assessment | Register with valid unique details, log in, verify **My profile** (name/email). |
| **UI-AC2** | Assessment | Browse/search, add **multiple** items, update quantity, checkout **Cash on Delivery**, press **Confirm twice**, view invoice under **My invoices** (number, COD, lines). |
| **API-AC1** | Assessment | Register, login, bearer token, create cart. |
| **API-AC2** | Assessment | Retrieve products, add to cart, verify cart, POST invoice with billing + `payment_method: cash-on-delivery` + `cart_id` + `payment_details: {}`. |

**Invoice rule:** UI must wait after the first Confirm (`POST /payment/check`), then Confirm again (`POST /invoices`). API uses **one** `POST /invoices`. There is no Confirm-twice API test.

**Out of this Core:** guest checkout, bank/card/BNPL/gift card, filters/sort/PDF, 2FA, social login, chat/contact, admin, invented comment CRUD. Documented in `ai-prompts/test-design.md`; not automated.

## Requirement and risk analysis

Full row-level tables live in `ai-prompts/test-design.md` (Prompt 3, updated through Prompt 13). This section is the assessment deliverable against the **implemented** suite, not the earlier “7 UI / API not coded yet” stub.

### Priority model

| Pri | Use when |
| --- | --- |
| **P1** | Shop cannot sell, customer cannot authenticate, invoice missing/wrong, or money/qty is wrong. Smoke lives here. |
| **P2** | Negatives/edges that protect P1 (duplicate email, bad login, qty clamp, empty cart, missing token / cart_id). Regression inside the cap. |
| **P3** | Filters, PDF, other payments, guest, 2FA, chat. Documented, not automated. |

**Impact:** **User** = cannot complete a journey. **Money** = wrong quantity, total, or payment method. **Data** = duplicate account, leftover cart, invoice attached to the wrong user or missing lines.

### Extra-depth flows (what we actually cover)

| Flow | AC | Business risk | Impact | Pri | Coverage | Tag | In auto? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Register unique customer | UI-AC1 / API-AC1 | New buyers cannot start checkout | **User/Data** | P1 | Both | @smoke | **IN** UI auth smoke; **IN** API lifecycle |
| Login + session + profile | UI-AC1 / API-AC1 | Token/session fail → cannot reach invoices | **User/Data** | P1 | Both | @smoke | **IN** UI auth smoke; **IN** API lifecycle |
| Duplicate email | Unique constraint | Two customers share one identity | **Data** | P2 | Both | @regression | **IN** UI duplicate register; **IN** API 409 |
| Bad login | Auth gate | Invalid credentials accepted | **User/Data** | P2 | Both | @regression | **IN** UI wrong password; **IN** API 401 |
| Multi-item cart + qty | UI-AC2 / API-AC2 | Order lines/qty wrong before pay | **Money/User** | P1 | Both | @smoke | **IN** UI purchase; **IN** API lifecycle |
| Qty clamp 0 / 99 | UI-AC2 | Qty 0 removes a line or qty 100 inflates total | **Money** | P2 | **UI** (API min:1 is a different contract) | @regression | **IN** UI cart clamp |
| Empty cart checkout | Invalid transition | Empty invoice | **Money/User** | P2 | **UI** | @regression | **IN** UI empty cart |
| Leftover / shared carts | Isolation | `cart_id` in **sessionStorage** | **Data/Money** | P1 | Both | hygiene | **IN** as preconditions (fresh cart / unique user) |
| COD + billing | UI-AC2 | Cannot pay, or wrong method | **User/Money** | P1 | Both | @smoke | **IN** UI purchase; **IN** API lifecycle |
| Confirm twice (UI) | Assessment | One Confirm = payment check only | **User/Money** | P1 | **UI only** | @smoke | **IN** `CheckoutPage.confirmTwice` inside purchase |
| Invoice POST (API) | API-AC2 | Single POST creates the invoice | **Money/Data** | P1 | **API only** | @smoke | **IN** API lifecycle (one POST) |
| My invoices verification | UI-AC2 | Success screen without list/details | **User/Money** | P1 | **UI** | @smoke | **IN** UI purchase (list + Details). API asserts create-body `invoice_number` / billing, not a separate GET-by-id test |
| Unauthenticated / malformed invoice | API-AC2 gate | Invoice leak or create without login | **Data** | P2 | **API** | @regression | **IN** missing bearer 401; malformed bearer 401 |
| Invoice missing `cart_id` | Payload | Invoice without lines | **Money** | P2 | **API** | @regression | **IN** live **422** |
| Unknown cart GET | Cart | 500 vs 404 | **User** | P2 | **API** | @regression | **IN** live **404** |

**Confirm twice (source-backed, implemented):** `CheckoutPage.confirmTwice` waits for `POST /payment/check` **and** `data-test="payment-success-message"`, then clicks Confirm again and waits for `POST /invoices`. Immediate double-click can fire two checks and create nothing. API does not model this.

**Cart leftover (source-backed):** `cart_id` lives in sessionStorage. Purchase clears session cart after login; empty-cart test seeds `POST /carts` and binds that id. Tests never hardcode a shared `cart_id`.

**Known SUT / contract risks (observed, not invented):**

- **Austria / Florida 422:** Register profile country is `"Austria"`. Postcode lookup for `Austria` + `1234AA` can return faker US address (e.g. Florida). Checkout that then sends `billing_country=NL` with that city gets **422**. UI `fillBilling` waits for `/postcode-lookup?country=NL` and writes that street/city/state. API payload uses **NL** + lookup address (`de Bruijnsingel` / `Idaerd` / `Limburg`).
- **Live vs OpenAPI:** `POST /invoices` is documented **200**; live v5 returns **201**. GET cart schema is **`id` only**; live body may include extra-schema `cart_items`. Login docs list **no** error codes; live wrong password is **401** `{ error: "Unauthorized" }`. Tests assert live success/error codes and treat extra fields as extra-schema.
- **Combination Pliers OOS:** preferred catalog name can be out of stock. UI opens an in-stock product by **exact heading** (`getByRole('heading', { name, exact: true })`), not a `hasText: 'Pliers'` substring that would click Combination Pliers.
- **Public SUT flakes:** register **500**, `connect ETIMEDOUT` on cart POST, occasional `goto` hang. Documented in `ai-prompts/automation-and-debugging.md`. Local `retries` are **0** (`playwright.config.js`: `retries: process.env.CI ? 1 : 0`). Failures were not masked by raising retries or `waitForTimeout`.

## UI / API strategy

**Split:** UI proves the shopper journey (forms, Confirm twice, My invoices). API proves the same lifecycle without the browser, plus auth/payload negatives that are cheaper and more stable as HTTP.

**Framework (`PrismStructure/`):** Playwright JS, two projects (`ui` Chromium + `api` request), `src/pages/` POM, `src/api/` helpers, `src/fixtures/test.js` injects both, `src/data/` factories, `src/utils/` env + unique email/password. No extra npm libraries.

**UI implemented (`tests/ui/`):**

| File | Title (tags in title) | Design IDs |
| --- | --- | --- |
| `auth.spec.js` | `@smoke unique customer can register, log in, and see matching profile` | UI-01 + UI-02 |
| `auth.spec.js` | `@regression login with wrong password is rejected` | UI-05 |
| `auth.spec.js` | `@regression register with an email already in use is rejected` | UI-04 |
| `cart.spec.js` | `@regression cart quantity clamps below 1 and above 99` | UI-06 |
| `cart.spec.js` | `@regression empty cart shows empty copy and hides proceed to checkout` | UI-07 |
| `purchase.spec.js` | `@smoke @regression unique customer can search, update cart, checkout COD, and see invoice` | UI-03 |

**API implemented (`tests/api/`):**

| File | Title (tags in title) | Design IDs |
| --- | --- | --- |
| `lifecycle.spec.js` | `@smoke @regression unique customer can register, login, cart products, and create a COD invoice` | API-01..04 combined |
| `auth.spec.js` | `@regression POST /invoices without a bearer token is rejected` | API-07 |
| `auth.spec.js` | `@regression register with a duplicate email returns 409` | API-05 |
| `auth.spec.js` | `@regression login with a wrong password is rejected` | API-06 |
| `auth.spec.js` | `@regression POST /invoices with a malformed bearer token is rejected` | auth gate (not a second API-07) |
| `auth.spec.js` | `@regression POST /invoices with a token but no cart_id is rejected` | CHK-08 |
| `cart.spec.js` | `@regression GET /carts/{cartId} with an unknown id returns 404` | cart 404 |

**Not automated (deliberate):** dedicated confirm-once UI test (manual TC-M-08; auto waits then second-clicks inside purchase); search no-results; GET invoice by id as its own test; cross-user GET invoice; add-item invalid `product_id` (would hit 8). Spare slots: two UI, one API.

**Commands** (from `PrismStructure/`): `npm test` (6 UI + 7 API); `npm run test:smoke`; `npm run test:regression`; `npm run test:ui`; `npm run test:api`; `npm run report`. Quote `@smoke` / `@regression` in PowerShell.

## Smoke / Regression strategy

Tags are lowercase `@smoke` / `@regression` **in the test title** so `npx playwright test --grep` works. Smoke + regression are **not extra** tests; they are a filter on the same 5–8 set.

**Smoke** = smallest set that proves the shop can sell: unique register/login/profile, COD E2E with Confirm twice + My invoices, API register → token → products → cart → one COD invoice. **3** Playwright tests carry `@smoke` (auth UI, purchase UI, API lifecycle).

**Regression** = negatives/edges inside the cap, plus the two E2E/lifecycle tests so `test:regression` also re-runs the money path. **12** Playwright tests match `@regression` (purchase and lifecycle are dual-tagged). Manual CSV uses Smoke / Regression only (no sanity tag): Smoke on TC-M-01, 03, 04, 06, 07; Regression on TC-M-02, 05, 08.

Workers are **2** (public SUT / Cloudflare was unstable at Playwright’s default parallelism). HTML reporter writes to `playwright-report/` with `open: 'never'`. Artifacts: `test-results/`. Both folders are in `.gitignore`.

## Positive / negative / edge coverage

| Layer | Positive | Negative | Edge |
| --- | --- | --- | --- |
| Manual | TC-M-01, 03, 04, 06, 07 | TC-M-02 (bad login), TC-M-08 (one Confirm, no invoice) | TC-M-05 (qty 0→1, 100→99) |
| UI auto | Auth smoke; purchase E2E | Wrong password; duplicate email; empty cart | Qty clamp |
| API auto | Lifecycle (register 201, login 200 + token, products, cart, invoice **201**) | No bearer 401; duplicate 409; wrong password 401; malformed bearer 401; missing `cart_id` 422; unknown cart 404 | Extra-schema `cart_items` when present; live vs documented invoice status |

**Valid/invalid transitions covered without a ticket state machine:** empty cart ↛ checkout (UI); qty below/above bounds (UI / TC-M-05); duplicate identity (UI + API); failed auth (UI + API); payment-check then invoice-create (UI); first Confirm ↛ invoice (manual TC-M-08); API invoice without token or without `cart_id`.

## Test-data strategy

Placeholders: `ai-prompts/test-data.md`. Runtime factories: `PrismStructure/src/data/` (`users.js`, `products.js`, `billing.js`, `messages.js`).

- **Unique identity:** `users.createUniqueCustomer()` → `user_{timestamp}{hex}@example.com` and `uniquePassword()` (`Aa1!` + hex) unless `TEST_PASSWORD` is set in local `.env`. No shared public customer. No hardcoded JWT; tokens come from `POST /users/login`. Malformed-token test sends the literal `not-a-jwt`, not a captured session token.
- **HIBP:** example password `Welcome1!` in the **manual CSV** meets the 8+ mixed/number/symbol rule but is blocked on live register. Automation does not use it.
- **Catalog:** search `Pliers` / `Hammer`; resolve **in-stock** names via API (`findInStock`). Preferred names Combination Pliers / Thor Hammer remain in data; UI clicks the in-stock heading, not an OOS substring.
- **Qty:** increase to 2 in purchase E2E; clamp 0→1 and 100→99 in cart regression.
- **Billing / COD:** checkout and invoice payload use **NL** + `1234AA` + house `1` and lookup street/city/state. `payment_method: cash-on-delivery`, `payment_details: {}`. Register profile country remains Austria (API `UserRequest`); that pairing is why NL lookup must overwrite Florida faker cities.
- **Isolation:** fresh cart per run; purchase clears `sessionStorage` cart after login; empty-cart test binds a newly created empty `cart_id`.
- **Manual:** unique email `user_{timestamp}@example.com`; `WrongPass1!` for TC-M-02; COD Confirm twice vs once. No live secrets in the CSV.

## Setup Summary

### 1. How I provide project and SUT context to the tool

I keep Cursor on this repo (`Assessment-C1` / `qa-ai-practical-assessment`) and point it at the assessment PDF (Prompt 1), live UI/API URLs, OpenAPI `/docs`, Sprint 5 source notes already in `ai-prompts/`, and the files in play (CSV, specs, page objects). Each later prompt restates the 5–8 cap, Confirm-twice UI-only, unique emails, and “do not invent comment CRUD.” Prompt history is summarized into `ai-prompts/*.md` after each focused session (prompts 1–16 recorded; this file is Prompt 17).

### 2. How I use AI for requirement analysis

Prompt 1 extracted deliverables, ACs, the 5–8 cap, Prism + Cursor, and ambiguities (CRUD/comment vs Toolshop; sanity vs smoke; Confirm twice vs one POST; Selenium folder label vs Playwright-only). Prompt 3 produced the risk tables. I treated the **5–8 cap and Toolshop ACs** as winning conflicts, not “all possible flows.”

### 3. How I use AI for test planning and strategy (UI vs API, smoke vs regression)

Prompt 2 inventoried flows and selected a UI set; Prompt 3 added API recommendations. We combined UI-01+02 and API-01..04 so the cap is not wasted on tiny steps. Smoke is the sell path; regression is negatives/edges **inside** the same count. Dual-tag on purchase and API lifecycle so both greps include the money path.

### 4. How I use AI for manual test case design

Prompt 4 wrote eight CSV rows (register/login, bad login, search, two-line cart, qty clamp, COD Confirm twice, My invoices, confirm-once). Prompt 5 reviewed the file and applied four small precondition/expected-result fixes. Types: 5 positive, 2 negative, 1 edge. Non-functional (perf, a11y, PDF) stayed OUT. ActualResult/Status left blank on purpose.

### 5. How I use AI for automation design

Prompt 7 scaffolded Prism under `PrismStructure/` (config, POM, API helpers, fixtures, data, HTML report, `.env.example` URLs only). Prompts 8–10 implemented 6 UI tests; Prompts 12–13 implemented 7 API tests and deleted wiring specs. Reusable utilities: `createUniqueCustomer`, `confirmTwice`, `fillBilling` (NL lookup), `findInStock`, invoice `create` (one POST). Pinned Playwright; no extra dependencies.

### 6. How I validate and refine AI-generated tests and scripts

I do not accept first-draft locators or documented-only status codes. Live probes and Playwright runs changed copy (duplicate email is “A customer with this email address already exists.” / 409), invoice **201**, GET-cart `cart_items`, login **401**. Prompts 14–16 classified failures (product vs test vs data vs locator vs environment) and applied the smallest signal-based fix. I did not weaken invoice/profile asserts to pass.

### 7. How I use AI for test data, environment assumptions, and API payloads

Prompt 4/11 recorded placeholders and checked payloads against OpenAPI. Register/login/cart/invoice **request** keys match the schema. Environment: shared public SUT; unique users; `workers: 2`; `waitUntil: 'domcontentloaded'`. Assumptions that were wrong (invoice 200, GET cart lines in spec, Austria+1234AA as checkout country) were corrected from live responses, not from the model’s prior notes.

### 8. How I use AI for debugging failing tests and interpreting logs

`ai-prompts/automation-and-debugging.md` holds traces, screenshots, and HTTP bodies. Examples: cart add-item race; invoice 422 from Austria/Florida vs NL; `fillBilling` waiting for a country value `"Austria"` that is not a select option; Combination Pliers OOS substring locator; public 500/ETIMEDOUT. Fixes wait for real signals (`/payment/check`, `/postcode-lookup?country=NL`, exact heading). I did not add `waitForTimeout`, `{ force: true }`, or swallow errors.

Prompt 16 last local validation (2026-08-26, from `PrismStructure/`): full suite retry **13 passed** after a first-run ETIMEDOUT; smoke **3 passed**; regression **12 passed**; `test:ui` retry **6 passed** after register 500; `test:api` **7 passed**. Those HTML reports were generated locally and remain gitignored. I am not claiming committed Passed reports.

### 9. What information I avoid sharing unnecessarily with AI tools

No production secrets (this SUT has none of ours). `.env` is gitignored; `.env.example` is URLs only. I do not paste bearer tokens, real customer PII, or `TEST_PASSWORD` into prompts or markdown. Runtime passwords are generated; reports/artifacts are gitignored. The malformed JWT test uses `not-a-jwt`. Manual `Welcome1!` is an example string, not a live account. I do not ask the model to disable TLS, bypass Cloudflare, or hardcode captured tokens.

### 10. How I would reuse this QA workflow on a real project

Same loop: extract ACs and conflicts → risk + 5–8 (or project-agreed) cap → manual CSV for human-observable quirks → Prism scaffold → UI happy path then negatives → OpenAPI then live probe before API asserts → smoke, then full suite → classify flakes vs defects → prompt history in `ai-prompts/`. Keep unique test data, gitignore secrets and local reports, wait for application signals instead of sleeps, and document live-vs-docs instead of asserting the spec when production disagrees. Dual-tag only the journeys both smoke and regression must re-run.

## Responsible AI and sensitive-data precautions

- Unique synthetic emails (`@example.com`); no real customer accounts.
- Passwords from `uniquePassword()`; optional `TEST_PASSWORD` stays in gitignored `.env`.
- No hardcoded JWT or `Bearer ey…` in source. Tokens are login responses used in memory for that test.
- `.env` gitignored; `.env.example` URLs only.
- HTML reports / `test-results` gitignored so unique emails and tokens from a local run are not pushed.
- Public SUT instability is reported honestly (500, ETIMEDOUT), not hidden with extra retries or looser expects.
- AI output is reviewed against live Toolshop and OpenAPI; prompt history records where the model or the spec was wrong.

## How this workflow can be reused

Recorded artifacts to copy into another product: `project-info.md` (this file), `ai-prompts/` (requirements, design, data, automation/debug, documentation), `FunctionalTestCase/*.csv`, `PrismStructure/` (Playwright Prism layout + smoke/regression scripts), and a public git remote. Swap SUT URLs in `.env.example`, regenerate unique data factories, re-probe the real OpenAPI, and keep the same cap + tag + isolation rules. Do not reuse this checkout’s NL billing or Confirm-twice waits on an app that does not have those quirks — treat them as SUT-specific, documented in Prompt 9–16 debugging notes.
