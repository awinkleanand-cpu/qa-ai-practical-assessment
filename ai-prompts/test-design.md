# AI Prompts – Test Design

Prompts used to generate or refine test scenarios and test cases for UI + API.

---

## Entry 1 — Prompt 2: Toolshop UI flow analysis (Smoke vs Regression, 5–8 cap)

**Date:** 2026-08-25

### Prompt

Analyze https://practicesoftwaretesting.com/ as a QA engineer. Identify main testable ecommerce flows (registration, login/profile, browse/search, cart/qty, COD checkout, invoices). Categorize Smoke or Regression. Include positive, negative, and edge. Keep scope suitable for 5–8 UI automated tests. Do not write Playwright/test code.

Honor prior planning: 5–8 UI cap (smoke+regression inside it); @Smoke not sanity; confirm-twice is UI-only; no invented comment/ticket feature.

### AI Response Summary

Selected **7 UI automated tests** (3 @Smoke + 4 @Regression) that cover AC1 (register/login/profile) and AC2 (browse, multi-item cart + qty, COD, Confirm twice, My invoices). Remaining flows are inventoried below and marked **OUT of UI automation** (manual / risk / later API). No test code was written.

### Validation Notes

- Could not click the live UI (Cloudflare challenge; no browser automation tools). Labels and steps were validated against Sprint 5 Angular source + `en.json`, plus public snippets of `/` and `/auth/login`.
- Confirm-twice matches `PaymentComponent.checkPayment()`: first Confirm calls `/payment/check` asynchronously and returns before `state` is true; second Confirm creates the invoice.
- Cart qty `< 1` is clamped to **1**; qty `> 99` is capped at **99** with a toast. Empty cart shows “The cart is empty. Nothing to display.” and hides Proceed.
- Duplicate register maps API `Duplicate Entry` to UI “Email is already in use.”
- Coverage vs cap: AC1 + AC2 happy paths are Smoke; highest-risk negatives/edges are Regression; everything else is out of the 5–8 UI set.

---

## UI map (labels / steps — for later locators, not code)

SUT: https://practicesoftwaretesting.com/ (Sprint 5 Toolshop).

| Area | Observed / source-backed UI |
| --- | --- |
| Header | **Sign in**; after login: user menu → **My account**, **My profile**, **My invoices**, **Sign out**; cart badge when items > 0 |
| Login `/auth/login` | **Login**; Email address; Password; submit **Login**; **Register your account**; **Forgot your Password?**; error **Invalid email or password** |
| Register `/auth/register` | **Customer registration**; First/Last name, DOB (YYYY-MM-DD), Country, Postal code, House number (lookup fills Street/City/State), Phone, Email, Password (8+ mixed case, number, symbol); **Register**; duplicate → **Email is already in use.** |
| Profile | **Profile** with name, email, phone, address; **Update Profile** |
| Catalog `/` | Sort, Price Range, **Search** (query + Search / X reset), By category, By brand, eco-friendly; product cards; **There are no products found.** |
| Product | **Add to cart**; quantity increase/decrease |
| Cart `/checkout` step 1 | Item / Quantity / Price / Total; qty input min 1 max 99; **Continue Shopping**; **Proceed to checkout**; empty: **The cart is empty. Nothing to display.** |
| Checkout step 2 | **Sign in** or **Continue as Guest**; if already logged in, proceed |
| Checkout step 3 | **Billing Address** (country, postal code, house number, street, city, state); **Proceed to checkout** disabled until valid |
| Payment step 4 | **Payment Method** including **Cash on Delivery**; button **Confirm** |
| Invoice | After second Confirm: thanks + invoice number; **My invoices** list + **Details**; fields include invoice number, date, total, billing, payment method |

**Confirm twice (UI risk, source-backed):** `finishFunction()` → `checkPayment()`. First Confirm starts payment validation and returns `state` still falsy, so no invoice. After validation, `state = true`. Second Confirm skips validation and POSTs the invoice. Assessment instruction matches this UI quirk; API tests use one POST.

---

## Recommended 7 UI automation set (inside the 5–8 cap)

Smoke = smallest set that proves the shop can sell. Regression = high-risk negatives/edges that still fit the cap.

| ID | Tag | Type | Scenario | Why it made the cut |
| --- | --- | --- | --- | --- |
| **UI-01** | @Smoke | Positive | New customer registers with unique valid details and is sent to login | AC1 foundation; unique email + password rules |
| **UI-02** | @Smoke | Positive | Login with those credentials; **My profile** shows the same name/email | AC1 “verify profile”; proves auth session |
| **UI-03** | @Smoke | Positive | Search a known product, add **two** products, increase qty, checkout **Cash on Delivery**, press **Confirm twice**, open **My invoices** and check invoice number / COD / line qty | AC2 E2E; one test carries browse, cart, COD, invoice. Highest business risk |
| **UI-04** | @Regression | Negative | Register again with an email already used → **Email is already in use.** | Unique-constraint failure; cheap, high signal |
| **UI-05** | @Regression | Negative | Login with wrong password → **Invalid email or password**; still on login; no user menu | Auth gate; protects UI-02/03 |
| **UI-06** | @Regression | Edge | In cart, set qty to **0** (expect clamp to 1) and to **100** (expect cap 99 + warning); line total updates | AC2 “updating quantity”; known min/max behavior |
| **UI-07** | @Regression | Negative | Open checkout with empty cart → **The cart is empty. Nothing to display.**; **Proceed to checkout** not available | Invalid transition; empty-cart checkout |

