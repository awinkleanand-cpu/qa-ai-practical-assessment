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

Setup and run instructions for Playwright/Prism will be added as the automation is built.
