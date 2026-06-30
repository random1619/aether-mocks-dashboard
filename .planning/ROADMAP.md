# Roadmap: Aether Mocks Dashboard

## Overview

Modernizing static mock exam pages across multiple providers into a standardized, distraction-free, clean light-mode experience using a centralized styling and interactivity asset architecture.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Core Design & Scripting** - Develop the unified styling variables (`mock-main.css`) and quiz taker interactive script (`mock-core.js`).
- [ ] **Phase 2: Page Unification & Cleaning** - Strip inline styles/vendor logic and link centralized CSS/JS dynamically.
- [ ] **Phase 3: Verification & Deployment** - Audit all mock test files locally and deploy to static hosting services.
- [ ] **Phase 4: Fullscreen & Dark Theme Integration** - Integrate dark theme toggle and fullscreen triggers to all mock exams.
- [ ] **Phase 5: Dashboard Redesign** - Redesign mock dashboard with professional structure and colors.

## Phase Details

### Phase 1: Core Design & Scripting

**Goal**: Create centralized CSS and JS files for mock tests.
**Mode**: mvp
**Depends on**: Nothing (first phase)
**Requirements**: LAYOUT-01, LOGIC-01, LOGIC-02, LOGIC-03, LOGIC-04
**Success Criteria** (what must be TRUE):

  1. A single centralized `mock-main.css` file exists with standard light-mode styling parameters.
  2. A single centralized `mock-core.js` file exists containing timers, page navigations, and option selectors.
  3. Running the core JS locally compiles without syntax errors and correctly tracks quiz selection states.

**Plans**: 2 plans

Plans:

- [x] 01-01: Create centralized CSS design system.
- [x] 01-02: Create unified exam-taking JS interactivity controller.

### Phase 2: Page Unification & Cleaning

**Goal**: Standardize HTML structure and connect mock pages to centralized assets.
**Mode**: mvp
**Depends on**: Phase 1
**Requirements**: LAYOUT-02, LAYOUT-03, INTEGRATE-01, INTEGRATE-02
**Success Criteria** (what must be TRUE):

  1. All mock HTML files link to `mock-main.css` and `mock-core.js` using depth-aware relative paths.
  2. Outdated inline style attributes and broken vendor trackers are stripped from the mock HTML files.
  3. Standard wrapper classes (e.g. `.quiz-option`) are added to questions and inputs in mock files.
  4. MathJax and KaTeX latex formula rendering is verified to still function properly.

**Plans**: 2 plans

Plans:

- [x] 02-01: Standardize and inject layout classes into mock HTML files.
- [x] 02-02: Strip vendor scripts, keep LaTeX script loaders, and link centralized CSS/JS.

### Phase 3: Verification & Deployment

**Goal**: Final verification and deployment of the mock test portal.
**Mode**: mvp
**Depends on**: Phase 2
**Requirements**: All
**Success Criteria** (what must be TRUE):

  1. Search, filter, pagination, and stats function correctly on the main dashboard portal.
  2. Mock exams from different providers load styled correctly in light-mode.
  3. Quiz navigation and timers behave correctly without errors in the browser console.
  4. Project is deployed to Firebase Hosting and Render static publishing.

**Plans**: 2 plans

Plans:

- [x] 03-01: Perform comprehensive dashboard and quiz functionality verification.
- [x] 03-02: Deploy the final static package to Firebase and Render.

### Phase 4: Fullscreen & Dark Theme Integration

**Goal**: Integrate dark theme toggle and fullscreen triggers to all mock exams.
**Mode**: mvp
**Depends on**: Phase 3
**Requirements**: LAYOUT-02, LAYOUT-03, LOGIC-01, LOGIC-04, INTEGRATE-01, INTEGRATE-02
**Success Criteria** (what must be TRUE):

  1. Dark theme class toggles correctly on the body element.
  2. Fullscreen mode can be enabled or disabled via header toggles.
  3. All 1,057 mock pages are updated to include header toggles.

**Plans**: 2 plans

Plans:

- [x] 04-01: Implement centralized dark theme variables and toggle actions in CSS/JS.
- [x] 04-02: Standardize welcome screen containers and inject toggle buttons into the HTML builder template.

### Phase 5: Dashboard Redesign

**Goal**: Redesign the main mock dashboard with a professional structure and a clean, legible light-mode theme using professional color palettes.
**Mode**: mvp
**Depends on**: Phase 4
**Requirements**: LAYOUT-01, LAYOUT-02, LAYOUT-03, LOGIC-01
**Success Criteria** (what must be TRUE):

  1. Inline CSS styles and JavaScript block are extracted from `public/index.html` to separate files (`public/css/dashboard.css`, `public/js/dashboard.js`).
  2. The main dashboard is redesigned in a professional, light-themed layout styled with Outfit typography, custom shadows, and micro-animations.
  3. Dynamic mock badges are styled using professional pastel theme colors (e.g. green, blue, purple, amber, rose).
  4. Search, filters, grid view, roadmap view, and completion tracking function correctly without console errors.

**Plans**: 1 plan

Plans:

- [x] 05-01: Redesign index dashboard and modularize assets.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Design & Scripting | 2/2 | Complete | 2026-06-29 |
| 2. Page Unification & Cleaning | 2/2 | Complete | 2026-06-29 |
| 3. Verification & Deployment | 2/2 | Complete | 2026-06-29 |
| 4. Fullscreen & Dark Theme Integration | 2/2 | Complete | 2026-06-29 |
| 5. Dashboard Redesign | 1/1 | Complete | 2026-06-29 |
| 6. 10-Min Sectional Timer Toggle | 0/1 | Active | |

### Phase 6: Introduce the sectional timing for different types of mocks. Introduced in ssc cgl

**Goal:** Replace the sectional timer select dropdown with a clean, iOS-style toggle switch on both the main dashboard and mock welcome screens, forcing a 10-minute limit when active.
**Requirements**: LOGIC-02
**Depends on:** Phase 5
**Plans:** 1 plan

Plans:

- [ ] 06-01: Replace sectional timer select with 10-min toggle switch.

