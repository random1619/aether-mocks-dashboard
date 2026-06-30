# Suggested Commands

Durable and generalizable commands used to manage compilation, styles, and hosting setup.

## Data Compilation / Re-indexing
- **Run mock test compiler/indexer**:
  ```powershell
  python generate_mocks_data.py
  ```
  *(Parses and updates the static database in `public/mocks-data.js`)*

## Pundits Mock Styles
- **Compile Sass/SCSS files**:
  ```powershell
  cd public/Pundiits
  npm run build
  ```
  *(Compiles `src/scss/main.scss` into `css/style.css` using Sass)*

## Utility/Fix Scripts
- **Fix duplicate widget issues**:
  ```powershell
  python fix_duplicate_widgets.py
  ```
- **Normalize English Madhyam mocks**:
  ```powershell
  python fix_english_madhyam.py
  ```
- **Standardize CSS inline colors**:
  ```powershell
  python fix_inline_colors.py
  ```