// Configuration for the 6 interactive portfolio destinations in Konoha Village

export const KONOHA_LOCATIONS = [
  {
    id: 'main-street',
    number: '01',
    name: 'Konoha Main Street',
    shortName: 'Main Street',
    japaneseName: '木ノ葉大通り',
    role: 'Introduction & Welcome',
    signLabel: 'Intro → Main Street',
    icon: '🍃',
    modalKey: 'intro',
    description: 'The bustling central artery of the Hidden Leaf Village and starting spawn point.',
    // Central Main Street entrance boulevard overlooking the village & Hokage Monument
    position: [-19.4, 1.62, 5.0],
    arrivalFacing: Math.PI, // Straight North down the ramp towards the well and Hokage monument
    cameraYaw: 0,
    shrinePosition: [-16.8, 1.60, 4.0],
    shrineRotation: 0, // Straight facing South
    radius: 6.0,
    badge: 'INTRO',
    color: '#c42b1c',
  },
  {
    id: 'ichiraku-ramen',
    number: '02',
    name: 'Ichiraku Ramen',
    shortName: 'Ichiraku Ramen',
    japaneseName: '一楽ラーメン',
    role: 'Featured Projects',
    signLabel: 'Projects → Ichiraku Ramen',
    icon: '🍜',
    modalKey: 'projects',
    description: "Naruto's favorite ramen shop. Browse engineering projects served as signature dishes.",
    // Actual 3D modeled Ichiraku Ramen shop with banners, counter & stools
    position: [-25.5, 0.02, -13.2],
    arrivalFacing: 0, // Straight North facing the counter and banners
    cameraYaw: Math.PI,
    shrinePosition: [-28.4, 0.02, -13.2],
    shrineRotation: 0, // Straight parallel to shop counter
    radius: 5.5,
    badge: 'PROJECTS',
    color: '#e67e22',
  },
  {
    id: 'hokage-office',
    number: '03',
    name: "Hokage's Office",
    shortName: "Hokage's Office",
    japaneseName: '火影邸',
    role: 'About Me & Journey',
    signLabel: "About → Hokage's Office",
    icon: '📜',
    modalKey: 'about',
    description: 'The administrative heart of Konoha. Developer background, AI/ML journey, and goals.',
    // Grand Hokage Residence entrance courtyard straight in front of entrance double doors & stairs
    position: [-17.6, -0.02, -33.0],
    arrivalFacing: Math.PI, // Straight North looking into Hokage entrance stairs
    cameraYaw: 0,
    shrinePosition: [-20.4, -0.02, -34.5],
    shrineRotation: 0, // Straight facing South towards the front gate & well
    radius: 6.5,
    badge: 'ABOUT',
    color: '#27ae60',
  },
  {
    id: 'training-grounds',
    number: '04',
    name: 'Training Grounds',
    shortName: 'Training Grounds',
    japaneseName: '演習場',
    role: 'Technical Skills Scrolls',
    signLabel: 'Skills → Training Grounds',
    icon: '⚔️',
    modalKey: 'skills',
    description: 'Outdoor shinobi training arena and battle dome overseen by Master Jiraiya.',
    // Outdoor Training Arena Dome courtyard supervised by Master Jiraiya
    position: [2.0, 0.0, 18.5],
    arrivalFacing: Math.PI, // Facing straight towards the training arena doorway
    cameraYaw: 0,
    shrinePosition: [0.6, 0.0, 19.5],
    shrineRotation: 0, // Straight facing the courtyard
    radius: 6.5,
    badge: 'SKILLS',
    color: '#2980b9',
  },
  {
    id: 'mission-board',
    number: '05',
    name: 'Mission Board',
    shortName: 'Mission Board',
    japaneseName: '任務受付',
    role: 'Experience & Hackathons',
    signLabel: 'Experience → Mission Board',
    icon: '🏆',
    modalKey: 'achievements',
    description: 'Pinned shinobi mission dossiers covering hackathons, team projects, and milestones.',
    // Northeast Shinobi Outpost Plaza with Team 7 assembled
    position: [16.0, 0.58, -21.8],
    arrivalFacing: Math.PI, // Straight North facing the mission board
    cameraYaw: 0,
    shrinePosition: [16.0, 0.58, -24.2],
    shrineRotation: 0, // Straight
    radius: 6.0,
    badge: 'MISSIONS',
    color: '#8e44ad',
  },
  {
    id: 'hokage-monument',
    number: '06',
    name: 'Hokage Monument',
    shortName: 'Hokage Monument',
    japaneseName: '火影岩',
    role: 'Contact & Socials',
    signLabel: 'Contact → Hokage Monument',
    icon: '⛰️',
    modalKey: 'contact',
    description: 'Overlooking the stone faces of Konoha. Start our next mission together.',
    // Far Northern Monument Overlook
    position: [0.0, -0.07, -58.0],
    arrivalFacing: Math.PI, // Straight North facing the monument faces
    cameraYaw: 0,
    shrinePosition: [0.0, -0.07, -61.0],
    shrineRotation: 0, // Straight
    radius: 5.5,
    badge: 'CONTACT',
    color: '#d35400',
  },
];