**Count:** 7 UI tests (3 Smoke, 4 Regression). Leaves one spare slot inside 5–8 if a flake forces a split; do not add more without dropping one.

**Traceability:** UI-01/02/04/05 → UI AC1. UI-03/06/07 → UI AC2. Confirm-twice is an assertion inside UI-03, not a separate test.

---

## Fuller flow inventory (six areas)

**In auto** = one of the 7. **OUT** = not in the 5–8 UI set (manual, risk log, or API later).

### 1. Registration

| Flow | +/-/edge | Smoke / Regression | Auto? |
| --- | --- | --- | --- |
| Register unique valid customer | Positive | Smoke | **UI-01** |
| Duplicate email | Negative | Regression | **UI-04** |
| Submit empty required fields | Negative | Regression | OUT (manual) |
| Weak password (no symbol / too short) | Negative | Regression | OUT (manual) |
| Invalid email format / non-ISO DOB | Negative | Regression | OUT (manual) |
| Postcode lookup fills street/city/state | Edge | Regression | OUT (manual; timing flake) |

### 2. Login and profile

| Flow | +/-/edge | Smoke / Regression | Auto? |
| --- | --- | --- | --- |
| Login + profile matches registered data | Positive | Smoke | **UI-02** |
| Wrong password / unknown email | Negative | Regression | **UI-05** |
| Empty email/password client validation | Negative | Regression | OUT (manual) |
| Sign out returns **Sign in** | Positive | Regression | OUT (covered enough by session isolation) |
| Update profile / change password / 2FA | Positive | Regression | OUT (not AC1/AC2) |
| Google social login | Positive | Regression | OUT (external IdP) |
| Forgot password | Positive | Regression | OUT |

### 3. Product browsing and search

| Flow | +/-/edge | Smoke / Regression | Auto? |
| --- | --- | --- | --- |
| Search known product and open PDP / add to cart | Positive | Smoke | **Inside UI-03** |
| Search with no matches → **There are no products found.** | Negative | Regression | OUT (manual) |
| Sort / category / brand / price / eco filters | Positive | Regression | OUT |
| Pagination | Edge | Regression | OUT |
| Out of stock product not purchasable | Negative | Regression | OUT (data-dependent) |
| Product comparison bar | Positive | Regression | OUT |

### 4. Cart and quantity updates

| Flow | +/-/edge | Smoke / Regression | Auto? |
| --- | --- | --- | --- |
| Add two items; qty increase; totals | Positive | Smoke | **Inside UI-03** |
| Qty 0 → 1; qty 100 → 99 | Edge | Regression | **UI-06** |
| Empty cart message; no proceed | Negative | Regression | **UI-07** |
| Delete line item | Positive | Regression | OUT |
| Continue shopping returns home | Positive | Regression | OUT |
| Eco / combo discounts | Edge | Regression | OUT |

### 5. Checkout using Cash on Delivery

| Flow | +/-/edge | Smoke / Regression | Auto? |
| --- | --- | --- | --- |
| Logged-in COD: address → payment → Confirm **twice** → invoice number | Positive | Smoke | **UI-03** |
| Confirm once only — no invoice | Negative | Regression | OUT (asserted as wait-then-second-click in UI-03; do not add a dedicated flake-prone test) |
| Payment method required if Confirm with none selected | Negative | Regression | OUT |
| Billing required fields / proceed disabled | Negative | Regression | OUT |
| Guest checkout | Positive | Regression | OUT (AC1 wants registered user) |
| Bank transfer / card / BNPL / gift card | Positive | Regression | OUT (AC2 specifies COD) |
| Checkout while logged out (must sign in or guest) | Edge | Regression | OUT |

### 6. Invoice generation and verification

| Flow | +/-/edge | Smoke / Regression | Auto? |
| --- | --- | --- | --- |
| Invoice listed under **My invoices**; details show number, COD, products, qty, billing | Positive | Smoke | **Inside UI-03** |
| Invoice not created after a single Confirm | Negative | Regression | OUT (same as confirm-twice; UI-03) |
| Unauthenticated user cannot open My invoices | Negative | Regression | OUT (login redirect; low extra value) |
| Invoice that does not exist → **This invoice doesn't exist.** | Negative | Regression | OUT |
| Download PDF | Positive | Regression | OUT (file flake; not in AC) |
| Invoice of another customer | Negative | Regression | OUT (better as API) |

---

## UI risks (call-outs for automation later)

