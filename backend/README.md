# 🍥 Shinobi Portfolio Backend API

A clean, production-grade Node.js + Express + MongoDB Atlas + Cloudinary backend architecture built for the Naruto-inspired 3D & 2D developer portfolio.

---

## 📁 Folder Structure

```text
backend/
├── .env                  # Your local environment variables (ignored by git)
├── .env.example          # Template for required environment variables
├── .gitignore            # Git exclusion rules (node_modules, .env, logs)
├── package.json          # Dependencies & scripts (ESM "type": "module")
├── server.js             # Express app entry, security headers, CORS, routes
├── README.md             # Documentation
└── src/
    ├── config/
    │   ├── db.js         # Mongoose connection with graceful Atlas error handling
    │   └── cloudinary.js # Cloudinary v2 setup & streaming buffer upload helper
    ├── middleware/
    │   ├── auth.js       # JWT admin route protector
    │   ├── upload.js     # Multer memory storage (WebP images & PDF limits)
    │   └── errorHandler.js # Standardized 404 & 500 JSON error responses
    ├── models/
    │   ├── User.js       # Admin user with bcrypt password hashing
    │   ├── Project.js    # Ramen Book & general project schema
    │   ├── Mission.js    # Freelance case studies & hackathon events schema
    │   ├── Skill.js      # 7 Jutsu skill categories & related projects schema
    │   ├── Profile.js    # Hero welcome sentences, gate badges & about dossier
    │   ├── Contact.js    # Contact directory, availability, resume & inbox messages
    │   └── Dialogue.js   # 3D Village NPC dialogue trees & choices
    ├── controllers/
    │   ├── authController.js
    │   ├── projectController.js
    │   ├── missionController.js
    │   ├── skillController.js
    │   ├── profileController.js
    │   ├── contactController.js
    │   ├── dialogueController.js
    │   └── uploadController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── projectRoutes.js
    │   ├── missionRoutes.js
    │   ├── skillRoutes.js
    │   ├── profileRoutes.js
    │   ├── contactRoutes.js
    │   ├── dialogueRoutes.js
    │   └── uploadRoutes.js
    └── data/
        └── seed.js       # Auto-seeds your existing portfolio data into MongoDB Atlas
```

---

## ⚡ Quick Start

### 1. Configure `.env`
Open `backend/.env` and replace `<db_username>` with your MongoDB Atlas database username:
```env
MONGO_URI=mongodb+srv://<db_username>:QDuT6eGKbMLFjvIi@cluster0.pluvu0q.mongodb.net/naruto_portfolio?retryWrites=true&w=majority
```

Add your free [Cloudinary](https://cloudinary.com) credentials for image & PDF uploads:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Seed Initial Portfolio Data
To seed your existing 5 projects, 7 skill scrolls, profile dossier, and default admin account:
```bash
npm run seed
```

### 3. Start Development Server
```bash
npm run dev
```
The server will start with Nodemon on **`http://localhost:5000`**.

---

## 📡 API Endpoints

| Category | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| **Health** | `GET` | `/api/health` | Public | Server uptime and health check |
| **Auth** | `POST` | `/api/auth/login` | Public (Rate-limited) | Admin login (Returns JWT & sets httpOnly cookie) |
| | `GET` | `/api/auth/me` | Protected | Get current admin user info |
| | `POST` | `/api/auth/logout` | Public | Clear auth cookie |
| | `PUT` | `/api/auth/change-password` | Protected | Change admin password |
| **Projects** | `GET` | `/api/projects` | Public | List all published projects (sorted by `order`) |
| | `GET` | `/api/projects?all=true` | Protected | List all projects including drafts & hidden |
| | `POST` | `/api/projects` | Protected | Create new project |
| | `PUT` | `/api/projects/:slug` | Protected | Update project by slug |
| | `DELETE` | `/api/projects/:slug` | Protected | Delete project |
| | `POST` | `/api/projects/reorder` | Protected | Update display order of multiple projects |
| **Missions** | `GET` | `/api/missions` | Public | List all published missions & hackathons |
| | `POST` | `/api/missions` | Protected | Create mission / hackathon entry |
| | `PUT` | `/api/missions/:slug` | Protected | Update mission |
| | `DELETE` | `/api/missions/:slug` | Protected | Delete mission |
| | `POST` | `/api/missions/reorder` | Protected | Reorder missions |
| **Skills** | `GET` | `/api/skills` | Public | List all 7 skill categories |
| | `POST` | `/api/skills` | Protected | Create skill scroll |
| | `PUT` | `/api/skills/:slug` | Protected | Update skill scroll |
| | `DELETE` | `/api/skills/:slug` | Protected | Delete skill scroll |
| | `POST` | `/api/skills/reorder` | Protected | Reorder skill scrolls |
| **Profile** | `GET` | `/api/profile` | Public | Get hero sentences, intro quote & about bio |
| | `PUT` | `/api/profile` | Protected | Update hero and about dossier |
| **Contact** | `GET` | `/api/contact` | Public | Get contact links & availability status |
| | `PUT` | `/api/contact` | Protected | Update contact links & active resume |
| | `POST` | `/api/contact/messages` | Public (Rate-limited) | Send scroll message from Hokage Monument |
| | `DELETE` | `/api/contact/messages/:messageId` | Protected | Delete received message |
| **Dialogues**| `GET` | `/api/dialogues` | Public | Get all 3D NPC dialogue trees |
| | `PUT` | `/api/dialogues/:characterId`| Protected | Update dialogue lines and choices |
| **Uploads** | `POST` | `/api/upload/image` | Protected | Upload image to Cloudinary (auto-WebP) |
| | `POST` | `/api/upload/document` | Protected | Upload Resume PDF to Cloudinary |

