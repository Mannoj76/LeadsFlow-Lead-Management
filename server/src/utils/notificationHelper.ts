import { Notification } from '../models/Notification.js';
import { logger } from './logger.js';
import mongoose from 'mongoose';

export const createNotification = async (data: {
    recipient: string | mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: 'lead_new' | 'followup_upcoming' | 'followup_missed' | 'system';
    relatedId?: string;
}) => {
    try {
        const notification = new Notification(data);
        await notification.save();
        return notification;
    } catch (error) {
        logger.error('Failed to create notification:', error);
        return null;
    }
};