1. **Confirm twice** — First Confirm only validates payment; invoice is created on the second Confirm. Automating a single click will fail AC2. Wait for payment message / enabled state, then click Confirm again. UI-only; API is one POST.
2. **Search** — Client-side submit (`search-query` + Search). Empty, special characters, and “no results” are easy to over-automate; keep one known-product search inside UI-03.
3. **Qty = 0** — Input `min="1"` and TS clamp: values `< 1` become **1**, not remove-the-line. Do not expect an error toast for 0.
4. **Duplicate email** — UI string is **Email is already in use.** (from API `Duplicate Entry`). Use a seeded or previously registered address, not a random unique one.
5. **Empty cart checkout** — Proceed is not rendered when `cart_items.length` is 0. Assert empty copy, not a disabled button.
6. **Invoice visibility** — Invoices are under the customer menu **My invoices**, not on the payment success screen alone. Guest checkout would not satisfy AC2 “My invoices.” Use a registered user in UI-03.
7. **Shared public SUT** — Unique emails per run; do not depend on cart leftover from other testers. Prefer register-in-test or isolated credentials.
8. **Postcode lookup** — Async fill of street/city/state can race registration/address steps; prefer typing address fields if lookup is slow.
9. **No comment/ticket feature** — Contact/chat “support ticket” exists in the widget but is not a Core AC; do not invent CRUD/comment UI tests.

---

## Out of UI automation (risk / manual / API)

- Guest checkout, other payment methods, discounts, rentals, favorites, contact form, chat widget, 2FA, social login, forgot password, PDF download, filters/sort/pagination, comparison, admin.
- Cross-user invoice access and payload validation → API suite (separate 5–8 cap).
- Manual CSV can reuse the inventory rows marked OUT if needed, still inside the **manual** 5–8 cap (do not dump 40 manual cases).

---

## Entry 2 — Prompt 3: Requirement and risk analysis

**Date:** 2026-08-25

### Prompt

Create a requirement and risk analysis for Practice Software Testing Toolshop. For each major flow: requirement/AC, business risk, failure impact, testing priority, recommended UI or API coverage, Smoke or Regression. Extra depth on authentication, cart state, checkout, duplicate confirmation, and invoice generation. Do not write Playwright/test code. Honor prior decisions: ≤5–8 per type; UI-01..UI-07 already selected; Confirm twice is UI-only; API invoice is a single POST; no invented comment/ticket CRUD; unique emails on shared SUT. Persist full tables; add a Requirement and risk analysis section to `project-info.md` plus a prompt-history entry.

### AI Response Summary

Risk tables for all major Toolshop flows with extra depth on auth, cart, COD checkout, Confirm-twice, and invoices. Each row maps AC, user/money/data impact, P1–P3, UI vs API vs both, @Smoke/@Regression, and IN vs OUT of the 5–8 auto set. Compact deliverable copy is in `project-info.md`. No test code.

### Validation Notes

- Behavior cross-checked against Sprint 5 source: `PaymentComponent.checkPayment()` (first Confirm = `/payment/check` only; second Confirm = `POST /invoices`); `CartService` (`cart_id` in sessionStorage; qty clamped 1–99 in UI; `emptyCart()` DELETE); API `addItem` validates `quantity` min 1 (no clamp — contract split vs UI).
- Cap honored: 7 UI tests unchanged; 7 API tests recommended (not coded); manual fills OUT gaps only.
- Live UI click-through still blocked by Cloudflare in this environment; labels/ACs unchanged from Entry 1.

---

## Requirement and risk analysis (full tables)

**Legend**

| Column | Meaning |
| --- | --- |
| AC | UI-AC1 register/login/profile; UI-AC2 browse/cart/qty/COD/Confirm twice/My invoices; API-AC1 register/login/token/cart; API-AC2 products/cart/invoice POST |
| Impact | **User** journey blocked; **Money** wrong qty/total/payment; **Data** identity, leftover cart, or invoice ownership |
| Pri | P1 sell/auth/invoice/money; P2 negatives that protect P1; P3 out of Core |
| Layer | UI / API / Both |
| Tag | @Smoke or @Regression (inside the 5–8 cap, not extra) |
| Auto | **IN-UI** = UI-01..07; **IN-API** = recommended API-01..07; **OUT-M** = candidate for the manual 5–8 CSV; **OUT** = not this assignment |

**Recommended API set (implied, not coded):** API-01 register @Smoke; API-02 login→token @Smoke; API-03 POST cart + add products + GET cart @Smoke; API-04 POST COD invoice + GET number/COD/lines @Smoke; API-05 duplicate email @Regression; API-06 bad login @Regression; API-07 unauthenticated `POST /invoices` @Regression.

---

### 1. Authentication (register, login, session, duplicate email)

