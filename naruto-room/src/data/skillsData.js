import { resolveArtwork } from './projectMenu';
import { published } from './published';
/**
 * Shinobi Portfolio — Technical Skills & Jutsu Scrolls Data
 * 
 * Modular, data-driven architecture designed for future Admin Panel / Headless CMS integration.
 * All technologies, categories, icons, and related projects can be dynamically fetched or updated.
 */

export const PROJECTS_METADATA = {
  'konoha-3d-portfolio': {
    id: 'konoha-3d-portfolio',
    title: 'Konoha 3D Interactive Portfolio',
    dishName: 'Miso Tonkotsu Special',
    thumbnail: '/ichiraku/projects/konoha-3d-portfolio.webp',
    shortDesc: 'Interactive 3D Hidden Leaf Village with custom third-person camera and GLTF environments.',
    liveUrl: 'https://portfolio-zeta-amber-3cr4nj8fai.vercel.app/',
    githubUrl: 'https://github.com/ashutosh607/portfolio',
    internalModalId: 'projects',
  },
  'travelflow-ai': {
    id: 'travelflow-ai',
    title: 'TravelFlow AI',
    dishName: 'Chashu Deluxe Ramen',
    thumbnail: '/ichiraku/projects/travelflow-ai.webp',
    shortDesc: 'Autonomous travel itinerary engine generating day-by-day schedules with live map integration.',
    liveUrl: 'https://travel-flow-1h4h.vercel.app/',
    githubUrl: 'https://github.com/ashutosh607/TravelFlow',
    internalModalId: 'projects',
  },
  'callkavach': {
    id: 'callkavach',
    title: 'CallKavach',
    dishName: 'Spicy ANBU Ramen',
    thumbnail: '/ichiraku/projects/callkavach.webp',
    shortDesc: 'Automated spam defense and scam call mitigation system with real-time speech analytics.',
    liveUrl: '#projects',
    githubUrl: 'https://github.com/ashutosh607',
    internalModalId: 'projects',
  },
  'wastewise': {
    id: 'wastewise',
    title: 'WasteWise',
    dishName: 'Shoyu Leaf Ramen',
    thumbnail: '/ichiraku/projects/wastewise.webp',
    shortDesc: 'Smart waste classification system powered by deep learning computer vision.',
    liveUrl: '#projects',
    githubUrl: 'https://github.com/ashutosh607',
    internalModalId: 'projects',
  },
  'racket-intel': {
    id: 'racket-intel',
    title: 'Racket Sports Intelligence',
    dishName: 'Sage Chakra Ramen',
    thumbnail: '/ichiraku/projects/racket-intel.webp',
    shortDesc: 'Computer vision analytics tracking player velocity, shot mechanics, and court coverage.',
    liveUrl: '#projects',
    githubUrl: 'https://github.com/ashutosh607',
    internalModalId: 'projects',
  },
};

