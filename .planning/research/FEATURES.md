# Feature Research

**Domain:** Static Web Mock Exam Portal
**Researched:** 2026-06-29
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Clean Light-Mode Theme | Prevents eye fatigue during 1-3 hour exam sessions | LOW | Standard font sizes, line heights, and margins |
| Unified Navigation Panel | Allows users to jump to any question or section instantly | MEDIUM | Dynamic rendering of question list panel |
| Active Exam Timer | Standard quiz requirement to track time constraints | LOW | Client-side countdown timer in Javascript |
| Clear Interactive States | Hover and focus indicators on options and inputs | LOW | Ensure checkboxes/radio buttons have clear checked states |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Responsive Grid View | Allow taking mock exams on mobile/tablet devices | MEDIUM | Flexible sidebar layouts using flexbox/grid |
| Live Statistics Dashboard | Visual summary of answered, flagged, and unvisited questions | MEDIUM | Simple state array calculating counts on the fly |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Multi-tab Synced State | Keep progress synced across browser tabs | Creates race conditions and performance degradation | Keep each mock session isolated to its single active tab |
| Persistent Server Scoring | Save quiz history on a database | Requires login, server hosting, and API backend overhead | Utilize local storage or client-side cookie caches |

## Feature Dependencies

```
[Unified Mock JS]
     └──requires──> [Centralized CSS Theme]
     
[Live Statistics Dashboard] ──enhances──> [Unified Mock JS]
```

### Dependency Notes

- **Unified Mock JS requires Centralized CSS Theme:** The JS code requires specific selectors, class names, and active states to style the UI elements dynamically.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] **Centralized CSS Theme File** — A single stylesheet defining light-mode variables, typography, navigation panel, and quiz card styling.
- [ ] **Unified JS Interactivity Script** — A single script containing clean navigation logic, timers, option selection listeners, and question status tracking.
- [ ] **Mock Page Integrations** — Overwrite existing header links in all mock HTML files to connect to the centralized CSS and JS files, and strip outdated inline styles.

### Add After Validation (v1.x)

- [ ] **Mobile Responsive Adapters** — Refine stylesheet media queries for smaller screens.
- [ ] **Session Recovery** — Implement auto-save to `localStorage` to recover exam progress if the tab is closed.

---
*Feature research for: Static Web Mock Exam Portal*
*Researched: 2026-06-29*
