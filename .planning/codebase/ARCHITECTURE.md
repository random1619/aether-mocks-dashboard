# Architecture Map
## Pattern Overview
- **Stateless Frontend:** The frontend is entirely static, serverless, and runs client-side in the browser.
- **Pre-Compiled Index:** Instead of querying a live backend or database, mock metadata is compiled at build/deploy time into a static JS module file (`public/mocks-data.js`).
- **Decoupled Quiz Engine:** Individual mock quizzes are self-contained static HTML pages created by various providers and served directly.
- **Modularized UI:** The dashboard UI is driven by `public/index.html`, with logic in `dashboard.js` and styling in `dashboard.css`.
