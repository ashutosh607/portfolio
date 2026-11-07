# 🍃 Ashutosh Kadam — Konoha 3D Shinobi Portfolio

> **An interactive, game-inspired 3D developer portfolio set in the Hidden Leaf Village (Konoha), paired with a seamless high-performance 2D edition.**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r186-black?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)
[![React Three Fiber](https://img.shields.io/badge/R3F-v9.8-black?style=flat-square&logo=three.js&logoColor=white)](https://r3f.docs.pmnd.rs/)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?style=flat-square&logo=greensock&logoColor=white)](https://greensock.com/gsap/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## ⛩️ Overview

This project is a cinematic, story-driven 3D web portfolio built from the ground up for **Ashutosh Kadam**, an AI/ML engineering student at **Dwarkadas J. Sanghvi College of Engineering (DJSCE)** and full-stack developer.

Visitors take control of a playable third-person shinobi character in a fully modeled 3D Konoha Village, exploring authentic landmarks, talking with familiar ninja NPCs through a modern borderless dialogue system, and uncovering engineering projects, technical jutsu scrolls, hackathon dossiers, and contact portals.

For recruiters on low-bandwidth devices or users preferring a streamlined browsing experience, a unified **2D Portfolio Mode** is accessible instantly with a single click.

---

## 🗺️ The Six Village Destinations

Each destination corresponds to a key aspect of Ashutosh's technical portfolio:

| Location | Landmark | Japanese | Portfolio Section | Description |
|---|---|---|---|---|
| **01** | **Main Street Gate** | 木ノ葉大通り | **Intro & Welcome** | Village welcome hero, philosophy, role tags, and 6-destination quick teleport directory. |
| **02** | **Ichiraku Ramen** | 一楽ラーメン | **Featured Projects** | 3D Japanese page-turning menu book showcasing full-stack applications & AI platforms. |
| **03** | **Hokage's Office Gate** | 火影邸門 | **About Me** | Dark-editorial showcase with academic snapshot (DJSCE), personal interests, and values. |
| **04** | **Training Grounds** | 演習場 | **Technical Skills** | Moonlit Japanese training room with a 7-category interactive Jutsu Scroll workbench. |
| **05** | **Mission Gate** | 任務受付門 | **Experience & Missions** | Physical unrolling Japanese scroll with client work (DS Photography), hackathons, and dossiers. |
| **06** | **Hokage Monument** | 火影岩 | **Contact & Socials** | Overlooking Konoha's stone faces at twilight, with one-click email copying and social links. |

---

## ⚡ Technical Highlights

- **Custom Physics & Terrain Collision (`O(1)` Spatial Grid)**:
  - Real-time ground snapping, slope traversal, and step-climbing up to `0.45m` using a custom spatial hash collider.
  - Obstacle avoidance around gate posts, building walls, and NPC footprints.
- **Skeletal Animation Blending**:
  - Custom animation mixer that eliminates T-pose glitches, blending between a natural hands-down standing idle pose and running clips.
- **Smart Target Detection & Minimal RPG Interaction UI**:
  - Distance, player facing-angle, and priority weighting with hysteresis to prevent flickering.
  - Displays a clean bottom-center pill (`[E] Talk to Sakura`) or a compact multi-target contextual dock (`NEARBY: 1 Sakura, 2 Sasuke, 3 Mission Board`).
- **Cinematic Borderless Dialogue Engine**:
  - Floating RPG dialogue interface featuring character portraits, animated Japanese nameplates, large serif dialogue text, and customizable choices.
- **Dual Lighting Atmosphere (Day & Japanese Night Mode)**:
  - Real-time toggle between golden daylight and deep indigo moonlight with glowing Japanese Chōchin lanterns (提灯) and Andon street lanterns (行灯).
- **Physical 3D Page Turn Mechanics**:
  - Mathematically derived parametric page-curling mesh using cubic Bézier deformation for the Ichiraku Ramen menu book.

---

## 📂 Project Architecture

```
naruto-room/
├── public/                       # Static assets & 3D models
│   ├── about/                    # About Me photography & textures
│   ├── contact/                  # Hokage Monument background art
│   ├── entry-gate/               # 6 village destination thumbnails
│   ├── ichiraku/                 # Ramen menu book textures & project previews
│   ├── images/                   # Moonlit training room backgrounds & NPC portraits
│   ├── missions/                 # Mission dossiers & certificate previews
│   ├── models/                   # Optimized GLTF/GLB & FBX 3D models (Konoha, Naruto, NPCs)
│   ├── Ashutosh_Kadam_Resume.pdf # Printable PDF curriculum vitae
│   └── favicon.*                 # Custom brand icons & favicons
├── src/
│   ├── components/               # React UI & 3D scene components
│   │   ├── dialogue/             # Modular cinematic RPG dialogue UI
│   │   ├── mission-scroll/       # Interactive unrolling mission scroll & dossiers
│   │   ├── skills/               # 7-category training room skills workbench
│   │   ├── AboutModal.jsx        # Full-screen Hokage's Office About Me modal
│   │   ├── Atmosphere.jsx        # Procedural clouds, moon, stars, leaves & fireflies
│   │   ├── CameraController.jsx  # Third-person smooth follow camera with NPC framing
│   │   ├── CinematicDialogue.jsx # Root RPG dialogue orchestrator
│   │   ├── ContactModal.jsx      # Full-screen Hokage Monument contact modal
│   │   ├── EntryGate.jsx         # 01 Main Entry Gate modal & destination directory
│   │   ├── FallbackPortfolio2D.jsx# High-performance 2D Classic Portfolio Edition
│   │   ├── InteractionHUD.jsx    # Minimal RPG single pill & multi-target dock
│   │   ├── KonohaHUD.jsx         # Top shinobi navbar, Day/Night toggle & touch dpad
│   │   ├── KonohaVillage.jsx     # 3D village model, lanterns & destination shrines
│   │   ├── LoadingScreen.jsx     # Cinematic Naruto asset loading screen
│   │   ├── Naruto.jsx            # Playable character physics, inputs & animations
│   │   ├── PortfolioModals.jsx   # Modal routing & ESC key handling
│   │   ├── RamenBookModal.jsx    # Ichiraku Ramen 3D page-turning project book
│   │   ├── ResumeViewerModal.jsx # In-app PDF resume viewer
│   │   └── VillageCharacters.jsx # 3D NPC actors (Sasuke, Sakura, Tsunade, Jiraiya, etc.)
│   ├── config/
│   │   ├── dialogueData.js       # Dialogue sequences, speaker profiles & voice lines
│   │   └── locations.js          # Coordinates, arrival facings & destination metadata
│   ├── data/
│   │   ├── entryDestinations.js  # Main gate destination card data
│   │   ├── missions.js           # Real-world client missions & hackathon records
│   │   ├── projectMenu.js        # Featured software projects & live URLs
│   │   └── skillsData.js         # 7 technical skill categories, badges & project links
│   ├── utils/
│   │   ├── constants.js          # Speeds, spawn coordinates, bounds & gravity
│   │   ├── interactionSystem.js  # Smart target detection, score weighting & registry
│   │   ├── poseUtils.js          # Skeletons rest-pose corrections for NPC models
│   │   └── terrainCollider.js    # O(1) spatial grid raycaster & collision obstacles
│   ├── App.jsx                   # Root application state & 3D canvas setup
│   ├── index.css                 # Global viewport resets
│   └── main.jsx                  # React DOM entry point
├── tests/
│   └── book-geometry.test.mjs    # Unit tests for 3D page turn curling mathematics
├── package.json
└── vite.config.js
```

---

## 🎮 Controls

### Desktop Controls
| Key | Action |
|---|---|
| `W`, `A`, `S`, `D` / `Arrow Keys` | Move Character |
| `Shift` (Hold) | Chakra Sprint |
| `Space` | Jump |
| `Mouse Drag` | Rotate 360° Follow Camera |
| `Mouse Scroll` | Zoom Camera In / Out |
| `E` / `Click` | Interact with selected NPC or Destination Board |
| `Arrow Up` / `Arrow Down` | Cycle between multiple nearby targets |
| `1` – `9` | Directly select item from the Nearby Dock |
| `N` | Toggle Day / Japanese Night Lighting |
| `H` | Toggle Shinobi Controls Guide |
| `Esc` | Close active dialog, modal, or drawer |

### Mobile Touch Controls
- **Virtual Thumbpad (Bottom-Left)**: Drag or tap in 8 directions to walk/run.
- **Swipe Anywhere**: Rotate the camera smoothly 360°.
- **Pinch In / Out**: Zoom camera distance.
- **⚡ Sprint Pill**: Tap to toggle continuous sprint, or hold down.
- **🥷 Jump Button**: Leap over obstacles and steps.
- **Contextual Action Pill**: Appears automatically near villagers and destination boards.

---

## 🛠️ Installation & Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0.0 or higher recommended)
- `npm` or `pnpm`

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/ashutosh607/portfolio.git
   cd portfolio/naruto-room
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Run unit tests**:
   ```bash
   npm test
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```
   The compiled assets will be output to the `dist/` directory.

---

## 👤 Developer Profile

**Ashutosh Kadam**  
*Full-Stack Developer & AI/ML Engineer*  
- **Email**: [ashutoshkadam607@gmail.com](mailto:ashutoshkadam607@gmail.com)  
- **GitHub**: [@ashutosh607](https://github.com/ashutosh607)  
- **LinkedIn**: [linkedin.com/in/Ashutosh-kadam](https://www.linkedin.com/in/Ashutosh-kadam)  
- **Education**: B.Tech in Artificial Intelligence & Machine Learning, *Dwarkadas J. Sanghvi College of Engineering (DJSCE)*, Mumbai, India.

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.  
*All Naruto-related trademarks, characters, and assets belong to Masashi Kishimoto / Shueisha / Studio Pierrot. This is a non-commercial educational fan portfolio.*
