import Project from './src/models/Project.js';
import Skill from './src/models/Skill.js';
import Mission, {publicMission} from './src/models/Mission.js';
import Contact from './src/models/Contact.js';
import Profile from './src/models/Profile.js';
import Dialogue from './src/models/Dialogue.js';
import 'dotenv/config';
import mongoose from 'mongoose';
import cloudinary from './src/config/cloudinary.js';
import { protectAdmin } from './src/middleware/auth.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { connectDB } from './src/config/db.js';
import { notFound, errorHandler } from './src/middleware/errorHandler.js';

// Route imports
import authRoutes from './src/routes/authRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import missionRoutes from './src/routes/missionRoutes.js';
import skillRoutes from './src/routes/skillRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
import contactRoutes from './src/routes/contactRoutes.js';
import dialogueRoutes from './src/routes/dialogueRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import githubRoutes from './src/routes/githubRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
if (process.env.TRUST_PROXY_HOPS) {
  const hops=Number(process.env.TRUST_PROXY_HOPS);
  if (!Number.isInteger(hops) || hops<1) throw new Error('TRUST_PROXY_HOPS must be a positive integer.');
  app.set('trust proxy',hops);
}

// Connect to MongoDB Atlas
connectDB();

// 1. Comprehensive Helmet Security Headers (CSP, HSTS, Clickjacking, MIME sniffing)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: { action: 'deny' }, // Anti-clickjacking
    xContentTypeOptions: true,      // Anti-MIME sniffing
    xDnsPrefetchControl: { allow: false },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
        mediaSrc: ["'self'", 'blob:', 'https://res.cloudinary.com'],
        connectSrc: [
          "'self'",
          'http://localhost:5000',
          'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:4173',
          'https://*.vercel.app',
          'https://*.onrender.com',
          'https://res.cloudinary.com',
          ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/+$/, '')) : []),
        ],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    hsts:
      process.env.NODE_ENV === 'production'
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          }
        : false,
  })
);

// Permissions-Policy (disables browser APIs not needed by portfolio)
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  );
  next();
});

// Configure trust proxy for reverse proxies in production
if (process.env.TRUST_PROXY_HOPS) {
  const hops = Number(process.env.TRUST_PROXY_HOPS);
  if (!Number.isInteger(hops) || hops < 1) throw new Error('TRUST_PROXY_HOPS must be a positive integer.');
  app.set('trust proxy', hops);
} else if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Disable Express fingerprinting header (hides "X-Powered-By: Express")
app.disable('x-powered-by');

// 2. Global API Rate Limiter (Anti-DDoS / Anti-Scraping: 150 requests per 15 minutes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again shortly.',
  },
});
app.use('/api', globalLimiter);

// 3. Strict & Dynamic CORS configuration (supports localhost, Vercel deployments, & Render)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:4173',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/+$/, '')) : []),
];

const checkOrigin = (origin, callback) => {
  // Allow server-to-server, curl, mobile, or same-origin requests with no origin header
  if (!origin) return callback(null, true);

  const cleanOrigin = origin.trim().replace(/\/+$/, '');

  // Exact match from allowed list
  if (allowedOrigins.includes(cleanOrigin)) {
    return callback(null, true);
  }

  // Allow any Vercel deployment (both production and preview URLs)
  if (/^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/i.test(cleanOrigin)) {
    return callback(null, true);
  }

  // Allow Render host domains
  if (/^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(cleanOrigin)) {
    return callback(null, true);
  }

  console.warn(`[CORS] Origin rejected: ${origin}`);
  return callback(null, false);
};

app.use(
  cors({
    origin: checkOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
  })
);

// 4. Tight Request Payload Size Limits (Anti-Buffer-Overflow & DoS)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// 5. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    message: 'Hidden Leaf Village API is alive and kicking!',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api',(req,res,next)=>{
  if (mongoose.connection.readyState!==1) return res.status(503).json({message:'Database unavailable. Please retry.'});
  next();
});
app.get('/api/system', protectAdmin, async (req, res) => {
  const [db, media] = await Promise.allSettled([
    mongoose.connection.db.admin().ping(),
    cloudinary.api.ping({timeout: 5000})
  ]);
  res.set('Cache-Control', 'no-store').json({data: {
    api: 'Online', database: db.status === 'fulfilled' ? 'Online' : 'Unavailable',
    media: media.status === 'fulfilled' ? 'Online' : 'Unavailable', verified: new Date()
  }});
});

// Include private fields only after checking the caller's session.
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (req.query.all === 'true' || req.query.includeMessages === 'true') return protectAdmin(req, res, next);
  next();
});

app.get('/api/overview', protectAdmin, async (req,res) => {
  const types=[[Project,'Project','projects'],[Mission,'Mission','missions'],[Skill,'Skill','skills']];
  const [projectCount,skillCount,missionCount,inbox,...groups]=await Promise.all([
    Project.countDocuments({visible:true,status:'published'}),Skill.countDocuments(),Mission.countDocuments(),
    Contact.aggregate([{$unwind:'$messages'},{$match:{'messages.read':{$ne:true}}},{$count:'unread'}]),
    ...types.map(([model])=>model.find().select('slug title status visible updatedAt').sort({updatedAt:-1}).limit(8).lean())
  ]);
  const rows=groups.flatMap((group,i)=>group.map(row=>({...row,type:types[i][1],path:types[i][2]})))
    .sort((a,b)=>b.updatedAt-a.updatedAt).slice(0,8);
  res.json({data:{counts:[projectCount,skillCount,missionCount,inbox[0]?.unread || 0],rows}});
});

app.get('/api/portfolio', async (req,res) => {
  const [projects,skills,missions,profile,contact,dialogues,hasDialogues] = await Promise.all([
    Project.find({visible:true,status:'published'}).sort({order:1,slug:1}),
    Skill.find({visible:true}).sort({order:1,slug:1}),
    Mission.find({visible:true}).sort({order:1,slug:1}), Profile.findOne(),
    Contact.findOne().select('-messages'), Dialogue.find({visible:true}), Dialogue.exists({})
  ]);
  res.json({data:{projects,skills,missions:missions.map(publicMission),profile,contact,dialogues,hasDialogues:!!hasDialogues}});
});

// 6. Mount Secure Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/dialogues', dialogueRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/github', githubRoutes);

// 7. Error Handlers
app.use(notFound);
app.use(errorHandler);

// 8. Start Server (binds to 0.0.0.0 for Render / cloud container compatibility)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🍥 SHINOBI SECURE BACKEND RUNNING ON PORT: ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🛡️  Security: Helmet, Rate-Limit, 256-Bit JWT, bcrypt cost 12`);
  console.log(`======================================================\n`);
});
