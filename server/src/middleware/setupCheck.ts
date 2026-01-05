import { Request, Response, NextFunction } from 'express';
import { isSetupRequired } from '../config/index.js';

// Middleware to check if setup is required
export const checkSetup = (req: Request, res: Response, next: NextFunction) => {
  // Allow setup routes to pass through
  if (req.path.startsWith('/api/setup')) {
    return next();
  }

  // Check if setup is required
  if (isSetupRequired()) {
    return res.status(503).json({
      error: 'Setup required',
      message: 'Please complete the initial setup before using the application',
      setupRequired: true,
    });
  }

  next();
};

