# Prism Structure — Playwright (Prism) Toolshop

UI + API automation for [Practice Software Testing](https://practicesoftwaretesting.com/) using Playwright JavaScript and page objects.

UI tests live in `tests/ui/`: **6 tests** (inside the 5–8 cap). Auth (`@smoke` register→login→profile; `@regression` wrong password; `@regression` duplicate email), cart (`@regression` qty clamp; `@regression` empty cart), and purchase (`@smoke @regression` search, multi-item cart, COD, Confirm twice, My invoices).

API tests live in `tests/api/`: **7 tests** (inside the 5–8 cap). Lifecycle (`@smoke @regression` unique register → login token → products → cart → add two in-stock items → GET cart → COD invoice); `@regression` unauthenticated `POST /invoices` (401); `@regression` duplicate register (409); `@regression` wrong-password login (401); `@regression` malformed bearer on invoice (401); `@regression` invoice missing `cart_id` (422); `@regression` GET unknown cart (404). The API wiring spec was removed.

## Setup (Windows PowerShell)

```powershell
cd PrismStructure
copy .env.example .env
npm install
npx playwright install chromium
```

`.env` is gitignored. `.env.example` contains **URLs only** (no passwords or tokens). Unique emails and passwords are generated at runtime (`users.createUniqueCustomer()`). Override the password with `TEST_PASSWORD` in `.env` if needed — do not commit it.

## npm scripts

| Script | Command | What it runs |
| --- | --- | --- |
| `npm test` | `npx playwright test` | Full suite (6 UI tests + 7 API tests) |
| `npm run test:smoke` | `--grep "@smoke"` | Tests tagged `@smoke` |
| `npm run test:regression` | `--grep "@regression"` | Tests tagged `@regression` |
| `npm run test:ui` | `--project=ui` | Browser UI project only |
| `npm run test:api` | `--project=api` | API request project only |
| `npm run report` | `npx playwright show-report playwright-report` | Open the last HTML report |

Quote `@smoke` / `@regression` if you run `npx playwright test --grep` directly in PowerShell (`@` is special there).

## Tags

Put `@smoke` or `@regression` in the **test title** (lowercase, grep-friendly). Playwright `--grep` filters on that title.

- `@smoke` — smallest set that proves the shop can sell (auth + purchase E2E; API lifecycle)
- `@regression` — negatives/edges inside the 5–8 cap (invalid login; duplicate email; qty clamp; empty cart; purchase E2E and API lifecycle also tagged so `test:regression` includes them; API unauthenticated invoice; API duplicate register; API wrong-password login; API malformed bearer; API invoice missing `cart_id`; API unknown cart 404)

## Reports

HTML reporter writes to `PrismStructure/playwright-report/` (`open: 'never'`). Artifacts go to `PrismStructure/test-results/`. Both folders are gitignored until the business suite is green and reports need to be committed as execution evidence.

## Layout

```
PrismStructure/
├── playwright.config.js
├── src/pages/          UI page objects (*Page)
├── src/api/            API helpers (*ApiPage)
├── src/fixtures/       test.extend — injects pages + API clients
├── src/data/           users, products, billing/COD, expected copy
├── src/utils/          env loader, unique email
└── tests/ui|api/       specs
```

## Test data

Placeholders come from `ai-prompts/test-data.md` via `src/data/`. Each registration run must call `users.createUniqueCustomer()` so the email and password are unique (`user_{timestamp}{random}@example.com`).

Confirm twice is **UI-only** (`CheckoutPage.confirmTwice`). API invoice is **one POST** (`InvoiceApiPage.create`).
