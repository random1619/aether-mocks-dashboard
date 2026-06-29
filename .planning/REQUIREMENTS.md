# Requirements: Aether Mocks Dashboard

**Defined:** 2026-06-29
**Core Value:** Ensure mock test preparation is seamless and distraction-free by offering a highly responsive, unified browsing dashboard and consistent, professional, clean mock interfaces.

## v1 Requirements

### Layout (Mock Layout Unification)

- [ ] **LAYOUT-01**: Centralized light-mode quiz stylesheet (`public/css/mock-main.css`) exists with clean, professional typography and margins.
- [ ] **LAYOUT-02**: Clean mock pages by removing unneeded inline styling attributes (`style="..."`) and custom headers.
- [ ] **LAYOUT-03**: Standardize display grids for quiz options, navigation bar panels, and questions.

### Logic (Unified Interactivity)

- [ ] **LOGIC-01**: Centralized mock interactive script (`public/js/mock-core.js`) exists with unified quiz controllers.
- [ ] **LOGIC-02**: Active countdown timer is implemented in JavaScript to monitor exam duration.
- [ ] **LOGIC-03**: Page navigation mechanisms exist to move between next/previous questions and jump to specific items via a list panel.
- [ ] **LOGIC-04**: Strip out bloated vendor interactive scripts while whitelisting KaTeX/MathJax LaTeX formula engines.

### Integrate (Mock Integrations)

- [ ] **INTEGRATE-01**: Link centralized CSS and JS files across all mock HTML pages using appropriate relative path calculations.
- [ ] **INTEGRATE-02**: Apply standard styling class names (such as `.quiz-option`) to elements in the HTML mock pages to bind the central JS handlers correctly.

## v2 Requirements

### Analytics & Cache

- **ANAL-01**: Persistent quiz scoring and progress saved to browser `localStorage` to recover state after accidental page close.
- **ANAL-02**: Performance indexing partitioned by provider/subject to speed up dashboard lookup.

## Out of Scope

| Feature | Reason |
|---------|--------|
| User Account Accounts/Login | Out of scope for static hosting without server APIs |
| Database-backed scoring | Client-side tracking is sufficient for static mocks |
| Real-time multi-tab progress syncing | High complexity, not core to the distraction-free exam taking value |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAYOUT-01 | Phase 1 | Pending |
| LAYOUT-02 | Phase 1 | Pending |
| LAYOUT-03 | Phase 1 | Pending |
| LOGIC-01 | Phase 1 | Pending |
| LOGIC-02 | Phase 1 | Pending |
| LOGIC-03 | Phase 1 | Pending |
| LOGIC-04 | Phase 1 | Pending |
| INTEGRATE-01 | Phase 2 | Pending |
| INTEGRATE-02 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-29*
*Last updated: 2026-06-29 after initial definition*