export const SKILL_CATEGORIES = [
  {
    id: 'frontend',
    title: 'Frontend Development',
    japaneseLabel: 'フロントエンド術',
    description:
      'Crafting responsive, interactive 2D and 3D user interfaces with clean component architecture.',
    iconKey: 'code',
    order: 1,
    visible: true,
    technologies: [
      { id: 'react', name: 'React', iconKey: 'react' },
      { id: 'javascript', name: 'JavaScript (ES6+)', iconKey: 'javascript' },
      { id: 'typescript', name: 'TypeScript', iconKey: 'typescript' },
      { id: 'threejs', name: 'Three.js', iconKey: 'threejs' },
      { id: 'r3f', name: 'React Three Fiber', iconKey: 'r3f' },
      { id: 'html5', name: 'HTML5', iconKey: 'html5' },
      { id: 'css3-tailwind', name: 'CSS3 / Tailwind CSS', iconKey: 'tailwind' },
    ],
    relatedProjectIds: ['konoha-3d-portfolio', 'travelflow-ai', 'callkavach'],
  },
  {
    id: 'backend',
    title: 'Backend Development',
    japaneseLabel: 'バックエンド術',
    description:
      'Building reliable server-side architectures, asynchronous pipelines, and scalable application logic.',
    iconKey: 'layers',
    order: 2,
    visible: true,
    technologies: [
      { id: 'nodejs', name: 'Node.js', iconKey: 'nodejs' },
      { id: 'express', name: 'Express.js', iconKey: 'express' },
      { id: 'rest-api', name: 'REST APIs', iconKey: 'api' },
      { id: 'fastapi', name: 'FastAPI', iconKey: 'fastapi' },
      { id: 'auth', name: 'Authentication & Security', iconKey: 'shield' },
      { id: 'websockets', name: 'WebSockets', iconKey: 'websocket' },
    ],
    relatedProjectIds: ['travelflow-ai', 'callkavach', 'wastewise'],
  },
  {
    id: 'python',
    title: 'Python Engineering',
    japaneseLabel: 'パイソン仙術',
    description:
      'Core language for machine learning pipelines, computer vision scripts, automation, and AI backends.',
    iconKey: 'python',
    order: 3,
    visible: true,
    technologies: [
      { id: 'python-core', name: 'Python 3', iconKey: 'python' },
      { id: 'numpy', name: 'NumPy', iconKey: 'numpy' },
      { id: 'pandas', name: 'Pandas', iconKey: 'pandas' },
      { id: 'asyncio', name: 'AsyncIO', iconKey: 'asyncio' },
      { id: 'opencv', name: 'OpenCV', iconKey: 'opencv' },
      { id: 'scripting', name: 'Data Processing & Scripting', iconKey: 'code' },
    ],
    relatedProjectIds: ['racket-intel', 'wastewise', 'callkavach'],
  },
  {
    id: 'ml',
    title: 'Machine Learning & AI',
    japaneseLabel: '機械学習・AI',
    description:
      'Designing and deploying computer vision models, NLP classifiers, and LLM-powered agent workflows.',
    iconKey: 'brain',
    order: 4,
    visible: true,
    technologies: [
      { id: 'pytorch', name: 'PyTorch', iconKey: 'pytorch' },
      { id: 'opencv-ml', name: 'OpenCV', iconKey: 'opencv' },
      { id: 'vision', name: 'Computer Vision', iconKey: 'vision' },
      { id: 'nlp', name: 'NLP / Transformers', iconKey: 'nlp' },
      { id: 'llm', name: 'LLM Prompt & Tool Orchestration', iconKey: 'ai' },
      { id: 'models', name: 'Supervised & Unsupervised Learning', iconKey: 'chart' },
    ],
    relatedProjectIds: ['racket-intel', 'wastewise', 'callkavach'],
  },
  {
    id: 'databases',
    title: 'Databases & Storage',
    japaneseLabel: 'データ封印術',
    description:
      'Structuring relational and document data models for fast queries, caching, and reliable persistence.',
    iconKey: 'database',
    order: 5,
    visible: true,
    technologies: [
      { id: 'mongodb', name: 'MongoDB', iconKey: 'mongodb' },
      { id: 'atlas', name: 'MongoDB Atlas', iconKey: 'mongodbatlas' },
      { id: 'postgresql', name: 'PostgreSQL', iconKey: 'postgresql' },
      { id: 'sqlite', name: 'SQLite', iconKey: 'sqlite' },
      { id: 'cloudinary', name: 'Cloudinary Media Storage', iconKey: 'cloud' },
      { id: 'schema', name: 'Schema & Query Optimization', iconKey: 'database' },
    ],
    relatedProjectIds: ['travelflow-ai', 'wastewise', 'callkavach'],
  },
  {
    id: 'apis',
    title: 'APIs & Integrations',
    japaneseLabel: '通信連携術',
    description:
      'Connecting frontend experiences with AI inference services, streaming endpoints, and third-party APIs.',
    iconKey: 'link',
    order: 6,
    visible: true,
    technologies: [
      { id: 'rest', name: 'REST APIs', iconKey: 'api' },
      { id: 'axios', name: 'Axios Client', iconKey: 'axios' },
      { id: 'streaming', name: 'Streaming Responses', iconKey: 'websocket' },
      { id: 'ai-apis', name: 'LLM & Vision APIs', iconKey: 'ai' },
      { id: 'json-schema', name: 'JSON Schema Validation', iconKey: 'code' },
      { id: 'integrations', name: 'Third-Party Integrations', iconKey: 'link' },
    ],
    relatedProjectIds: ['travelflow-ai', 'callkavach', 'wastewise'],
  },
  {
    id: 'tools',
    title: 'Development Tools',
    japaneseLabel: '忍具・開発環境',
    description:
      'Modern developer workflow for version control, bundling, 3D asset optimization, and cloud deployment.',
    iconKey: 'tools',
    order: 7,
    visible: true,
    technologies: [
      { id: 'git', name: 'Git & GitHub', iconKey: 'github' },
      { id: 'vscode', name: 'VS Code', iconKey: 'vscode' },
      { id: 'vite', name: 'Vite', iconKey: 'vite' },
      { id: 'vercel', name: 'Vercel Deployment', iconKey: 'vercel' },
      { id: 'render', name: 'Render Cloud', iconKey: 'render' },
      { id: 'linux', name: 'Linux / Bash', iconKey: 'linux' },
      { id: 'blender', name: 'Blender 3D Pipeline', iconKey: 'blender' },
    ],
    relatedProjectIds: ['konoha-3d-portfolio', 'travelflow-ai', 'racket-intel'],
  },
];

/**
 * Service helpers for future API integration
 */
export function getSkillCategories() {
  if (published) return published.skills.map(skill => ({
    id:skill.slug,title:skill.title,japaneseLabel:skill.japaneseTitle,description:skill.summary,
    iconKey:({frontend:'code',backend:'layers',ml:'brain',databases:'database',apis:'link'})[skill.icon] || skill.icon,relatedProjectIds:skill.relatedProjects,
    technologies:skill.technologies.map(name=>({id:name,name,iconKey:name.toLowerCase()}))
  }));
  return SKILL_CATEGORIES.filter((c) => c.visible).sort((a, b) => a.order - b.order);
}

export function getProjectById(projectId) {
  if (published) {
    const project = published.projects.find(p=>p.slug===projectId);
    return project && {...project,id:project.slug,thumbnail:resolveArtwork(project.frontPagePhoto || project.projectPhoto)};
  }
  return PROJECTS_METADATA[projectId] || null;
}

