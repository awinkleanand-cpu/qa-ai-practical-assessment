# AI Prompts – Test Data

Unique users, NL billing vs Austria lookup, and Combination Pliers OOS. Facts from Prompts 8 and 14–16. QA engineer supplied those prompts; Cursor implemented.

---

## Entry 1

### Prompt

(QA engineer — Prompt 8, data facts.) Implement UI registration/login with unique valid user data at runtime. Do not hardcode credentials.

### AI Response Summary

Cursor generated unique emails at runtime (`user_{timestamp}{hex}@example.com`) via `users.createUniqueCustomer()`. Live register returned 422: “The given password has appeared in a data leak.” `Welcome1!` is HIBP-blocked on the public API. Passwords now come from `uniquePassword()` (`Aa1!` + hex) unless `TEST_PASSWORD` is set. Live v2.4 register form requires `house_number` (`data-test="house_number"`); Sprint 5 HTML had misled the first fill.

### Validation Notes

Register without `house_number` showed “House number is required.” After `uniquePassword()`, auth smoke passed. `Welcome1!` remains a manual CSV example only, not a live automation password.

### Changes I Made

`PrismStructure/src/data/users.js`, `PrismStructure/src/utils/unique.js`, and `RegisterPage` (`house_number`). No static customer on the public shop.

### Reason for Changes

Leaked-password rejection and the live house-number field are SUT rules. Unique data is required on a shared shop.

---

## Entry 2

### Prompt

(QA engineer — Prompts 14–15, billing data.) Run `@smoke` and fix real test defects. Do not weaken invoice asserts.

### AI Response Summary

Purchase invoice POST returned 422 because register profile country is `"Austria"` and postcode lookup of Austria + `1234AA` + house `1` returned a faker US address (Florida city). Checkout then sent `billing_country=NL` with that city. Live NL lookup is Idaerd / de Bruijnsingel / Limburg. `fillBilling` must wait for `/postcode-lookup?country=NL` and write that body. Austria is not a `<select>` option value, so waiting for country not-empty never succeeds.

### Validation Notes

Live probe: `GET /postcode-lookup?country=Austria&postcode=1234AA&house_number=1` → Florida faker address; `country=NL` → Idaerd / de Bruijnsingel / Limburg. Invoice success expect was not changed to accept 422.

### Changes I Made

`CheckoutPage.fillBilling` waits for the NL lookup response. API `billing.invoicePayload` uses NL + lookup street/city/state, not Utrecht/Netherlands or Austria/Florida. Dropped the country-not-empty wait in Prompt 15.

### Reason for Changes

NL + Florida city is an invalid checkout payload. The product lookup quirk is real; tests must send matching country and city.

---

## Entry 3

### Prompt

(QA engineer — Prompt 16, catalog data.) Run the full suite. Apply the smallest signal-based fix only for a clear test defect.

### AI Response Summary

Combination Pliers is Out of stock on the live shop. `findInStock` returned in-stock **Pliers**, but `hasText: 'Pliers'` + `.first()` opened Combination Pliers (substring). UI tests now open an in-stock product by exact heading. Preferred OOS name is not used as a fallback.

### Validation Notes

Screenshots and a11y snapshots showed Out of stock on Combination Pliers; API search listed `in_stock: false` for that name and `true` for Pliers. A regex on `data-test="product-name"` still timed out because card text is not only the heading.

### Changes I Made

`HomePage.productByName` / `ProductPage.waitForName` use `getByRole('heading', { name, exact: true })`. Cart/invoice line locators use exact name. `catalogProduct` no longer falls back to the preferred OOS name.

### Reason for Changes

Substring “Pliers” selected an OOS product. Exact heading selects the in-stock card.