// Featured Projects (Ichiraku Ramen Menu Dishes)
export const PORTFOLIO_PROJECTS = [
  {
    id: 'travelflow-ai',
    dishName: 'Miso Tonkotsu Special',
    title: 'TravelFlow AI',
    category: 'AI & FULL-STACK • INTELLIGENT ITINERARY ENGINE',
    shortDesc:
      'AI-powered travel planning and itinerary orchestration platform that generates personalized, budget-aware multi-day routes in real time.',
    problemSolved:
      'Eliminates hours of manual trip research and fragmented booking tabs by synthesizing preferences, local transit constraints, and weather context into a unified interactive itinerary.',
    features: [
      'Dynamic multi-day itinerary generation using structured LLM outputs',
      'Interactive map route visualization and real-time schedule rebalancing',
      'Budget breakdown estimation and place discovery filtering',
      'Responsive full-stack web interface with persistent trip saving',
    ],
    techStack: ['React', 'Node.js', 'Python', 'LLM APIs', 'Tailwind CSS', 'REST APIs'],
    githubUrl: 'https://github.com/ashutosh',
    liveUrl: '#projects',
    accent: '#e67e22',
  },
  {
    id: 'wastewise',
    dishName: 'Shoyu Leaf Ramen',
    title: 'WasteWise',
    category: 'COMPUTER VISION & SUSTAINABILITY • ML',
    shortDesc:
      'Smart waste classification and sustainability tracking system powered by deep learning image recognition to automate recycling sorting.',
    problemSolved:
      'Reduces recycling contamination and sorting errors by accurately classifying waste items from camera streams into recyclable, organic, and hazardous categories.',
    features: [
      'Real-time waste category classification using convolutional neural networks',
      'Actionable disposal and recycling guidance per detected item',
      'Analytics dashboard tracking waste diversion and environmental impact',
      'Fast inference pipeline optimized for mobile and edge cameras',
    ],
    techStack: ['Python', 'PyTorch', 'OpenCV', 'FastAPI', 'React', 'SQLite'],
    githubUrl: 'https://github.com/ashutosh',
    liveUrl: '#projects',
    accent: '#27ae60',
  },
  {
    id: 'callkavach',
    dishName: 'Spicy ANBU Ramen',
    title: 'CallKavach',
    category: 'AI SECURITY & NLP • FRAUD DETECTION',
    shortDesc:
      'Real-time scam and phishing call protection shield that analyzes conversational patterns to warn users of social engineering attacks.',
    problemSolved:
      'Protects vulnerable users from financial fraud and voice phishing (vishing) by detecting urgency traps, impersonation cues, and suspicious requests in real time.',
    features: [
      'Real-time speech-to-text transcription and intent risk scoring',
      'NLP classification of coercion, OTP solicitation, and financial urgency',
      'Instant visual and audio warning alerts with explainable risk reasons',
      'Privacy-conscious processing pipeline with low-latency streaming',
    ],
    techStack: ['Python', 'NLP / Transformers', 'FastAPI', 'WebSockets', 'React', 'JavaScript'],
    githubUrl: 'https://github.com/ashutosh',
    liveUrl: '#projects',
    accent: '#c42b1c',
  },
  {
    id: 'racket-sports-intelligence',
    dishName: 'Sage Chakra Ramen',
    title: 'Racket Sports Intelligence',
    category: 'COMPUTER VISION • SPORTS ANALYTICS',
    shortDesc:
      'Automated video analysis system for racket sports that tracks player movement, shuttle/ball trajectory, and shot mechanics from match footage.',
    problemSolved:
      'Brings pro-grade performance analytics to everyday players and coaches using standard camera footage without expensive wearable sensors.',
    features: [
      'High-speed object tracking and court keypoint homography mapping',
      'Player court-coverage heatmaps and movement velocity profiling',
      'Automated rally segmentation and shot-type classification',
      'Visual overlay rendering for tactical post-match review',
    ],
    techStack: ['Python', 'OpenCV', 'PyTorch', 'NumPy', 'Computer Vision'],
    githubUrl: 'https://github.com/ashutosh',
    liveUrl: '#projects',
    accent: '#2980b9',
  },
  {
    id: 'konoha-3d-portfolio',
    dishName: 'Hokage Grand Bowl',
    title: 'Konoha 3D Interactive Portfolio',
    category: '3D WEBGL • REACT THREE FIBER • SPATIAL ENGINE',
    shortDesc:
      'This explorable 3D Hidden Leaf Village portfolio featuring O(1) spatial-grid terrain physics, skeletal character interactions, and adaptive FPS scaling.',
    problemSolved:
      'Transforms a traditional static developer portfolio into an explorable 3D world that runs smoothly across desktop and mobile devices.',
    features: [
      'Custom 2D spatial hash grid collider for O(1) terrain height and wall collision',
      'Interactive 3D destinations, directional signage, and RPG character dialogues',
      'Adaptive DPR & automatic FPS watchdog with instant 2D fallback mode',
      'Third-person camera controller with desktop WASD and mobile touch controls',
    ],
    techStack: ['React 19', 'Three.js', 'React Three Fiber', 'Drei', 'Vite'],
    githubUrl: 'https://github.com/ashutosh',
    liveUrl: '#main-street',
    accent: '#d35400',
  },
];

