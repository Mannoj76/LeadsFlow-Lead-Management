import express from 'express';
import { body, validationResult } from 'express-validator';
import { PipelineStage } from '../models/PipelineStage.js';
import { LeadSource } from '../models/LeadSource.js';
import { LeadStatus } from '../models/LeadStatus.js';
import { SystemSettings } from '../models/SystemSettings.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ===== Pipeline Stages =====

// Get all pipeline stages
router.get('/pipeline-stages', async (req: AuthRequest, res) => {
  try {
    const stages = await PipelineStage.find().sort({ order: 1 });

    const transformedStages = stages.map(stage => ({
      id: stage._id.toString(),
      name: stage.name,
      order: stage.order,
      color: stage.color,
    }));

    res.json(transformedStages);
  } catch (error: any) {
    logger.error('Get pipeline stages error:', error);
    res.status(500).json({ error: 'Failed to fetch pipeline stages' });
  }
});

// Create pipeline stage (admin only)
router.post('/pipeline-stages', [
  requireAdmin,
  body('name').notEmpty().withMessage('Name is required'),
  body('order').isInt().withMessage('Order must be a number'),
  body('color').notEmpty().withMessage('Color is required'),
], async (req: AuthRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, order, color } = req.body;

    const stage = await PipelineStage.create({ name, order, color });

    logger.info('Pipeline stage created', { stageId: stage._id });

    res.status(201).json({
      id: stage._id.toString(),
      name: stage.name,
      order: stage.order,
      color: stage.color,
    });
  } catch (error: any) {
    logger.error('Create pipeline stage error:', error);
    res.status(500).json({ error: 'Failed to create pipeline stage' });
  }
});

// ===== Lead Sources =====

// Get all lead sources
router.get('/lead-sources', async (req: AuthRequest, res) => {
  try {
    const sources = await LeadSource.find().sort({ name: 1 });

    const transformedSources = sources.map(source => ({
      id: source._id.toString(),
      name: source.name,
    }));

    res.json(transformedSources);
  } catch (error: any) {
    logger.error('Get lead sources error:', error);
    res.status(500).json({ error: 'Failed to fetch lead sources' });
  }
});

// Create lead source (admin only)
router.post('/lead-sources', [
  requireAdmin,
  body('name').notEmpty().withMessage('Name is required'),
], async (req: AuthRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;

    const source = await LeadSource.create({ name });

    logger.info('Lead source created', { sourceId: source._id });

    res.status(201).json({
      id: source._id.toString(),
      name: source.name,
    });
  } catch (error: any) {
    logger.error('Create lead source error:', error);
    res.status(500).json({ error: 'Failed to create lead source' });
  }
});

// ===== Lead Statuses =====

// Get all lead statuses
router.get('/lead-statuses', async (req: AuthRequest, res) => {
  try {
    const statuses = await LeadStatus.find().sort({ name: 1 });

    const transformedStatuses = statuses.map(status => ({
      id: status._id.toString(),
      name: status.name,
      color: status.color,
    }));

    res.json(transformedStatuses);
  } catch (error: any) {
    logger.error('Get lead statuses error:', error);
    res.status(500).json({ error: 'Failed to fetch lead statuses' });
  }
});

// Create lead status (admin only)
router.post('/lead-statuses', [
  requireAdmin,
  body('name').notEmpty().withMessage('Name is required'),
  body('color').notEmpty().withMessage('Color is required'),
], async (req: AuthRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, color } = req.body;

    const status = await LeadStatus.create({ name, color });

    logger.info('Lead status created', { statusId: status._id });

    res.status(201).json({
      id: status._id.toString(),
      name: status.name,
      color: status.color,
    });
  } catch (error: any) {
    logger.error('Create lead status error:', error);
    res.status(500).json({ error: 'Failed to create lead status' });
  }
});

// ===== System Settings =====

// Get system settings
router.get('/settings', async (req: AuthRequest, res) => {
  try {
    let settings = await SystemSettings.findOne();

    if (!settings) {
      // Create default settings if none exist
      settings = await SystemSettings.create({
        companyName: 'LeadsFlow CRM',
        companyEmail: '',
        companyPhone: '',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        timezone: 'UTC',
      });
    }

    res.json({
      companyName: settings.companyName,
      companyEmail: settings.companyEmail,
      companyPhone: settings.companyPhone,
      dateFormat: settings.dateFormat,
      timeFormat: settings.timeFormat,
      timezone: settings.timezone,
    });
  } catch (error: any) {
    logger.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update system settings (admin only)
router.put('/settings', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { companyName, companyEmail, companyPhone, dateFormat, timeFormat, timezone } = req.body;

    let settings = await SystemSettings.findOne();

    if (!settings) {
      settings = await SystemSettings.create({
        companyName,
        companyEmail,
        companyPhone,
        dateFormat,
        timeFormat,
        timezone,
      });
    } else {
      if (companyName) settings.companyName = companyName;
      if (companyEmail) settings.companyEmail = companyEmail;
      if (companyPhone !== undefined) settings.companyPhone = companyPhone;
      if (dateFormat) settings.dateFormat = dateFormat;
      if (timeFormat) settings.timeFormat = timeFormat;
      if (timezone) settings.timezone = timezone;

      await settings.save();
    }

    logger.info('Settings updated');

    res.json({
      companyName: settings.companyName,
      companyEmail: settings.companyEmail,
      companyPhone: settings.companyPhone,
      dateFormat: settings.dateFormat,
      timeFormat: settings.timeFormat,
      timezone: settings.timezone,
    });
  } catch (error: any) {
    logger.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;

