import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config, isSetupRequired } from './config/index.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { checkSetup } from './middleware/setupCheck.js';

// Import routes
import setupRoutes from './routes/setup.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import leadRoutes from './routes/leads.js';
import noteRoutes from './routes/notes.js';
import activityRoutes from './routes/activities.js';
import followUpRoutes from './routes/followups.js';
import configRoutes from './routes/config.js';
import dashboardRoutes from './routes/dashboard.js';
import authConfigRoutes from './routes/authConfig.js';
import notificationRoutes from './routes/notifications.js';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development flexibility
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://192.168.1.107:3000'],
  credentials: true,
}));

// Rate limiting (Increased for CRM usage)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased from 100 to 1000 for smoother CRM experience
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    setupRequired: isSetupRequired(),
  });
});

// Setup routes (always accessible)
app.use('/api/setup', setupRoutes);

// Setup check middleware (blocks other routes if setup is required)
app.use(checkSetup);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/followups', followUpRoutes);
app.use('/api/config', configRoutes);
app.use('/api/config', authConfigRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Check if setup is required
    if (isSetupRequired()) {
      logger.warn('Setup is required. Please complete the setup wizard.');
      logger.info(`Server starting on port ${config.port} (Setup mode)`);
    } else {
      // Connect to database
      const connected = await connectDatabase();
      if (!connected) {
        logger.error('Failed to connect to database. Please check your configuration.');
        process.exit(1);
      }
      logger.info('Database connected successfully');
    }

    // Start listening
    app.listen(config.port, () => {
      logger.info(`LeadsFlow CRM Server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Setup required: ${isSetupRequired()}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start the server
startServer();