// 7 Interactive Skill Scrolls (Training Grounds)
export const SKILL_SCROLLS = [
  {
    id: 'frontend',
    title: 'Frontend Development',
    japaneseTitle: 'フロントエンド術',
    icon: '🎨',
    summary: 'Crafting responsive, interactive 2D and 3D user interfaces with clean component architecture.',
    technologies: ['React', 'JavaScript (ES6+)', 'TypeScript', 'Three.js', 'React Three Fiber', 'HTML5', 'CSS3 / Tailwind CSS'],
    relatedProjects: ['Konoha 3D Interactive Portfolio', 'TravelFlow AI', 'CallKavach'],
  },
  {
    id: 'backend',
    title: 'Backend Development',
    japaneseTitle: 'バックエンド術',
    icon: '⚙️',
    summary: 'Building reliable server-side architectures, asynchronous pipelines, and scalable application logic.',
    technologies: ['Node.js', 'Express.js', 'FastAPI', 'RESTful Architecture', 'WebSockets', 'Authentication & Security'],
    relatedProjects: ['TravelFlow AI', 'CallKavach', 'WasteWise'],
  },
  {
    id: 'python',
    title: 'Python Engineering',
    japaneseTitle: 'パイソン仙術',
    icon: '🐍',
    summary: 'Core language for machine learning pipelines, computer vision scripts, automation, and AI backends.',
    technologies: ['Python 3', 'NumPy', 'Pandas', 'AsyncIO', 'FastAPI', 'Data Processing & Scripting'],
    relatedProjects: ['Racket Sports Intelligence', 'WasteWise', 'CallKavach', 'TravelFlow AI'],
  },
  {
    id: 'ml',
    title: 'Machine Learning & AI',
    japaneseTitle: '機械学習・AI',
    icon: '🧠',
    summary: 'Designing and deploying computer vision models, NLP classifiers, and LLM-powered agent workflows.',
    technologies: ['PyTorch', 'OpenCV', 'Computer Vision', 'NLP / Transformers', 'LLM Prompt & Tool Orchestration', 'Model Optimization'],
    relatedProjects: ['Racket Sports Intelligence', 'WasteWise', 'CallKavach', 'TravelFlow AI'],
  },
  {
    id: 'databases',
    title: 'Databases & Storage',
    japaneseTitle: 'データ封印術',
    icon: '🗄️',
    summary: 'Structuring relational and document data models for fast queries and reliable persistence.',
    technologies: ['PostgreSQL', 'MongoDB', 'SQLite', 'SQL', 'Schema Design', 'Query Optimization'],
    relatedProjects: ['TravelFlow AI', 'WasteWise'],
  },
  {
    id: 'apis',
    title: 'APIs & Integrations',
    japaneseTitle: '通信連携術',
    icon: '🔌',
    summary: 'Connecting frontend experiences with AI inference services, streaming endpoints, and third-party APIs.',
    technologies: ['REST APIs', 'WebSockets', 'JSON Schema Validation', 'LLM & Vision APIs', 'Streaming Responses'],
    relatedProjects: ['TravelFlow AI', 'CallKavach', 'WasteWise'],
  },
  {
    id: 'tools',
    title: 'Development Tools',
    japaneseTitle: '忍具・開発環境',
    icon: '🛠️',
    summary: 'Modern developer workflow for version control, bundling, 3D asset optimization, and deployment.',
    technologies: ['Git & GitHub', 'Vite', 'VS Code', 'Linux / Bash', 'Docker', 'Blender / 3D GLTF Pipeline'],
    relatedProjects: ['Konoha 3D Interactive Portfolio', 'TravelFlow AI', 'Racket Sports Intelligence'],
  },
];

