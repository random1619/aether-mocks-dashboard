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
- [ ] 01-01: Create centralized CSS design system.
- [ ] 01-02: Create unified exam-taking JS interactivity controller.

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
- [ ] 02-01: Standardize and inject layout classes into mock HTML files.
- [ ] 02-02: Strip vendor scripts, keep LaTeX script loaders, and link centralized CSS/JS.

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
- [ ] 03-01: Perform comprehensive dashboard and quiz functionality verification.
- [ ] 03-02: Deploy the final static package to Firebase and Render.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Design & Scripting | 0/2 | Not started | - |
| 2. Page Unification & Cleaning | 0/2 | Not started | - |
| 3. Verification & Deployment | 0/2 | Not started | - |
