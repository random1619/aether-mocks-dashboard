# Project Research Summary

**Project:** Aether Mocks Dashboard
**Domain:** Static Web Mock Exam Portal
**Researched:** 2026-06-29
**Confidence:** HIGH

## Executive Summary

This research focuses on standardizing the styling and interactivity across various scraped vendor mock test pages hosted on the static Aether Mocks platform. Currently, the mock HTML files contain fragmented inline styles, varying DOM markup structures, and heavy vendor-specific interactive scripts. 

The recommended approach is to centralize the design using a single clean light-mode stylesheet (`mock-main.css`) and a single javascript interactivity controller (`mock-core.js`), then link them to the target pages. This avoids duplicating code, simplifies style updates, and provides a uniform, distraction-free testing environment for the end user.

Key risks include broken relative asset links across varying directory levels, silent failures in JS listeners due to non-standard layout trees, and the potential loss of LaTeX mathematical rendering if KaTeX or MathJax scripts are stripped. These will be mitigated by mapping directory depths, applying standardized wrapper classes during layout cleanup, and implementing script whitelisting.

## Key Findings

### Recommended Stack
We recommend utilizing a native, serverless static stack: standard HTML5 for page markup, modern CSS3 variables for theme management, and lightweight vanilla ES6 JavaScript for timers and navigation. Python 3.x is used locally to automate folder scanning, cleanup, and file overwrites.

**Core technologies:**
- **HTML5**: Page structure — Semantic structure of question sheets.
- **CSS3 Variables**: Visual presentation — Unified typography and colors.
- **ES6 JavaScript**: Interactivity — Client-side timer and navigations.

### Expected Features

**Must have (table stakes):**
- **Clean Light-Mode CSS** — Standardized styling for exam cards, options, and sidebars.
- **Unified JS Navigation** — Dynamic "Next", "Previous", and "Question Panel" selectors.
- **Active Exam Timer** — Simple client-side count-down mechanism.

**Should have (competitive):**
- **Responsive Layout** — Adapt grid structures for tablet and mobile devices.
- **Status Dashboard** — Interactive count of skipped, flagged, and answered questions.

### Architecture Approach
A decoupled presentation architecture. Mock HTML files act as content storage and link to centralized CSS and JS files stored in the root asset directory, maintaining a clean Separation of Concerns.

**Major components:**
1. **`mock-main.css`** — Design system: sets typography, colors, sidebars, and input states.
2. **`mock-core.js`** — Interactivity engine: handles clicks, state updates, and timer.
3. **`generate_mocks_data.py`** — Data indexer: keeps portal stats and metadata up to date.

### Critical Pitfalls

1. **Broken relative asset links** — Mitigate by determining file directory depths and writing relative paths dynamically.
2. **Fragile JS selectors** — Mitigate by injecting standardized wrapper classes (`.quiz-option`) into the HTML markup.
3. **Broken math formulas** — Mitigate by whitelisting MathJax and KaTeX script nodes.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Core Design & Scripting
- **Rationale:** Establishes the centralized assets before editing mock HTML files.
- **Delivers:** `public/css/mock-main.css` and `public/js/mock-core.js`.
- **Addresses:** Clean light-mode theme, timer, and navigation controller.

### Phase 2: Page Unification & Cleaning
- **Rationale:** Connects mock pages to the core assets and standardizes class names.
- **Delivers:** Cleaned mock HTML files with linked stylesheets and interactive scripts.
- **Avoids:** Broken relative asset links and broken LaTeX rendering by mapping paths and whitelisting formula scripts.

### Phase 3: Verification & Deployment
- **Rationale:** Final quality checks across multiple providers prior to ship.
- **Delivers:** Fully verified mock portal deployed to Firebase Hosting and Render.
- **Implements:** Manual testing checklists and layout verification.

---
*Research summary for: Aether Mocks Dashboard*
*Researched: 2026-06-29*
