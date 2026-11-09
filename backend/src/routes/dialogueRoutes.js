import express from 'express';
import {
  getDialogues,
  getDialogueByCharacter,
  updateDialogue,
} from '../controllers/dialogueController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDialogues);
router.route('/:characterId')
  .get(getDialogueByCharacter)
  .put(protectAdmin, updateDialogue);

export default router;

