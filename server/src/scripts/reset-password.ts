/**
 * Password Reset Script for LeadsFlow CRM
 * 
 * This script allows you to reset a user's password securely.
 * It uses the same bcrypt hashing method as the User model.
 * 
 * Usage:
 *   npx tsx src/scripts/reset-password.ts <email> <new-password>
 *   npx tsx src/scripts/reset-password.ts sujeet.karn@erpca.com MyNewPassword123
 * 
 * Or run interactively:
 *   npx tsx src/scripts/reset-password.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as readline from 'readline';
import { config, updateConfigFromEncrypted } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Load encrypted configuration (for MongoDB Atlas connection)
updateConfigFromEncrypted();

const MONGODB_URI = config.mongodb.uri || process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = config.mongodb.databaseName || process.env.DATABASE_NAME || 'leadsflow';

// User schema interface
interface IUser {
  _id: any;
  username: string;
  name: string;
  email?: string;
  password: string;
  role: string;
  isActive: boolean;
}

// Create readline interface for interactive input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetPassword(emailOrUsername: string, newPassword: string) {
  try {
    console.log('\n🔐 LeadsFlow CRM - Password Reset Tool\n');
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      dbName: DATABASE_NAME,
    });
    
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find user by email or username
    console.log(`🔍 Searching for user: ${emailOrUsername}`);
    const user = await usersCollection.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() }
      ]
    }) as IUser | null;

    if (!user) {
      console.error(`❌ Error: User not found with email/username: ${emailOrUsername}`);
      console.log('\n💡 Tip: Check available users by running:');
      console.log('   npx tsx src/scripts/check-users.ts\n');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.name} (${user.email || user.username})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Username: ${user.username}\n`);

    // Validate new password
    if (newPassword.length < 6) {
      console.error('❌ Error: Password must be at least 6 characters long\n');
      await mongoose.disconnect();
      process.exit(1);
    }

    // Hash the new password using bcrypt (same as User model)
    console.log('🔒 Hashing new password with bcrypt (salt rounds: 10)...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password
    console.log('💾 Updating password in database...');
    const result = await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );

    if (result.modifiedCount === 1) {
      console.log('✅ Password updated successfully!\n');
      console.log('📋 Login Credentials:');
      console.log(`   Email/Username: ${user.email || user.username}`);
      console.log(`   Password: ${newPassword}`);
      console.log('\n🌐 You can now login at: http://localhost:3000\n');
    } else {
      console.error('❌ Error: Failed to update password\n');
      await mongoose.disconnect();
      process.exit(1);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

async function interactiveMode() {
  try {
    console.log('\n🔐 LeadsFlow CRM - Interactive Password Reset\n');
    
    const emailOrUsername = await question('Enter user email or username: ');
    const newPassword = await question('Enter new password (min 6 characters): ');
    const confirm = await question(`\nReset password for "${emailOrUsername}"? (yes/no): `);
    
    rl.close();
    
    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('\n❌ Password reset cancelled\n');
      process.exit(0);
    }
    
    await resetPassword(emailOrUsername, newPassword);
    
  } catch (error) {
    rl.close();
    throw error;
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  // Interactive mode
  interactiveMode();
} else if (args.length === 2) {
  // Command line mode
  const [emailOrUsername, newPassword] = args;
  resetPassword(emailOrUsername, newPassword).then(() => {
    process.exit(0);
  });
} else {
  console.log('\n🔐 LeadsFlow CRM - Password Reset Tool\n');
  console.log('Usage:');
  console.log('  Interactive mode:');
  console.log('    npx tsx src/scripts/reset-password.ts\n');
  console.log('  Command line mode:');
  console.log('    npx tsx src/scripts/reset-password.ts <email-or-username> <new-password>\n');
  console.log('Examples:');
  console.log('    npx tsx src/scripts/reset-password.ts sujeet.karn@erpca.com MyNewPass123');
  console.log('    npx tsx src/scripts/reset-password.ts admin NewAdminPass456\n');
  process.exit(1);
}

