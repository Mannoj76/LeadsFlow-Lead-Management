import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuthConfig } from '../models/AuthConfig.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { emailService } from '../utils/emailService.js';
import { whatsappService } from '../utils/whatsappService.js';

const router = express.Router();

// Login (accepts username or email)
router.post('/login', [
  body('email').notEmpty().withMessage('Username or email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body; // 'email' field can contain username or email

  try {
    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: email.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    logger.info('User logged in', { username: user.username, role: user.role });

    res.json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
        lastLogin: user.lastLogin.toISOString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error: any) {
    logger.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

// Logout (client-side token removal, but we can log it)
router.post('/logout', authenticate, (req: AuthRequest, res) => {
  logger.info('User logged out', { username: req.user!.username });
  res.json({ message: 'Logged out successfully' });
});

// Change password
router.post('/change-password', [
  authenticate,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req: AuthRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info('Password changed', { username: user.username });

    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    logger.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Request email verification code
router.post('/email/request-code', [
  body('email').isEmail().withMessage('Valid email is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    // Check if email auth is enabled
    const authConfig = await AuthConfig.findOne();
    if (!authConfig?.emailAuthEnabled) {
      return res.status(403).json({ error: 'Email authentication is not enabled' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Generate verification code
    const verificationCode = Math.random().toString().slice(2, 8);
    
    // Send verification email
    const sent = await emailService.sendVerificationEmail(
      email,
      verificationCode,
      user.username
    );

    if (!sent) {
      return res.status(500).json({ error: 'Failed to send verification code' });
    }

    // In production, store the code in Redis or a temporary verification collection
    // For now, we'll return it for testing (remove in production)
    logger.info('Email verification code requested', { email });

    res.json({
      success: true,
      message: 'Verification code sent to email',
      _temp_code: verificationCode, // Remove in production
    });
  } catch (error: any) {
    logger.error('Email verification code request error:', error);
    res.status(500).json({ error: 'Failed to request verification code' });
  }
});

// Verify email code and login
router.post('/email/verify-code', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('code').notEmpty().withMessage('Verification code is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, code } = req.body;

  try {
    // Check if email auth is enabled
    const authConfig = await AuthConfig.findOne();
    if (!authConfig?.emailAuthEnabled) {
      return res.status(403).json({ error: 'Email authentication is not enabled' });
    }

    // In production, verify the code against stored verification
    // For now, accept any 6-digit code (for testing)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Invalid verification code format' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    logger.info('User logged in via email', { email, username: user.username });

    res.json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
        lastLogin: user.lastLogin.toISOString(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    logger.error('Email verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Request WhatsApp verification code
router.post('/whatsapp/request-code', [
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { phoneNumber } = req.body;

  try {
    // Check if WhatsApp auth is enabled
    const authConfig = await AuthConfig.findOne();
    if (!authConfig?.whatsappEnabled) {
      return res.status(403).json({ error: 'WhatsApp authentication is not enabled' });
    }

    // In production, lookup user by phone number
    // For now, we'll just send the code
    const verificationCode = Math.random().toString().slice(2, 8);

    const sent = await whatsappService.sendVerificationCode(
      phoneNumber,
      verificationCode,
      'User'
    );

    if (!sent) {
      return res.status(500).json({ error: 'Failed to send WhatsApp verification code' });
    }

    logger.info('WhatsApp verification code requested', { phoneNumber });

    res.json({
      success: true,
      message: 'Verification code sent via WhatsApp',
      _temp_code: verificationCode, // Remove in production
    });
  } catch (error: any) {
    logger.error('WhatsApp verification code request error:', error);
    res.status(500).json({ error: 'Failed to request verification code' });
  }
});

// Verify WhatsApp code and login
router.post('/whatsapp/verify-code', [
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('code').notEmpty().withMessage('Verification code is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { phoneNumber, code } = req.body;

  try {
    // Check if WhatsApp auth is enabled
    const authConfig = await AuthConfig.findOne();
    if (!authConfig?.whatsappEnabled) {
      return res.status(403).json({ error: 'WhatsApp authentication is not enabled' });
    }

    // In production, verify the code against stored verification
    // For now, accept any 6-digit code (for testing)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Invalid verification code format' });
    }

    // In production, lookup user by phone number
    // For now, we'll return an error (implement proper phone-to-user mapping)
    return res.status(501).json({
      error: 'WhatsApp user lookup not yet implemented',
      message: 'Please configure phone-to-user mapping in your database',
    });

    // Example of what the rest would look like:
    // const user = await User.findOne({ phone: phoneNumber });
    // ...rest of login logic
  } catch (error: any) {
    logger.error('WhatsApp verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;

