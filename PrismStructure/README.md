# Prism Structure — Playwright (Prism) Toolshop

UI + API automation for [Practice Software Testing](https://practicesoftwaretesting.com/) using Playwright JavaScript and page objects.

UI tests live in `tests/ui/`: auth (`@smoke` register→login→profile; `@regression` wrong password) and purchase (`@smoke @regression` search, multi-item cart, COD, Confirm twice, My invoices). Remaining UI-04/06/07 and API-01..07 are later prompts. One API wiring test still proves the `api` project runs.

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
| `npm test` | `npx playwright test` | Full suite (UI auth + API wiring) |
| `npm run test:smoke` | `--grep "@smoke"` | Tests tagged `@smoke` |
| `npm run test:regression` | `--grep "@regression"` | Tests tagged `@regression` |
| `npm run test:ui` | `--project=ui` | Browser UI project only |
| `npm run test:api` | `--project=api` | API request project only |
| `npm run report` | `npx playwright show-report playwright-report` | Open the last HTML report |

Quote `@smoke` / `@regression` if you run `npx playwright test --grep` directly in PowerShell (`@` is special there).

## Tags

Put `@smoke` or `@regression` in the **test title** (lowercase, grep-friendly). Playwright `--grep` filters on that title.

- `@smoke` — smallest set that proves the shop can sell (auth + purchase E2E; API-01..04 later)
- `@regression` — negatives/edges inside the 5–8 cap (invalid login; purchase E2E also tagged so `test:regression` includes it; UI-04/06/07 / API-05..07 later)

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
