# Stack Research

**Domain:** Static Web Mock Exam Portal
**Researched:** 2026-06-29
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| HTML5 | Standard | Structure mock test questions, layouts, and controls | Native support across all web browsers without runtime compile steps |
| CSS3 | Standard | Layout, typography, responsive grid, clean light-mode themes | Declarative, supports global CSS variables, and enables clean site-wide theme overrides |
| JavaScript | ES6+ | Unified quiz taking logic (timer, navigation, answers state) | Native client-side interactivity, fast and lightweight execution |
| Python | 3.10+ | Local scripting to scan files and apply templates | Built-in module support for parsing files and text manipulations |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| FontAwesome | 6.4.0 | Render quiz navigation, status, and button icons | Standard navigation controls (Next, Back, Clear) |
| Google Fonts | Outfit | Render clean, readable typography for test questions | Standardizing text appearance to reduce reading fatigue |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Python http.server | Local host testing for dashboard and quiz pages | Run `python -m http.server` in the project root to prevent CORS errors during asset loading |
| Git | Version control tracking | Track styling and script edits across all HTML files |

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Centralized static CSS/JS | Dynamic script injection on page load | When mock files are hosted externally and cannot be modified physically on disk |
| Rebuilding raw markup into JSON | Direct styling of existing vendor HTML structures | When vendor markup is completely broken and cannot be rescued by standard CSS variables |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Frontend Frameworks (React/Vue) | High compile overhead and breaks simple static deployment | Vanilla JavaScript for client-side interactivity |
| Inline styles (`style="..."`) | Prevents global style overrides and creates design drift | Standard CSS stylesheets with specific selectors |
| Regex-based DOM manipulation | Highly fragile, breaks when HTML attributes order varies | Standard CSS class assignment and native JS query selectors |

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| CSS Variables | Modern browsers (Safari 15+, Chrome 90+, Firefox 90+) | Critical for webkit-backdrop-filter and visual design parameters |

## Sources
- MDN Web Docs — CSS variables and selector specificity
- W3C Web Accessibility Guidelines — standard styles for readable content

---
*Stack research for: Static Web Mock Exam Portal*
*Researched: 2026-06-29*
