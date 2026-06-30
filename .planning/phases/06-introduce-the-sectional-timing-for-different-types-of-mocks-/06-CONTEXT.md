# Phase 6: Introduce the sectional timing for different types of mocks - Context

**Gathered:** 2026-06-30
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase introduces a binary toggle switch to override sectional timings with a strict 10-minute limit.
Specifically:
- Replace the select dropdown in the dashboard sidebar Settings area with a switch.
- Add CSS styling rules for a premium toggle switch in `dashboard.css` and `mock-main.css`.
- Update dashboard logic in `dashboard.js` to handle toggle switch changes.
- Update welcome screen logic in `mock-core.js` to display the switch toggle instead of the select element, keeping options unified.
- Ensure the start button handles toggle states and saves preferences to `localStorage`.

</domain>

<decisions>
## Implementation Decisions

### Toggle Switch UI
- **D-01:** Replace the dropdown select menus in both the dashboard and mock welcome screens with an iOS-style toggle switch. A toggle switch is simpler and faster for forcing a 10-minute time limit.

### Standard CSS Rules
- **D-02:** Append switch toggle stylesheet rules at the end of both `dashboard.css` and `mock-main.css`.

</decisions>

<canonical_refs>
## Canonical References

### Project Scope
- `.planning/PROJECT.md` — Project core value and constraints
- `.planning/ROADMAP.md` — Phase 6 targets and success criteria

</canonical_refs>

---
*Phase: 06-introduce-the-sectional-timing-for-different-types-of-mocks-*
*Context gathered: 2026-06-30*
