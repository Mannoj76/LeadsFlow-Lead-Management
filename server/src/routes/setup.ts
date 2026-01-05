import express from 'express';
import { body, validationResult } from 'express-validator';
import { testDatabaseConnection, connectDatabase } from '../config/database.js';
import { saveEncryptedConfig, isSetupRequired, updateConfigFromEncrypted, config } from '../config/index.js';
import { validateLicense, generateTestLicense } from '../utils/license.js';
import { User } from '../models/User.js';
import { PipelineStage } from '../models/PipelineStage.js';
import { LeadSource } from '../models/LeadSource.js';
import { LeadStatus } from '../models/LeadStatus.js';
import { SystemSettings } from '../models/SystemSettings.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

const router = express.Router();

// Check if setup is required
router.get('/status', (req, res) => {
  res.json({
    setupRequired: isSetupRequired(),
    setupCompleted: config.app.setupCompleted,
  });
});

// Test database connection
router.post('/test-connection', [
  body('mongodbUri').notEmpty().withMessage('MongoDB URI is required'),
  body('databaseName').notEmpty().withMessage('Database name is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { mongodbUri, databaseName } = req.body;

  try {
    const result = await testDatabaseConnection(mongodbUri, databaseName);
    res.json(result);
  } catch (error: any) {
    logger.error('Database connection test failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Validate license key
router.post('/validate-license', [
  body('licenseKey').notEmpty().withMessage('License key is required'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { licenseKey } = req.body;
  const result = validateLicense(licenseKey);
  
  res.json(result);
});

// Generate test license (for development only)
router.get('/generate-test-license', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not available in production' });
  }
  
  const testLicense = generateTestLicense();
  res.json({ licenseKey: testLicense });
});

// Complete setup
router.post('/complete', [
  body('mongodbUri').notEmpty().withMessage('MongoDB URI is required'),
  body('databaseName').notEmpty().withMessage('Database name is required'),
  body('licenseKey').notEmpty().withMessage('License key is required'),
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('companyEmail').isEmail().withMessage('Valid company email is required'),
  body('adminName').notEmpty().withMessage('Admin name is required'),
  body('adminEmail').isEmail().withMessage('Valid admin email is required'),
  body('adminPassword').isLength({ min: 6 }).withMessage('Admin password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    mongodbUri,
    databaseName,
    licenseKey,
    companyName,
    companyEmail,
    companyPhone,
    adminName,
    adminEmail,
    adminPassword,
  } = req.body;

  try {
    // Validate license
    const licenseResult = validateLicense(licenseKey);
    if (!licenseResult.valid) {
      return res.status(400).json({ error: licenseResult.error });
    }

    // Test database connection
    const dbTest = await testDatabaseConnection(mongodbUri, databaseName);
    if (!dbTest.success) {
      return res.status(400).json({ error: dbTest.error });
    }

    // Generate JWT secret
    const jwtSecret = crypto.randomBytes(64).toString('hex');

    // Save encrypted configuration
    saveEncryptedConfig({
      mongodbUri,
      databaseName,
      jwtSecret,
      licenseKey,
      setupCompleted: true,
      companyName,
      companyEmail,
      adminEmail,
      createdAt: new Date().toISOString(),
    });

    // Update in-memory config
    updateConfigFromEncrypted();

    // Connect to database
    const connected = await connectDatabase();
    if (!connected) {
      return res.status(500).json({ error: 'Failed to connect to database' });
    }

    // Initialize database with default data
    await initializeDatabase(companyName, companyEmail, companyPhone || '', adminName, adminEmail, adminPassword);

    logger.info('Setup completed successfully', { companyName, adminEmail });

    res.json({
      success: true,
      message: 'Setup completed successfully',
    });
  } catch (error: any) {
    logger.error('Setup failed:', error);
    res.status(500).json({ error: error.message || 'Setup failed' });
  }
});

// Initialize database with default data
async function initializeDatabase(
  companyName: string,
  companyEmail: string,
  companyPhone: string,
  adminName: string,
  adminEmail: string,
  adminPassword: string
): Promise<void> {
  try {
    // Create admin user
    const adminUser = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      isActive: true,
    });

    logger.info('Admin user created', { email: adminEmail });

    // Create default pipeline stages
    const defaultStages = [
      { name: 'New Lead', order: 1, color: '#3b82f6' },
      { name: 'Contacted', order: 2, color: '#8b5cf6' },
      { name: 'Qualified', order: 3, color: '#f59e0b' },
      { name: 'Proposal Sent', order: 4, color: '#06b6d4' },
      { name: 'Negotiation', order: 5, color: '#ec4899' },
      { name: 'Closed Won', order: 6, color: '#10b981' },
      { name: 'Closed Lost', order: 7, color: '#64748b' },
    ];

    await PipelineStage.insertMany(defaultStages);
    logger.info('Pipeline stages created');

    // Create default lead sources
    const defaultSources = [
      { name: 'Website' },
      { name: 'Referral' },
      { name: 'Social Media' },
      { name: 'Email Campaign' },
      { name: 'Cold Call' },
      { name: 'Walk-in' },
      { name: 'Other' },
    ];

    await LeadSource.insertMany(defaultSources);
    logger.info('Lead sources created');

    // Create default lead statuses
    const defaultStatuses = [
      { name: 'New', color: '#3b82f6' },
      { name: 'In Progress', color: '#f59e0b' },
      { name: 'Hot', color: '#ef4444' },
      { name: 'Warm', color: '#f97316' },
      { name: 'Cold', color: '#64748b' },
      { name: 'Converted', color: '#10b981' },
      { name: 'Lost', color: '#6b7280' },
    ];

    await LeadStatus.insertMany(defaultStatuses);
    logger.info('Lead statuses created');

    // Create system settings
    await SystemSettings.create({
      companyName,
      companyEmail,
      companyPhone,
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      timezone: 'UTC',
    });

    logger.info('System settings created');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

export default router;

