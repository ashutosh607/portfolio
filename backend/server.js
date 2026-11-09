import dotenv from 'dotenv';
dotenv.config();

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

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// 1. Comprehensive Helmet Security Headers (Clickjacking, XSS, Sniffing, Server Masking)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    frameguard: { action: 'deny' }, // Anti-clickjacking
    xContentTypeOptions: true,      // Anti-MIME sniffing
    xDnsPrefetchControl: { allow: false },
  })
);

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

// 3. Strict CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((url) => url.trim()) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server or trusted local origin
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by Shinobi CORS Policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
    message: 'Hidden Leaf Village API is alive and kicking!',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
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

// 7. Error Handlers
app.use(notFound);
app.use(errorHandler);

// 8. Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🍥 SHINOBI SECURE BACKEND RUNNING ON PORT: ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🛡️  Security: Helmet, Rate-Limit, 256-Bit JWT, bcrypt cost 12`);
  console.log(`======================================================\n`);
});