| ID | Flow | Requirement / AC | Business risk | Failure impact | Pri | Layer | Tag | Auto |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AUTH-01 | Register unique valid customer | UI-AC1 / API-AC1: 201 + redirect to login | New customers cannot enter the shop | **User:** onboarding blocked. **Data:** no customer record | P1 | Both | @Smoke | **IN-UI** UI-01; **IN-API** API-01 |
| AUTH-02 | Login with registered credentials | UI-AC1 / API-AC1: session / `access_token` | Checkout and My invoices are behind auth | **User:** cannot buy or see orders. **Data:** wrong user if token mix-up | P1 | Both | @Smoke | **IN-UI** UI-02; **IN-API** API-02 |
| AUTH-03 | My profile matches registered name/email | UI-AC1 “verify profile” | Silent login to the wrong account | **Data:** identity mismatch; later invoice asserts on the wrong customer | P1 | UI | @Smoke | **IN-UI** UI-02 (API GET user **OUT**) |
| AUTH-04 | Duplicate email | Unique email on shared SUT | Two testers/customers collide | **Data:** Duplicate Entry; UI “Email is already in use.” Tests that reuse a static email flake | P2 | Both | @Regression | **IN-UI** UI-04; **IN-API** API-05 |
| AUTH-05 | Wrong password / unknown email | Auth gate | Bad credentials accepted, or no error | **User:** lockout with no message. **Data:** session if 200 on bad password | P2 | Both | @Regression | **IN-UI** UI-05; **IN-API** API-06 |
| AUTH-06 | Empty email/password client validation | Form gate | Submit fires with blanks | **User:** confusing 422 vs inline error | P3 | UI | @Regression | **OUT-M** |
| AUTH-07 | Weak password / invalid email / non-ISO DOB | Register rules (8+, mixed, number, symbol) | Junk accounts on public SUT | **Data:** weak credentials; low money impact | P3 | UI | @Regression | **OUT-M** |
| AUTH-08 | Sign out → Sign in visible | Session end | Stale user menu after logout | **User:** thinks they are still in | P3 | UI | @Regression | **OUT** (session isolation covers enough) |
| AUTH-09 | Unauthenticated invoice API | API-AC2 security | Anyone can create or list invoices | **Data:** invoice leak/create. **Money:** unpaid orders in the system | P2 | API | @Regression | **IN-API** API-07 |
| AUTH-10 | Update profile / change password / 2FA / Google / forgot password | Not UI-AC1/AC2 | Account takeover surface exists but is out of Core | **User/Data** if broken; not in assessment ACs | P3 | UI | @Regression | **OUT** |

**Auth notes:** Always generate a unique email per run. Do not seed a shared customer on the public SUT. Bearer token is required for `POST /invoices` and `GET /invoices`. Cart `cart_id` is **not** the session — see Cart.

---

### 2. Cart state (qty, empty cart, leftover carts, multi-item)

| ID | Flow | Requirement / AC | Business risk | Failure impact | Pri | Layer | Tag | Auto |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CART-01 | Add two products; increase qty; totals | UI-AC2 / API-AC2 multi-item + qty | Order composition wrong before payment | **Money:** missing line or wrong qty×price. **User:** Confirm shows a surprise total | P1 | Both | @Smoke | **IN-UI** UI-03; **IN-API** API-03 |
| CART-02 | Qty 0 → clamp 1 | UI min=1; TS `Math.max(1, qty)` | Qty 0 treated as delete or as free item | **Money:** line disappears or $0 line. UI must stay at **1**, not toast | P2 | UI | @Regression | **IN-UI** UI-06 |
| CART-03 | Qty 100 → cap 99 + warning | UI `Math.min(qty, 99)` | Unbounded qty inflates COD total | **Money:** 100× price charged on invoice | P2 | UI | @Regression | **IN-UI** UI-06 |
| CART-04 | API quantity 0 / non-integer | API `quantity` required integer min 1 | UI clamp hides that API **rejects** 0 (422), it does not clamp | **Data:** contract split. Automating API 0 as “becomes 1” would be a false pass | P2 | API | @Regression | **OUT** (do not copy UI-06 onto API) |
| CART-05 | Empty cart: copy + no Proceed | Invalid checkout transition | Empty invoice or 500 on Confirm | **Money:** zero-value invoice. **User:** dead-end. Assert copy, not a disabled button (Proceed is not rendered) | P2 | UI | @Regression | **IN-UI** UI-07 |
| CART-06 | Leftover `cart_id` in sessionStorage | Isolation; `CartService` | Previous test/user cart reused | **Data:** flake (UI-07 fails because UI-03 left items). **Money:** checkout of someone else’s leftover lines if a hardcoded id is used | P1 | Both | @Smoke (hygiene) | **IN** as preconditions — fresh cart per test, never a shared id |
| CART-07 | Cart not bound to user login | sessionStorage vs bearer | Login does not migrate/clear cart | **Data:** guest-added items follow the browser, not the account. Expected for guest→login; dangerous if tests share a profile | P2 | Both | @Regression | **OUT** (document; isolate storage) |
| CART-08 | Cart leftover after invoice | `emptyCart()` DELETE `/carts/{id}` | Badge/items remain; second Confirm/POST possible | **Money:** duplicate invoice if API allows reuse of the same cart. **User:** cart not empty | P1 | Both | @Smoke | **IN** assert empty/success inside UI-03 / API-04; dedicated retry **OUT** |
| CART-09 | Delete line item | Cart maintenance | Cannot remove unwanted SKU | **User:** forced to buy extra. **Money:** extra line on invoice | P3 | UI | @Regression | **OUT** |
| CART-10 | Continue shopping | Navigation | User stuck on cart | **User:** UX only | P3 | UI | @Regression | **OUT** |
| CART-11 | POST `/carts` then GET | API-AC1 create cart | No cart_id → invoice 404 | **User/Money:** cannot complete API-AC2 | P1 | API | @Smoke | **IN-API** API-03 |

