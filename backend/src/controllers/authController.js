import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Dummy hash used for constant-time comparison to prevent timing attacks
const DUMMY_HASH = '$2a$12$e8ZbzK1jL/qF1pT.3j0z6eF0T4pA9F9pA9F9pA9F9pA9F9pA9F9pA';

const production = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: production,
  sameSite: production ? 'none' : 'lax',
  partitioned: production,
  path: '/',
};

const generateToken = (id, version) => {
  return jwt.sign({ id, version }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    algorithm: 'HS256',
  });
};

/**
 * @desc Secure Admin Login with Anti-Brute-Force, Anti-Timing, and Anti-NoSQL-Injection defense
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Strict Type & Length Validation (Defeats NoSQL Injection object payloads)
    if (
      !email ||
      !password ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      email.length > 120 ||
      password.length > 120
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials format.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Query user by sanitized string
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    // 3. Constant-time comparison to eliminate Timing Attack user enumeration
    let passwordMatches = false;
    if (user) {
      passwordMatches = await user.comparePassword(password);
    } else {
      // Run dummy compare so response time is identical whether email exists or not
      await bcrypt.compare(password, DUMMY_HASH);
    }

    if (!user || !passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid shinobi admin credentials.',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.sessionVersion);

    res.cookie('adminToken', token, {
      ...cookieOptions,
      maxAge: Math.max(0, jwt.decode(token).exp * 1000 - Date.now()),
    });

    res.json({
      success: true,
      message: 'Authentication verified.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get current authenticated admin
 * @route GET /api/auth/me
 * @access Protected
 */
export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      lastLogin: req.user.lastLogin,
    },
  });
};

/**
 * @desc Admin Logout
 * @route POST /api/auth/logout
 * @access Public
 */
export const logout = async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $inc: { sessionVersion: 1 } });
  res.clearCookie('adminToken', cookieOptions);
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * @desc Change Admin Password
 * @route PUT /api/auth/change-password
 * @access Protected
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (
      !currentPassword ||
      !newPassword ||
      typeof currentPassword !== 'string' ||
      typeof newPassword !== 'string' ||
      currentPassword.length > 120 ||
      newPassword.length < 15 ||
      Buffer.byteLength(newPassword, 'utf8') > 72
    ) {
      return res.status(400).json({
        success: false,
        message: 'Use at least 15 characters and at most 72 UTF-8 bytes for the new password.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    user.password = newPassword;
    user.sessionVersion += 1;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
