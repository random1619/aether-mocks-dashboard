# Technical Stack

## Languages
- **HTML5**: Frontend structure and content for the main dashboard and mock quiz pages.
- **JavaScript (ES6+)**: Client-side search, filtering, styling, and data loading logic.
- **CSS3**: Visual styles, layout, and animations for the dashboard.
- **Python 3**: Local automation and data compilation scripts (e.g. `generate_mocks_data.py`).

## Runtimes & Frameworks
- **Web Browsers**: Client-side runtime for the dashboard.
- **Python 3.x**: Runs data indexing and file cleaning scripts locally.
- **Node.js 18.x+ & npm 10.x**: Used in `public/Pundiits/` for managing Sass compile tools (Lockfile: `public/Pundiits/package-lock.json`).
- **Vanilla JS**: No active JS frameworks (like React or Vue); uses native DOM APIs.
- **Sass/SCSS**: CSS preprocessor used to construct quiz-specific layout sheets under `public/Pundiits/`.
- **FontAwesome v6.4.0**: Loaded via CDN.

## Key Dependencies & Services
- **sass ^1.77.6**: Compile `src/scss/main.scss` into `css/style.css` in the Pundits subfolder.
- **Firebase Hosting**: Platform for serverless hosting of static assets. Project ID: `cbt-mocks`.
- **Render Static Hosting**: Alternative hosting platform using static publish rules.

## Configurations
- `firebase.json` - Firebase Hosting properties.
- `.firebaserc` - Environment targets.
- `render.yaml` - Static web hosting configurations.
- `public/Pundiits/package.json` - Build script definitions for Sass.