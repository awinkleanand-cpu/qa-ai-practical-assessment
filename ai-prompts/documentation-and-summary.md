# AI Prompts – Documentation and Summary

Prompts used for writing README, reports, and related documentation.

## Entry 1 — Prompt 16 README / counts

**Date:** 2026-08-26

- **Prompt:** Keep README accurate on test counts and commands after final validation; append Prompt 16 to `automation-and-debugging.md`.
- **AI Response Summary:** Root and `PrismStructure/` READMEs list 8 manual / 6 UI / 7 API, all five npm scripts, HTML report path, and the Prompt 16 pass result. `project-info.md` project summary filled with the same counts.
- **Edits You Made:** Added `test:ui` / `test:api` to the root command table (they already existed in `package.json` and `PrismStructure/README.md`).
- **Reason for Edits:** Final validation confirmed those scripts; the root README had omitted them.

---

## Entry 2 — Prompt 17 project-info.md

**Date:** 2026-08-26

- **Prompt:** Rewrite `project-info.md` for the current Toolshop QA assessment (not the original stub). Cover project summary, AUT, tools, scope/ACs, requirement and risk analysis, UI/API strategy, smoke/regression, positive/negative/edge, test-data, AI use (planning/design/automation/validation/debugging), responsible AI, and reuse. Describe only work present in the repository. Do not invent tests, reports, or tools. Append this prompt here. No git commit.
- **AI Response Summary:** Replaced `project-info.md` so it matches the live repo: Cursor; Toolshop checkout; Playwright JS Prism in `PrismStructure/`; manual **8** / UI **6** / API **7**; Confirm twice UI-only and one `POST /invoices`; live vs OpenAPI (invoice **201** vs documented **200**; GET cart extra-schema `cart_items`); NL billing lookup and Austria/Florida 422; Combination Pliers OOS exact-heading fix; public SUT 500/ETIMEDOUT documented without extra retries; `uniquePassword` and no hardcoded JWT; `.env` gitignored; HTML reports generated locally and gitignored (not claimed as committed Passed evidence). Setup Summary answers the ten assessment workflow questions from actual prompts 1–16.
- **Edits You Made:** None beyond asking for an honest rewrite against the current files (counts, titles, gitignore, and debugging notes).
- **Reason for Edits:** The previous `project-info.md` still described 7 UI tests, “API not coded yet,” and unfilled Setup Summary placeholders, which no longer matched the repository.
