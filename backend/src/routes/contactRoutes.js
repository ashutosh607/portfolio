import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  getContact,
  getContactMessages,
  updateContact,
  submitVisitorMessage,
  updateVisitorMessageStatus,
  deleteVisitorMessage,
} from '../controllers/contactController.js';
import { protectAdmin, checkAdminOptional } from '../middleware/auth.js';
import { validateBody, contactMessageSchema } from '../middleware/validate.js';

const router = express.Router();

// Strict anti-spam rate limiter on public contact inquiries: max 5 messages per hour per IP
const messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many messages sent. Please wait before sending another inquiry.',
  },
});

router.route('/')
  .get(checkAdminOptional, getContact)
  .put(protectAdmin, updateContact);

router.get('/messages', protectAdmin, getContactMessages);
router.post('/messages', messageLimiter, validateBody(contactMessageSchema), submitVisitorMessage);
router.patch('/messages/:messageId', protectAdmin, updateVisitorMessageStatus);
router.delete('/messages/:messageId', protectAdmin, deleteVisitorMessage);

export default router;
