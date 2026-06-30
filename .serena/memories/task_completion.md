# Task Completion Guidelines

Steps to execute and verify before completing a task or submitting a change.

## Verification Steps
1. **Re-index Mock Files**:
   Always run the index generation script to ensure the static mocks database is up to date:
   ```powershell
   python generate_mocks_data.py
   ```
2. **Re-compile Sass (if SCSS modified)**:
   If any style definition inside `public/Pundiits/src/` changes, run:
   ```powershell
   cd public/Pundiits
   npm run build
   ```
3. **Verify Local Rendering**:
   Serve the project locally using a static server (e.g., `http-server`, `python -m http.server`, or similar) and open the page in a browser:
   - Ensure the glassmorphism theme renders correctly in both light and dark modes.
   - Verify pagination, search, and vendor filters function correctly.
   - Open individual modified mock HTML files to verify quiz layout, style links, and interactive elements.
4. **Browser Console Check**:
   Open developer tools in the browser and verify that no uncaught JavaScript exceptions or console errors are present.