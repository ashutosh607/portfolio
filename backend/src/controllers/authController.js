import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc Admin Login
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid shinobi credentials.',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    // Set HTTP-only cookie for secure browser access
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: 'Authentication successful. Welcome, Shinobi Admin.',
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
    user: req.user,
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

