import mongoose from 'mongoose';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export async function connectDatabase(): Promise<boolean> {
  if (isConnected) {
    logger.info('Using existing database connection');
    return true;
  }

  if (!config.mongodb.uri) {
    logger.error('MongoDB URI is not configured');
    return false;
  }

  let retryCount = 0;
  const maxRetries = 5;

  while (retryCount < maxRetries) {
    try {
      const options = {
        dbName: config.mongodb.databaseName,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      await mongoose.connect(config.mongodb.uri, options);
      isConnected = true;
      logger.info(`Connected to MongoDB database: ${config.mongodb.databaseName}`);

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
        isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected. Attempting to reconnect...');
        isConnected = false;
      });

      return true;
    } catch (error: any) {
      retryCount++;
      logger.error(`Failed to connect to MongoDB (Attempt ${retryCount}/${maxRetries}):`, error.message);
      if (retryCount < maxRetries) {
        logger.info('Retrying in 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  logger.error('All database connection attempts failed');
  return false;
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
  }
}

export function getDatabaseConnection() {
  return mongoose.connection;
}

export function isDatabaseConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

// Test database connection
export async function testDatabaseConnection(uri: string, dbName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const testConnection = await mongoose.createConnection(uri, {
      dbName,
      serverSelectionTimeoutMS: 5000,
    }).asPromise();

    await testConnection.close();
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to connect to database'
    };
  }
}

