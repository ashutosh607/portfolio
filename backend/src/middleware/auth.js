import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes: requires valid JWT in Bearer Authorization header or httpOnly cookie.
 * Defends against 'none' algorithm attacks and token tampering.
 */
export const protectAdmin = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.adminToken) {
    token = req.cookies.adminToken;
  }

  if (!token || typeof token !== 'string') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Authentication token required.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    const user = await User.findById(decoded.id).select('-password');

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Admin privileges required.',
      });
    }

    if (user.sessionVersion !== decoded.version) {
      return res.status(401).json({
        success: false,
        message: 'Session has ended. Please log in again.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (!['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError', 'CastError'].includes(error.name)) {
      return next(error);
    }
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid signature. Please log in again.',
    });
  }
};

/**
 * Optional admin resolver: populates req.user if valid admin session exists,
 * without blocking public visitors.
 */
export const checkAdminOptional = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.adminToken) {
    token = req.cookies.adminToken;
  }

  if (!token || typeof token !== 'string') {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    const user = await User.findById(decoded.id).select('-password');
    if (user && user.role === 'admin' && user.sessionVersion === decoded.version) {
      req.user = user;
    }
  } catch (err) {
    // Silently continue for public requests
  }

  next();
};
