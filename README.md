# QA AI Practical Assessment

Playwright (Prism) UI + API testing for [Practice Software Testing](https://practicesoftwaretesting.com/).

## Repository layout

```
qa-ai-practical-assessment/
├── FunctionalTestCase/
│   └── functional-test-cases.csv
├── PrismStructure/
├── ai-prompts/
├── project-info.md
└── README.md
```

## Manual functional tests

Human-executable cases (8 / 8 cap) are in [`FunctionalTestCase/functional-test-cases.csv`](FunctionalTestCase/functional-test-cases.csv).

- Columns: `TestCaseID`, `RequirementID`, `Title`, `TestType`, `Tag`, `Priority`, `Preconditions`, `Steps`, `TestData`, `ExpectedResult`, `ActualResult`, `Status`
- IDs: `TC-M-01` … `TC-M-08` mapped to UI-AC1 / UI-AC2
- Tags: **Smoke** or **Regression** only (Smoke + Regression count toward the 5–8 cap)
- `ActualResult` and `Status` are blank until a tester executes the suite
- Shared placeholders (unique email, COD, qty bounds, expected copy): `ai-prompts/test-data.md`

## Playwright (Prism) automation

Framework lives in [`PrismStructure/`](PrismStructure/). Playwright JavaScript, page objects, API helpers, HTML reports. Full how-to: [`PrismStructure/README.md`](PrismStructure/README.md).

```powershell
cd PrismStructure
copy .env.example .env
npm install
npx playwright install chromium
```

`.env.example` has **URLs only**. Copy it to `.env` (gitignored). Do not commit passwords or tokens. Unique emails are generated in `PrismStructure/src/data/users.js`.

### Commands (from `PrismStructure/`)

| Command | What it runs |
| --- | --- |
| `npm test` | Full suite |
| `npm run test:smoke` | Tests tagged `@smoke` |
| `npm run test:regression` | Tests tagged `@regression` |
| `npm run report` | Open HTML report |

Quote the tag if you call grep from PowerShell: `npx playwright test --grep "@smoke"`.

Tags are lowercase `@smoke` / `@regression` in the test title. Reports: `PrismStructure/playwright-report/` (HTML) and `PrismStructure/test-results/` (artifacts). Those folders are gitignored until the business suite is green.

UI tests (**6 / 8**, inside the 5–8 cap): `tests/ui/auth.spec.js` (register+login+profile `@smoke`; invalid login `@regression`; duplicate email `@regression`), `tests/ui/cart.spec.js` (qty clamp `@regression`; empty cart `@regression`), and `tests/ui/purchase.spec.js` (COD E2E tagged **both** `@smoke` and `@regression`).

API tests (**7 / 8**, inside the 5–8 cap): `tests/api/lifecycle.spec.js` (`@smoke @regression` register → token → products → cart → COD invoice); `tests/api/auth.spec.js` (`@regression` invoice without bearer → 401; duplicate register → 409; wrong-password login → 401; malformed bearer → 401; invoice missing `cart_id` → 422); `tests/api/cart.spec.js` (`@regression` GET unknown cart → 404).
