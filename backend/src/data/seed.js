import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Skill from '../models/Skill.js';
import Mission from '../models/Mission.js';
import Profile from '../models/Profile.js';
import Contact from '../models/Contact.js';
import Dialogue from '../models/Dialogue.js';

const INITIAL_PROJECTS = [
  {
    slug: 'travelflow-ai',
    title: 'TravelFlow AI',
    dishName: 'Narutomaki AI Ramen',
    category: 'Full-Stack / AI Itinerary Planner',
    frontPagePhoto: '/ichiraku/projects/travelflow-ai.webp',
    projectPhoto: '/ichiraku/projects/travelflow-ai.webp',
    screenshots: [],
    shortDesc: 'A production-grade travel platform with real-time routing, dynamic budget forecasting, and AI trip compilation.',
    problemSolved: 'Replaces scattered tabs, manual booking spreadsheets, and broken routes with an all-in-one AI travel workspace.',
    features: [
      'Multi-city smart itinerary optimizer with live drag-and-drop',
      'Dynamic day-by-day budget tracker across currencies',
      'Interactive maps, live weather forecasts, and offline PDF export',
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Mapbox GL', 'Tailwind CSS'],
    githubUrl: 'https://github.com/ashutosh607',
    liveUrl: 'https://github.com/ashutosh607',
    accent: '#D97706',
    order: 1,
    visible: true,
    status: 'published',
  },
  {
    slug: 'wastewise',
    title: 'WasteWise',
    dishName: 'Tonkotsu Eco-Classifier',
    category: 'Computer Vision / Waste Segregation',
    frontPagePhoto: '/ichiraku/projects/wastewise.webp',
    projectPhoto: '/ichiraku/projects/wastewise.webp',
    screenshots: [],
    shortDesc: 'Computer-vision-powered edge waste classification system that detects recyclables and sorts municipal refuse in real-time.',
    problemSolved: 'Solves municipal recycling contamination by classifying recyclable vs. organic refuse in under 60 milliseconds.',
    features: [
      'Fine-tuned YOLOv8 classification with 94.2% top-1 accuracy',
      'Edge deployment pipeline on Raspberry Pi and NVIDIA Jetson',
      'Real-time municipal telemetry dashboard with anomaly detection',
    ],
    techStack: ['Python', 'PyTorch', 'YOLOv8', 'OpenCV', 'FastAPI', 'React', 'Docker'],
    githubUrl: 'https://github.com/ashutosh607',
    liveUrl: 'https://github.com/ashutosh607',
    accent: '#059669',
    order: 2,
    visible: true,
    status: 'published',
  },
  {
    slug: 'callkavach',
    title: 'CallKavach',
    dishName: 'Shoyu Defense Broth',
    category: 'Voice Intelligence / Fraud Prevention',
    frontPagePhoto: '/ichiraku/projects/callkavach.webp',
    projectPhoto: '/ichiraku/projects/callkavach.webp',
    screenshots: [],
    shortDesc: 'Streaming speech fraud detection that analyzes live phone call transcripts to block impersonation and credential theft.',
    problemSolved: 'Shields vulnerable users from bank impersonation and urgent financial scams before they transfer money.',
    features: [
      'Zero-latency acoustic-to-text pipeline with sentiment scoring',
      'Transformer-based scam intent classifier with urgency detection',
      'Automated caller reputational telemetry and instant SMS alerts',
    ],
    techStack: ['Python', 'FastAPI', 'Hugging Face Transformers', 'Whisper ASR', 'Redis', 'Twilio API'],
    githubUrl: 'https://github.com/ashutosh607',
    liveUrl: 'https://github.com/ashutosh607',
    accent: '#DC2626',
    order: 3,
    visible: true,
    status: 'published',
  },
  {
    slug: 'racket-sports-intelligence',
    title: 'Racket Sports Intelligence',
    dishName: 'Miso Vision Stir',
    category: 'Sports Analytics / Pose Estimation',
    frontPagePhoto: '/ichiraku/projects/racket-intel.webp',
    projectPhoto: '/ichiraku/projects/racket-intel.webp',
    screenshots: [],
    shortDesc: 'Spatial tracking platform that analyzes match video footage, computes shuttlecock velocities, and maps court coverage.',
    problemSolved: 'Brings elite-level spatial stroke analytics to grassroots badminton players using standard smartphone cameras.',
    features: [
      'TrackNet-inspired ball and shuttlecock trajectory extrapolation',
      'Multi-person pose estimation for footwork speed and reach coverage',
      'Automated rally segmentation with shot type classification',
    ],
    techStack: ['Python', 'MediaPipe', 'OpenCV', 'PyTorch', 'Flask', 'NumPy', 'Chart.js'],
    githubUrl: 'https://github.com/ashutosh607',
    liveUrl: 'https://github.com/ashutosh607',
    accent: '#2563EB',
    order: 4,
    visible: true,
    status: 'published',
  },
  {
    slug: 'konoha-3d-portfolio',
    title: 'Hidden Leaf 3D Portfolio',
    dishName: 'Chidori Shio Ramen',
    category: 'Interactive 3D / WebGL Experience',
    frontPagePhoto: '/ichiraku/projects/konoha-3d-portfolio.webp',
    projectPhoto: '/ichiraku/projects/konoha-3d-portfolio.webp',
    screenshots: [],
    shortDesc: 'A real-time 3D gamified developer portfolio featuring Konoha Village, third-person controls, character interactions, and dynamic HUD.',
    problemSolved: 'Transforms standard boring developer resumes into an unforgettable story-driven exploration experience.',
    features: [
      'Third-person camera controller with ground collision detection',
      'Realistic night/day cycle, atmospheric fog, and dynamic shadows',
      'Cinematic character dialogues with Sasuke, Sakura, Tsunade, and Kakashi',
    ],
    techStack: ['React', 'Three.js', 'React Three Fiber', 'React Three Drei', 'GSAP', 'Vite'],
    githubUrl: 'https://github.com/ashutosh607',
    liveUrl: 'https://github.com/ashutosh607',
    accent: '#7C3AED',
    order: 5,
    visible: true,
    status: 'published',
  },
];

const INITIAL_SKILLS = [
  {
    slug: 'frontend',
    title: 'Frontend Architecture',
    japaneseTitle: '風遁・フロントエンド',
    icon: 'frontend',
    summary: 'Crafting responsive, high-performance interfaces with modern React, WebGL 3D immersion, and cinematic GSAP timelines.',
    technologies: ['React 19', 'Three.js / R3F', 'GSAP', 'JavaScript (ES6+)', 'Tailwind CSS', 'Vite', 'HTML5 / CSS3'],
    relatedProjects: ['konoha-3d-portfolio', 'travelflow-ai'],
    order: 1,
  },
  {
    slug: 'backend',
    title: 'Backend Systems',
    japaneseTitle: '土遁・バックエンド',
    icon: 'backend',
    summary: 'Architecting scalable server-side systems, RESTful microservices, secure authentication flows, and real-time sockets.',
    technologies: ['Node.js', 'Express.js', 'FastAPI', 'JWT Authentication', 'REST APIs', 'WebSockets', 'CORS & Security'],
    relatedProjects: ['travelflow-ai', 'callkavach'],
    order: 2,
  },
  {
    slug: 'python',
    title: 'Python Ecosystem',
    japaneseTitle: '雷遁・パイソン',
    icon: 'python',
    summary: 'Writing clean, idiomatic Python for scientific computing, high-performance data processing pipelines, and computer vision.',
    technologies: ['Python 3', 'FastAPI', 'Flask', 'NumPy', 'Pandas', 'OpenCV', 'AsyncIO'],
    relatedProjects: ['wastewise', 'callkavach', 'racket-sports-intelligence'],
    order: 3,
  },
  {
    slug: 'ml',
    title: 'Machine Learning & AI',
    japaneseTitle: '火遁・機械学習',
    icon: 'ml',
    summary: 'Training neural networks, fine-tuning computer vision backbones, and deploying real-time inference pipelines.',
    technologies: ['PyTorch', 'YOLOv8', 'Hugging Face', 'MediaPipe', 'Scikit-Learn', 'Transfer Learning', 'LLMs'],
    relatedProjects: ['wastewise', 'callkavach', 'racket-sports-intelligence'],
    order: 4,
  },
  {
    slug: 'databases',
    title: 'Data Architecture',
    japaneseTitle: '水遁・データベース',
    icon: 'databases',
    summary: 'Designing normalized relational schemas and flexible document stores optimized for query speed and data integrity.',
    technologies: ['MongoDB', 'Mongoose ODM', 'PostgreSQL', 'MySQL', 'Redis Caching'],
    relatedProjects: ['travelflow-ai', 'callkavach'],
    order: 5,
  },
  {
    slug: 'apis',
    title: 'APIs & Integrations',
    japaneseTitle: '口寄せ・API通信',
    icon: 'apis',
    summary: 'Integrating complex third-party AI APIs, mapping services, real-time telephony, and cloud storage providers.',
    technologies: ['Cloudinary', 'OpenAI API', 'Twilio Voice', 'Mapbox GL', 'Stripe Payments', 'Axios'],
    relatedProjects: ['travelflow-ai', 'callkavach'],
    order: 6,
  },
  {
    slug: 'tools',
    title: 'DevOps & Tooling',
    japaneseTitle: '忍具・開発環境',
    icon: 'tools',
    summary: 'Disciplined version control, automated testing, containerized deployments, and Linux environment management.',
    technologies: ['Git / GitHub', 'Docker', 'Vercel', 'Postman', 'Linux / Bash', 'npm / pnpm', 'VS Code'],
    relatedProjects: ['konoha-3d-portfolio', 'wastewise'],
    order: 7,
  },
];

export const seedDatabase = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri || uri.includes('<db_username>')) {
    console.log('⚠️ [Seed] MONGO_URI contains unconfigured placeholder <db_username>. Seeding skipped.');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('🍃 [Seed] Connected to MongoDB Atlas. Seeding initial data...');

    // 1. Seed Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || 'ashutoshkadam607@gmail.com').toLowerCase().trim();
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        email: adminEmail,
        password: process.env.ADMIN_INITIAL_PASSWORD,
        name: 'Ashutosh Kadam',
        role: 'admin',
      });
      console.log(`✅ [Seed] Admin account created: ${adminEmail}`);
    }

    // 2. Seed Projects
    for (const proj of INITIAL_PROJECTS) {
      await Project.findOneAndUpdate({ slug: proj.slug }, { $setOnInsert: proj }, { upsert: true, new: true });
    }
    console.log(`✅ [Seed] ${INITIAL_PROJECTS.length} Portfolio Projects seeded.`);

    // 3. Seed Skills
    for (const skill of INITIAL_SKILLS) {
      await Skill.findOneAndUpdate({ slug: skill.slug }, { $setOnInsert: skill }, { upsert: true, new: true });
    }
    console.log(`✅ [Seed] ${INITIAL_SKILLS.length} Skill Scrolls seeded.`);

    // 4. Seed Profile
    const existingProfile = await Profile.findOne();
    if (!existingProfile) {
      await Profile.create({
        about: {
          snapshotItems: [
            { label: 'EDUCATION', title: 'DJ Sanghvi College of Engineering', desc: 'B.Tech in Artificial Intelligence & Machine Learning (2022–2026)' },
            { label: 'DEVELOPMENT', title: 'Full-Stack & 3D Interactive Systems', desc: 'Specializing in React, Node, WebGL/Three.js, and FastAPIs' },
            { label: 'EXPLORATION', title: 'Edge AI & Real-Time Computer Vision', desc: 'YOLO, PyTorch, MediaPipe spatial tracking & pose estimation' },
            { label: 'GOAL', title: 'High-Impact Engineering', desc: 'Building scalable products that merge creative engineering with deep tech' },
          ],
          interestItems: [
            { icon: '⚽', label: 'Football', sub: 'Pitch strategy & teamwork' },
            { icon: '⚔️', label: 'Anime & Manga', sub: 'World-building & narrative arcs' },
            { icon: '🍜', label: 'Food Enthusiast', sub: 'Authentic ramen & street cuisine' },
            { icon: '💻', label: 'System Design', sub: 'Low-latency code & clean architectures' },
            { icon: '🚀', label: 'Hackathons', sub: 'Rapid prototyping & problem solving' },
          ],
          driveValues: [
            { num: '01', title: 'Build', desc: 'Transforming ideas into resilient production code' },
            { num: '02', title: 'Learn', desc: 'Relentlessly mastering new technologies and paradigms' },
            { num: '03', title: 'Grow', desc: 'Sharpening skills through high-stakes hackathons and team leadership' },
          ],
        },
      });
      console.log('✅ [Seed] Profile dossier seeded.');
    }

    // 5. Seed Contact
    const existingContact = await Contact.findOne();
    if (!existingContact) {
      await Contact.create({});
      console.log('✅ [Seed] Contact settings seeded.');
    }

    console.log('🎉 [Seed] Shinobi Database Seeding Completed Successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seed] Error seeding database:', error);
    process.exit(1);
  }
};

// Run if called directly
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}

