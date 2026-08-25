# AI Prompts – Requirements and Planning

Record prompts and responses used for understanding the Toolshop flow, identifying risks, and drafting the test plan.

---

## Entry 1 — Prompt 1: Extract project requirements from the QA Practical Assessment PDF

**Date:** 2026-08-25

### Prompt

Read the attached QA Practical Assessment document (`QA Practical Assessment.pdf`).

Extract:

1. Mandatory deliverables
2. UI and API acceptance criteria
3. Test-count restrictions
4. Required tools and framework
5. Submission structure
6. Important special instructions

Do not create code yet. Highlight ambiguous or conflicting requirements.

Do not write application/test code. Do not create Playwright files. Record this prompt plus the extraction as the first prompt-history entry.

### AI Response (short summary)

Full extraction of the six required sections from the 15-page participant guide, plus a dedicated ambiguities/conflicts section. Source of truth is the PDF. No automation or test code was created.

### Validation Notes

- Extracted against the full PDF (15 pages), not only the briefing.
- Conflicts flagged: Core AC CRUD/comment vs Toolshop ecommerce; 5–8 tests per type vs “all possible flows”; confirm-twice vs API invoice payload; Prism vs Selenium in the repo tree; CSV filename vs folder name; `test-data.md` listed in the prompts folder but missing from the required-structure tree; skipped numbering in Common QA Requirements.
- Local file updated for prompt history only; no git commit (user did not ask to commit).

---

## 1. Mandatory deliverables

### Part A — AI Workflow Foundation (`project-info.md`)

Submit `project-info.md` covering:

1. What the project is about
2. Primary AI tool(s) used (e.g., ChatGPT, Cursor)
3. How project and SUT context is provided to the tool
4. How AI is used for requirement analysis
5. How AI is used for test planning and strategy (UI vs API, smoke vs regression)
6. How AI is used for manual test case design (functional, edge, negative, non-functional)
7. How AI is used for automation design (framework, structure, data, reusable utilities)
8. How AI-generated test cases and scripts are validated and refined
9. How AI is used for test data generation, environment assumptions, and API payloads
10. How AI is used for debugging failing tests and interpreting logs
11. What information is avoided sharing with AI tools
12. How this QA workflow would be reused on a real project

*(PDF numbering has a duplicated “2.” and some later items are unnumbered; the list above is the intended content.)*

The `project-info.md` template also asks for: Primary AI Tool(s), Application Under Test (PracticeSoftwareTesting Toolshop – Checkout & Application Flow), Assessment Start/Submission Date, Project Summary (1–3 sentences), Tools Used, and Setup Summary (same 10 workflow questions as above).

### Common QA Requirements (regardless of option)

1. **Requirement and risk analysis** specific to the application under test
2. **project-info** document (Project Info, UI, API, positive/negative/edge, Smoke/Regression)
3. **Manual test suite** for key flows (Manual / Functional Test case)
4. **UI automation tier** (Playwright) covering smoke **and** E2E/regression flows
5. *(PDF numbering skips 5)*
6. **API automation tier** (Playwright) covering core lifecycle APIs
7. **Test data strategy** (how data is designed and/or generated, including via AI)
8. **Evidence of test execution**: logs, reports, screenshots, or API collections
9. *(PDF numbering skips 9)*
10. **README** with test setup and execution instructions
11. **Full prompt history** related to test design, automation, and debugging
12. All planning, design, testing, debugging, review, and reflection artifacts in a clear repository/folder structure

### Completeness / quality gates

- Execution reports must be included; **status of all test cases should be ‘Passed’**
- At least one automation suite must be **executable from the README** without manual intervention beyond environment setup
- Prompt history must show **thoughtful AI use**, not unreviewed copy-paste
- Submit over **public git** and share the URL
- **Iterative git commits / pushes**, not a single dump
- Stay within Cursor **monthly token limit**; do not expand automation surface at the expense of lifecycle artifacts

---

## 2. UI and API acceptance criteria

### System under test

| Layer | URL |
| --- | --- |
| UI | https://practicesoftwaretesting.com/ |
| API docs | https://api.practicesoftwaretesting.com/api/documentation |

The SUT is a **small ecommerce application** (Practice Software Testing / Toolshop). Suggested focus: **new user checkout + invoice verification**.

UI instruction: *include all the possible flows that can be tested, categorize them as sanity or regression.*

