import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, getMe, logout, changePassword } from '../controllers/authController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Strict rate limiter for login endpoint to block brute-force attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  },
});

router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', protectAdmin, getMe);
router.put('/change-password', protectAdmin, changePassword);

export default router;

