# AI Prompts – Requirements and Planning

QA engineer supplied numbered prompts. Cursor implemented. No invented facts.

---

## Entry 1

### Prompt

(QA engineer — Prompt 1.) Read `QA Practical Assessment.pdf`. Extract mandatory deliverables, UI and API acceptance criteria, test-count restrictions, required tools and framework, submission structure, and special instructions. Highlight ambiguous or conflicting requirements. Do not create code or Playwright files.

### AI Response Summary

Cursor extracted the six sections from the 15-page participant guide and listed conflicts. Source of truth is the PDF. No application or test code was created.

### Validation Notes

Checked against the full PDF, not only the briefing. Conflicts flagged: Core AC CRUD/comment vs Toolshop ecommerce; 5–8 tests per type vs “all possible flows”; confirm-twice vs API invoice payload; Prism vs Selenium in the repo tree; CSV filename vs folder name; skipped numbering in Common QA Requirements. QA engineer decisions kept: 5–8 cap, Playwright + Cursor, public GitHub, Confirm twice UI-only, Smoke/Regression tags, no code until later prompts.

### Changes I Made

Recorded this prompt and the extraction in `ai-prompts/requirements-and-planning.md`. No git commit on this prompt (QA engineer had not asked to commit).

### Reason for Changes

Prompt 1 required a prompt-history record and a requirements extraction, not a test suite.

---

## Entry 2

### Prompt

(QA engineer — Prompt 3.) Create a requirement and risk analysis for Practice Software Testing Toolshop. For each major flow: AC, business risk, failure impact, testing priority, UI vs API coverage, Smoke or Regression. Extra depth on authentication, cart state, checkout, duplicate confirmation, and invoices. Do not write Playwright code. Honor the 5–8 cap, Confirm twice UI-only, API invoice as one POST, unique emails, no invented comment/ticket CRUD.

### AI Response Summary

Cursor produced risk tables with P1 on sell/auth/invoice/money, extra depth on Confirm twice and cart `sessionStorage`, and a recommended API set of 7 tests (not coded yet). Confirm twice stayed UI-only (first Confirm = `/payment/check`, second = invoice). Full tables went to `ai-prompts/test-design.md`; a compact copy went into `project-info.md`.

### Validation Notes

Cross-checked against Sprint 5 `PaymentComponent.checkPayment()` and `CartService` (qty clamp 1–99 in UI; `cart_id` in sessionStorage). Live click-through was still blocked by Cloudflare in that session. Caps and UI-01..07 selection were unchanged.

### Changes I Made

Added the Prompt 3 history entry and a Requirement and risk analysis section in `project-info.md`. Full tables persisted in `ai-prompts/test-design.md`. No Playwright. Later git push (QA engineer: “push the local code to git”) included these artifacts as `ed392b3`.

### Reason for Changes

The assessment requires a requirement/risk analysis as a deliverable. Prompt 3 forbade automation code.

---

## Entry 3

### Prompt

(QA engineer — Prompt 6.) Inspect the existing repository and Prism Playwright structure. Explain folder conventions, page-object pattern, fixtures and utilities, test-data handling, tagging, UI/API execution, and report configuration. Follow existing patterns. Do not modify files yet.

### AI Response Summary

Cursor reported assessment scaffolding only. `PrismStructure/` was a stub README. There was no `package.json`, `playwright.config.js`, specs, page objects, fixtures, or reports. Public remote was already `https://github.com/awinkleanand-cpu/qa-ai-practical-assessment`. Inspection was read-only.

### Validation Notes

Verified against the workspace tree, root/`PrismStructure` READMEs, `project-info.md`, `.gitignore`, the CSV, the assessment PDF, and the GitHub remote. No files were written in that session.

### Changes I Made

None. Prompt 6 was read-only.

### Reason for Changes

No changes: the QA engineer forbade edits until the framework prompt.
