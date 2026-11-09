import express from 'express';
import {
  getMissions,
  getMissionBySlug,
  createMission,
  updateMission,
  deleteMission,
} from '../controllers/missionController.js';
import { reorder } from '../controllers/reorder.js';
import Mission from '../models/Mission.js';
import { protectAdmin, checkAdminOptional } from '../middleware/auth.js';
import { validateBody, missionSchema } from '../middleware/validate.js';

const router = express.Router();

router.route('/')
  .get(checkAdminOptional, getMissions)
  .post(protectAdmin, validateBody(missionSchema), createMission);

router.post('/reorder', protectAdmin, reorder(Mission));

router.route('/:slug')
  .get(checkAdminOptional, getMissionBySlug)
  .put(protectAdmin, validateBody(missionSchema.partial()), updateMission)
  .delete(protectAdmin, deleteMission);

export default router;
