import express from 'express';
import {
  getMissions,
  getMissionBySlug,
  createMission,
  updateMission,
  deleteMission,
  reorderMissions,
} from '../controllers/missionController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getMissions)
  .post(protectAdmin, createMission);

router.post('/reorder', protectAdmin, reorderMissions);

router.route('/:slug')
  .get(getMissionBySlug)
  .put(protectAdmin, updateMission)
  .delete(protectAdmin, deleteMission);

export default router;