**Cart notes:** Shared public SUT means other people’s carts exist on the server, but they are not in *your* sessionStorage. The real leftover risk is **our own tests** reusing a browser context or a hardcoded `cart_id`. After pay, UI calls `emptyCart()`; if DELETE fails, session is still cleared locally (`clearCart` on error) while the server cart may remain — API tests should not reuse that id.

---

### 3. Checkout (COD, billing, payment method)

| ID | Flow | Requirement / AC | Business risk | Failure impact | Pri | Layer | Tag | Auto |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CHK-01 | Logged-in COD happy path | UI-AC2 | Core revenue path fails | **User:** cannot complete purchase. **Money:** no order | P1 | Both | @Smoke | **IN-UI** UI-03; **IN-API** API-04 |
| CHK-02 | Billing address required / Proceed disabled | Invoice billing fields | Invoice with blank street/city/country | **Data:** undeliverable COD. **Money:** order exists but cannot be fulfilled | P2 | UI | @Regression | **OUT-M** |
| CHK-03 | Payment method required | `payment_method` Validators.required | Confirm with no method | **Money:** invoice missing method or 422. **User:** silent no-op | P2 | UI | @Regression | **OUT-M** |
| CHK-04 | COD `payment_details: {}` | API example payload; UI COD branch is empty object | Extra card/bank fields required for COD | **User:** COD blocked. **Money:** cannot use the AC payment method | P1 | Both | @Smoke | **IN** inside UI-03 / API-04 payload |
| CHK-05 | Guest checkout | UI supports guest + `guest_email` on payload | Guest never sees **My invoices** | **User:** AC2 fails if we use guest. Not a product bug; wrong test design | P2 | UI | @Regression | **OUT** (registered user only) |
| CHK-06 | Bank / card / BNPL / gift card | Other methods have extra validators | Wrong regex/required on non-COD | **User:** those methods fail. Out of AC2 | P3 | UI | @Regression | **OUT** |
| CHK-07 | Checkout while logged out | Must Sign in or Continue as Guest | Logged-out user reaches payment | **User:** blocked or guest-only invoice | P2 | UI | @Regression | **OUT** (UI-03 starts logged in) |
| CHK-08 | POST invoice missing `cart_id` / bad cart | API 404/422 | Invoice without lines | **Money:** empty or failed order. **Data:** 404 noise | P2 | API | @Regression | **OUT** if API-07 takes the last negative slot |

---

### 4. Duplicate confirmation (first Confirm = payment check; second creates invoice)

| ID | Flow | Requirement / AC | Business risk | Failure impact | Pri | Layer | Tag | Auto |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CONF-01 | First Confirm → `/payment/check` only | Assessment: press Confirm **twice**; `checkPayment()` returns `of(this.state)` while `state` is still falsy | Single-click automation (or a real user who clicks once) never creates an invoice | **User:** “nothing happened” / no invoice number. **Money:** lost COD order | P1 | **UI only** | @Smoke | **IN-UI** UI-03 (wait, then second click) |
| CONF-02 | Second Confirm → `POST /invoices` | `state === true` skips check and calls `createInvoice` | Second click never fires or fires too early | **User/Money:** same as CONF-01 | P1 | **UI only** | @Smoke | **IN-UI** UI-03 |
| CONF-03 | Immediate double-click (no wait) | Both clicks can see `!state` and only start two payment checks | Race: two checks, **zero** invoices | **User:** looks like Confirm is broken. **Money:** lost sale. Do not automate “click twice with no wait” as a pass | P1 | UI | @Regression | **OUT** (flake). UI-03 must wait for payment message / `state` |
| CONF-04 | Confirm once only — stay on payment, no My-invoices row | Negative of CONF-01 | False confidence if we only assert the button exists | **User:** no order. Treat as known UI quirk, not a product AC to “fix” | P2 | UI | @Regression | **OUT** (do not add a dedicated test; UI-03 implies the wait) |
| CONF-05 | API invoice is one POST | API-AC2 example body; no confirm step | Modeling “two confirms” in API tests | **Data:** wasted slot / false requirement. Payment check is a separate `POST /payment/check` | P1 | **API only** | @Smoke | **IN-API** API-04 once. No Confirm-twice API case |
| CONF-06 | Third Confirm / retry POST same `cart_id` | Idempotency | Duplicate invoices for one cart | **Money:** two COD records. **Data:** two numbers in My invoices | P2 | Both | @Regression | **OUT** (nice if a spare API slot; not in the 7) |

**Confirm-twice notes:** This is an SUT UI quirk the assessment *requires* us to follow, not a second payment. COD still sends empty `payment_details`. Do not assert two HTTP invoice creates from the UI.

---

### 5. Invoice generation and verification (My invoices, number, COD, lines)

