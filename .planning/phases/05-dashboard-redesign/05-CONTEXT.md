# Phase 5: Dashboard Redesign - Context

**Gathered:** 2026-06-29
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers a modern, clean light-mode dashboard redesign for the entry portal.
Specifically:
- Extraction of massive inline CSS stylesheet from `public/index.html` to a new centralized asset file `public/css/dashboard.css`.
- Extraction of massive inline JavaScript block from `public/index.html` to a new centralized asset file `public/js/dashboard.js`.
- A professional, light-mode redesign of the Aether Mocks dashboard with Outfit typography, custom subtle shadows, and responsive layouts.
- Refined, professional dynamic color palettes (pastel backgrounds, dark text, clean borders) for mock providers and subject filters/badges.

</domain>

<decisions>
## Implementation Decisions

### Modular File Structure
- **D-01:** Strip massive inline style and script blocks from the dashboard HTML file and link to external `dashboard.css` and `dashboard.js` assets. This cleans up the codebase architecture and keeps files manageable.

### Premium Light-Mode Theme
- **D-02:** Establish a clean, minimal light-mode styling system using modern slate, indigo, emerald, and violet color tokens. Keep eye strain low for mock browsing sessions.
- **D-03:** Maintain a low-opacity floating ambient orb background to provide aesthetic depth and visual polish without distraction.

### Professional Dynamic Palette
- **D-04:** Replace generic and bright neon badges with soft, modern pastel badges. Define a mapping in JS matching each mock provider (e.g., Oliveboard, Pundits, The Solver, English Madhyam) to a specific theme color configuration (bg, text, border, main accent).

### Robust Interactivity
- **D-05:** Guarantee full functionality of search queries, filter pill configurations, category selectors, status filters (All/Completed/Pending), sorting, grid view cards, and roadmap timeline navigation. Ensure zero JavaScript developer console errors.

</decisions>

<canonical_refs>
## Canonical References

### Project Scope
- `.planning/PROJECT.md` — Project core value and constraints
- `.planning/ROADMAP.md` — Phase 5 targets and success criteria
- `.planning/STATE.md` — Position state tracker

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The dashboard is powered by `public/mocks-data.js` containing the compiled `MOCK_DATA` array.
- Icons are loaded via FontAwesome v6.4.0.
- Typography is Outfit (Google Fonts).

</code_context>

<deferred>
## Deferred Ideas

- None.

</deferred>

---
*Phase: 05-dashboard-redesign*
*Context gathered: 2026-06-29*
