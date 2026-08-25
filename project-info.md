# Project Info

Primary AI Tool(s) Used: Cursor

Application Under Test: PracticeSoftwareTesting Toolshop – Checkout & Application Flow

Assessment Start Date: 2026-08-25 / Submission Date:

## Project Summary

_(To be completed: 1–3 sentences describing the flow tested and the main focus.)_

## Tools Used

- Cursor
- Playwright (Prism framework)
- GitHub

## Setup Summary

1. How you provide project and system-under-test context to the tool.
2. How you use AI for requirement analysis.
3. How you use AI for test planning and strategy (UI vs API, smoke vs regression).
4. How you use AI for manual test case design (functional, edge, negative, non-functional).
5. How you use AI for automation design (framework choice, structure, data, reusable utilities).
6. How you validate and refine AI-generated test cases and scripts.
7. How you use AI for test data generation, environment assumptions, and API payloads.
8. How you use AI for debugging failing tests and interpreting logs.
9. What information you avoid sharing unnecessarily with AI tools.
10. How you would reuse this QA workflow in a real project.

---

## Requirement and risk analysis

SUT: [practicesoftwaretesting.com](https://practicesoftwaretesting.com/) (Sprint 5 Toolshop) and [API docs](https://api.practicesoftwaretesting.com/api/documentation). Scope is **new-user checkout + invoice verification**, not catalog/admin completeness. Core AC wording about tickets/comments/state machines is mapped onto Toolshop entities (user, cart, product, invoice) — no invented CRUD.

**Hard cap:** ≤5–8 tests per type (manual / UI auto / API auto). `@Smoke` and `@Regression` live inside that cap. Unique emails on the shared public SUT. Confirm twice is **UI-only**; API invoice is a **single POST**.

Full row-level tables (including IN/OUT vs the 7 UI tests) live in `ai-prompts/test-design.md` (Prompt 3). This section is the assessment deliverable.

### Acceptance criteria (Toolshop)

| ID | Source | Criterion |
| --- | --- | --- |
| **UI-AC1** | Assessment | Register with valid unique details, log in, verify **My profile** (name/email). |
| **UI-AC2** | Assessment | Browse/search, add **multiple** items, update quantity, checkout **Cash on Delivery**, press **Confirm twice**, view invoice under **My invoices** (number, COD, lines). |
| **API-AC1** | Assessment | Register, login, bearer token, create cart. |
| **API-AC2** | Assessment | Retrieve products, add to cart, verify cart, POST invoice with billing + `payment_method: cash-on-delivery` + `cart_id` + `payment_details: {}`. |

### Priority model

| Pri | Use when |
| --- | --- |
| **P1** | Shop cannot sell, customer cannot authenticate, invoice missing/wrong, or money/qty is wrong. Smoke lives here. |
| **P2** | Negatives/edges that protect P1 (duplicate email, bad login, qty clamp, empty cart). Regression inside the cap. |
| **P3** | Filters, PDF, other payments, guest, 2FA, chat. Documented, not automated. |

**Impact:** **User** = cannot complete a journey. **Money** = wrong quantity, total, or payment method on the order. **Data** = duplicate account, leftover cart, invoice attached to the wrong user or missing lines.

### Extra-depth flows (assessment special attention)

| Flow | Requirement / AC | Business risk | Failure impact | Pri | Coverage | Tag | In 5–8 auto? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Register unique customer | UI-AC1 / API-AC1 | New buyers cannot start checkout | **User:** no account. **Data:** blocked onboarding | P1 | **Both** (UI form + `POST /users/register`) | @Smoke | **IN** UI-01; **IN** API-01 |
| Login + session + profile | UI-AC1 / API-AC1 | Token/session fail → cannot reach invoices | **User:** locked out. **Data:** profile mismatch hides the wrong customer | P1 | **Both** (UI My profile; `POST /users/login` → bearer) | @Smoke | **IN** UI-02; **IN** API-02 |
| Duplicate email | Unique constraint | Two customers share one identity | **Data:** account collision on a public SUT; later tests steal the wrong user | P2 | **Both** (UI “Email is already in use.”; API Duplicate Entry) | @Regression | **IN** UI-04; **IN** API-05 |
| Bad login | Auth gate | Invalid credentials accepted or no error | **User:** lockout UX. **Data:** session leak if success on bad password | P2 | **Both** (UI “Invalid email or password”; API 401) | @Regression | **IN** UI-05; **IN** API-06 |
| Multi-item cart + qty | UI-AC2 / API-AC2 | Order lines/qty wrong before pay | **Money:** under/over-sold lines. **User:** surprise total at Confirm | P1 | **Both** (UI cart table; `POST /carts`, add item, `GET /carts/{id}`) | @Smoke | **IN** UI-03; **IN** API-03 |
| Qty clamp 0 / 99 | UI-AC2 “updating quantity” | Qty 0 removes a line or qty 100 inflates total | **Money:** line total wrong. UI clamps to 1–99; API `min:1` rejects 0 (contract split) | P2 | **UI** for clamp; API 0/100 is a different assertion | @Regression | **IN** UI-06; API clamp **OUT** (optional 422) |
| Empty cart checkout | Invalid transition | Proceed on zero items creates an empty invoice | **Money:** zero-value or junk invoice. **User:** dead-end checkout | P2 | **UI** empty copy / no Proceed; API POST invoice with empty/missing cart | @Regression | **IN** UI-07; API empty-cart **OUT** (manual/API-only if slot) |
| Leftover / shared carts | Isolation on public SUT | `cart_id` lives in **sessionStorage**, not on the user record | **Data:** flake from a previous test’s cart; **Money:** second invoice if cart not deleted after pay | P1 (isolation) | **Both** (fresh `POST /carts` per run; UI must not share storage across tests) | @Smoke (hygiene) | **IN** as preconditions of UI-03/07 and API-03/04 — not a separate test |
| COD + billing + payment method | UI-AC2 | Cannot pay, or wrong method stored | **User:** checkout blocked. **Money:** invoice not COD / missing billing | P1 | **Both** (UI wizard; API payload billing + `cash-on-delivery`) | @Smoke | **IN** UI-03; **IN** API-04 |
| Confirm twice (UI) | Assessment invoice rule | One Confirm = payment check only; invoice never created | **User:** thinks they paid, no order. **Money:** lost sale. Fast double-click can miss `state=true` | P1 | **UI only** — wait for payment message, then Confirm again | @Smoke | **IN** as assertions inside UI-03; dedicated “one Confirm” test **OUT** (flake) |
| Invoice POST (API) | API-AC2 | Single POST creates the invoice; no second confirm | **Money:** missing/duplicate invoice if retried. **Data:** lines not copied from cart | P1 | **API only** (`POST /invoices` once) | @Smoke | **IN** API-04 |
| My invoices verification | UI-AC2 | Success screen without list/details | **User:** cannot prove purchase. **Money:** wrong number, method, or qty on the legal record | P1 | **Both** (UI My invoices + Details; `GET /invoices` / `{id}`) | @Smoke | **IN** UI-03; **IN** API-04 |

**Confirm twice (source-backed):** `PaymentComponent.checkPayment()` — first Confirm calls `POST /payment/check` asynchronously and returns while `state` is still falsy, so **no invoice**. After success, `state = true`. Second Confirm skips check and `POST /invoices`. Immediate double-click can fire two checks and still create nothing; automation must **wait**, then click again. API does not model this.

**Cart leftover (source-backed):** `CartService` stores `cart_id` / `cart_quantity` in **sessionStorage**. Login does not bind or clear the cart. After invoice, `emptyCart()` `DELETE`s the cart. Tests must create their own cart and unique user; do not hardcode a shared `cart_id`.

### Other major flows (inside cap vs documented OUT)

| Flow | AC | Risk / impact | Pri | Coverage | Tag | Auto? |
| --- | --- | --- | --- | --- | --- | --- |
| Search known product → add to cart | UI-AC2 | Cannot find stock → cannot sell | P1 | UI | @Smoke | **IN** UI-03 |
| Register empty/weak password / bad DOB | UI-AC1 negatives | Junk accounts | P3 | UI | @Regression | **OUT** (manual) |
| Sign out | Session | Stale “logged in” chrome | P3 | UI | @Regression | **OUT** |
| Search no results / filters / sort | Catalog | Wrong assortment | P3 | UI | @Regression | **OUT** |
| Delete line / continue shopping | Cart | Stuck unwanted line | P3 | UI | @Regression | **OUT** |
| Guest checkout | Exists in UI | Guest has no **My invoices** → fails UI-AC2 | P2 | UI | @Regression | **OUT** (AC wants registered user) |
| Bank / card / BNPL / gift card | Payment matrix | Wrong extra-field validation | P3 | UI | @Regression | **OUT** (AC specifies COD) |
| Billing required fields (Proceed disabled) | Checkout | Incomplete address on invoice | P2 | UI | @Regression | **OUT** (manual) |
| Confirm with no payment method | Payment | Invoice with empty method | P2 | UI | @Regression | **OUT** (manual) |
| Unauthenticated GET/POST invoice | API-AC2 gate | Invoice leak or create without login | P2 | API | @Regression | **IN** API-07 (401) |
| Cross-user GET invoice | Data isolation | Customer A reads customer B | P2 | API | @Regression | **OUT** (if no spare API slot) |
| Invoice PDF download | After sales | File flake; not in AC | P3 | UI | @Regression | **OUT** |
| Contact / chat / 2FA / social / admin | Not AC | Out of Core | P3 | — | — | **OUT** |

### How this maps to the 7 UI tests + API/manual

**UI automation (7 of 5–8):** UI-01 register @Smoke; UI-02 login/profile @Smoke; UI-03 COD E2E with Confirm twice + My invoices @Smoke; UI-04 duplicate email @Regression; UI-05 bad login @Regression; UI-06 qty 0→1 / 100→99 @Regression; UI-07 empty cart @Regression.

**API automation (recommended 7 of 5–8 — not coded yet):** API-01 register @Smoke; API-02 login token @Smoke; API-03 create cart + add products + GET cart @Smoke; API-04 POST COD invoice + GET number/COD/lines @Smoke; API-05 duplicate email @Regression; API-06 bad login @Regression; API-07 unauthenticated invoice POST @Regression. No Confirm-twice API test.

**Manual (8 / 8 in `FunctionalTestCase/functional-test-cases.csv`):** TC-M-01 register+login+profile @Smoke; TC-M-02 bad login @Regression; TC-M-03 search @Smoke; TC-M-04 two products in cart @Smoke; TC-M-05 qty 0→1 / 100→99 @Regression; TC-M-06 COD Confirm twice @Smoke; TC-M-07 My invoices @Smoke; TC-M-08 confirm-once (no invoice) @Regression. Prompt 4 covers the eight named flows rather than only OUT-M leftovers. Still not dumped: empty/weak register, billing-disabled, payment-method required, search no results, empty cart (UI-07), duplicate email (UI-04).

**Valid/invalid transitions covered without a ticket state machine:** empty cart → no checkout (UI-07); qty below/above bounds (UI-06 / TC-M-05); duplicate identity (UI-04); failed auth (UI-05 / TC-M-02); payment-check then invoice-create (UI-03 / TC-M-06); first Confirm ↛ invoice (TC-M-08); API invoice without token (API-07).