| ID | Flow | Requirement / AC | Business risk | Failure impact | Pri | Layer | Tag | Auto |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| INV-01 | Invoice number shown after second Confirm | UI-AC2 | Success UI without a number | **User:** cannot quote the order. **Money:** no auditable sale | P1 | UI | @Smoke | **IN-UI** UI-03 |
| INV-02 | Listed under **My invoices** (not only success screen) | UI-AC2 | List empty / guest has no menu | **User:** cannot find the purchase later. Guest path cannot satisfy this AC | P1 | UI | @Smoke | **IN-UI** UI-03 |
| INV-03 | Details: number, COD, products, qty, billing | UI-AC2 / API-AC2 | Wrong method, missing line, qty 1 when 2 were bought | **Money:** legal/fulfillment record wrong. Highest assertion value in the suite | P1 | Both | @Smoke | **IN-UI** UI-03; **IN-API** API-04 `GET /invoices/{id}` |
| INV-04 | `POST /invoices` with billing + COD + cart_id | API-AC2 payload | 401/404/422 on the documented body | **User:** API lifecycle broken. **Money:** no invoice | P1 | API | @Smoke | **IN-API** API-04 |
| INV-05 | Invoice not created after a single Confirm | Same as CONF-04 | False pass if we only check HTTP 200 on payment check | **Money:** no invoice row | P2 | UI | @Regression | **OUT** (covered by UI-03 wait) |
| INV-06 | Unauthenticated My invoices | Menu behind login | Invoice list leak | **Data:** low on UI (redirect). API is the real leak risk (AUTH-09) | P2 | UI | @Regression | **OUT** |
| INV-07 | Unknown invoice id | “This invoice doesn't exist.” | 500 vs 404 | **User:** ugly error. Low money | P3 | UI | @Regression | **OUT** |
| INV-08 | Cross-user GET invoice | Authorization | Customer A opens B’s invoice URL/id | **Data:** PII + order leak. **Money:** competitive/privacy | P2 | API | @Regression | **OUT** (prefer over UI; no spare if API is already 7) |
| INV-09 | PDF download | After-sales | File download flake | **User:** cannot print. Not in AC | P3 | UI | @Regression | **OUT** |

**Invoice notes:** Assert **payment method = Cash on Delivery / cash-on-delivery**, **invoice number**, **line qty matching the cart**, and **billing**. Do not stop at “thank you.” API response is HTTP 201 with invoice body; list via `GET /invoices` with bearer.

---

### 6. Product browsing and search (supporting UI-AC2)

| ID | Flow | Requirement / AC | Business risk | Failure impact | Pri | Layer | Tag | Auto |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PRD-01 | Search known product, open PDP, add to cart | UI-AC2 / API-AC2 retrieve products | Catalog search broken → cannot start AC2 | **User:** cannot find stock | P1 | Both | @Smoke | **IN-UI** inside UI-03; **IN-API** GET products inside API-03 |
| PRD-02 | Search no matches | Empty result copy | False “no products” on a known name | **User:** thinks shop is empty | P3 | UI | @Regression | **OUT-M** |
| PRD-03 | Sort / category / brand / price / eco / pagination | Catalog | Wrong assortment | **User:** discovery only. Not in AC | P3 | UI | @Regression | **OUT** |
| PRD-04 | Out of stock not purchasable | Inventory | Oversell | **Money:** COD for unavailable SKU. Data-dependent on public SUT | P3 | UI | @Regression | **OUT** |

---

### Coverage map (caps)

| Type | Count | IDs | Smoke | Regression |
| --- | --- | --- | --- | --- |
| UI auto | **7 / 8** | UI-01..07 | 01–03 | 04–07 |
| API auto (planned) | **7 / 8** | API-01..07 | 01–04 | 05–07 |
| Manual CSV | **8 / 8** | TC-M-01..08 (Prompt 4; Core AC covers, not OUT-M-only) | 01, 03, 04, 06, 07 | 02, 05, 08 |

**Spare slot:** one UI and one API slot unused. Do not fill them unless a P1 flake forces a split (e.g. Confirm-twice extracted from UI-03). Prefer keeping the E2E intact.

**State-machine intent (Core AC, Toolshop mapping):** empty cart ↛ checkout; qty &lt;1 or &gt;99 ↛ unbounded; duplicate email ↛ second account; bad login ↛ session; first Confirm ↛ invoice; no token ↛ invoice POST. No comment/ticket statuses.

**Explicitly not in any 5–8 set:** guest checkout, non-COD payments, discounts, rentals, favorites, contact, chat widget, 2FA, social login, forgot password, PDF, filters, comparison, admin, invented comment CRUD.

---

## Entry 3 — Prompt 4: Manual functional test CSV

**Date:** 2026-08-25

### Prompt

Create 8 manual functional test cases for Practice Software Testing Toolshop.

Cover: Registration and login; Invalid login; Product search; Adding multiple products to cart; Updating quantity; Cash on Delivery checkout; Invoice verification; One edge or negative checkout scenario.

CSV structure: TestCaseID,RequirementID,Title,TestType,Tag,Priority,Preconditions,Steps,TestData,ExpectedResult,ActualResult,Status.

Use Smoke or Regression tags. Include positive, negative, and edge tests. Leave ActualResult and Status blank. Do NOT write Playwright/automation code.

