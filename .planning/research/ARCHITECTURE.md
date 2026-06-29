# Architecture Research

**Domain:** Static Web Mock Exam Portal
**Researched:** 2026-06-29
**Confidence:** HIGH

## Recommended Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       Presentation Layer                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐   ┌──────────────────────────┐ │
│  │   Dashboard Interface   │   │   Mock HTML View Shell   │ │
│  │      (index.html)       │   │   (Pundiits/75/*.html)   │ │
│  └────────────┬────────────┘   └────────────┬─────────────┘ │
│               │                             │               │
├───────────────┼─────────────────────────────┼───────────────┤
│               ▼                             ▼               │
│      [public/mocks-data.js]        [public/css/mock-main.css]│
│         (Metadata List)            (Centralized Light Theme)│
│                                             │               │
│                                             ▼               │
│                                    [public/js/mock-core.js] │
│                                    (Centralized Quiz Logic) │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `mock-main.css` | Centralizes styles for margins, option buttons, layout grids, sidebars, timers, and question panels. | Standard CSS3 with CSS variables for light-mode variables. |
| `mock-core.js` | Manages active exam state (current question index, score counter, timer start/stop, navigation actions). | Clean ES6 class or function controller utilizing DOM selectors. |
| `Mock Exam Files` | Host the raw question markup. Links to `mock-main.css` and `mock-core.js`. | HTML files under provider subdirectories (e.g. `public/Pundiits/`). |

## Recommended Project Structure

```
public/
├── css/
│   └── mock-main.css     # Centralized CSS stylesheet for all mock tests
├── js/
│   └── mock-core.js      # Centralized JS script for unified quiz taking logic
├── Pundiits/
│   └── 75/
│       └── quiz-name.html# Mock test HTML (points to ../../css/mock-main.css)
└── index.html            # Main Portal Dashboard
```

### Structure Rationale

- **public/css/ and public/js/:** Storing these assets in root subdirectories ensures they can be referenced easily by any mock HTML file using relative paths (e.g., `../../css/mock-main.css` or `../../../css/mock-main.css`), avoiding duplication.

## Architectural Patterns

### Pattern 1: Centralized Asset Injection
- **What:** Linking all mock pages to unified stylesheets and scripts, removing inline code.
- **When to use:** When dealing with hundreds of static content files that require identical presentation and interactive behavior.
- **Trade-offs:** Makes file changes straightforward (editing one CSS file updates all mocks), but requires ensuring relative path depths in link references are accurate.

### Pattern 2: Client-Side Stateful Controller
- **What:** Maintaining session statistics (time elapsed, visited questions, selected options) in-memory inside the browser tab runtime.
- **When to use:** When there's no backend API or state server.
- **Trade-offs:** Very fast load and navigation times, but state is lost if the page is hard-refreshed (unless localStorage cache is used).

---
*Architecture research for: Static Web Mock Exam Portal*
*Researched: 2026-06-29*
