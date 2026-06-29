# Architecture

**Analysis Date:** 2026-06-29

## Pattern Overview

**Overall:** Static Dashboard with Compile-Time Metadata Indexing ("Generated Static Database" Pattern).

**Key Characteristics:**
- **Stateless Frontend:** The frontend is entirely static, serverless, and runs client-side in the browser.
- **Pre-Compiled Index:** Instead of querying a live backend or database, mock metadata is compiled at build/deploy time into a static JS module file (`public/mocks-data.js`).
- **Decoupled Quiz Engine:** Individual mock quizzes are self-contained static HTML pages created by various providers (Pundits, Oliveboard, etc.) and served directly.

## Layers

**1. Data Processing & Compilation Layer:**
- Purpose: Scans the filesystem, extracts metadata, normalizes names/providers, and outputs the static database file.
- Contains: `generate_mocks_data.py` (and related helper scripts under subdirectories).
- Depends on: Local file system structure.
- Used by: Developer / Deployment pipelines prior to static hosting deployment.

**2. Client Controller Layer (Dashboard Engine):**
- Purpose: Loads the mock database, handles state (search filters, provider filters, active pagination page), and binds events.
- Contains: Inline JavaScript in `public/index.html`.
- Depends on: Data compilation layer outputs (`public/mocks-data.js`).
- Used by: Browser runtime when loading `index.html`.

**3. Presentation/UI Layer:**
- Purpose: Renders the glassmorphic dashboard interface, cards, stats widgets, search forms, and navigation buttons.
- Contains: HTML structure, Tailwind CSS or custom CSS variables, Google Fonts, and FontAwesome icons in `public/index.html`.
- Used by: End user interface.

**4. Content/Quiz Layer:**
- Purpose: Renders individual test interfaces where users answer questions.
- Contains: Static HTML files under provider subdirectories (e.g. `public/Pundiits/**/*.html`).

## Data Flow

**Mock Index Update Flow (Build/Compile Time):**
1. Developer runs `python generate_mocks_data.py`.
2. Script walks `public/` directory to locate HTML files.
3. Script normalizes file names, extracts categories, infers subjects based on keywords.
4. Script outputs the list as a Javascript assignment `const MOCK_DATA = [...]` to `public/mocks-data.js`.

**User Interactive Flow (Runtime):**
1. User requests dashboard URL (`index.html`).
2. Browser loads `index.html` and fetches the static script `mocks-data.js`.
3. Inlined JS initializes state: `searchTerm = ""`, `selectedProvider = "All"`, `selectedSubject = "All"`, `currentPage = 1`.
4. Script processes `MOCK_DATA` to populate stats:
   - Total mocks count.
   - Count by subject.
   - Count by provider.
5. Script calls `renderDashboard()` which:
   - Filters `MOCK_DATA` by current search terms and dropdown selections.
   - Truncates list to support pagination.
   - Generates HTML card elements.
   - Updates page stats.
6. User adjusts a filter or types a search.
7. Event listener fires -> updates state -> calls `renderDashboard()` to re-draw active listings.
8. User clicks a mock card -> opens the target static HTML test page in a new window/tab.

## Key Abstractions

**MOCK_DATA Object:**
- Representation: A static array of JSON objects representing single mock tests.
- Schema:
  ```json
  {
    "path": "Pundiits/75/Mathematics/Quiz1.html",
    "name": "Quiz 1",
    "provider": "Pundits",
    "category": "75/Mathematics",
    "subject": "Quant"
  }
  ```

## Entry Points

**Main Dashboard:**
- Location: `public/index.html`
- Triggers: Browser request to root.
- Responsibilities: Main client shell, search, and list presentation.

**Data Generator:**
- Location: `generate_mocks_data.py`
- Triggers: CLI script execution.
- Responsibilities: Re-indexing mock quizzes.

## Error Handling

**Strategy:**
- Python compiler handles missing files or invalid structures gracefully, print error logs.
- Client-side Javascript filters out undefined or poorly structured entries from `MOCK_DATA` without crashing, fallback rendering empty states if search returns zero matches.

---

*Architecture analysis: 2026-06-29*
*Update after structural architecture changes*
