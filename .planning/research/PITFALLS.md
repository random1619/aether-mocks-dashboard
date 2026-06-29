# Pitfalls Research

**Domain:** Static Web Mock Exam Portal
**Researched:** 2026-06-29
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Broken Asset Paths due to Directory Nesting

**What goes wrong:**
Mock HTML files are stored at different directory depths (e.g., `public/Pundiits/75/Math/mock1.html` is 4 levels deep, while `public/static GK/mock2.html` is 2 levels deep). Hardcoding a relative path like `../../css/mock-main.css` across all files will result in 404 errors on some pages.

**Why it happens:**
Developers copy and paste header link tags without calculating the depth relative to the public root.

**How to avoid:**
Map the depth level of each mock page during integration and construct relative links accordingly, or use automated script tests to verify that every linked resource resolves (200 OK) when run on a local HTTP server.

**Warning signs:**
404 errors in the browser console when opening mock tests, or unstyled raw text.

**Phase to address:**
Phase 2 (Mock Page Integration).

---

### Pitfall 2: Silently Broken Interactivity on Non-Standard Markups

**What goes wrong:**
Vendor pages have different HTML structures (some use `<div class="option">`, others use `<span class="opt">`, etc.). Connecting a centralized JS script that relies on query selectors like `.option` will fail silently on pages using different class names, preventing users from selecting answers.

**Why it happens:**
Assuming all vendor-scraped files share a identical DOM tree layout.

**How to avoid:**
Perform standard class injection during cleanup. Add class names like `.quiz-option` and `.question-container` to the target tags in the HTML files so the JS can find them regardless of vendor tags.

**Warning signs:**
Options are not clickable, or console errors like `TypeError: Cannot read properties of null`.

**Phase to address:**
Phase 1 (Centralized Layout Unification).

---

### Pitfall 3: Loss of Math/Scientific Renderers (LaTeX)

**What goes wrong:**
Some math mock tests rely on inline MathJax or Katex scripts to display fractions, integrations, and chemical equations. Stripping all vendor scripts blindly will break formula rendering, leaving questions unreadable.

**Why it happens:**
"Strip all script tags" rule is applied too broadly.

**How to avoid:**
Preserve CDNs/scripts that load `MathJax.js` or `katex.min.js` and their configurations during the sanitization/cleanup pass.

**Warning signs:**
Raw LaTeX text (e.g., `$$\frac{a}{b}$$`) displays on screen instead of formatted mathematical symbols.

**Phase to address:**
Phase 1 (Centralized Layout Unification).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Regex replacements for DOM edits | Fast to implement in Python | Extremely fragile; breaks if vendor HTML structure changes slightly | Never. Use proper DOM parsers (BeautifulSoup) or standard CSS selectors instead. |
| Hardcoding absolute root paths | Simple asset links `/css/...` | Prevents launching or previewing files locally via the `file://` protocol | Only if the site is strictly served via a local web server or hosting platform. |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| MathJax / KaTeX | Stripping out math config scripts along with vendor trackers | Maintain a whitelist for scripts matching `mathjax` or `katex` in the URL or script body |

---
*Pitfalls research for: Static Web Mock Exam Portal*
*Researched: 2026-06-29*
