import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Dummy hash used for constant-time comparison to prevent timing attacks
const DUMMY_HASH = '$2a$12$e8ZbzK1jL/qF1pT.3j0z6eF0T4pA9F9pA9F9pA9F9pA9F9pA9F9pA';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
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

    const token = generateToken(user._id);

    // 4. Secure HTTP-only Cookie flag configuration
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'Authentication verified.',
      token,
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
export const logout = (req, res) => {
  res.cookie('adminToken', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
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
      newPassword.length < 6 ||
      newPassword.length > 120
    ) {
      return res.status(400).json({
        success: false,
        message: 'Password must be between 6 and 120 characters.',
      });
    }

    const user = await User.findById(req.user._id);

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
