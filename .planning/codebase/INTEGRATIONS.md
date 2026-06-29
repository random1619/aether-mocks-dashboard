# External Integrations

**Analysis Date:** 2026-06-29

## APIs & External Services

**CDN Services:**
- Google Fonts - Loads `Outfit` font family.
  - Connection: Preconnect URLs `https://fonts.googleapis.com` and `https://fonts.gstatic.com` via `<link>` tags.
- Cloudflare CDNjs - Loads FontAwesome stylesheet icons.
  - Connection: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css` via `<link>` tag.

## Data Storage

**Databases:**
- None (No database storage).
- Mock index metadata is statically stored in `public/mocks-data.js` as a JS global variable `MOCK_DATA`, which is generated via the local script `generate_mocks_data.py`.

**File Storage:**
- None. Static HTML files representing mock tests are stored locally under subdirectories of `public/` (such as `public/Pundiits/`, `public/Oliveboard/`, etc.) and served directly by the web server.

## Authentication & Identity
- Public Access - The dashboard does not require authentication or identity management.

## Monitoring & Observability
- None. No logging or error tracking services are integrated.

## CI/CD & Deployment

**Hosting & Deployment:**
- Firebase Hosting - Primary deployment platform.
  - Deploy command: `firebase deploy`
  - Project configuration: `firebase.json`, `.firebaserc`
  - Deploy Target: project ID `cbt-mocks`
- Render Static Sites - Alternative/backup deployment platform.
  - Deploy behavior: Auto-deploys on commit/push to git repository.
  - Configuration: `render.yaml`
  - Publish Path: `./public`

---

*Integrations analysis: 2026-06-29*
*Update after hosting or CDN changes*
