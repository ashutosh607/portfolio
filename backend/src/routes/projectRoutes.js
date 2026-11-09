import express from 'express';
import {
  getProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
} from '../controllers/projectController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getProjects)
  .post(protectAdmin, createProject);

router.post('/reorder', protectAdmin, reorderProjects);

router.route('/:slug')
  .get(getProjectBySlug)
  .put(protectAdmin, updateProject)
  .delete(protectAdmin, deleteProject);

export default router;

