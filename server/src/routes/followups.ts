import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { FollowUp } from '../models/FollowUp.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import { createNotification } from '../utils/notificationHelper.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all follow-ups
router.get('/', async (req: AuthRequest, res) => {
  try {
    const followUps = await FollowUp.find()
      .populate('leadId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 });

    const transformedFollowUps = followUps.map(followUp => ({
      id: followUp._id.toString(),
      leadId: followUp.leadId._id.toString(),
      leadName: (followUp.leadId as any).name,
      followUpType: 'call', // Default type, should be stored in model
      dueDate: followUp.dueDate.toISOString().split('T')[0],
      dueTime: followUp.dueTime,
      assignedTo: followUp.assignedTo._id.toString(),
      assignedToName: (followUp.assignedTo as any).name,
      status: followUp.isCompleted ? 'completed' : 'scheduled',
      notes: followUp.notes,
      priority: 'medium', // Default priority
      createdBy: followUp.userId.toString(),
      createdByName: (followUp.assignedTo as any).name, // Should populate userId
      createdAt: followUp.createdAt.toISOString(),
      completedDate: followUp.completedAt?.toISOString(),
    }));

    res.json(transformedFollowUps);
  } catch (error: any) {
    logger.error('Get follow-ups error:', error);
    res.status(500).json({ error: 'Failed to fetch follow-ups' });
  }
});

// Get follow-ups by lead ID
router.get('/lead/:leadId', async (req: AuthRequest, res) => {
  try {
    const followUps = await FollowUp.find({ leadId: req.params.leadId })
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 });

    const transformedFollowUps = followUps.map(followUp => ({
      id: followUp._id.toString(),
      leadId: followUp.leadId.toString(),
      leadName: '', // Would need to populate lead
      followUpType: 'call',
      dueDate: followUp.dueDate.toISOString().split('T')[0],
      dueTime: followUp.dueTime,
      assignedTo: followUp.assignedTo._id.toString(),
      assignedToName: (followUp.assignedTo as any).name,
      status: followUp.isCompleted ? 'completed' : 'scheduled',
      notes: followUp.notes,
      priority: 'medium',
      createdBy: followUp.userId.toString(),
      createdByName: (followUp.assignedTo as any).name,
      createdAt: followUp.createdAt.toISOString(),
      completedDate: followUp.completedAt?.toISOString(),
    }));

    res.json(transformedFollowUps);
  } catch (error: any) {
    logger.error('Get follow-ups by lead error:', error);
    res.status(500).json({ error: 'Failed to fetch follow-ups' });
  }
});

// Create follow-up
router.post('/', [
  body('leadId').notEmpty().withMessage('Lead ID is required'),
  body('assignedTo').notEmpty().withMessage('Assigned user is required'),
  body('dueDate').notEmpty().withMessage('Due date is required'),
  body('dueTime').notEmpty().withMessage('Due time is required'),
], async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { leadId, assignedTo, dueDate, dueTime, notes } = req.body;

    const followUp = await FollowUp.create({
      leadId,
      userId: req.user!.id,
      assignedTo,
      dueDate: new Date(dueDate),
      dueTime,
      notes: notes || '',
      isCompleted: false,
    });

    // Notify assigned user (if not the one who created it)
    if (assignedTo !== req.user!.id) {
      await createNotification({
        recipient: assignedTo,
        title: 'New Follow-up Scheduled',
        message: `A follow-up has been scheduled for you on ${dueDate} at ${dueTime}`,
        type: 'followup_upcoming',
        relatedId: followUp._id.toString(),
      });
    }

    const populatedFollowUp = await FollowUp.findById(followUp._id)
      .populate('leadId', 'name email')
      .populate('assignedTo', 'name email');

    logger.info('Follow-up created', { followUpId: followUp._id, leadId });

    res.status(201).json({
      id: populatedFollowUp!._id.toString(),
      leadId: populatedFollowUp!.leadId._id.toString(),
      leadName: (populatedFollowUp!.leadId as any).name,
      followUpType: 'call',
      dueDate: populatedFollowUp!.dueDate.toISOString().split('T')[0],
      dueTime: populatedFollowUp!.dueTime,
      assignedTo: populatedFollowUp!.assignedTo._id.toString(),
      assignedToName: (populatedFollowUp!.assignedTo as any).name,
      status: populatedFollowUp!.isCompleted ? 'completed' : 'scheduled',
      notes: populatedFollowUp!.notes,
      priority: 'medium',
      createdBy: populatedFollowUp!.userId.toString(),
      createdByName: (populatedFollowUp!.assignedTo as any).name,
      createdAt: populatedFollowUp!.createdAt.toISOString(),
      completedDate: populatedFollowUp!.completedAt?.toISOString(),
    });
  } catch (error: any) {
    logger.error('Create follow-up error:', error);
    res.status(500).json({ error: 'Failed to create follow-up' });
  }
});

// Update follow-up
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { dueDate, dueTime, notes, status, completedDate } = req.body;

    const followUp = await FollowUp.findById(req.params.id);
    if (!followUp) {
      return res.status(404).json({ error: 'Follow-up not found' });
    }

    if (dueDate) followUp.dueDate = new Date(dueDate);
    if (dueTime) followUp.dueTime = dueTime;
    if (notes !== undefined) followUp.notes = notes;
    if (status) {
      followUp.isCompleted = status === 'completed';
      if (status === 'completed') {
        followUp.completedAt = completedDate ? new Date(completedDate) : new Date();
      }
    }

    await followUp.save();

    const populatedFollowUp = await FollowUp.findById(followUp._id)
      .populate('leadId', 'name email')
      .populate('assignedTo', 'name email');

    logger.info('Follow-up updated', { followUpId: followUp._id });

    res.json({
      id: populatedFollowUp!._id.toString(),
      leadId: populatedFollowUp!.leadId._id.toString(),
      leadName: (populatedFollowUp!.leadId as any).name,
      followUpType: 'call',
      dueDate: populatedFollowUp!.dueDate.toISOString().split('T')[0],
      dueTime: populatedFollowUp!.dueTime,
      assignedTo: populatedFollowUp!.assignedTo._id.toString(),
      assignedToName: (populatedFollowUp!.assignedTo as any).name,
      status: populatedFollowUp!.isCompleted ? 'completed' : 'scheduled',
      notes: populatedFollowUp!.notes,
      priority: 'medium',
      createdBy: populatedFollowUp!.userId.toString(),
      createdByName: (populatedFollowUp!.assignedTo as any).name,
      createdAt: populatedFollowUp!.createdAt.toISOString(),
      completedDate: populatedFollowUp!.completedAt?.toISOString(),
    });
  } catch (error: any) {
    logger.error('Update follow-up error:', error);
    res.status(500).json({ error: 'Failed to update follow-up' });
  }
});

export default router;

