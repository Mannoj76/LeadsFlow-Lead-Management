import { Router, Request, Response } from 'express';
import { AuthConfig } from '../models/AuthConfig.js';
import { User } from '../models/User.js';
import { emailService } from '../utils/emailService.js';
import { whatsappService } from '../utils/whatsappService.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Get current auth configuration (non-sensitive fields only)
router.get('/auth', async (req: Request, res: Response) => {
  try {
    let config = await AuthConfig.findOne();

    // Create default if doesn't exist
    if (!config) {
      config = new AuthConfig({
        emailAuthEnabled: false,
        whatsappEnabled: false,
      });
      await config.save();
    }

    res.json({
      emailAuthEnabled: config.emailAuthEnabled,
      emailVerificationRequired: config.emailVerificationRequired,
      emailConfigValid: config.emailConfigValid,
      whatsappEnabled: config.whatsappEnabled,
      whatsappConfigValid: config.whatsappConfigValid,
      lastEmailTestAt: config.lastEmailTestAt,
      lastWhatsappTestAt: config.lastWhatsappTestAt,
    });
  } catch (error) {
    logger.error('Error fetching auth config:', error);
    res.status(500).json({ error: 'Failed to fetch auth configuration' });
  }
});

// Update email configuration
router.post('/auth/email', async (req: Request, res: Response) => {
  try {
    const {
      emailAuthEnabled,
      emailSmtpServer,
      emailSmtpPort,
      emailSmtpUsername,
      emailSmtpPassword,
      emailSmtpSecure,
      emailFromAddress,
      emailVerificationRequired,
    } = req.body;

    let config = await AuthConfig.findOne();
    if (!config) {
      config = new AuthConfig();
    }

    config.emailAuthEnabled = emailAuthEnabled ?? config.emailAuthEnabled;
    if (emailSmtpServer) config.emailSmtpServer = emailSmtpServer;
    if (emailSmtpPort) config.emailSmtpPort = emailSmtpPort;
    if (emailSmtpUsername) config.emailSmtpUsername = emailSmtpUsername;
    if (emailSmtpPassword) config.emailSmtpPassword = emailSmtpPassword;
    if (emailSmtpSecure !== undefined) config.emailSmtpSecure = emailSmtpSecure;
    if (emailFromAddress) config.emailFromAddress = emailFromAddress;
    if (emailVerificationRequired !== undefined) {
      config.emailVerificationRequired = emailVerificationRequired;
    }

    await config.save();

    // Initialize email service with new config
    await emailService.initialize();

    res.json({
      success: true,
      message: 'Email configuration updated',
      config: {
        emailAuthEnabled: config.emailAuthEnabled,
        emailVerificationRequired: config.emailVerificationRequired,
        emailConfigValid: config.emailConfigValid,
      },
    });
  } catch (error) {
    logger.error('Error updating email config:', error);
    res.status(500).json({ error: 'Failed to update email configuration' });
  }
});

// Test email connectivity
router.post('/auth/email/test', async (req: Request, res: Response) => {
  try {
    const success = await emailService.testConnection();

    res.json({
      success,
      message: success
        ? 'Email service is working'
        : 'Email service test failed',
    });
  } catch (error) {
    logger.error('Error testing email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test email service',
    });
  }
});

// Update WhatsApp configuration
router.post('/auth/whatsapp', async (req: Request, res: Response) => {
  try {
    const {
      whatsappEnabled,
      whatsappBusinessAccountId,
      whatsappPhoneNumberId,
      whatsappAccessToken,
      whatsappWebhookToken,
    } = req.body;

    let config = await AuthConfig.findOne();
    if (!config) {
      config = new AuthConfig();
    }

    config.whatsappEnabled = whatsappEnabled ?? config.whatsappEnabled;
    if (whatsappBusinessAccountId)
      config.whatsappBusinessAccountId = whatsappBusinessAccountId;
    if (whatsappPhoneNumberId) config.whatsappPhoneNumberId = whatsappPhoneNumberId;
    if (whatsappAccessToken) config.whatsappAccessToken = whatsappAccessToken;
    if (whatsappWebhookToken) config.whatsappWebhookToken = whatsappWebhookToken;

    await config.save();

    res.json({
      success: true,
      message: 'WhatsApp configuration updated',
      config: {
        whatsappEnabled: config.whatsappEnabled,
        whatsappConfigValid: config.whatsappConfigValid,
      },
    });
  } catch (error) {
    logger.error('Error updating WhatsApp config:', error);
    res.status(500).json({ error: 'Failed to update WhatsApp configuration' });
  }
});

// Test WhatsApp connectivity
router.post('/auth/whatsapp/test', async (req: Request, res: Response) => {
  try {
    const success = await whatsappService.testConnection();

    res.json({
      success,
      message: success
        ? 'WhatsApp service is working'
        : 'WhatsApp service test failed',
    });
  } catch (error) {
    logger.error('Error testing WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test WhatsApp service',
    });
  }
});

// Send verification code via email
router.post('/auth/email/send-code', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const verificationCode = Math.random().toString().slice(2, 8);
    const sent = await emailService.sendVerificationEmail(email, verificationCode, user.username);

    if (sent) {
      // Store verification code temporarily (in real app, use Redis or session)
      // For now, we'll just return success - implement persistence based on your needs
      res.json({
        success: true,
        message: 'Verification code sent to email',
        _temp_code: verificationCode, // Remove in production
      });
    } else {
      res.status(500).json({ error: 'Failed to send verification code' });
    }
  } catch (error) {
    logger.error('Error sending email code:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Send verification code via WhatsApp
router.post('/auth/whatsapp/send-code', async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // In a real implementation, you'd look up user by phone
    const verificationCode = Math.random().toString().slice(2, 8);
    const sent = await whatsappService.sendVerificationCode(
      phoneNumber,
      verificationCode,
      'User'
    );

    if (sent) {
      res.json({
        success: true,
        message: 'Verification code sent via WhatsApp',
        _temp_code: verificationCode, // Remove in production
      });
    } else {
      res.status(500).json({ error: 'Failed to send WhatsApp verification code' });
    }
  } catch (error) {
    logger.error('Error sending WhatsApp code:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Get available authentication methods
router.get('/auth/methods', async (req: Request, res: Response) => {
  try {
    let config = await AuthConfig.findOne();

    if (!config) {
      config = new AuthConfig({
        emailAuthEnabled: false,
        whatsappEnabled: false,
      });
      await config.save();
    }

    res.json({
      methods: {
        username: {
          enabled: true,
          name: 'Username/Password',
          requiresVerification: false,
          configValid: true,
        },
        email: {
          enabled: config.emailAuthEnabled,
          name: 'Email',
          requiresVerification: config.emailVerificationRequired,
          configValid: config.emailConfigValid,
        },
        whatsapp: {
          enabled: config.whatsappEnabled,
          name: 'WhatsApp',
          requiresVerification: true,
          configValid: config.whatsappConfigValid,
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching auth methods:', error);
    res.status(500).json({ error: 'Failed to fetch authentication methods' });
  }
});

export default router;
