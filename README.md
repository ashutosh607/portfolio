# Ashutosh Kadam | Shinobi Portfolio

A developer portfolio presented as a playable Hidden Leaf Village. Visitors can walk through Konoha as Naruto, talk to characters, and open portfolio sections at six landmarks. A scrollable 2D edition presents the same work, and a private CMS lets Ashutosh update published content.

[Explore the live portfolio](https://ashutosh-kadam-portfolio.vercel.app/) · [Local setup](#local-development) · [Deployment](#deployment) · [Architecture](docs/architecture.md)

## Explore the village

| Destination | Portfolio section |
| --- | --- |
| Konoha Main Street | Introduction and directory with fast travel |
| Ichiraku Ramen | Interactive project book with previews, technology stacks, and live links |
| Hokage’s Office Gate | Biography, interests, and résumé |
| Training Grounds | Skills grouped by discipline, related projects, and GitHub activity |
| Mission Gate | Experience, hackathons, case studies, and supporting documents |
| Hokage Monument | Contact form and social links |

Use **WASD** or the **arrow keys** to move, **Shift** to sprint, and **Space** to jump. Touch controls are available on mobile. The village HUD includes fast travel, lighting controls, and the switch to the 2D portfolio. Background music starts muted and can continue across both modes after a visitor enables it.

## Local development

Use **Node.js 22.12 or newer**, npm, and a checkout of this repository. Run the commands below from the repository root. The frontend and backend have separate lockfiles.

### Preview the portfolio

```sh
npm ci --prefix naruto-room
npm run dev
```

Open [localhost:5173](http://localhost:5173), or the address printed by Vite. The public portfolio can display bundled content when the API is unavailable. To edit content, test form submissions, or work with uploaded media, start the API as well.

### Run the API and CMS

1. Install the server dependencies with `npm ci --prefix backend`.
2. Copy [backend/.env.example](backend/.env.example) to `backend/.env`. The template uses production settings. For local development set `NODE_ENV=development`, `PORT=5000`, and `CLIENT_URL=http://localhost:5173`.
3. Set `MONGO_URI` to a local or Atlas development database. Set `JWT_SECRET` to a random secret of at least 32 bytes. You can generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
4. Set `ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD` for the initial administrator. Use a password of at least 15 characters. For image uploads, also set the three `CLOUDINARY_*` values in the template.
5. Initialize the development database, then start the server in a second terminal.

```sh
npm --prefix backend run seed
npm --prefix backend run import:village
npm run backend:dev
```

The seed creates the administrator if that email is new. Running it again leaves the existing password in place. The village import adds missing mission and dialogue records. Confirm the API responds at [localhost:5000/api/health](http://localhost:5000/api/health), then sign in at [localhost:5173/admin/login](http://localhost:5173/admin/login).

The frontend defaults to `http://localhost:5000/api` in development. To use another API, copy [naruto-room/.env.example](naruto-room/.env.example) to `naruto-room/.env`, set `VITE_API_URL`, and restart Vite. Values prefixed with `VITE_` are public build settings. Keep database credentials, signing secrets, and Cloudinary credentials in the backend environment.

## Content and architecture

The frontend uses **React, Vite, Three.js, React Three Fiber, and GSAP**. The API uses **Express, Mongoose, and MongoDB**. The public app reads published content from `GET /api/portfolio`. The CMS uses a server-issued HTTP-only session cookie for authenticated edits. For content types with drafts, publish the changes before checking the visitor view.

| Location | Responsibility |
| --- | --- |
| [naruto-room/src/app](naruto-room/src/app) | Application shell and coordination between the village and portfolio sections |
| [naruto-room/src/features](naruto-room/src/features) | Village, project book, mission scroll, skills, dialogue, contact, audio, and admin interface |
| [naruto-room/src/shared](naruto-room/src/shared) | Shared frontend code, including the published-content loader |
| [naruto-room/public](naruto-room/public) | Models, textures, images, résumé, and optional background music assets |
| [backend/src](backend/src) | API routes, controllers, validation, authentication, and database models |
| [backend/src/data](backend/src/data) | Initial CMS records and village import scripts |

Images uploaded through the CMS use Cloudinary. PDF uploads support Cloudinary delivery and a MongoDB GridFS fallback. For background music, replace the loop files in [public/audio](naruto-room/public/audio) and adjust the playback settings in the [audio feature](naruto-room/src/features/audio).

## Verification

| Command from the repository root | Purpose |
| --- | --- |
| `npm test` | Run the frontend unit tests and the backend mission validation and upload filter tests |
| `npm --prefix backend run test:github` | Check GitHub calendar responses and caching against a running development API on port 5000 |
| `npm --prefix naruto-room run lint` | Run the frontend linter |
| `npm run build` | Build the frontend into `naruto-room/dist` |
| `npm --prefix naruto-room run preview` | Serve the production build locally |
| `npm --prefix backend run test:audit` | Exercise the CMS API using a temporary database and test fixtures |

The backend audit needs a MongoDB account that can create and drop its temporary database and Cloudinary credentials for upload checks. Run it with development services. After changing a shared portfolio section, check it both through its 3D landmark and in the 2D page.

## Deployment

- **Frontend on Vercel.** The [root Vercel configuration](vercel.json) installs and builds the client from `naruto-room`, serves `naruto-room/dist`, and handles SPA routes such as `/admin/login`. Set `VITE_API_URL` to the deployed API URL ending in `/api` before building.
- **API on Render.** The [Render blueprint](render.yaml) runs the service from `backend` and checks `/api/health`. Configure MongoDB, the session secret, Cloudinary, and the exact deployed frontend origin in `CLIENT_URL`. Seed a new database once to provision its first admin.
- **Changing hosts.** The current Vercel configuration forwards `/cms-api/*` to the project’s Render API for same-origin admin requests. If you change the API host, review both the rewrite destination and the [admin API resolver](naruto-room/src/features/admin/services/api.js). After deployment, verify a public project, an admin sign-in, and a published edit from the deployed frontend.