**Invoice special rule (UI):** press **Confirm twice** to generate an invoice. Repeated in the doc as “For Invoiceid press confirm button on application twice.”

### UI high-level flow examples (treat as suggested ACs)

**AC1: User Registration & Login**  
The user should be able to register with valid details, log in using the registered credentials, and verify their profile information successfully.

**AC2: End-to-End Purchase Flow**  
The user should be able to browse products, add multiple items to the cart (including updating quantity), complete checkout using **Cash on Delivery**, and successfully view the generated invoice under **My Invoices**.

### API high-level flow examples (treat as suggested ACs)

**AC1: User Authentication & Cart Creation**  
A new user should be able to register via API, log in with the registered credentials, obtain a valid bearer token, and create a new cart successfully.

**AC2: Product Selection & Invoice Generation**  
Using the bearer token, the user should be able to retrieve products, add selected products to the cart, verify cart contents, and successfully generate an invoice with the required customer and order details.

Example invoice generation POST body:

```json
{
  "billing_street": "Zoey Shore",
  "billing_city": "Hesselbury",
  "billing_state": "Florida",
  "billing_country": "TG",
  "billing_postal_code": "1234AA",
  "payment_method": "cash-on-delivery",
  "cart_id": "01kx0dctdxxg6sm4wtt1t0nf9r",
  "payment_details": {}
}
```

### Core Acceptance Criteria (QA perspective)

The Core submission should show that:

1. Clear **test objectives and scope** are derived from the application or tickets
2. There is a **traceable mapping** from requirements / state machine to test scenarios and cases
3. **Valid and invalid status transitions** are covered (manual + API automation for the state machine)
4. **UI tests** verify key user flows: create, list, view, update, comment, search, error handling
5. **API tests** verify key user flows: create, list, view, update, comment, search, error handling
6. Test data is well-planned (e.g., different priorities, statuses, edge-case titles/descriptions)
7. At least one automation suite can be executed from the README without manual intervention beyond environment setup
8. Prompt history shows thoughtful AI use, not copy-paste of unreviewed outputs

**Note:** Items 3–6 look like leftover criteria from a ticket/comment/state-machine app, not Toolshop. See Ambiguities.

Core vs Stretch: a **clean, well-documented Core alone is a strong result**. Both are judged the same way; the difference is depth of evidence. A smaller well-tested Core with strong artifacts beats a large, superficially tested surface.

---

## 3. Test-count restrictions

**Hard cap (What Counts as Complete):**

> There should not be more than **5–8 test cases of each type (manual + UI + API)** which includes **@Smoke, @regression**.

Interpretation to confirm:

- Cap applies **per type**: Manual ≤ 5–8, UI automation ≤ 5–8, API automation ≤ 5–8
- `@Smoke` and `@regression` are **included in** that 5–8, not extra
- Conflicts with “include all the possible flows that can be tested” (see Ambiguities)

Implied tagging: tests should be categorized/tagged as Smoke (PDF also says “sanity”) vs Regression.

---

## 4. Required tools and framework

**Mandatory for this assignment:**

- **Playwright** using **Prism Framework**
- **Cursor AI** (assignment must be done in Playwright using Cursor; manage within monthly limit)

**README must include:**

- What framework is used
- How to run it
- Where test data lives and other fields required to run automation or manual cases
- Different commands for **Smoke** and **Regression**
- Where final reports are generated

**Cursor usage guidance (Quick Tips, not graded as a tool list but important):**

- Default **Auto / Composer 2.5 / lighter model** for requirements, test design, risk analysis, ai-prompts docs (~70% of work)
- **Sonnet 4.6** (or dedicated coding model) only for page objects, spec files, playwright.config, API helpers, debugging failures
- Auto/Composer for small README/CSV/folder edits
- Use **Caveman skill**: short focused prompts, one task per chat
- Summarize chats into `ai-prompts/*.md` after each focused session

**Who Takes Part** mentions Selenium, Cypress, REST Assured, Postman, Karate as common competency tools — **not** the required stack for this assignment. The assignment-specific line is Playwright + Prism + Cursor.

**PrismStructure folder annotation** says “Playwright/Selenium For API+UI+ Execution Report” — Selenium is mentioned only in the folder label, not as an allowed alternative for this assignment.

---

## 5. Submission structure

Required repository layout from the PDF:

