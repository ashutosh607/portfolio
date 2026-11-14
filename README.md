# Ashutosh Kadam — Interactive 3D & 2D Shinobi Portfolio

An interactive 3D and 2D developer portfolio inspired by the Hidden Leaf Village (*Konoha*), paired with a full-stack Content Management System (CMS) and Admin Dashboard. Visitors can explore a real-time 3D village built with React Three Fiber or switch seamlessly to a responsive 2D editorial portfolio, while all projects, experience dossiers, skills, character dialogues, profile metadata, and media assets are managed dynamically through a secure Node.js + Express + MongoDB backend.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure](#3-repository-structure)
4. [Frontend Architecture (`naruto-room/`)](#4-frontend-architecture-naruto-room)
5. [Backend Architecture (`backend/`)](#5-backend-architecture-backend)
6. [CMS Data Flow](#6-cms-data-flow)
7. [Local Development Setup](#7-local-development-setup)
8. [Environment Variables](#8-environment-variables)
9. [Testing & Verification](#9-testing--verification)
10. [Build & Deployment](#10-build--deployment)
11. [Developer Guide: Extending the Portfolio](#11-developer-guide-extending-the-portfolio)

---

## 1. Project Overview

- **Interactive 3D Village (`features/village/`)**: Third-person character controller (`Naruto.jsx`), spatial terrain and obstacle collision system (`terrainCollider.js`), proximity-based NPC & landmark interaction engine (`interactionSystem.js`), dynamic day/night atmosphere (`Atmosphere.jsx`), and HUD navigation (`KonohaHUD.jsx`, `InteractionHUD.jsx`).
- **2D Editorial Portfolio (`features/portfolio-2d/`)**: Automatic and manual fallback experience (`FallbackPortfolio2D.jsx`) with sticky navigation (`StickyNavbar2D.jsx`) and direct section access for low-power devices or visitors who prefer a classic layout.
- **Interactive Feature Modals**:
  - **Entry Gate (`features/entry/`)**: Pre-rendered instant word boot (`IMAGINE. -> BUILD. -> ENTER KONOHA`), cinematic welcome intro, and quick destination cards.
  - **Projects Ramen Book (`features/projects/`)**: 3D/2D interactive Ichiraku Ramen Menu book (`RamenBookModal.jsx`, `ProjectSpread.jsx`, `PageTurnSurface.js`) with custom curl physics and synced project photography.
  - **Experience & Mission Scroll (`features/experience/`)**: Categorized mission board (`MissionScroll.jsx`, `Dossier.jsx`) with case studies, architecture breakdowns, screenshots, and PDF certificate previews.
  - **Skills & Arsenal (`features/skills/`)**: Domain-grouped technical skills (`SkillsModal.jsx`) linked to real portfolio projects and GitHub activity (`features/github/`).
  - **Character Dialogue System (`features/dialogue/`)**: Typewriter dialogue engine (`CinematicDialogue.jsx`) with character portraits, clan insignias, and contextual action triggers.
  - **Peaceful Konoha Audio (`features/audio/`)**: Opt-in background music controller (`VillageMusicPlayer.jsx`, `villageMusic.js`) with Web Audio API raised-cosine loop crossfading, 2.0s fade-in, and 1.5s fade-out.
  - **Admin CMS (`features/admin/`)**: Lazy-loaded administrative application (`/admin/*`) for managing profile, projects, missions, skills, dialogues, contact messages, and uploaded media/documents.

For deep architectural diagrams, module boundaries, and design decisions, see [`docs/architecture.md`](./docs/architecture.md).

---

## 2. Tech Stack

### Frontend (`naruto-room/`)
- **Framework**: React 19, React DOM 19, React Router DOM 7
- **3D Rendering**: Three.js (`0.183`), `@react-three/fiber`, `@react-three/drei`, `three-stdlib`
- **Animation**: GSAP (`3.14`)
- **Icons**: Lucide React
- **Build & Tooling**: Vite 8, Oxlint, Node.js native test runner (`node --test`)

### Backend (`backend/`)
- **Runtime & Server**: Node.js, Express 5
- **Database & ODM**: MongoDB Atlas, Mongoose 9
- **Authentication & Security**: JWT (`jsonwebtoken`) in `HttpOnly` cookies, `bcryptjs`, `helmet`, `cors`, `express-rate-limit`
- **Validation & Uploads**: Zod 4, Multer (MongoDB-backed binary image & PDF document storage)

---

## 3. Repository Structure

```text
portfolio/
├── README.md                          # Project overview, setup, and developer guide
├── package.json                       # Workspace root scripts (dev, build, preview, test)
├── vercel.json                        # Root Vercel configuration & SPA/asset headers
├── render.yaml                        # Render Blueprint for backend API service
├── docs/
│   └── architecture.md                # Detailed frontend, backend, and CMS architecture
├── naruto-room/                       # Frontend Vite + React application
│   ├── index.html                     # HTML entry with instant word-boot overlay
│   ├── package.json                   # Frontend dependencies and scripts
│   ├── vite.config.js                 # Vite build & React plugin configuration
│   ├── vercel.json                    # Frontend directory Vercel config
│   ├── public/                        # Static 3D GLB models, audio, resume, and media
│   ├── tests/                         # Frontend unit tests (node --test)
│   └── src/
│       ├── main.jsx                   # Route-aware entry point (public vs /admin)
│       ├── app/                       # Application shell, global CSS, modal orchestrator
│       ├── features/                  # Feature-sliced domain modules
│       │   ├── about/                 # About modal & favorite anime config
│       │   ├── admin/                 # Lazy-loaded Admin CMS (auth, layouts, pages, services)
│       │   ├── audio/                 # Global Web Audio loop engine & bottom-right player
│       │   ├── contact/               # Contact form modal & social links
│       │   ├── dialogue/              # NPC typewriter dialogue UI & character data
│       │   ├── entry/                 # Loading screen, cinematic intro, Entry Gate modal
│       │   ├── experience/            # Mission Scroll, Dossier viewer, mission media helpers
│       │   ├── github/                # Live GitHub contribution graph component
│       │   ├── portfolio-2d/          # 2D fallback portfolio view, sticky navbar, motion hooks
│       │   ├── projects/              # Ichiraku Ramen project book, spread, page-turn geometry
│       │   ├── resume/                # Interactive PDF resume modal
│       │   ├── skills/                # Skills modal, category navigation, tech badges
│       │   └── village/               # 3D Konoha scene, Naruto controller, HUD, collisions
│       └── shared/                    # Cross-feature utilities, icons, and CMS store
│           ├── cms/                   # Singleton published CMS cache (published.js)
│           ├── components/            # Shared SVG location icons
│           └── utils/                 # Shared GSAP section entrance helper
└── backend/                           # Node.js + Express + MongoDB CMS API
    ├── server.js                      # Express app bootstrap, CORS, security, route mounting
    ├── package.json                   # Backend dependencies and scripts
    ├── tests/                         # Backend unit, integration, and audit suites
    └── src/
        ├── config/                    # Environment & MongoDB connection setup
        ├── controllers/               # Route handlers for auth, CRUD, uploads, public API
        ├── data/                      # Seed scripts & village data importers
        ├── middleware/                # JWT auth, rate limiters, Multer upload, Zod validation
        ├── models/                    # Mongoose schemas (Project, Mission, Skill, etc.)
        ├── routes/                    # Express routers
        ├── utils/                     # AppError, asyncHandler, auditLogger
        └── validation/                # Zod request payload schemas
```

---

## 4. Frontend Architecture (`naruto-room/`)

The frontend follows a **Feature-Based Architecture**:

- **`src/main.jsx`**: Inspects `window.location.pathname` at boot. If the route starts with `/admin`, it dynamically imports `src/features/admin/AdminApp.jsx` inside `<BrowserRouter>` and hides `#initial-word-boot`. Otherwise, it mounts the public portfolio (`src/app/App.jsx` wrapped in `<VillageMusicProvider>` from `src/features/audio/VillageMusicPlayer.jsx`) immediately and triggers `loadPublished()` asynchronously in the background.
- **`src/app/`**: Owns top-level state transitions (loading boot -> 3D village or 2D fallback -> active modal/dialogue) and composes feature modals via `PortfolioModals.jsx`.
- **`src/features/<domain>/`**: Each feature encapsulates its own React components, styles, hooks, configuration, and fallback seed data.
- **`src/shared/`**: Houses strictly cross-cutting modules shared by three or more features (`shared/cms/published.js`, `shared/components/locationIcons.jsx`, `shared/utils/sectionEntrance.js`).

---

## 5. Backend Architecture (`backend/`)

The backend follows a layered controller-service-model architecture:

- **Public Endpoints**:
  - `GET /api/health` — Service health & uptime check.
  - `GET /api/portfolio` — Aggregates published profile, projects, missions, skills, and NPC dialogues in a single payload.
  - `GET /api/github/contributions/:username` — Proxies and normalizes GitHub contribution calendar data with in-memory caching.
  - `POST /api/contact` — Validates and stores visitor messages (rate-limited).
  - `GET /api/upload/files/:filename` & `GET /api/upload/documents/:filename` — Streams binary images and PDF documents stored in MongoDB with immutable cache headers.
- **Admin Endpoints (`/api/auth`, `/api/profile`, `/api/projects`, `/api/missions`, `/api/skills`, `/api/dialogues`, `/api/contact`, `/api/media`, `/api/upload`)**:
  - Protected by `requireAuth` (`JWT` via `HttpOnly` cookie or `Authorization: Bearer` header) and validated by Zod schemas (`src/validation/schemas.js`).

---

## 6. CMS Data Flow

1. **Instant Boot with Seed Fallbacks**: Feature data modules (`projectMenu.js`, `missionRepository.js`, `skillsData.js`, `dialogueData.js`) ship with complete local fallback datasets so the portfolio renders immediately with zero blank states even before the network responds.
2. **Non-Blocking Hydration**: `loadPublished()` in `src/shared/cms/published.js` fetches `GET /api/portfolio` (with a 6-second abort timeout).
3. **Reactive Subscription**: When the payload arrives, `published.js` updates its singleton `published` cache and notifies subscribed components via `subscribePublished()`, seamlessly replacing seed data with live CMS records.

---

## 7. Local Development Setup

### Prerequisites
- **Node.js** `>= 20.x`
- **npm** `>= 10.x`
- **MongoDB** instance (local or MongoDB Atlas connection URI for backend API features)

### Installation

```bash
# Install frontend dependencies
npm install --prefix naruto-room

# Install backend dependencies
npm install --prefix backend
```

### Running Locally

1. **Start the Frontend Dev Server** (runs on `http://localhost:5173`):
   ```bash
   npm run dev
   ```
2. **Start the Backend API Server** (runs on `http://localhost:5000`):
   ```bash
   npm run dev --prefix backend
   ```
3. *(Optional)* **Seed Initial Database Content**:
   ```bash
   npm run seed --prefix backend
   ```

---

## 8. Environment Variables

### Frontend (`naruto-room/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for backend API requests (e.g. `http://localhost:5000/api`) | Auto-detects `localhost:5000/api` in dev or Render production URL |

### Backend (`backend/.env`)

| Variable | Required | Description |
| :--- | :---: | :--- |
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | No | Port for Express server (default: `5000`) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key (minimum 32 characters) for signing admin JWT tokens |
| `JWT_EXPIRES_IN` | No | Token expiration window (default: `7d`) |
| `ADMIN_EMAIL` | Yes | Initial admin account email for seeding |
| `ADMIN_PASSWORD` | Yes | Initial admin account password for seeding |
| `FRONTEND_URL` | Yes | Allowed CORS origin(s), comma-separated |

---

## 9. Testing & Verification

```bash
# Run frontend unit tests (page-turn geometry, GitHub calendar, mission media, collisions, audio loop)
npm test

# Run backend validation & upload unit tests
node --test backend/tests/upload-mission.test.mjs

# Run frontend static analysis / linter
npm run lint --prefix naruto-room

# Check for unused variables across frontend and backend
npx --prefix naruto-room oxlint -A all -D no-unused-vars naruto-room/src backend/src
```

---

## 10. Build & Deployment

### Production Build

```bash
npm run build
```
Outputs the production bundle to `naruto-room/dist`.

### Deployment Architecture
- **Frontend (Vercel)**: Configured via root `vercel.json` and `naruto-room/vercel.json`. Serves static assets with long-lived cache headers for `/assets/*` and `/models/*.glb`, and rewrites SPA routes to `/index.html`.
- **Backend (Render)**: Configured via `render.yaml` (`rootDir: backend`, `buildCommand: npm install`, `startCommand: npm start`, `healthCheckPath: /api/health`).

---

## 11. Developer Guide: Extending the Portfolio

- **Adding or Editing Projects, Missions, Skills, or Dialogues (No Code Required)**:
  Sign in at `/admin/login` and use the **Projects**, **Missions**, **Skills**, or **Dialogues** tabs to create, reorder, or publish records and upload images/PDFs.
- **Adding a New Static Fallback Project**:
  Update `PORTFOLIO_PROJECTS` in `naruto-room/src/features/village/config/locations.js` and artwork mappings in `naruto-room/src/features/projects/data/projectMenu.js`.
- **Adding a New Static Fallback Mission**:
  Update `missions` in `naruto-room/src/features/experience/data/missions.js`.
- **Adding a New 3D Village Landmark or NPC**:
  1. Register coordinates and camera offsets in `naruto-room/src/features/village/config/locations.js`.
  2. Add dialogue profiles in `naruto-room/src/features/dialogue/config/dialogueData.js`.
  3. Add the 3D character or trigger volume in `naruto-room/src/features/village/components/VillageCharacters.jsx` and `naruto-room/src/features/village/systems/interactionSystem.js`.
