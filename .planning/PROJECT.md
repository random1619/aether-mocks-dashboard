# Aether Mocks Dashboard

## What This Is

A static web dashboard for hosting and browsing mock test HTML pages. The system parses, indexes, and normalizes mock test files into a unified dashboard, enabling users to search, filter, and take mocks from various vendors in a clean, unified presentation.

## Core Value

Ensure mock test preparation is seamless and distraction-free by offering a highly responsive, unified browsing dashboard and consistent, professional, clean mock interfaces.

## Requirements

### Validated

- ✓ **Static Dashboard Interface** — Searchable, filterable, and paginated portal that loads mock metadata from `mocks-data.js` and lists cards with links.
- ✓ **Static Mock Indexing Compiler** — Python script `generate_mocks_data.py` walks the web directories, normalizes file names, determines subjects/categories, and outputs the `mocks-data.js` dataset.
- ✓ **Multi-Provider Support** — Structures to serve scraped mock exams from various providers (Pundits, Oliveboard, The Solver, English Madhyam) under `public/`.
- ✓ **Multi-Platform Hosting** — Deployment configurations for Firebase Hosting (`cbt-mocks`) and Render Static Sites.

### Active

- [ ] **Centralized Mock CSS Stylesheet** — Define a single, clean, minimal light-mode CSS file optimized for long quiz-taking sessions.
- [ ] **Centralized Mock JS Interactivity** — Implement unified interactive JS logic for mocks (handling navigation, pagination, question selections) and strip bloat/unnecessary vendor scripts.
- [ ] **Manual Mock Integration** — Overwrite/link the centralized CSS and JS files across all mock HTML pages in the codebase.
- [ ] **Standardized Layout Structure** — Unify different mock HTML codes into a clean and professional standard layout.

### Out of Scope

- **User Authentication / Login** — Public access only; no user accounts or persistent profiles.
- **Dynamic Server Database** — No SQL/NoSQL databases; the index is strictly pre-compiled into `mocks-data.js`.
- **Dynamic Scoring Backend** — Grading is computed entirely in the client-side browser sessions.

## Context

The codebase contains scraped mock exams from multiple vendors. These files have widely differing layout structures, inline styling, and heavy vendor-specific interactive scripts (which can cause render issues, accessibility violations, or layout breakages). The user wants to replace this fragmented state with a clean, unified light-mode test-taking experience by using a single centralized CSS/JS and linking it to the mock pages.

## Constraints

- **Theme Style**: Clean, minimal light-mode theme optimized for long quiz-taking sessions.
- **Integration Method**: Manual CSS/JS linking/overwriting across mock files to ensure precise control.
- **Stack Constraint**: Strict static files (HTML, CSS, JS) served from static hosting (Firebase/Render). No server-side components.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Clean Light-Mode Quiz Theme | Reduce eye strain during long-duration mock tests | — Pending |
| Centralized CSS & JS Linking | Avoid duplicating style definitions and logic across hundreds of HTML mock files | — Pending |
| Strip Vendor JS Interactivity | Eliminates tracking, advertisements, and broken custom calculators, replacing them with a unified system | — Pending |
| Manual Integration of Assets | Ensures no automated script corrupts the unique structure of different mock HTML formats | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-29 after initialization*
