import express from 'express';
import {
  getProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { reorder } from '../controllers/reorder.js';
import Project from '../models/Project.js';
import { protectAdmin, checkAdminOptional } from '../middleware/auth.js';
import { validateBody, projectSchema } from '../middleware/validate.js';

const router = express.Router();

router.route('/')
  .get(checkAdminOptional, getProjects)
  .post(protectAdmin, validateBody(projectSchema), createProject);

router.post('/reorder', protectAdmin, reorder(Project));

router.route('/:slug')
  .get(checkAdminOptional, getProjectBySlug)
  .put(protectAdmin, validateBody(projectSchema.partial()), updateProject)
  .delete(protectAdmin, deleteProject);

export default router;
