import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

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

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration for frontend
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
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

// Body Parsers & Cookie Parser
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Hidden Leaf Village API is alive and kicking!',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/dialogues', dialogueRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🍥 SHINOBI BACKEND SERVER RUNNING ON PORT: ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🚀 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`======================================================\n`);
});

