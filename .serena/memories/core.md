# Core Project Memory

Aether Mocks Dashboard is a static web dashboard for hosting and browsing mock test HTML pages. The system parses, indexes, and normalizes mock test files into a unified dashboard, enabling users to search, filter, and take mocks from various vendors in a clean, unified presentation.

## References

- Technical stack and dependencies: `mem:tech_stack`
- Project commands and utility usage: `mem:suggested_commands`
- Code style, naming, and architectural conventions: `mem:conventions`
- Task verification and completion guidelines: `mem:task_completion`

## Project Structure & Invariants

- **Stateless Frontend**: The dashboard and quiz pages run client-side in the browser. Static hosting is served from Firebase/Render. No server-side components.
- **Pre-Compiled Index**: Instead of querying a live backend or database, mock metadata is compiled at build/deploy time into a static JS module file `public/mocks-data.js` via local automation scripts.
- **Decoupled Quiz Engine**: Individual mock quizzes are self-contained static HTML pages created by various providers (Pundits, Oliveboard, etc.) and served directly.
- **Entry Points**:
  - Main client shell: `public/index.html`
  - Re-indexing script: `generate_mocks_data.py`