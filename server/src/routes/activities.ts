import express from 'express';
import { Activity } from '../models/Activity.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get activities by lead ID
router.get('/lead/:leadId', async (req: AuthRequest, res) => {
  try {
    const activities = await Activity.find({ leadId: req.params.leadId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const transformedActivities = activities.map(activity => ({
      id: activity._id.toString(),
      leadId: activity.leadId.toString(),
      userId: activity.userId._id.toString(),
      userName: (activity.userId as any).name,
      action: activity.action,
      details: activity.details,
      createdAt: activity.createdAt.toISOString(),
    }));

    res.json(transformedActivities);
  } catch (error: any) {
    logger.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

export default router;

