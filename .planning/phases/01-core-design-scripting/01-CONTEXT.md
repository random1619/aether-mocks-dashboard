# Phase 1: Core Design & Scripting - Context

**Gathered:** 2026-06-29
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the core centralized styles and script file that will govern all mock exam pages.
Specifically:
- Centralized CSS stylesheet `public/css/mock-main.css` establishing a clean light-mode layout.
- Centralized JS script `public/js/mock-core.js` implementing timers and question navigations.

</domain>

<decisions>
## Implementation Decisions

### CSS Design (Theme & Layout)
- **D-01:** Design a clean, minimal light-mode style optimized for long quiz-taking sessions. Avoid high-contrast pure white/black, using soft grays, clean borders, and clear typography (Outfit font).
- **D-02:** Build layouts supporting a standard split screen (question area on the left/center, navigation sidebar on the right).

### JS Interactivity & Interactivity Controller
- **D-03:** Write a modular, decoupled Javascript class or core initialization function in `mock-core.js` to manage active mock state: `currentQuestionIndex`, list of questions, timer duration, and selected options.
- **D-04:** Implement standard navigation triggers: Next Question, Previous Question, and a Sidebar Question Panel to jump to questions directly.
- **D-05:** Implement a countdown timer that visually updates the time remaining in the header bar and warns the user when time expires.
- **D-06:** Keep MathJax/KaTeX LaTeX formula rendering fully functional by avoiding alterations to script tags loading formula libraries.

### the agent's Discretion
- The exact layout structure of option buttons (radio/checkbox states), hover highlights, and sidebar styling is left to the agent's discretion, as long as it looks premium, clean, and highly readable.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Scope
- `.planning/PROJECT.md` — Project core value and constraints
- `.planning/REQUIREMENTS.md` — Functional requirements for LAYOUT and LOGIC
- `.planning/ROADMAP.md` — Phase 1 targets and success criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The dashboard page `public/index.html` contains Outfit Google Fonts loading link and FontAwesome CDN link which can be reused in mock pages.

### Established Patterns
- Use of vanilla CSS and standard JavaScript. Direct inline event binding model.

</code_context>

<deferred>
## Deferred Ideas

- Session persistence in localStorage is deferred to Phase 3/v2.

</deferred>

---
*Phase: 01-core-design-scripting*
*Context gathered: 2026-06-29*
