import express from 'express';
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  reorderSkills,
} from '../controllers/skillController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getSkills)
  .post(protectAdmin, createSkill);

router.post('/reorder', protectAdmin, reorderSkills);

router.route('/:slug')
  .put(protectAdmin, updateSkill)
  .delete(protectAdmin, deleteSkill);

export default router;

