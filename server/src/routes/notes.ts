import express from 'express';
import { body, validationResult } from 'express-validator';
import { Note } from '../models/Note.js';
import { User } from '../models/User.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get notes by lead ID
router.get('/lead/:leadId', async (req: AuthRequest, res) => {
  try {
    const notes = await Note.find({ leadId: req.params.leadId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const transformedNotes = notes.map(note => ({
      id: note._id.toString(),
      leadId: note.leadId.toString(),
      userId: note.userId._id.toString(),
      userName: (note.userId as any).name,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
    }));

    res.json(transformedNotes);
  } catch (error: any) {
    logger.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create note
router.post('/', [
  body('leadId').notEmpty().withMessage('Lead ID is required'),
  body('content').notEmpty().withMessage('Content is required'),
], async (req: AuthRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { leadId, content } = req.body;

    const note = await Note.create({
      leadId,
      userId: req.user!.id,
      content,
    });

    const populatedNote = await Note.findById(note._id).populate('userId', 'name email');

    logger.info('Note created', { noteId: note._id, leadId });

    res.status(201).json({
      id: populatedNote!._id.toString(),
      leadId: populatedNote!.leadId.toString(),
      userId: populatedNote!.userId._id.toString(),
      userName: (populatedNote!.userId as any).name,
      content: populatedNote!.content,
      createdAt: populatedNote!.createdAt.toISOString(),
    });
  } catch (error: any) {
    logger.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Delete note
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Only allow deletion by the creator or admin
    if (note.userId.toString() !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this note' });
    }

    await note.deleteOne();

    logger.info('Note deleted', { noteId: note._id });

    res.json({ message: 'Note deleted successfully' });
  } catch (error: any) {
    logger.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;

