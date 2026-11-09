# Shinobi CMS audit · 9 November 2026

The local admin is available at [localhost:5173/admin](http://localhost:5173/admin). The configured public feed returned five projects, seven skills, three missions and five NPC scripts. The original five conversations were imported from the village source using insert-only updates. The three existing mission records were preserved. All destructive testing used a separate, randomly named Atlas database and uniquely named cloud uploads.

## A. Functional audit

| Feature | Initial status | Issue found | Fix applied | Final test result |
|---|---|---|---|---|
| Private reads | Failed | A query parameter exposed inbox messages and hidden content. Direct detail routes could return unpublished items. | Authenticate private queries, enforce publication filters on lists and details, omit messages, drafts and hidden events from public responses. | Fixed & Verified. Anonymous private reads returned 401. A draft project and hidden mission returned 404. Hidden events were absent from the public response. |
| Authentication | Failed | Login copied the JWT into browser storage. Logout cleared the client but left issued tokens usable. | Use an HTTP-only cookie, check server-side session version, invalidate sessions after logout or password change and redirect on expiry. Removed the fallback seed password. | Fixed & Verified. Browser login, invalid password, reload, expired token, logout replay, password-change revocation, throttling and production Secure cookie tested. The configured admin also matched its stored password hash. |
| Atlas | Passed | The original indicators could show success during failure. Reordering could report success for missing records. | Live ping, database-backed overview, explicit errors and transactional ordering. | Fixed & Verified. Create/update/delete, duplicate rejection, ordering, backend restart and database-unavailable HTTP 503 tested. |
| Projects | Failed | The book read bundled data and local browser overrides. Visibility alone was displayed as publication. Seeded artwork referenced a missing directory. | Shared published feed, draft/publish status, filters, image uploads, screenshots, preview, stable slugs and legacy artwork resolution. | Fixed & Verified. Browser create/edit/reload/delete, API publication and order changes, 3D book opening and page turn with four projects, and 2D rendering tested. |
| Skills | Failed | The editor only updated existing skills. The public scroll used static categories and project metadata. | Split category editor, create/delete, icon, linked project slugs, visibility, numeric and drag ordering. | Fixed & Verified for API CRUD and ordering and browser rendering of the published category. Dragging was not separately automated. |
| About & education | Failed | Admin data did not drive the dossier. Highlights, interests and goals lacked editing controls. | Shared profile, portrait preview/upload, editable lists, separate save-draft and publish actions. | Fixed & Verified for saved profile, draft isolation and a published title in the 2D dossier. |
| Contact & inbox | Failed | Public contact actions were static, the inbox lacked a public form and administrators could not change read state. | Connected links, availability and description. Added a public inquiry form, atomic message writes, authenticated read/unread and confirmed deletion. | Fixed & Verified. Browser submission reached Atlas. Private read, read/unread, deletion and public exclusion tested. |
| Missions & hackathons | Failed | Mission APIs existed but the scroll used a bundled list. The data shapes differed for evidence and case studies. | Connected both modes, added a shared editor for experience and hackathon records, event ordering, dates, case study fields, screenshots, evidence and visibility. | Fixed & Verified for CRUD, visibility, ordering, hidden event filtering and published mission rendering. Public PDF evidence delivery remains blocked below. |
| NPC dialogues | Failed | Conversations were hardcoded and the CMS had no usable dialogue editor. | Imported the five original scripts, added line/choice/reply editing and ordered navigation targets. The interaction registry reads the published scripts. | Fixed & Verified. A changed Sasuke line appeared after fast travel and selecting him from the village proximity control. |
| Cloudinary images | Failed | The dashboard declared storage ready. Uploads had no durable searchable inventory or in-use deletion guard. | Server-side storage ping, signature and size validation, persisted asset metadata, previews, replacement and guarded deletion. | Fixed & Verified. Actual image upload, public retrieval, replacement, reference protection and cloud cleanup tested. Oversized files and spoofed content were rejected. |
| Résumé and PDF certificates | Failed | The viewer used a fixed file. An accepted cloud upload could produce an inaccessible public URL. | Bind the viewer to the published résumé. Probe new PDF delivery before returning its URL and remove the upload if delivery fails. | Blocked. A real uploaded PDF returned HTTP 401 from Cloudinary. Rejection and rollback passed. Public preview/download of a newly uploaded PDF still needs an account change and retest. |
| Dashboard and routes | Failed | Infrastructure states were hardcoded. Caught request failures became zero counts. Dashboard actions led to generic lists. | Query MongoDB for four metrics and recent content, show service checks with timestamps, and link to actual editors. | Fixed & Verified. Browser overview counts, authenticated routes, project shortcuts, mobile navigation and viewport checks ran. |

## B. UI improvements

The overview puts publication and inbox work first. Four compact metrics sit above a recent-content table and editor shortcuts. Infrastructure checks occupy one secondary row with a verification time. Navigation is grouped by workspace, content, assets and configuration. The desktop sidebar collapses and becomes a drawer on mobile. Projects have search, filters and an editor with grouped controls. Skills use a split editor and assets have a searchable file grid. Amber indicates active navigation and primary actions. Public village models and book/page-turn geometry were preserved.

## C. Remaining scope

- The media library can account for files registered through the updated uploader. It has no inventory of older files uploaded directly to Cloudinary. Replaced files remain available for manual reuse or deletion.
- Résumé version history, inbox archiving, a historical activity log and SEO management are not implemented. The dashboard omits actions and events for them.
- Several original project records use the same GitHub profile as both repository and live website. The book uses known project-specific links from existing portfolio metadata where available. Other project-specific destinations require the owner's URLs. The DS Photography site returned HTTP 200. The GitHub link probe did not receive a response within five seconds.
- An already-open public page loads newly published content on refresh. If the API is unreachable at startup, the existing bundled portfolio is the offline fallback.
- The audit exercises representative browser workflows plus API coverage. It does not establish cross-browser parity, test every individual form field by mouse, or verify the production hosting provider’s redirects and cookie policy.

## D. Testing evidence

The integration suite starts the real Express server, uses Atlas and Cloudinary, restarts the API, and removes its test database and cloud fixtures. Headless Chrome runs the real React site. Desktop, laptop, tablet and phone widths tested were 1440, 1280, 1024, 768, 390 and 360 pixels. Tests cover authentication, admin routes, editor CRUD, file validation, both portfolio modes and error responses. The successful browser run recorded zero uncaught JavaScript exceptions. Expected negative API cases include 400-series responses for unauthorized access, duplicate content, oversized uploads and guarded deletions.

The Vite production build passed. Three existing book-geometry tests passed. The backend lockfile passed an npm clean-install dry run. A scan compared compiled client JavaScript against the configured JWT secret, MongoDB URI, Cloudinary secret/key and bootstrap password. None of those configured values appeared in the bundle. The build still reports the existing large public 3D bundle advisory.

To repeat the full audit in PowerShell, run from the backend directory with the configured services available. The test user and its credentials are generated for the run.

```powershell
$env:CMS_BROWSER = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
npm run test:audit
```

## E. Deployment readiness

1. In Cloudinary's product environment Security settings, review **Allow delivery of PDF and ZIP files**, then rerun the audit with a fresh PDF. Require a successful public download before releasing résumé and certificate uploads. [Cloudinary PDF delivery documentation](https://cloudinary.com/documentation/ts_how_to_upload_manage_and_deliver_pdf_files)
2. Deploy the API and frontend on HTTPS. Prefer a same-origin reverse proxy at `/api`. Alternatively, configure `VITE_API_URL` at build time and host the API on a same-site domain for the strict session cookie. Set the exact frontend origin in `CLIENT_URL`. Keep database, JWT and Cloudinary secrets on the server. Set `NODE_ENV=production` and configure `TRUST_PROXY_HOPS` only for a verified proxy topology.
3. Route direct frontend `/admin/*` requests to the SPA entry and API requests to Express. Smoke-test login, refresh, logout, upload and public résumé delivery on the deployed domains. No hosted deployment was performed in this audit.
4. For another database, import the existing NPC and mission definitions with `npm run import:village` from the backend directory in a checkout containing both projects. For the configured database this import has already run. It uses insert-only updates to preserve existing records.
