import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, updateConfigFromEncrypted } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Load encrypted configuration
updateConfigFromEncrypted();

const MONGODB_URI = config.mongodb.uri || process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = config.mongodb.databaseName || process.env.DATABASE_NAME || 'leadsflow';

async function showDatabaseInfo() {
  try {
    console.log('\n📊 Database Connection Information\n');
    console.log('MongoDB URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password
    console.log('Database Name:', DATABASE_NAME);
    
    console.log('\nConnecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      dbName: DATABASE_NAME,
    });
    
    console.log('✅ Connected to MongoDB\n');
    
    // Get database info
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('📁 Collections in database:');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  - ${collection.name}: ${count} documents`);
    }
    
    console.log('\n✅ Database info retrieved successfully\n');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

showDatabaseInfo();

