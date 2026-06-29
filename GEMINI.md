<!-- GSD:project-start source:PROJECT.md -->

## Project

**Aether Mocks Dashboard**

A static web dashboard for hosting and browsing mock test HTML pages. The system parses, indexes, and normalizes mock test files into a unified dashboard, enabling users to search, filter, and take mocks from various vendors in a clean, unified presentation.

**Core Value:** Ensure mock test preparation is seamless and distraction-free by offering a highly responsive, unified browsing dashboard and consistent, professional, clean mock interfaces.

### Constraints

- **Theme Style**: Clean, minimal light-mode theme optimized for long quiz-taking sessions.
- **Integration Method**: Manual CSS/JS linking/overwriting across mock files to ensure precise control.
- **Stack Constraint**: Strict static files (HTML, CSS, JS) served from static hosting (Firebase/Render). No server-side components.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- HTML5 - Frontend structure and content for the main dashboard and mock quiz pages.
- JavaScript (ES6+) - Client-side search, filtering, styling, and data loading logic.
- CSS3 - Visual styles, layout, and animations for the dashboard.
- Python 3 - Local automation and data compilation scripts (e.g., `generate_mocks_data.py` and subject organizers).

## Runtime

- Modern Web Browsers - Client-side runtime for the dashboard.
- Python 3.x Interpreter - Runs data indexing and file cleaning scripts locally.
- Node.js 18.x+ (optional) - Runs SCSS compilations for Pundits mock styles.
- npm 10.x - Used exclusively in `public/Pundiits/` for managing Sass compile tools.
- Lockfile: `public/Pundiits/package-lock.json` present.

## Frameworks

- Vanilla JavaScript - No active JS frameworks (like React or Vue) are used; the application relies entirely on native DOM APIs.
- Sass/SCSS - CSS preprocessor used to construct quiz-specific layout sheets under `public/Pundiits/`.
- FontAwesome v6.4.0 - SVG and font icons loaded via CDN.
- None in use.

## Key Dependencies

- sass ^1.77.6 - Compile `src/scss/main.scss` into `css/style.css` in the Pundits subfolder.
- Firebase Hosting - Platform for serverless hosting of static assets.
- Render Static Hosting - Alternative hosting platform using static publish rules.

## Configuration

- Fully static client environment; no environment variables are resolved at runtime.
- `firebase.json` - Firebase Hosting properties.
- `.firebaserc` - Points default environment to Firebase project ID `cbt-mocks`.
- `render.yaml` - Configures static web hosting on Render.
- `public/Pundiits/package.json` - Build script definitions for Sass.

## Platform Requirements

- Cross-platform (Windows/macOS/Linux). Requires Python 3.x for running backend collection scripts, and Node.js for styles.
- Serves as a static website. Deployed and distributed via CDN (Firebase / Render).

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- Javascript: camelCase (e.g. `currentPage`, `selectedProvider`, `searchTerm`, `filteredMocks`).
- Python: snake_case (e.g. `root_dir`, `pattern_prefix`, `cleaned_name`, `js_content`).
- Javascript: camelCase (e.g. `renderDashboard`, `toggleTheme`, `updateStats`).
- Python: snake_case (e.g. `clean_name`, `get_subject`, `fix_html_file`).
- Raw files have provider prefixes or alphanumeric suffixes. They are cleaned at compilation time, replacing underscores/hyphens with spaces.

## Code Style

- Use standard library modules (`os`, `json`, `re`, `sys`) wherever possible to keep execution fast and dependency-free.
- Open files explicitly specifying UTF-8 encoding: `open(file_path, 'r', encoding='utf-8')`.
- Compile regex patterns using `re.compile()` for performance.
- Walk directories using `os.walk(root_dir)` and prune subfolders in-place:
- Style parameters declared globally under `:root` in `public/index.html`.
- Uses custom CSS properties/variables for colors, margins, glows, and filters:
- Uses a glassmorphism theme (`backdrop-filter: blur(20px)`) with `-webkit-backdrop-filter` fallback support for Safari.
- Direct event binding in HTML tags (e.g., `onclick="toggleTheme()"` or `onchange="filterBySection()"`).
- Global state object containing UI parameters.
- DOM manipulation via `document.getElementById` and string templates:

## Error Handling

- Wrap file reads in simple validation checks:
- Safe array operations for filtering so that standard errors do not block dashboard rendering.
- Render fallback messages or empty-state cards if zero results are returned.

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## Pattern Overview

- **Stateless Frontend:** The frontend is entirely static, serverless, and runs client-side in the browser.
- **Pre-Compiled Index:** Instead of querying a live backend or database, mock metadata is compiled at build/deploy time into a static JS module file (`public/mocks-data.js`).
- **Decoupled Quiz Engine:** Individual mock quizzes are self-contained static HTML pages created by various providers (Pundits, Oliveboard, etc.) and served directly.

## Layers

- Purpose: Scans the filesystem, extracts metadata, normalizes names/providers, and outputs the static database file.
- Contains: `generate_mocks_data.py` (and related helper scripts under subdirectories).
- Depends on: Local file system structure.
- Used by: Developer / Deployment pipelines prior to static hosting deployment.
- Purpose: Loads the mock database, handles state (search filters, provider filters, active pagination page), and binds events.
- Contains: Inline JavaScript in `public/index.html`.
- Depends on: Data compilation layer outputs (`public/mocks-data.js`).
- Used by: Browser runtime when loading `index.html`.
- Purpose: Renders the glassmorphic dashboard interface, cards, stats widgets, search forms, and navigation buttons.
- Contains: HTML structure, Tailwind CSS or custom CSS variables, Google Fonts, and FontAwesome icons in `public/index.html`.
- Used by: End user interface.
- Purpose: Renders individual test interfaces where users answer questions.
- Contains: Static HTML files under provider subdirectories (e.g. `public/Pundiits/**/*.html`).

## Data Flow

## Key Abstractions

- Representation: A static array of JSON objects representing single mock tests.
- Schema:

## Entry Points

- Location: `public/index.html`
- Triggers: Browser request to root.
- Responsibilities: Main client shell, search, and list presentation.
- Location: `generate_mocks_data.py`
- Triggers: CLI script execution.
- Responsibilities: Re-indexing mock quizzes.

## Error Handling

- Python compiler handles missing files or invalid structures gracefully, print error logs.
- Client-side Javascript filters out undefined or poorly structured entries from `MOCK_DATA` without crashing, fallback rendering empty states if search returns zero matches.

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.agents/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