Honor prior decisions: exactly 8 cases (cap max); RequirementID = UI-AC1 / UI-AC2; Confirm twice on UI; unique emails `user_{timestamp}@example.com`; COD; 8th case = confirm-once (empty cart is already UI-07 in auto). Align with UI-01..07 where sensible.

### AI Response Summary

Wrote **8** human-executable cases in `FunctionalTestCase/functional-test-cases.csv` (replaced the stub header). Prompt 4’s eight covers are **one case each**, split more step-by-step than UI-03, still inside the manual 5–8 cap. 8th case is **confirm-once** (CONF-04 / INV-05), not empty cart (already UI-07) and not qty clamp as the checkout negative (qty clamp is TC-M-05 / UI-06). No automation code.

| ID | Title | Tag | TestType | Prompt 4 cover | Aligns with |
| --- | --- | --- | --- | --- | --- |
| TC-M-01 | Register a unique customer, log in, and verify My profile | Smoke | Positive | Registration and login | UI-01 + UI-02; UI-AC1 |
| TC-M-02 | Login with wrong password is rejected | Regression | Negative | Invalid login | UI-05; UI-AC1 |
| TC-M-03 | Search returns a known catalog product | Smoke | Positive | Product search | PRD-01 inside UI-03; UI-AC2 |
| TC-M-04 | Add two different products to the cart | Smoke | Positive | Adding multiple products to cart | CART-01 inside UI-03; UI-AC2 |
| TC-M-05 | Cart quantity clamps below 1 and above 99 | Regression | Edge | Updating quantity | UI-06; UI-AC2 |
| TC-M-06 | Complete Cash on Delivery checkout with Confirm twice | Smoke | Positive | Cash on Delivery checkout | CHK-01 / CONF-01–02 inside UI-03; UI-AC2 |
| TC-M-07 | Verify COD invoice under My invoices | Smoke | Positive | Invoice verification | INV-01–03 inside UI-03; UI-AC2 |
| TC-M-08 | Single Confirm on COD checkout does not create an invoice | Regression | Negative | One edge or negative checkout | CONF-04 / INV-05 (OUT of auto); UI-AC2 |

**Count:** 8 / 8. Smoke 5 (M-01, M-03, M-04, M-06, M-07). Regression 3 (M-02, M-05, M-08). Positive 5 / Negative 2 / Edge 1. Priorities: P1 on sell/auth/invoice paths; P2 on bad login, qty clamp, confirm-once.

**Not in this CSV (still OUT, documented earlier):** duplicate email (UI-04 covers it in auto); empty cart (UI-07); empty/weak register; billing-disabled; payment method required; search no results; sign out.

### Validation Notes

- Prompt 4’s eight named covers **override** the Prompt 3 line that said the manual CSV should only fill OUT-M gaps. Manual now mirrors Core AC1/AC2 for a human tester; leftover OUT-M rows stay in the inventory, not in the CSV.
- Confirm-once is the 8th case because empty-cart checkout is already UI-07 and qty clamp is already TC-M-05 / UI-06. Confirm-once was OUT of UI auto (flake if automated as a dedicated test) and is high value for a manual negative checkout.
- Invoice rule: TC-M-06 instructs wait then **Confirm twice**; TC-M-07 asserts **My invoices** (not success screen alone); TC-M-08 asserts one Confirm creates **no** new invoice row.
- Unique email placeholder `user_{timestamp}@example.com`; password example `Welcome1!` meets 8+ mixed case, number, symbol. Known catalog names Combination Pliers / Thor Hammer (search Pliers / Hammer). Qty expected 0→1 and 100→99 with toast. Copy: “Invalid email or password”, “Email is already in use.” (not expected on unique register), “There are no products found.” (must not appear on Pliers), “The cart is empty. Nothing to display.” (must not appear on TC-M-04).
- ActualResult and Status columns are empty (not executed). Tags are Smoke / Regression only (no sanity). CSV quoting uses RFC 4180 for commas/newlines in Steps.
- Live UI click-through still not used this session (same Cloudflare limit as prior entries). Labels and Confirm-twice behavior unchanged from Entry 1 source notes.
- README now points at `FunctionalTestCase/functional-test-cases.csv`. Shared placeholders also recorded in `ai-prompts/test-data.md`. No Playwright. No git commit.

---

## Entry 4 — Prompt 5: Review test coverage (manual CSV)

**Date:** 2026-08-25

### Prompt

Review `FunctionalTestCase/functional-test-cases.csv` against the assessment requirements.

Check: requirement traceability; positive/negative/edge coverage; Smoke vs Regression; clear preconditions and expected results; duplicate or low-value cases; maximum 5–8 manual tests.

Prior decisions: 5–8 manual max; TC-M-01..08; Confirm twice; UI-AC1/AC2; Smoke vs Regression; confirm-once is TC-M-08; qty clamp TC-M-05.

Do a real QA review of the CSV content (open the file, parse rows). Do not write Playwright. List problems first, then only necessary corrections. Apply real defects only. Append this review here. Do not git commit.

### AI Response Summary

