# Codebase Concerns

**Analysis Date:** 2026-06-29

## Tech Debt

**Mismatched Directory and Provider Names:**
- Issue: Subdirectories under `public/` have misspelled names (e.g., `Oliiveboardd`, `Pundiits`).
- Why: Likely due to copy/paste sources or legacy scripts.
- Impact: Requires hardcoded string mappings in python compiler:
  ```python
  if raw_provider.lower() in ['oliiveboardd', 'oliveboard']:
      provider = 'Oliveboard'
  ```
- Fix approach: Rename actual physical directories to standard spelling (e.g., `oliveboard`, `pundits`) and update references.

**Monolithic Static Database (`mocks-data.js`):**
- Issue: All metadata index is loaded as a single `265KB+` Javascript file in the client.
- Why: Simple, serverless implementation that avoids API dependencies.
- Impact: Increases page load time. As the database grows to thousands of mocks, performance and load latency will degrade.
- Fix approach: Implement client-side search indexing or partition database chunking (e.g. by provider/subject).

## Known Bugs
- None documented at present.

## Security Considerations

**Unsanitized Static HTML Quizzes:**
- Risk: Scraped/extracted vendor quizzes contain inline scripts, ads trackers, or styles that can run in the user's browser, posing cross-site scripting (XSS) risks or tracking issues.
- Current mitigation: Basic cleaning scripts exist in developer scripts, but no robust automated parser sanitization is enforced.
- Recommendations: Implement a post-scrape sanitizer script using HTML parsers (like BeautifulSoup) to strip unneeded `<script>` tags, iframe trackers, and tracking beacons.

## Performance Bottlenecks

**Keystroke filtering on large lists:**
- Problem: The search input does filtering on the entire `MOCK_DATA` array on every single input keypress without debounce.
- Cause: Input event binds directly to rendering.
- Improvement path: Introduce a `debounce` function (e.g. 200ms) on the search input listener to avoid lagging on fast typing.

## Fragile Areas

**Regex HTML Fixing Script:**
- Why fragile: Scripts like `fix_html_problems.py` parse and alter HTML structures using regular expressions:
  ```python
  html_content = re.sub(r'<button\s+id="themeToggle"\s+class="btn"...>', ...)
  ```
- Common failures: If the vendor HTML structure changes slightly (e.g., swapping class order, adding whitespace, or modifying tags), the regex match fails silently.
- Safe modification: Transition HTML cleaning utilities from regex-based searches to structured AST parsers (such as `BeautifulSoup` or `lxml` in Python) to ensure robust updates regardless of string layout.

---

*Concerns analysis: 2026-06-29*
*Update after auditing new concerns*