```
qa-ai-practical-assessment/
├── FunctionalTestCase (.csv)
├── PrismStructure (Playwright/Selenium For API+UI+ Execution Report)
├── project-info.md
├── readme.md
└── ai-prompts/
    ├── requirements-and-planning.md
    ├── test-design.md
    ├── automation-and-debugging.md
    └── documentation-and-summary.md
├── .Cursor/Tool
    ├── Rules
    ├── Skills
    └── agent/mcp (Optional)
```

**Public git:** submit over public git and share the URL. Existing repo: `https://github.com/awinkleanand-cpu/qa-ai-practical-assessment`. Iterative commits/pushes required.

### AI prompts folder — expected files and entry format

The later “AI Prompts Folder and History Expectations” section lists **five** files (adds `test-data.md`):

```
ai-prompts/
├── requirements-and-planning.md
├── test-design.md
├── test-data.md
├── automation-and-debugging.md
└── documentation-and-summary.md
```

Per-file entry formats:

| File | Required fields per entry |
| --- | --- |
| requirements-and-planning.md | Prompt; AI Response (short summary) |
| test-design.md | Prompt; AI Response Summary; Validation Notes |
| test-data.md | Prompt; AI Response Summary; Validation Notes |
| automation-and-debugging.md | Prompt; AI Response Summary; Debugging Outcome |
| documentation-and-summary.md | Prompt; AI Response Summary; Edits You Made; Reason for Edits |

### Suggested phase-wise flow (can differ)

1. QA doc + requirements + risk doc → Auto
2. Manual CSV + ai-prompts (record as you go) → Auto + summarize to `.md`
3. UI/API automation (`PrismStructure-toolshop-playwright`) → Sonnet
4. `npm test` smoke → full suite → execution-evidence screenshots → Auto/Composer/GPT-5
5. Git push → done

---

## 6. Important special instructions

- **Invoice UI:** press **Confirm twice** to generate invoice / Invoice ID.
- **Iterative development while prompting**; do not dump everything in one chat or one commit.
- **Git push must be iterative**, not a single commit.
- **All test cases in execution reports must be Passed.**
- Stay within **Cursor monthly limit**; Auto for ~70% of work; Sonnet only for automation + hard debugging.
- Use **Caveman skill** (short, one-task prompts) to save tokens and make prompt history copyable.
- After each focused session, **summarize chat into the matching `ai-prompts/*.md` file**.
- Exercise is **self-paced within one week**; Core project scoped at **~5–10 focused hours**; remaining time for artifacts. Do not expand automation at the expense of artifacts.
- Not a pass/fail exam; **how AI was used** (requirement analysis, strategy, prompt design, coverage decisions, debugging, reflection) matters as much as scripts running.
- **Core alone is a strong result**; smaller well-tested Core with strong artifacts beats large shallow coverage.
- Suggested local folder name in Phase 3: `PrismStructure-toolshop-playwright` (may differ from the required tree name `PrismStructure`).
- `.Cursor` Rules and Skills are required; agent/mcp is optional.
- Suggested prompt splits: extract ACs in one chat; CSV rows for login negatives in another; Prism page objects in another — do not mix in one giant thread.

---

## Ambiguous or conflicting requirements

These should be resolved by judgment (prefer Toolshop-specific ACs + the 5–8 cap + Playwright/Prism) and noted in `project-info.md` / risk analysis.

### 1. Core AC CRUD/comment vs Toolshop ecommerce flows

- **SUT / high-level ACs** describe ecommerce: register, login, profile, browse, cart, quantity, COD checkout, invoices.
- **Core AC items 3–6** describe a different product: state machine, status transitions, create/list/view/update/**comment**/search, priorities, statuses, edge-case titles/descriptions.

**Conflict:** comment and ticket-style state machine do not exist as first-class Toolshop flows.  
**Recommended interpretation:** map Core AC *intent* (happy path + negative + error handling + traceability) onto Toolshop entities (user, cart, product, invoice), not invent a comment feature.

### 2. “All possible flows” vs 5–8 tests per type

- UI section: *include all the possible flows that can be tested*.
- Completeness: *not more than 5–8 test cases of each type (manual+UI+API)* including @Smoke and @regression.