Parsed 8 data rows × 12 columns (RFC 4180). Suite already met the cap, traceability (UI-AC1/AC2), type mix (5 Positive / 2 Negative / 1 Edge), Smoke/Regression split, and blank ActualResult/Status. Real defects were sequential-state and split-case duplication, not missing covers. Applied **four small field edits** in `FunctionalTestCase/functional-test-cases.csv`; still **8 / 8**. No new cases. No Playwright.

### Validation Notes

- **Changed — TC-M-06 Preconditions:** sequential run after TC-M-05 leaves quantity at 99, but 06 said “quantity may be 1.” Tester must reset that line to **1** before Proceed.
- **Changed — TC-M-07 Preconditions:** removed “or repeat logged-in COD checkout.” 07 is My invoices only; if 06 was skipped, run 06 first, then continue — do not treat a second full E2E as this case.
- **Changed — TC-M-07 ExpectedResult:** dropped the guest-user sentence (not an observable result of this case’s steps; guest ban already lives in 06 preconditions).
- **Changed — TC-M-08 ExpectedResult:** dropped the empty-cart / UI-07 design note (not an assertion of confirm-once).
- **Not changed (reviewed, not defects):** TC-M-01 vs 06/07/08 is a user **dependency**, not a duplicate; TC-M-03 vs 04 share a Pliers search but assert different outcomes (catalog vs two-line cart); 06 vs 07 **split** is the Prompt 4 cover split, not a merge; Smoke tags on 01/03/04/06/07 stay; RequirementIDs stay UI-AC1 (01–02) and UI-AC2 (03–08); count stays 8; quoting and blank ActualResult/Status were already correct.
- Re-parsed after edits: 8 rows, 12 fields, ActualResult/Status empty. No git commit.

---

## Entry 5 — Prompt 8: UI-01 + UI-02 combined in automation

**Date:** 2026-08-25

### Prompt

(Same session as automation Prompt 8.) Implement successful registration and login as **one** `@smoke` test and invalid login as **one** `@regression` test. Do not keep UI-01 and UI-02 as separate automated tests.

### AI Response Summary

Automation IDs/tags for the implemented pair:

| Implemented spec | Title tag | Covers planned IDs | Maps to |
| --- | --- | --- | --- |
| `tests/ui/auth.spec.js` | `@smoke` | **UI-01 + UI-02** (combined) | TC-M-01 |
| `tests/ui/auth.spec.js` | `@regression` | **UI-05** | TC-M-02 |

UI-01 and UI-02 remain the design IDs; they are one Playwright test so the 5–8 cap is not doubled. Remaining planned UI: UI-03, UI-04, UI-06, UI-07 (combined planned set = **6** UI tests, still inside 5–8). UI wiring homepage smoke was removed.

### Validation Notes

- Tags stay lowercase `@smoke` / `@regression` in the test title (grep-friendly).
- Unique customer at runtime; invalid login seeds via API then UI-logs in with `users.wrongPassword()`.
- No change to manual CSV IDs TC-M-01 / TC-M-02.

---

## Entry 6 — Prompt 9: UI-03 purchase E2E with both tags

**Date:** 2026-08-25

### Prompt

Implement the Toolshop purchase flow as a Playwright UI test: log in with a registered user, browse/search, add multiple products, update quantity, verify cart, COD checkout with Confirm twice, My invoices. Tag the test `@smoke` and `@regression`. Keep the 5–8 UI cap (3 specs/tests after this: 2 auth + 1 E2E).

### AI Response Summary

Implemented **one** combined E2E in `PrismStructure/tests/ui/purchase.spec.js` titled `@smoke @regression unique customer can search, update cart, checkout COD, and see invoice`. Covers planned **UI-03** (and manual TC-M-03..07 happy path in one auto test). Both tags are in the title so `npm run test:smoke` and `npm run test:regression` include it. No extra purchase variants.

| Implemented spec | Title tags | Covers planned IDs | Maps to |
| --- | --- | --- | --- |
| `tests/ui/auth.spec.js` | `@smoke` | UI-01 + UI-02 | TC-M-01 |
| `tests/ui/auth.spec.js` | `@regression` | UI-05 | TC-M-02 |
| `tests/ui/purchase.spec.js` | `@smoke` **and** `@regression` | **UI-03** | TC-M-03..07 (combined) |

**UI automated count:** **3 / 8** (was 2). Remaining planned: UI-04, UI-06, UI-07 (combined planned set still **6**, inside 5–8).

### Validation Notes

- Seed unique customer via API, then UI login (not UI register). Fresh browser context; `sessionStorage.cart_id` cleared after login.
- Confirm twice waits for `POST /payment/check` **and** `data-test="payment-success-message"` before the second Confirm; then waits for `POST /invoices`. No `waitForTimeout`.
- Product names resolved from `GET /products/search` against catalog (Pliers / Combination Pliers, Hammer / Thor Hammer).
- Checkout billing uses **NL** + `1234AA` (invoice API rejects `Austria` + `1234AA`); street/city come from postcode lookup.
- Assertions: two different cart lines, raised qty reflected in line total, COD selected, invoice number after two confirms, My invoices details show COD + line qty.
- Manual CSV IDs unchanged (still split TC-M-03..07).
