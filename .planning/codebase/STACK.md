# Technology Stack

**Analysis Date:** 2026-06-29

## Languages

**Primary:**
- HTML5 - Frontend structure and content for the main dashboard and mock quiz pages.
- JavaScript (ES6+) - Client-side search, filtering, styling, and data loading logic.
- CSS3 - Visual styles, layout, and animations for the dashboard.

**Secondary:**
- Python 3 - Local automation and data compilation scripts (e.g., `generate_mocks_data.py` and subject organizers).

## Runtime

**Environment:**
- Modern Web Browsers - Client-side runtime for the dashboard.
- Python 3.x Interpreter - Runs data indexing and file cleaning scripts locally.
- Node.js 18.x+ (optional) - Runs SCSS compilations for Pundits mock styles.

**Package Manager:**
- npm 10.x - Used exclusively in `public/Pundiits/` for managing Sass compile tools.
- Lockfile: `public/Pundiits/package-lock.json` present.

## Frameworks

**Core:**
- Vanilla JavaScript - No active JS frameworks (like React or Vue) are used; the application relies entirely on native DOM APIs.

**Styling:**
- Sass/SCSS - CSS preprocessor used to construct quiz-specific layout sheets under `public/Pundiits/`.
- FontAwesome v6.4.0 - SVG and font icons loaded via CDN.

**Testing:**
- None in use.

## Key Dependencies

**Critical:**
- sass ^1.77.6 - Compile `src/scss/main.scss` into `css/style.css` in the Pundits subfolder.

**Infrastructure:**
- Firebase Hosting - Platform for serverless hosting of static assets.
- Render Static Hosting - Alternative hosting platform using static publish rules.

## Configuration

**Environment:**
- Fully static client environment; no environment variables are resolved at runtime.

**Build/Deploy:**
- `firebase.json` - Firebase Hosting properties.
- `.firebaserc` - Points default environment to Firebase project ID `cbt-mocks`.
- `render.yaml` - Configures static web hosting on Render.
- `public/Pundiits/package.json` - Build script definitions for Sass.

## Platform Requirements

**Development:**
- Cross-platform (Windows/macOS/Linux). Requires Python 3.x for running backend collection scripts, and Node.js for styles.

**Production:**
- Serves as a static website. Deployed and distributed via CDN (Firebase / Render).

---

*Stack analysis: 2026-06-29*
*Update after major dependency changes*
