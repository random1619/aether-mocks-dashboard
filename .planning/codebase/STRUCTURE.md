# Structure Map
## Directory Layout
- `/public/`: Root of static files to be hosted.
  - `/public/index.html`: Main entry point.
  - `/public/dashboard.js`: Extracted Javascript.
  - `/public/dashboard.css`: Extracted CSS.
  - `/public/mocks-data.js`: Automatically generated metadata.
  - `/public/<Provider_Name>/`: Various subdirectories holding provider-specific HTML pages.
- `generate_mocks_data.py`: Central data compiler script.
- `fix_*.py`: Various cleanup/automation scripts.
