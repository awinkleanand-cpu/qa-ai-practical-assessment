# AI Prompts – Documentation and Summary

Git process, Prompts 17–19, README, and project-info. QA engineer asked to push git and supplied numbered prompts. Cursor implemented.

---

## Entry 1

### Prompt

(QA engineer.) Submit over public git. Workspace remote is `https://github.com/awinkleanand-cpu/qa-ai-practical-assessment`. Iterative pushes, not one dump. Repeated request: “push the local code to git.”

### AI Response Summary

Cursor committed and pushed on `main` when the QA engineer asked. Public repo name is `qa-ai-practical-assessment` (GitHub `awinkleanand-cpu`). Recorded chunk commits: `ed392b3` (Prompts 1–3), `af9991d` (8 manual cases + coverage review), `4dc159a` (Playwright scaffold + UI auth + COD), `de7ed49` (UI edges + API lifecycle/negatives), `4d0633d` (billing stabilize + project-info). Initial scaffold commit `4d1f00e` predates those chunks.

### Validation Notes

Hashes taken from local `git` log. `.env`, `node_modules`, `playwright-report/`, and `test-results/` were not committed. Cursor did not invent the public-git requirement; the QA engineer required it.

### Changes I Made

Pushes only when the QA engineer asked. No force-push. No secrets in those commits.

### Reason for Changes

Assessment submission is a public GitHub URL. Work was pushed after completed prompt chunks, not as a single dump.

---

## Entry 2

### Prompt

(QA engineer — Prompt 17.) Create `project-info.md` for the Toolshop QA assessment: summary, AUT, tools, scope/ACs, risk, UI/API and smoke/regression strategy, coverage mix, test-data, how AI was used, responsible AI, reuse. Describe only work present in the repository.

### AI Response Summary

Cursor replaced the stub `project-info.md` with the live repo: Cursor; Toolshop checkout; Playwright JS Prism in `PrismStructure/`; manual 8 / UI 6 / API 7; Confirm twice UI-only and one `POST /invoices`; live vs OpenAPI (invoice 201 vs documented 200; GET cart extra-schema `cart_items`); NL billing vs Austria/Florida 422; Combination Pliers OOS exact-heading fix; public SUT 500/ETIMEDOUT without extra retries; `uniquePassword` and no hardcoded JWT. Setup Summary answers the workflow questions from prompts 1–16.

### Validation Notes

Checked against current specs, CSV, `package.json`, `.gitignore`, and recorded debug notes. Did not claim committed HTML reports as Passed evidence (reports are gitignored). Did not invent Selenium, Allure, or extra tests.

### Changes I Made

Rewrote `project-info.md`. No extra participant edits recorded beyond accepting that rewrite.

### Reason for Changes

The previous file still described 7 UI tests, “API not coded yet,” and unfilled Setup Summary placeholders.

---

## Entry 3

### Prompt

(QA engineer — Prompt 18.) Create root `README.md` from the actual repository: overview, prerequisites, installation, configuration without secrets, test-data location, commands for all/UI/API/smoke/regression, reports, structure, known application behavior including invoice double confirmation, troubleshooting. Verify every command against `package.json` and Playwright config.

### AI Response Summary

Cursor rewrote root `README.md`. Documented only existing scripts (`npm test`, `test:ui`, `test:api`, `test:smoke`, `test:regression`, `report`), PowerShell `copy .env.example .env`, URLs-only `.env.example`, Confirm twice (UI) vs one API POST, OpenAPI vs live, NL/Austria-Florida 422, Combination Pliers OOS, workers=2, `domcontentloaded`, unique emails. Shortened `PrismStructure/README.md` to point at the root README.

### Validation Notes

Scripts checked against `PrismStructure/package.json` (there is no root `package.json`). Reporter path checked against `playwright.config.js`. Quoted `@smoke` / `@regression` for PowerShell.

### Changes I Made

Root `README.md` and `PrismStructure/README.md`. No invented scripts or secrets.

### Reason for Changes

Prompt 18 requires a complete README. The previous root file was a short layout-plus-commands note.

---

## Entry 4

### Prompt

(QA engineer — Prompt 19.) Summarize this conversation into the assessment `ai-prompts/` files. For each meaningful interaction: Prompt, AI Response Summary, Validation Notes, Changes I Made, Reason for Changes. Do not invent. Distinguish QA engineer decisions from Cursor implementation. Split files: requirements 1/3/6; test-design 2/4/5/10/11; test-data (unique users, NL billing, OOS); automation 7–9 and 12–16; this file for git, 17–19, README/project-info. No git commit.

