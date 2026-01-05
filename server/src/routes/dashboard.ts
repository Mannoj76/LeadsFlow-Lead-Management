import express from 'express';
import { Lead } from '../models/Lead.js';
import { FollowUp } from '../models/FollowUp.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get dashboard statistics
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all leads
    const leads = await Lead.find().populate('assignedTo', 'name');

    // Get follow-ups
    const allFollowUps = await FollowUp.find();

    // Calculate statistics
    const totalLeads = leads.length;
    const activeLeads = leads.filter(l => l.status !== 'Closed Won' && l.status !== 'Closed Lost').length;
    const convertedLeads = leads.filter(l => l.status === 'Closed Won').length;

    // Today's follow-ups
    const todayFollowUps = allFollowUps.filter(f => {
      const dueDate = new Date(f.dueDate);
      return dueDate >= today && dueDate < tomorrow && !f.isCompleted;
    }).length;

    // Overdue follow-ups
    const overdueFollowUps = allFollowUps.filter(f => {
      const dueDate = new Date(f.dueDate);
      return dueDate < today && !f.isCompleted;
    }).length;

    // Leads by status
    const leadsByStatus: Record<string, number> = {};
    leads.forEach(lead => {
      leadsByStatus[lead.status] = (leadsByStatus[lead.status] || 0) + 1;
    });

    // Leads by source
    const leadsBySource: Record<string, number> = {};
    leads.forEach(lead => {
      leadsBySource[lead.source] = (leadsBySource[lead.source] || 0) + 1;
    });

    // Leads by user
    const leadsByUser: Record<string, number> = {};
    leads.forEach(lead => {
      const userName = (lead.assignedTo as any)?.name || 'Unassigned';
      leadsByUser[userName] = (leadsByUser[userName] || 0) + 1;
    });

    res.json({
      totalLeads,
      activeLeads,
      convertedLeads,
      todayFollowUps,
      overdueFollowUps,
      leadsByStatus,
      leadsBySource,
      leadsByUser,
    });
  } catch (error: any) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

export default router;

