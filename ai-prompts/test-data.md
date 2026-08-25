# AI Prompts – Test Data

Prompts used to generate test data for UI + API.

---

## Entry 1 — Prompt 4: Manual CSV test data

**Date:** 2026-08-25

### Prompt

(Same session as test-design Prompt 4.) Create 8 manual functional cases; unique emails for registration (`user_{timestamp}@example.com`); COD checkout; Confirm twice on UI; expected messages and qty clamp values where used. Persist reusable placeholders here because the CSV TestData column is substantial.

### AI Response Summary

Shared placeholders for the manual suite in `FunctionalTestCase/functional-test-cases.csv`. No secrets. No live data generated against the SUT. Automation payloads are not in this entry (API-AC2 example body already lives in `ai-prompts/requirements-and-planning.md`).

### Validation Notes

- Password `Welcome1!` is an example that meets the documented register rule (8+, mixed case, number, symbol) — not a real credential.
- Product names Combination Pliers / Thor Hammer are stable Sprint 5 catalog examples used with search queries Pliers / Hammer.
- Qty bounds 1–99 and messages match Entry 1 UI map (`en.json` / CartService clamp).
- `{timestamp}` must be replaced per run on the public SUT; never reuse a static email.

---

## Shared placeholders (manual TC-M-01..08)

| Use | Value | Cases |
| --- | --- | --- |
| SUT | https://practicesoftwaretesting.com/ | All |
| Unique email | `user_{timestamp}@example.com` (replace `{timestamp}` each run, e.g. `user_202608251430@example.com`) | TC-M-01, then reuse in 02 / 06 / 07 / 08 |
| Valid password | `Welcome1!` | TC-M-01, TC-M-06+ |
| Wrong password | `WrongPass1!` | TC-M-02 |
| Register profile | First: Ava; Last: Mercer; DOB: 1990-01-15; Country: Austria; Postal: 1234AA; House: 1; Phone: 1234567890 | TC-M-01 |
| Search / products | Query `Pliers` → Combination Pliers; query `Hammer` → Thor Hammer | TC-M-03, TC-M-04, TC-M-05 |
| Qty edges | Increase to 2 (line total = unit × 2); `0` clamps to **1**; `100` caps at **99** + warning toast | TC-M-05 |
| Billing (checkout) | Street: Test Street 1; City: Utrecht; State: Utrecht; Country: Austria; Postal: 1234AA | TC-M-06, TC-M-08 |
| Payment | Cash on Delivery (`cash-on-delivery`); UI Confirm **twice** for a real invoice; once only for the negative | TC-M-06, TC-M-07, TC-M-08 |

### Expected UI copy (assert these strings)

| Message | When |
| --- | --- |
| Email is already in use. | Duplicate register — **not** expected in TC-M-01 (unique email). Covered in UI-04 auto, not in this CSV. |
| Invalid email or password | TC-M-02 wrong password |
| There are no products found. | Must **not** appear for search `Pliers` in TC-M-03 |
| The cart is empty. Nothing to display. | Must **not** appear in TC-M-04 (two lines present). Empty-cart checkout is UI-07 auto, not a manual case. |

### Isolation rules

- New unique email per registration run; do not seed a shared public customer.
- Fresh cart / browser session if a leftover badge is visible (`cart_id` is sessionStorage).
- Registered user for COD + My invoices — never Continue as Guest for TC-M-06/07/08.
- Wait after the first Confirm before the second (TC-M-06). TC-M-08 clicks Confirm **once** and waits ≥5 seconds without a second click.
