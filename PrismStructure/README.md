# Prism Structure — Playwright (Prism) Toolshop

Local how-to for the Playwright JavaScript suite in this folder. The assessment README (overview, known SUT behavior, troubleshooting) is at the [repository root](../README.md). Do not contradict the scripts below.

UI + API automation for [Practice Software Testing](https://practicesoftwaretesting.com/). UI: **6** tests. API: **7** tests. Confirm twice is UI-only (`CheckoutPage.confirmTwice`); API invoice is one `POST /invoices`.

## Setup (Windows PowerShell)

```powershell
cd PrismStructure
copy .env.example .env
npm install
npx playwright install chromium
```

`.env` is gitignored. `.env.example` contains **URLs only**. Unique emails and passwords come from `users.createUniqueCustomer()`. Optional `TEST_PASSWORD` in `.env` overrides `uniquePassword()` — do not commit it.

## npm scripts

Verified against `package.json` (run from this folder):

| Script | Command | What it runs |
| --- | --- | --- |
| `npm test` | `npx playwright test` | Full suite (6 UI + 7 API) |
| `npm run test:ui` | `--project=ui` | Browser UI project only |
| `npm run test:api` | `--project=api` | API request project only |
| `npm run test:smoke` | `--grep "@smoke"` | Tests tagged `@smoke` |
| `npm run test:regression` | `--grep "@regression" --pass-with-no-tests` | Tests tagged `@regression` |
| `npm run report` | `npx playwright show-report playwright-report` | Open the last HTML report |

Quote `@smoke` / `@regression` if you run `npx playwright test --grep` directly in PowerShell.

Config (`playwright.config.js`): projects `ui` and `api`; HTML reporter to `playwright-report/` with `open: 'never'`; `workers: 2`; grep is not in the config file.

## Reports

After `npm test` (or any test script), run `npm run report` or open `playwright-report\index.html`. `playwright-report/` and `test-results/` are gitignored.

## Test data

Factories: `src/data/`. Placeholders: `../ai-prompts/test-data.md`. Manual CSV: `../FunctionalTestCase/functional-test-cases.csv`.

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
