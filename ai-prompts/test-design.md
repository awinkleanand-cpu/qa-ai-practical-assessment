# AI Prompts – Test Design

QA engineer supplied numbered prompts. Cursor implemented. No invented facts.

---

## Entry 1

### Prompt

(QA engineer — Prompt 2.) Analyze https://practicesoftwaretesting.com/ as a QA engineer. Identify main testable ecommerce flows (registration, login/profile, browse/search, cart/qty, COD checkout, invoices). Categorize Smoke or Regression. Include positive, negative, and edge. Keep scope suitable for 5–8 UI automated tests. Do not write Playwright/test code.

### AI Response Summary

Cursor recommended 7 UI automated tests (3 Smoke, 4 Regression) covering AC1 + AC2 plus high-risk negatives/edges. Extra flows (guest checkout, other payments, filters, PDF, 2FA, chat) were marked OUT of the UI cap. Confirm twice was documented as UI-only. No Playwright code. Later automation combined register+login, so the implemented UI count became 6 (AI suggestion the QA engineer accepted).

### Validation Notes

Live click-through was blocked by Cloudflare; labels and Confirm-twice behavior were checked against Sprint 5 Angular source and `en.json`. Cap honored: 7 planned UI cases, not “all possible flows.”

### Changes I Made

Recorded the flow inventory and the recommended 7-test set in `ai-prompts/test-design.md`. No test code. Later git push of planning artifacts: `ed392b3`.

### Reason for Changes

Prompt 2 was analysis only. Combining UI-01 and UI-02 into one smoke test happened in Prompt 8, not here.

---

## Entry 2

### Prompt

(QA engineer — Prompt 4.) Create 8 manual functional test cases. Cover registration/login, invalid login, product search, adding multiple products, updating quantity, COD checkout, invoice verification, and one edge/negative checkout. CSV columns as specified. Smoke or Regression tags. Leave ActualResult and Status blank. Do not write Playwright. Unique emails `user_{timestamp}@example.com`. Eighth case = confirm-once.

### AI Response Summary

Cursor wrote 8 human-executable rows in `FunctionalTestCase/functional-test-cases.csv` (`TC-M-01`…`TC-M-08`). Eighth case is confirm-once, not empty cart (already planned as UI-07) and not qty clamp (TC-M-05). Shared placeholders also went to `ai-prompts/test-data.md`. No automation code.

### Validation Notes

Eight named covers override an earlier Prompt 3 line that said the CSV should only fill OUT-M gaps. Tags are Smoke/Regression only. ActualResult/Status left blank. Password example `Welcome1!` met the documented register rule (later live register rejected it as leaked — see test-data / Prompt 8).

### Changes I Made

Replaced the CSV stub with TC-M-01..08. Updated README pointer and `ai-prompts/test-data.md` placeholders.

### Reason for Changes

Manual suite must sit inside the 5–8 cap and cover Core AC1/AC2 for a human tester.

---

## Entry 3

### Prompt

(QA engineer — Prompt 5.) Review `FunctionalTestCase/functional-test-cases.csv` against assessment requirements: traceability, positive/negative/edge, Smoke vs Regression, preconditions/expected results, duplicates, 5–8 max. List problems first; apply real defects only. Do not write Playwright. Do not git commit.

### AI Response Summary

Cursor parsed 8 data rows × 12 columns. Cap, UI-AC1/AC2 traceability, type mix, and blank ActualResult/Status already met the brief. Real defects were sequential-state and split-case overlap. Four small field edits were applied; count stayed 8/8. No new cases.

### Validation Notes

QA review opened the CSV and re-parsed after edits. Not treated as defects: TC-M-01 vs 06/07/08 user dependency; TC-M-03 vs 04 different asserts; 06 vs 07 cover split; Smoke tags on 01/03/04/06/07.

### Changes I Made

TC-M-06 preconditions: reset qty to 1 after TC-M-05’s 99. TC-M-07: My invoices only (do not repeat a second E2E). Dropped non-observable guest/empty-cart notes from 07/08 expected results.

### Reason for Changes

Sequential CSV state would have made TC-M-06 assert the wrong cart qty; 07/08 expected results had design notes that were not case asserts.

---

## Entry 4

### Prompt

(QA engineer — Prompt 10.) Review the current UI suite (3 tests) and add only the highest-value missing scenarios while keeping 5–8 tests. Include negative/edge coverage for search, cart, or checkout. Avoid duplicating the E2E. Tag `@smoke` or `@regression`. Target 6: existing 3 + duplicate email + qty clamp + empty cart.

### AI Response Summary

Cursor added three `@regression` tests and skipped a second purchase E2E, confirm-once, and search-no-results (optional 7th left as spare). UI automated count became 6/8. Live duplicate-email copy was “A customer with this email address already exists.” (HTTP 409), not the earlier Sprint 5 string.

### Validation Notes

`npx playwright test tests/ui --list` showed 6 tests in 3 files. Six default workers caused Cloudflare/`goto` timeouts; `workers: 2` kept the run stable. Empty cart with no `cart_id` does not show empty copy; the test seeds `POST /carts` + `sessionStorage`. Qty clamp 0→1 and 100→99 matched source.

### Changes I Made

Added UI-04 (duplicate email) in `tests/ui/auth.spec.js`, UI-06/UI-07 in `tests/ui/cart.spec.js`, set `workers: 2`, updated design counts. Did not add search-no-results.

### Reason for Changes

Highest-value gaps inside the cap without duplicating the COD E2E. Search-no-results was optional and left unused.

---

## Entry 5

### Prompt

(QA engineer — Prompt 11.) Review https://api.practicesoftwaretesting.com/api/documentation. Identify endpoints, bodies, auth, and status codes for register, login, products, cart create/add/GET, invoice. Do not guess undocumented fields. Do not write API tests.

### AI Response Summary

Cursor fetched OpenAPI 3.2.0 Toolshop API v5.0.0 from `GET /docs` (Swagger UI is HTML; `/openapi.json` 404). Register/login/products/carts are public; invoices need Bearer. Documented `POST /invoices` success is 200, not 201. GET cart schema is `id` only. Confirm twice is UI-only (`POST /payment/check`). No API tests written.

### Validation Notes

Machine JSON is `/docs`. Later Prompt 12 live probes showed invoice 201 and extra-schema `cart_items` — those are live vs spec, not invented request fields. Login docs list no error statuses.

### Changes I Made

Persisted the contract notes in `ai-prompts/test-design.md`. No specs added.

### Reason for Changes

Prompt 11 forbade writing tests. Documenting OpenAPI vs later live 201/`cart_items` prevented false requirements.
