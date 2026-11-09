import express from 'express';
import {
  getContributions,
  refreshContributions,
  getCalendarConfig,
  updateCalendarConfig,
} from '../controllers/githubController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public endpoints
router.get('/contributions', getContributions);
router.get('/config', getCalendarConfig);

// Protected Admin endpoints
router.post('/refresh', protectAdmin, refreshContributions);
router.put('/config', protectAdmin, updateCalendarConfig);

export default router;

