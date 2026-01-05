import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Lead } from '../models/Lead.js';
import { Activity } from '../models/Activity.js';
import { Note } from '../models/Note.js';
import { FollowUp } from '../models/FollowUp.js';
import { User } from '../models/User.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { createNotification } from '../utils/notificationHelper.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all leads
router.get('/', async (req: AuthRequest, res) => {
  try {
    const leads = await Lead.find()
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    // Transform to match frontend format
    const transformedLeads = leads.map(lead => ({
      id: lead._id.toString(),
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      source: lead.source,
      status: lead.status,
      assignedTo: lead.assignedTo._id.toString(),
      assignedToName: (lead.assignedTo as any).name,
      leadType: lead.leadType,
      companyName: lead.companyName,
      productInterest: lead.productInterest,
      priority: lead.priority,
      initialNotes: lead.initialNotes,
      customFields: lead.customFields ? Object.fromEntries(lead.customFields.entries()) : {},
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    }));

    res.json(transformedLeads);
  } catch (error: any) {
    logger.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get lead by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email');

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const transformedLead = {
      id: lead._id.toString(),
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      source: lead.source,
      status: lead.status,
      assignedTo: lead.assignedTo._id.toString(),
      assignedToName: (lead.assignedTo as any).name,
      leadType: lead.leadType,
      companyName: lead.companyName,
      productInterest: lead.productInterest,
      priority: lead.priority,
      initialNotes: lead.initialNotes,
      customFields: lead.customFields ? Object.fromEntries(lead.customFields) : {},
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    };

    res.json(transformedLead);
  } catch (error: any) {
    logger.error('Get lead error:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// Create lead
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('source').notEmpty().withMessage('Source is required'),
  body('status').notEmpty().withMessage('Status is required'),
  body('assignedTo').notEmpty().withMessage('Assigned user is required'),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name, phone, email, source, status, assignedTo,
      leadType, companyName, productInterest, priority,
      initialNotes, customFields
    } = req.body;

    // Verify assigned user exists
    const user = await User.findById(assignedTo);
    if (!user) {
      return res.status(400).json({ error: 'Assigned user not found' });
    }

    const lead = await Lead.create({
      name,
      phone,
      email,
      source,
      status,
      assignedTo,
      leadType: leadType || 'individual',
      companyName,
      productInterest,
      priority: priority || 'medium',
      initialNotes,
      customFields: customFields || {},
    });

    // Create activity
    await Activity.create({
      leadId: lead._id,
      userId: req.user!.id,
      action: 'created',
      details: 'Lead created',
    });

    // Notify assigned user (if not the one who created it)
    if (assignedTo !== req.user!.id) {
      await createNotification({
        recipient: assignedTo,
        title: 'New Lead Assigned',
        message: `You have been assigned a new lead: ${name}`,
        type: 'lead_new',
        relatedId: lead._id.toString(),
      });
    }

    const populatedLead = await Lead.findById(lead._id).populate('assignedTo', 'name email');

    logger.info('Lead created', { leadId: lead._id, name: lead.name });

    res.status(201).json({
      id: populatedLead!._id.toString(),
      name: populatedLead!.name,
      phone: populatedLead!.phone,
      email: populatedLead!.email,
      source: populatedLead!.source,
      status: populatedLead!.status,
      assignedTo: populatedLead!.assignedTo._id.toString(),
      assignedToName: (populatedLead!.assignedTo as any).name,
      leadType: populatedLead!.leadType,
      companyName: populatedLead!.companyName,
      productInterest: populatedLead!.productInterest,
      priority: populatedLead!.priority,
      initialNotes: populatedLead!.initialNotes,
      customFields: populatedLead!.customFields ? Object.fromEntries(populatedLead!.customFields.entries()) : {},
      createdAt: populatedLead!.createdAt.toISOString(),
      updatedAt: populatedLead!.updatedAt.toISOString(),
    });
  } catch (error: any) {
    logger.error('Create lead error:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

// Update lead
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const {
      name, phone, email, source, status, assignedTo,
      leadType, companyName, productInterest, priority,
      initialNotes, customFields
    } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Track status change
    const statusChanged = status && status !== lead.status;
    const oldStatus = lead.status;

    // Update lead
    if (name) lead.name = name;
    if (phone) lead.phone = phone;
    if (email !== undefined) lead.email = email;
    if (source) lead.source = source;
    if (status) lead.status = status;
    if (assignedTo) lead.assignedTo = assignedTo;
    if (leadType) lead.leadType = leadType;
    if (companyName !== undefined) lead.companyName = companyName;
    if (productInterest !== undefined) lead.productInterest = productInterest;
    if (priority) lead.priority = priority;
    if (initialNotes !== undefined) lead.initialNotes = initialNotes;
    if (customFields) lead.customFields = new Map(Object.entries(customFields));

    await lead.save();

    // Create activity
    if (statusChanged) {
      await Activity.create({
        leadId: lead._id,
        userId: req.user!.id,
        action: 'status_changed',
        details: `Status changed from ${oldStatus} to ${status}`,
      });
    } else {
      await Activity.create({
        leadId: lead._id,
        userId: req.user!.id,
        action: 'updated',
        details: 'Lead information updated',
      });
    }

    const populatedLead = await Lead.findById(lead._id).populate('assignedTo', 'name email');

    logger.info('Lead updated', { leadId: lead._id });

    res.json({
      id: populatedLead!._id.toString(),
      name: populatedLead!.name,
      phone: populatedLead!.phone,
      email: populatedLead!.email,
      source: populatedLead!.source,
      status: populatedLead!.status,
      assignedTo: populatedLead!.assignedTo._id.toString(),
      assignedToName: (populatedLead!.assignedTo as any).name,
      leadType: populatedLead!.leadType,
      companyName: populatedLead!.companyName,
      productInterest: populatedLead!.productInterest,
      priority: populatedLead!.priority,
      initialNotes: populatedLead!.initialNotes,
      customFields: populatedLead!.customFields ? Object.fromEntries(populatedLead!.customFields.entries()) : {},
      createdAt: populatedLead!.createdAt.toISOString(),
      updatedAt: populatedLead!.updatedAt.toISOString(),
    });
  } catch (error: any) {
    logger.error('Update lead error:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// Delete lead
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Delete associated data
    await Note.deleteMany({ leadId: lead._id });
    await Activity.deleteMany({ leadId: lead._id });
    await FollowUp.deleteMany({ leadId: lead._id });

    logger.info('Lead deleted', { leadId: lead._id });

    res.json({ message: 'Lead deleted successfully' });
  } catch (error: any) {
    logger.error('Delete lead error:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

// Bulk import leads
router.post('/bulk-import', async (req: AuthRequest, res) => {
  try {
    const { leads } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ error: 'Invalid leads data' });
    }

    const createdLeadsCount = 0;
    const results = [];

    for (const data of leads) {
      try {
        const lead = await Lead.create({
          name: data.name,
          phone: data.phone,
          email: data.email,
          source: data.source,
          status: data.status,
          assignedTo: data.assignedTo,
          leadType: data.leadType || 'individual',
          companyName: data.companyName,
          productInterest: data.productInterest,
          priority: data.priority || 'medium',
          initialNotes: data.initialNotes,
          customFields: data.customFields || {},
        });

        await Activity.create({
          leadId: lead._id,
          userId: req.user!.id,
          action: 'created',
          details: 'Lead imported via Excel',
        });

        results.push(lead);
      } catch (error) {
        logger.error('Failed to import lead:', { data, error });
      }
    }

    logger.info('Bulk import completed', { count: results.length });

    res.json({
      message: `Successfully imported ${results.length} leads`,
      count: results.length,
    });
  } catch (error: any) {
    logger.error('Bulk import error:', error);
    res.status(500).json({ error: 'Failed to import leads' });
  }
});

export default router;

