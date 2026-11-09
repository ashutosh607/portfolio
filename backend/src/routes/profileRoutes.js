import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getProfile)
  .put(protectAdmin, updateProfile);

export default router;

