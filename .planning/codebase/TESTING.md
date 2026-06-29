# Testing Patterns

**Analysis Date:** 2026-06-29

## Test Framework
- **Automated Tests:** None currently integrated in this codebase.
- **Manual Verification:** Verification is done via console outputs, file system audits, and visual inspections in the browser.

## Run Commands

**Data Compilation Verification:**
```bash
python generate_mocks_data.py
```
*Verification criteria:* Check that the console prints `Successfully generated public/mocks-data.js with [N] mocks.` and check that `public/mocks-data.js` contains a valid Javascript declaration of `MOCK_DATA`.

**Local Dev Server Testing:**
To test the static site locally, launch a simple web server (e.g. using Python's built-in module) to avoid CORS issues:
```bash
python -m http.server 8000 --directory public
```
*Verification URL:* `http://localhost:8000`

## Manual Verification Checklist

**1. Dashboard Loading & Stats:**
- Verify dashboard renders the glassmorphic theme.
- Confirm total mock counter matches the output of `generate_mocks_data.py`.
- Confirm subject and provider counts are calculated correctly.

**2. Interactive Filters:**
- Type inside the search bar; verify listings match keywords and update stats accordingly.
- Click provider tags/buttons; verify the listings filter to that provider only.
- Select a subject filter from dropdown; verify only mocks from that subject display.
- Change filters simultaneously and confirm intersection filtering behaves correctly.

**3. Pagination:**
- Verify pagination buttons update current page view.
- Confirm items count matches limits (e.g., 10 or 20 cards per page).
- Verify page numbers update correctly.

**4. Quiz Access:**
- Click on any mock card; confirm it loads the selected mock test in a new tab/window without any 404 errors.

---

*Testing analysis: 2026-06-29*
*Update after adding test suites*
