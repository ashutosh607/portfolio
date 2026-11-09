import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getContact,
  updateContact,
  submitVisitorMessage,
  deleteVisitorMessage,
} from '../controllers/contactController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

const messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // max 5 messages per hour per IP
  message: {
    success: false,
    message: 'Too many messages sent. Please wait a bit before sending another scroll.',
  },
});

router.route('/')
  .get(getContact)
  .put(protectAdmin, updateContact);

router.post('/messages', messageLimiter, submitVisitorMessage);
router.delete('/messages/:messageId', protectAdmin, deleteVisitorMessage);

export default router;

