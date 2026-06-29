# Phase 2: Page Unification & Cleaning - Context

**Gathered:** 2026-06-29
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase unifies the layout and styling of all static mock exam HTML pages in the project:
- Dynamically link the centralized `mock-main.css` and `mock-core.js` files using relative paths.
- Remove all vendor-specific inline styles and bloated trackers.
- Inject unified container and navigation classes into mock exam structures.

</domain>

<decisions>
## Implementation Decisions

### Dynamic Linking
- **D-01:** Calculate the folder depth of each mock page and dynamically inject the relative path prefix (e.g., `../../css/mock-main.css` or `../../../js/mock-core.js`) to link the centralized stylesheet and javascript controller correctly.

### HTML Cleaning
- **D-02:** Remove all inline styles (`style="..."`), custom header structures, and vendor analytics tracking scripts from the mock pages to reduce overhead.
- **D-03:** Map each question card to a `.question-card` block and all option containers to `.quiz-option` blocks to ensure compatibility with `mock-core.js`.

### the agent's Discretion
- The exact layout restructuring of question elements and choice badges can be adjusted to match the unified stylesheet.

</decisions>

<canonical_refs>
## Canonical References

### Project Scope
- `.planning/PROJECT.md` — Project core value and constraints
- `.planning/REQUIREMENTS.md` — Functional requirements for INTEGRATE and LAYOUT
- `.planning/ROADMAP.md` — Phase 2 targets and success criteria

### Phase 1 Assets
- `public/css/mock-main.css` — Centralized styles
- `public/js/mock-core.js` — Centralized Javascript controller

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The Python processing script `fix_html_problems.py` (or related local automation scripts) can be adapted or run to automate the cleaning and replacement work across all mock HTML pages.

</code_context>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope.

</deferred>

---
*Phase: 02-page-unification-cleaning*
*Context gathered: 2026-06-29*
