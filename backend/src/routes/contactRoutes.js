import Contact from '../models/Contact.js';
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
router.patch('/messages/:messageId', protectAdmin, async (req,res) => {
  if (typeof req.body.read !== 'boolean') return res.status(400).json({message:'Expected read status'});
  const result = await Contact.updateOne({'messages._id':req.params.messageId}, {$set:{'messages.$.read':req.body.read}});
  if (!result.matchedCount) return res.status(404).json({message:'Message not found'});
  res.json({success:true});
});
router.delete('/messages/:messageId', protectAdmin, deleteVisitorMessage);

export default router;

