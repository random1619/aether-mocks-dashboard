# Coding Conventions

**Analysis Date:** 2026-06-29

## Naming Patterns

**Variables:**
- Javascript: camelCase (e.g. `currentPage`, `selectedProvider`, `searchTerm`, `filteredMocks`).
- Python: snake_case (e.g. `root_dir`, `pattern_prefix`, `cleaned_name`, `js_content`).

**Functions:**
- Javascript: camelCase (e.g. `renderDashboard`, `toggleTheme`, `updateStats`).
- Python: snake_case (e.g. `clean_name`, `get_subject`, `fix_html_file`).

**HTML Files:**
- Raw files have provider prefixes or alphanumeric suffixes. They are cleaned at compilation time, replacing underscores/hyphens with spaces.

## Code Style

**Python Automation Scripts:**
- Use standard library modules (`os`, `json`, `re`, `sys`) wherever possible to keep execution fast and dependency-free.
- Open files explicitly specifying UTF-8 encoding: `open(file_path, 'r', encoding='utf-8')`.
- Compile regex patterns using `re.compile()` for performance.
- Walk directories using `os.walk(root_dir)` and prune subfolders in-place:
  ```python
  dirs[:] = [d for d in dirs if d.lower() not in [...]]
  ```

**Frontend CSS & Theme Organization:**
- Style parameters declared globally under `:root` in `public/index.html`.
- Uses custom CSS properties/variables for colors, margins, glows, and filters:
  ```css
  :root {
      --bg-color: #030712;
      --text-main: #f8fafc;
      --glass-bg: rgba(255, 255, 255, 0.02);
  }
  ```
- Uses a glassmorphism theme (`backdrop-filter: blur(20px)`) with `-webkit-backdrop-filter` fallback support for Safari.

**Frontend JavaScript (inline in index.html):**
- Direct event binding in HTML tags (e.g., `onclick="toggleTheme()"` or `onchange="filterBySection()"`).
- Global state object containing UI parameters.
- DOM manipulation via `document.getElementById` and string templates:
  ```javascript
  const card = `
    <div class="card">
       <h3>${mock.name}</h3>
    </div>
  `;
  ```

## Error Handling

**Python Script Error Handling:**
- Wrap file reads in simple validation checks:
  ```python
  if not os.path.exists(file_path):
      print(f"Error: File not found: {file_path}")
      return False
  ```

**Frontend JS Error Handling:**
- Safe array operations for filtering so that standard errors do not block dashboard rendering.
- Render fallback messages or empty-state cards if zero results are returned.

---

*Conventions analysis: 2026-06-29*
*Update after style changes*