// Shinobi Mission Board Dossiers (Experience & Hackathons)
export const MISSION_DOSSIERS = [
  {
    id: 'mission-travelflow',
    rank: 'S-RANK',
    rankClass: 's-rank',
    title: 'AI Itinerary & Route Synthesis Engine',
    organization: 'Flagship AI Engineering Project • TravelFlow AI',
    role: 'Full-Stack & AI Developer',
    date: 'Recent Mission',
    description:
      'Architected an end-to-end intelligent travel planning workflow combining LLM reasoning with structured schedule generation and interactive frontend views.',
    outcome: 'Delivered a responsive multi-day itinerary planner solving fragmented trip research.',
    projectLink: 'travelflow-ai',
  },
  {
    id: 'mission-callkavach',
    rank: 'S-RANK',
    rankClass: 's-rank',
    title: 'Real-Time Scam & Voice Phishing Shield',
    organization: 'Cybersecurity & AI Innovation • CallKavach',
    role: 'AI/ML & Backend Lead',
    date: 'Hackathon & Product Build',
    description:
      'Built a low-latency conversational analysis pipeline to detect social engineering patterns, urgency traps, and fraudulent requests during live calls.',
    outcome: 'Created an explainable real-time fraud alert system protecting users from vishing scams.',
    projectLink: 'callkavach',
  },
  {
    id: 'mission-racket',
    rank: 'A-RANK',
    rankClass: 'a-rank',
    title: 'Computer Vision Sports Telemetry Pipeline',
    organization: 'Applied Computer Vision • Racket Sports Intelligence',
    role: 'Computer Vision Engineer',
    date: 'Research & Engineering Build',
    description:
      'Developed automated player tracking, court mapping, and rally analysis from match video streams using OpenCV and PyTorch.',
    outcome: 'Enabled camera-only tactical movement heatmaps and shot analysis without wearable hardware.',
    projectLink: 'racket-sports-intelligence',
  },
  {
    id: 'mission-wastewise',
    rank: 'A-RANK',
    rankClass: 'a-rank',
    title: 'Automated Waste Classification & Sustainability Tracker',
    organization: 'Green-Tech & ML Initiative • WasteWise',
    role: 'Machine Learning & Full-Stack Developer',
    date: 'Team & Community Project',
    description:
      'Trained and integrated a vision classification pipeline with a web interface to guide accurate waste sorting and recycling habits.',
    outcome: 'Streamlined waste categorization with instant visual feedback and disposal guidance.',
    projectLink: 'wastewise',
  },
  {
    id: 'mission-konoha',
    rank: 'S-RANK',
    rankClass: 's-rank',
    title: 'Interactive 3D Konoha World & Spatial Engine',
    organization: 'Creative WebGL Engineering • Konoha Portfolio',
    role: 'Creator & 3D Web Developer',
    date: 'Active Deployment',
    description:
      'Engineered an explorable 3D Hidden Leaf Village in React Three Fiber with custom O(1) spatial-grid collision, skeletal pose systems, and adaptive FPS optimization.',
    outcome: 'Achieved smooth 60 FPS exploration with full desktop, mobile, and 2D fallback accessibility.',
    projectLink: 'konoha-3d-portfolio',
  },
];
