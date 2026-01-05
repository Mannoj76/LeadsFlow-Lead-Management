/**
 * Quick script to check users in the database
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, updateConfigFromEncrypted } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Load encrypted configuration (for MongoDB Atlas connection)
updateConfigFromEncrypted();

const MONGODB_URI = config.mongodb.uri || process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = config.mongodb.databaseName || process.env.DATABASE_NAME || 'leadsflow';

async function checkUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      dbName: DATABASE_NAME,
    });
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();

    console.log(`Found ${users.length} users:\n`);

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  _id: ${user._id}`);
      console.log(`  username: ${user.username || 'NOT SET'}`);
      console.log(`  name: ${user.name}`);
      console.log(`  email: ${user.email || 'NOT SET'}`);
      console.log(`  role: ${user.role}`);
      console.log(`  isActive: ${user.isActive}`);
      console.log('');
    });

    // Check if any users are missing username
    const usersWithoutUsername = users.filter(u => !u.username);
    if (usersWithoutUsername.length > 0) {
      console.log(`⚠️  WARNING: ${usersWithoutUsername.length} users are missing username field!`);
      console.log('   Run migration script: npx tsx src/scripts/migrate-add-username.ts\n');
    } else {
      console.log('✅ All users have username field\n');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();

