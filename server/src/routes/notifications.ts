import express from 'express';
import { Notification } from '../models/Notification.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all notifications for current user
router.get('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user!.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error: any) {
        logger.error('Failed to fetch notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user!.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json(notification);
    } catch (error: any) {
        logger.error('Failed to mark notification as read:', error);
        res.status(500).json({ error: 'Failed to mark as read' });
    }
});

// Mark all as read
router.patch('/read-all', authenticate, async (req: AuthRequest, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user!.id, isRead: false },
            { isRead: true }
        );
        res.json({ success: true });
    } catch (error: any) {
        logger.error('Failed to mark all as read:', error);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
});

// Delete a notification
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const result = await Notification.deleteOne({
            _id: req.params.id,
            recipient: req.user!.id
        });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json({ success: true });
    } catch (error: any) {
        logger.error('Failed to delete notification:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

export default router;
