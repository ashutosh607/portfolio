import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes: requires valid JWT in Bearer Authorization header or httpOnly cookie
 */
export const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.adminToken) {
    token = req.cookies.adminToken;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Shinobi authentication token required.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token expired or invalid. Please log in again.',
    });
  }
};

