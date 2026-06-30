# Coding Conventions

Stable coding styles, naming conventions, and patterns used throughout this codebase.

## Naming Patterns
- **JavaScript**: camelCase (e.g., `currentPage`, `renderDashboard`, `updateStats`).
- **Python**: snake_case (e.g., `root_dir`, `clean_name`, `get_subject`).
- **File Naming**: Raw files use provider prefixes or alphanumeric suffixes, cleaned dynamically during indexing.

## Code Style
- **Python Automation**:
  - Rely on standard library modules (`os`, `json`, `re`, `sys`) to minimize external dependencies.
  - Always open files with explicit UTF-8 encoding: `open(file_path, 'r', encoding='utf-8')`.
  - Use `re.compile()` for regex patterns to ensure optimal performance.
  - Walk directories dynamically with `os.walk()` and prune directories in-place when needed.
- **Styling & CSS**:
  - Set global custom properties under `:root` in `public/index.html`.
  - Avoid ad-hoc values; use defined CSS variables for margins, colors, glows, and blur filters.
  - Maintain the glassmorphism theme (`backdrop-filter: blur(20px)`) with `-webkit-backdrop-filter` support.
- **JavaScript & DOM**:
  - Maintain the global state object to coordinate UI parameters.
  - Utilize direct event bindings in HTML tags (e.g. `onclick="toggleTheme()"`).
  - Interact with DOM nodes using `document.getElementById()` and template literals.

## Error Handling
- **Python**: Wrap filesystem operations in validation checks.
- **Client JS**: Use safe array filtering and handle empty results by displaying fallback empty-state cards.