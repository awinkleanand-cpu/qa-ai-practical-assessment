# QA AI Practical Assessment

Playwright (Prism) UI and API tests for [Practice Software Testing Toolshop](https://practicesoftwaretesting.com/). Scope is **registered-user checkout and invoice verification** (Cash on Delivery), not catalog browsing as a product, guest checkout, admin, or other payment methods.

| Type | Count | Location | Cap (5–8) |
| --- | --- | --- | --- |
| Manual | **8** | [`FunctionalTestCase/functional-test-cases.csv`](FunctionalTestCase/functional-test-cases.csv) (`TC-M-01` … `TC-M-08`) | Yes |
| UI automation | **7** | [`PrismStructure/tests/ui/`](PrismStructure/tests/ui/) | Yes |
| API automation | **7** | [`PrismStructure/tests/api/`](PrismStructure/tests/api/) | Yes |

`@smoke` and `@regression` are tags on those same tests, not extra cases. Confirm twice is **UI-only**. The API creates an invoice with **one** `POST /invoices`.

Framework how-to (same scripts): [`PrismStructure/README.md`](PrismStructure/README.md). Assessment write-up: [`project-info.md`](project-info.md).

## Prerequisites

- **Windows** with PowerShell (commands below are PowerShell-safe)
- **Node.js** and **npm** (needed to install `@playwright/test` **1.62.1**)
- Network access to the public SUT:
  - UI: `https://practicesoftwaretesting.com`
  - API: `https://api.practicesoftwaretesting.com`

Chromium is installed after dependencies with `npx playwright install chromium`. There is no Selenium, Cypress, Allure, faker, or `dotenv` package in this repo.

## Installation

From the repository root:

```powershell
cd PrismStructure
copy .env.example .env
npm install
npx playwright install chromium
```

All npm scripts run from **`PrismStructure/`** (that folder has `package.json`). There is no root `package.json`.

## Configuration

Copy [`PrismStructure/.env.example`](PrismStructure/.env.example) to `PrismStructure/.env`. The example file contains **URLs only**:

```
UI_BASE_URL=https://practicesoftwaretesting.com
API_BASE_URL=https://api.practicesoftwaretesting.com
```

- `.env` is gitignored (see [`.gitignore`](.gitignore)). Do not commit passwords, tokens, or JWTs.
- `PrismStructure/src/utils/env.js` loads `.env` with `fs`/`path` and falls back to the same public URLs if keys are missing.
- Registration passwords default to `uniquePassword()` (`Aa1!` plus hex) in `PrismStructure/src/utils/unique.js`. You may set **`TEST_PASSWORD`** in local `.env` as an optional override. Do not put a real password in this README or in `.env.example`.
- Unique emails are generated at runtime (`user_{timestamp}{hex}@example.com`). Do not reuse a static customer on the public shop.

## Test data

| Kind | Location |
| --- | --- |
| Manual placeholders (unique email pattern, COD, qty bounds, expected copy) | [`ai-prompts/test-data.md`](ai-prompts/test-data.md) |
| Manual cases | [`FunctionalTestCase/functional-test-cases.csv`](FunctionalTestCase/functional-test-cases.csv) |
| Automation factories | [`PrismStructure/src/data/`](PrismStructure/src/data/) (`users.js`, `products.js`, `billing.js`, `messages.js`) |

Each automated registration must call `users.createUniqueCustomer()`. Catalog names prefer Combination Pliers / Thor Hammer; UI tests open an **in-stock** product by exact heading. Checkout and API invoice billing use **NL** + `1234AA` + house `1` and postcode-lookup street/city/state (`de Bruijnsingel` / `Idaerd` / `Limburg`). Register profile country remains Austria (API `UserRequest`).

## Commands

Run these from `PrismStructure/`. Only scripts that exist in [`PrismStructure/package.json`](PrismStructure/package.json) are listed.

| Command | Script | What it runs |
| --- | --- | --- |
| `npm test` | `npx playwright test` | Full suite (7 UI + 7 API = 14 tests) |
| `npm run test:ui` | `npx playwright test --project=ui` | Browser UI project only (`tests/ui/`) |
| `npm run test:api` | `npx playwright test --project=api` | API request project only (`tests/api/`) |
| `npm run test:smoke` | `npx playwright test --grep "@smoke"` | Tests whose title contains `@smoke` (currently 3) |
| `npm run test:regression` | `npx playwright test --grep "@regression" --pass-with-no-tests` | Tests whose title contains `@regression` (currently 13; purchase and API lifecycle are dual-tagged) |
| `npm run report` | `npx playwright show-report playwright-report` | Open the last HTML report |

Playwright projects, reporter, and workers come from [`PrismStructure/playwright.config.js`](PrismStructure/playwright.config.js):

- Projects: **`ui`** (Desktop Chrome, `baseURL` from `UI_BASE_URL`) and **`api`** (`baseURL` from `API_BASE_URL`, `Accept: application/json`)
- Grep is **not** in the config; smoke/regression filters are npm `--grep` flags
- `workers: 2`; local `retries: 0` (`retries` is `1` only when `CI` is set)
- Reporter: `list` plus HTML (`outputFolder: playwright-report`, `open: 'never'`)
- Artifacts: `test-results/`

If you call grep yourself in PowerShell, **quote the tag** (`@` is special):

```powershell
npx playwright test --grep "@smoke"
npx playwright test --grep "@regression"
```

`npm run test:smoke` and `npm run test:regression` already quote the tag in `package.json`, so those npm commands do not need extra quotes.

## Reports

Committed execution evidence lives in **[`PrismStructure/execution-reports/`](PrismStructure/execution-reports/)** (dated HTML snapshot plus [`execution-summary.md`](PrismStructure/execution-reports/execution-summary.md)). That folder is **not** gitignored.

Local HTML output is regenerated into **`PrismStructure/playwright-report/`** (`index.html`). Failure traces/screenshots go to **`PrismStructure/test-results/`**. Those two live folders stay **gitignored**.

Generate and open a local report:

```powershell
cd PrismStructure
npm test
npm run report
```

If the report server is not needed, open `PrismStructure\playwright-report\index.html` after a run, or the committed copy at `PrismStructure\execution-reports\playwright-html\index.html`. `open: 'never'` means Playwright will not auto-launch the report when tests finish.

## Repository structure

```
qa-ai-practical-assessment/
├── FunctionalTestCase/
│   └── functional-test-cases.csv
├── PrismStructure/
│   ├── .env.example
│   ├── package.json
│   ├── playwright.config.js
│   ├── execution-reports/  committed HTML snapshot + execution-summary.md
│   ├── src/
│   │   ├── pages/          UI page objects (*Page)
│   │   ├── api/            API helpers (*ApiPage)
│   │   ├── fixtures/       test.extend — pages + API clients
│   │   ├── data/           users, products, billing/COD, expected copy
│   │   └── utils/          env loader, unique email/password
│   └── tests/
│       ├── ui/             auth.spec.js, cart.spec.js, purchase.spec.js
│       └── api/            lifecycle.spec.js, auth.spec.js, cart.spec.js
├── ai-prompts/             requirements, design, data, debug notes, this README prompt log
├── project-info.md
├── .gitignore
└── README.md
```

Generated (gitignored): `PrismStructure/node_modules/`, `PrismStructure/.env`, `PrismStructure/playwright-report/`, `PrismStructure/test-results/`. Committed snapshot: `PrismStructure/execution-reports/`.

## Known application behavior

These are live Toolshop behaviors the suite accounts for; they are not test bugs.

**Invoice Confirm twice (UI).** The first Confirm only runs `POST /payment/check`. The invoice is created on the **second** Confirm (`POST /invoices`). `CheckoutPage.confirmTwice` waits for the check response **and** `data-test="payment-success-message"`, then clicks Confirm again. A fast double-click can fire two checks and create nothing. Confirm-once (no invoice) is UI `@regression` plus manual TC-M-08 (`CheckoutPage.confirmOnce`).

**Invoice API.** One `POST /invoices` with billing + `payment_method: cash-on-delivery` + `cart_id` + `payment_details: {}`. There is no Confirm-twice API test.

**OpenAPI vs live.** OpenAPI documents `POST /invoices` as **200**; live v5 returns **201**. Tests assert **201**. GET cart schema documents **`id` only**; live bodies may include extra-schema `cart_items` (asserted when present). Login docs list no error codes; live wrong password is **401**.

**NL postcode vs Austria / Florida 422.** Register profile country is `"Austria"`. Lookup of `Austria` + `1234AA` can return a faker US address (for example Florida). Checkout that then sends `billing_country=NL` with that city gets **422**. UI `fillBilling` waits for `/postcode-lookup?country=NL` and writes that street/city/state. API invoice payload uses **NL** + the lookup address.

**Combination Pliers out of stock.** Preferred catalog names can be OOS. UI tests open an in-stock product by **exact heading** (`getByRole('heading', { name, exact: true })`), not a `hasText: 'Pliers'` substring that would click Combination Pliers.

**Public SUT instability.** Shared shop can return register **500**, `connect ETIMEDOUT` on cart POST, or slow `goto`. Local retries stay **0**. Failures are not masked with `waitForTimeout` or extra retries.

**Cart leftover.** `cart_id` lives in **sessionStorage**. Purchase clears the session cart after login; the empty-cart test seeds `POST /carts` and binds that id. Tests never hardcode a shared `cart_id`.

## Troubleshooting

| Symptom | What to do |
| --- | --- |
| Flakes / Cloudflare / overloaded public SUT | Workers are already **2** in `playwright.config.js` (default Playwright parallelism was unstable). Re-run the same command; do not raise local retries to hide 500/ETIMEDOUT. |
| `goto` hangs or times out on `load` | Page `open()` methods use `waitUntil: 'domcontentloaded'` for this reason. Do not switch them back to full `load` on this SUT. |
| Duplicate-email / 409 on register | Use a new unique email every run (`createUniqueCustomer()`). Do not hardcode an address. |
| Unexpected cart lines or empty-cart test sees items | Clear leftover `cart_id` / `cart_quantity` in sessionStorage, or use a fresh browser context. `CartPage.clearSessionCart()` / `bindCartId()` already do this in UI tests. |
| PowerShell: `--grep @smoke` does nothing or errors | Quote the tag: `npx playwright test --grep "@smoke"`. Prefer `npm run test:smoke`. |
| Missing HTML report | Run tests first (`npm test` or another script above), then `npm run report`, or open `playwright-report\index.html`. That live folder is gitignored. Committed evidence is `PrismStructure/execution-reports/`. |
| Invoice POST 422 (city / country) | Billing country must be **NL** with postcode-lookup city/state, not Austria + Florida faker data. |
| Combination Pliers click / OOS | Open the product by exact in-stock heading, not a Pliers substring. |

## Manual functional tests

Human-executable cases (8 / 8) are in [`FunctionalTestCase/functional-test-cases.csv`](FunctionalTestCase/functional-test-cases.csv).

- Columns: `TestCaseID`, `RequirementID`, `Title`, `TestType`, `Tag`, `Priority`, `Preconditions`, `Steps`, `TestData`, `ExpectedResult`, `ActualResult`, `Status`
- IDs: `TC-M-01` … `TC-M-08` mapped to UI-AC1 / UI-AC2
- Tags: **Smoke** or **Regression** only
- `ActualResult` and `Status` are filled **Passed** from the 2026-08-26 green run (`npx playwright test`, 14 passed), mapped to the UI specs listed in [`PrismStructure/execution-reports/execution-summary.md`](PrismStructure/execution-reports/execution-summary.md)

## Playwright tests (what exists)

UI (**7**): `tests/ui/auth.spec.js` (register+login+profile `@smoke`; invalid login `@regression`; duplicate email `@regression`), `tests/ui/cart.spec.js` (qty clamp `@regression`; empty cart `@regression`), `tests/ui/purchase.spec.js` (COD E2E `@smoke` `@regression`; confirm-once `@regression`).

API (**7**): `tests/api/lifecycle.spec.js` (`@smoke` `@regression` register → token → products → cart → COD invoice); `tests/api/auth.spec.js` (`@regression` invoice without bearer → 401; duplicate register → 409; wrong-password login → 401; malformed bearer → 401; invoice missing `cart_id` → 422); `tests/api/cart.spec.js` (`@regression` GET unknown cart → 404).