**Conflict:** exhaustive coverage vs a hard cap.  
**Recommended interpretation:** the 5–8 cap wins. Select the highest-risk Toolshop flows (the given AC1/AC2 plus a few negatives/edges) and categorize them Smoke vs Regression. Document out-of-scope flows in risk analysis.

### 3. Sanity vs Smoke terminology

UI text says categorize as **sanity or regression**. Tags later say **@Smoke, @regression**. README asks for Smoke and Regression commands.

**Ambiguity:** sanity vs smoke used interchangeably.  
**Recommended interpretation:** use **@Smoke** (and treat “sanity” as the same bucket) plus **@Regression**.

### 4. Confirm twice (UI) vs invoice POST payload (API)

- UI: press Confirm **twice** to generate invoice.
- API: single POST with billing/payment/cart_id; no “confirm twice” step.

**Ambiguity:** is double-confirm UI-only, or must API tests somehow model two confirms?  
**Recommended interpretation:** UI automation must click Confirm twice. API uses the documented payload once. Record this as an SUT quirk, not an API requirement.

### 5. Prism vs Selenium

- Assignment line: **Playwright (Prism Framework) and Cursor**.
- Required tree: `PrismStructure(Playwright/Selenium For API+UI+ Execution Report)`.

**Conflict:** Selenium in the folder annotation vs Playwright-only assignment.  
**Recommended interpretation:** Playwright + Prism only. Do not add Selenium.

### 6. FunctionalTestCase CSV vs folder name

Tree shows `FunctionalTestCase (.csv)` — could mean a **file** named `FunctionalTestCase.csv` or a **folder** containing a CSV.

**Recommended interpretation:** keep a `FunctionalTestCase/` folder with a `.csv` inside (current local layout), and mention the path in README so evaluators can find it.

### 7. `test-data.md` missing from required-structure tree

- Required repo tree under `ai-prompts/` lists 4 files (no `test-data.md`).
- “AI Prompts Folder and History Expectations” lists 5 files **including `test-data.md`**.

**Recommended interpretation:** include **`test-data.md`**. Extra prompt-history evidence is aligned with “full prompt history.”

### 8. Numbering gaps in Common QA Requirements

Items 5 and 9 are skipped. Unknown whether deliverables were deleted or just mis-numbered.

**Recommended interpretation:** deliver everything that *is* listed; do not invent missing items 5 and 9.

### 9. Duplicate / overlapping `project-info.md` outlines

Part A has an 11-item AI-workflow list; the later template has a 10-item Setup Summary plus Project Summary / Tools Used. Content overlaps but numbering differs.

**Recommended interpretation:** one `project-info.md` that covers **both** the template header fields and the Part A workflow questions.

### 10. Folder name `PrismStructure` vs `PrismStructure-toolshop-playwright`

Required tree: `PrismStructure`. Quick Tips Phase 3: `PrismStructure-toolshop-playwright`.

**Recommended interpretation:** use **`PrismStructure`** as the repo folder; Playwright/Prism project can live inside it.

### 11. “Each type (manual+UI+API)” parsing

Could mean:

- A) 5–8 **per** type (max ~15–24 total), or
- B) 5–8 **total across all types**.

Wording “of each type” supports **A**. Smoke/regression are included in that count, not extra.

### 12. Core AC “state machine” for Toolshop

Toolshop has cart/checkout/invoice states, not a ticket state machine. Cover valid/invalid transitions that **exist** (empty cart checkout, unauthenticated invoice, invalid payload) rather than fabricating statuses.

### 13. Stretch vs Core

Stretch is mentioned (“Both Core and Stretch are looked at the same way”) but **Stretch criteria are never defined** in the PDF.

**Recommended interpretation:** deliver a complete Core within 5–8 tests per type; do not invent Stretch work unless time remains after artifacts.

### 14. `.Cursor/Tool` path vs `.cursor`

Tree shows `├──.Cursor/Tool` then Rules / Skills. Cursor conventionally uses `.cursor/rules` and `.cursor/skills`.

**Ambiguity:** exact path/casing.  
**Recommended interpretation:** use standard Cursor locations (`.cursor/rules`, `.cursor/skills`) and document them in README so evaluators can find them.

### 15. readme.md vs README.md

PDF says `readme.md`; GitHub default is `README.md`. Local repo already has `README.md`. Keep `README.md` (evaluators will find it).

---

## Entry 2 — Prompt 2: Application analysis of Toolshop UI flows

**Date:** 2026-08-25

