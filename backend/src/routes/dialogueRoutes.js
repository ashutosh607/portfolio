import express from 'express';
import {
  getDialogues,
  getDialogueByCharacter,
  updateDialogue,
} from '../controllers/dialogueController.js';
import { protectAdmin, checkAdminOptional } from '../middleware/auth.js';

const router = express.Router();

router.get('/', checkAdminOptional, getDialogues);
router.route('/:characterId')
  .get(checkAdminOptional, getDialogueByCharacter)
  .put(protectAdmin, updateDialogue);

export default router;
