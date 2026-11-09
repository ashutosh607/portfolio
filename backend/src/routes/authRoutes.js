import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, getMe, logout, changePassword } from '../controllers/authController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = express.Router();

// Strict anti-brute-force limiter: 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Access temporarily locked for 15 minutes.',
  },
});

router.post('/login', loginLimiter, login);
router.post('/logout', protectAdmin, logout);
router.get('/me', protectAdmin, getMe);
router.put('/change-password', protectAdmin, changePassword);

export default router;