### Prompt

Analyze https://practicesoftwaretesting.com/ as a QA engineer.

Identify the main testable ecommerce flows covering:

- Registration
- Login and profile
- Product browsing and search
- Cart and quantity updates
- Checkout using Cash on Delivery
- Invoice generation and verification

Categorize the flows as Smoke or Regression. Include positive, negative, and edge scenarios.
Keep the scope suitable for 5–8 UI automated tests.

Do NOT write Playwright/test code. This is analysis only.

Honor Entry 1 decisions: ≤5–8 UI tests total; smoke+regression inside that cap; @Smoke not “sanity”; confirm-twice is UI-only; do not invent a comment/ticket feature.

### AI Response (short summary)

Recommended **7 UI automated tests** (3 @Smoke, 4 @Regression) covering AC1 + AC2 plus high-risk negatives/edges. Fuller flow inventory lives in `ai-prompts/test-design.md`. Extra flows (guest checkout, other payment methods, filters, PDF download, 2FA, chat widget) are documented as **OUT of UI automation scope** / manual-only. No Playwright code.

### Validation Notes

- Live click-through was **not** possible: homepage/checkout fetches hit Cloudflare bot-check; no interactive browser MCP in this session. Login/home labels were cross-checked from public page snippets (Sign in, Register, Search, Filters).
- Remaining labels, wizard steps, and Confirm-twice behavior were confirmed against Sprint 5 source (`sprint5/UI`) and `en.json` for https://practicesoftwaretesting.com/ (Sprint 5).
- Confirm twice is a UI `checkPayment()` race: first **Confirm** only validates payment; second **Confirm** creates the invoice. API remains a single POST.
- Cap honored: 7 UI cases, not “all possible flows.”

### Decisions carried forward (unchanged)

- Cap: ≤5–8 UI automated tests; @Smoke + @Regression live inside that cap
- SUT: https://practicesoftwaretesting.com/
- Invoice: Confirm twice on UI only
- No comment/ticket feature
- Public repo exists; do not commit unless asked

---

## Entry 3 — Prompt 3: Requirement and risk analysis

**Date:** 2026-08-25

### Prompt

Create a requirement and risk analysis for the Practice Software Testing Toolshop.

For each major flow, provide: requirement or acceptance criterion; business risk; failure impact; testing priority; recommended UI or API coverage; Smoke or Regression classification.

Pay special attention to authentication, cart state, checkout, duplicate confirmation, and invoice generation.

Do NOT write Playwright/test/automation code.

Read first: `ai-prompts/requirements-and-planning.md`, `ai-prompts/test-design.md`, QA Practical Assessment PDF if needed, SUT + API docs.

Honor prior decisions: ≤5–8 tests per type; recommended UI-01..UI-07; Confirm twice is UI-only; API invoice is a single POST; no invented comment/ticket CRUD; unique emails on shared SUT.

Produce a QA risk analysis covering major flows with extra depth on auth, cart, checkout, duplicate confirmation, and invoices. For each flow: AC mapping, business risk, failure impact (user/money/data), P1/P2/P3, UI vs API vs both, @Smoke vs @Regression, IN vs OUT of the 5–8 auto set.

Save prompt history here; put full tables in a durable artifact; add a Requirement and risk analysis section to `project-info.md`. Do not git commit.

### AI Response (short summary)

Risk analysis for Toolshop with extra depth on the five special-attention areas. P1 is sell/auth/invoice/money; P2 is the negatives already in UI-04..07; P3 is catalog/other payments/PDF. Confirm twice stays UI-only (first click = `/payment/check`, second = invoice). Cart leftover is sessionStorage `cart_id` isolation, not a separate test. Recommended API set is 7 tests (register, login, cart, COD invoice GET, duplicate email, bad login, unauthenticated invoice). Full tables: `ai-prompts/test-design.md` Entry 2. Deliverable section: `project-info.md`. No Playwright code. No commit.

### Validation Notes

- Source-backed: Sprint 5 `PaymentComponent.checkPayment()`, `CartService` sessionStorage + UI qty clamp 1–99 vs API `min:1` reject, `emptyCart()` DELETE.
- UI-01..07 unchanged. Caps unchanged. Unique-email and no-comment-CRUD decisions unchanged.
- `project-info.md` gained a Requirement and risk analysis section only; Setup Summary placeholders were not rewritten.
