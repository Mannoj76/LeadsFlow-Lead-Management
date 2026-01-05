/**
 * Migration Script: Add username field to existing users
 * 
 * This script adds a username field to all existing users in the database.
 * For users with email, it uses the email prefix as username.
 * For users without email, it generates a username from their name.
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

// User schema (simplified for migration)
const UserSchema = new mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function migrateUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      dbName: DATABASE_NAME,
    });
    console.log('Connected to MongoDB');

    // Find all users without username
    const usersWithoutUsername = await User.find({ username: { $exists: false } });
    console.log(`Found ${usersWithoutUsername.length} users without username`);

    if (usersWithoutUsername.length === 0) {
      console.log('No users need migration');
      await mongoose.disconnect();
      return;
    }

    let updated = 0;
    const usedUsernames = new Set<string>();

    for (const user of usersWithoutUsername) {
      let username: string;

      // Generate username from email if available
      if (user.email) {
        username = user.email.split('@')[0].toLowerCase();
      } else {
        // Generate username from name
        username = user.name
          .toLowerCase()
          .replace(/\s+/g, '.')
          .replace(/[^a-z0-9.]/g, '');
      }

      // Ensure username is unique
      let finalUsername = username;
      let counter = 1;
      while (usedUsernames.has(finalUsername)) {
        finalUsername = `${username}${counter}`;
        counter++;
      }

      // Check if username already exists in database
      const existingUser = await User.findOne({ username: finalUsername });
      if (existingUser) {
        // Add counter to make it unique
        while (await User.findOne({ username: `${username}${counter}` })) {
          counter++;
        }
        finalUsername = `${username}${counter}`;
      }

      usedUsernames.add(finalUsername);

      // Update user
      await User.updateOne(
        { _id: user._id },
        { $set: { username: finalUsername } }
      );

      console.log(`Updated user: ${user.name} -> username: ${finalUsername}`);
      updated++;
    }

    console.log(`\nMigration complete! Updated ${updated} users.`);
    console.log('\nPlease verify the usernames and update them if needed.');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateUsers();

