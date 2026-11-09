import express from 'express';
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from '../controllers/skillController.js';
import { reorder } from '../controllers/reorder.js';
import Skill from '../models/Skill.js';
import { protectAdmin, checkAdminOptional } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(checkAdminOptional, getSkills)
  .post(protectAdmin, createSkill);

router.post('/reorder', protectAdmin, reorder(Skill));

router.route('/:slug')
  .put(protectAdmin, updateSkill)
  .delete(protectAdmin, deleteSkill);

export default router;