### AI Response Summary

Cursor replaced the five `ai-prompts/*.md` files with short Entry-format histories. Counts: requirements 3, test-design 5, test-data 3, automation 8, documentation 4. A prior Prompt 19 attempt failed with `resource_exhausted`; this rewrite stayed short and used only recorded conversation facts.

### Validation Notes

Facts limited to repo artifacts, git log hashes, and prior session notes already in these files. Pass timings not re-invented. QA engineer supplied numbered prompts and git-push requests; Cursor implemented.

### Changes I Made

Replaced contents of the five `ai-prompts/` markdown files listed above. No git commit.

### Reason for Changes

Prompt 19 requires this format. Older files mixed long extractions, duplicate prompt copies, and missing Prompt 6 / git / Prompt 19 entries.

---

## Entry 5

### Prompt

(QA engineer — Prompt 20.) Final audit. Audit the repository against the QA assessment. Check: required folder structure and files; 5–8 manual, UI, and API tests; Smoke and Regression tags; requirement traceability; positive, negative, and edge coverage; passing execution evidence; README command accuracy; complete AI prompt history; no secrets or generated clutter committed; meaningful iterative Git history. Return a checklist with Pass, Fail, or Needs Evidence. Do not modify files.

### AI Response Summary

Cursor ran a read-only audit (no file writes). Structure, 5–8 counts (manual 8 / UI 6 / API 7 at that commit), Smoke/Regression tags, README scripts, five `ai-prompts` files, and iterative git **Passed**. Passing execution evidence was **Needs Evidence**: `playwright-report/` and `test-results/` were gitignored, CSV `ActualResult`/`Status` were blank, and Prompt 18–19 docs were not on GitHub yet at the first audit snapshot (`4d0633d`). A later GitHub-vs-PDF check at `ac00020` repeated the same evidence gaps on origin/main.

### Validation Notes

Read-only. Playwright suite was not re-run for Prompt 20. Public repo https://github.com/awinkleanand-cpu/qa-ai-practical-assessment. `.cursor` rules/skills rated optional/absent.

### Changes I Made

None on Prompt 20 (audit-only).

### Reason for Changes

Prompt 20 forbade modifications.

---

## Entry 6

### Prompt

(QA engineer.) Complete the Toolshop QA assessment to 100% against the PDF. Close GitHub-vs-PDF gaps: commit dated execution reports under `PrismStructure/execution-reports/` while keeping live `playwright-report/` and `test-results/` gitignored; fill CSV `ActualResult`/`Status`; add Prompt 20 plus this completion to prompt history; skip optional `.cursor` rules. Automate TC-M-08 confirm-once as one focused UI `@regression` (UI becomes 7, still ≤8). Run `npx playwright test` until green; do not add config retries, `waitForTimeout`, force clicks, or weaker asserts. Push to `origin/main`. Do not add Selenium, exceed 8 UI/API tests, or commit `.env` / `node_modules` / secrets.

### AI Response Summary

Cursor added `CheckoutPage.confirmOnce` and `tests/ui/purchase.spec.js` confirm-once `@regression`. Listed 7 UI + 7 API. First `npx playwright test` from `PrismStructure/` on 2026-08-26: **14 passed (1.1m)**. Copied HTML to `PrismStructure/execution-reports/playwright-html/`; wrote `execution-summary.md`. Filled CSV Status=Passed with date + mapped spec titles. Updated README / Prism README / `project-info.md` / `.gitignore` un-ignore for `execution-reports/`. No screenshots (Playwright `only-on-failure`; run had none). No `.cursor` rules added.

### Validation Notes

`npx playwright test tests/ui --list` → 7; `tests/api --list` → 7. Full suite 14 passed on the first try (no SUT 500/ETIMEDOUT this run). Mapped TC-M-01..07 to existing passing UI tests; TC-M-08 to the new confirm-once test. Did not fake Passed without a mapping.

### Changes I Made

Confirm-once UI test and page method; `execution-reports/`; CSV Status/ActualResult; README report path; prompt-history entries; `.gitignore` exception. Commit and push requested in this prompt.

### Reason for Changes

PDF requires committed execution reports in PrismStructure and all case statuses Passed. Live generated folders stay gitignored so later runs do not dump secrets. TC-M-08 had no automated mapping, so it was automated instead of marked Passed by hand.
