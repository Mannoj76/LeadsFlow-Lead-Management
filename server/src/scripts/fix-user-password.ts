import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'leadsflow';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'sales'], default: 'sales' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'users' });

async function checkAndFixUsers() {
  try {
    console.log('\n🔍 Checking MongoDB Users...\n');
    
    await mongoose.connect(MONGODB_URI, {
      dbName: DATABASE_NAME,
    });
    
    const User = mongoose.model('User', UserSchema, 'users');
    
    // Get all users
    const users = await User.find().select('-password');
    
    console.log(`Found ${users.length} user(s):\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt}\n`);
    });

    // Update password for sujeet.karn
    console.log('\n🔐 Updating password for sujeet.karn...');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const updated = await User.updateOne(
      { username: 'sujeet.karn' },
      { password: hashedPassword }
    );
    
    if (updated.modifiedCount > 0) {
      console.log('✅ Password updated successfully!');
    } else {
      console.log('⚠️  User not found or password not changed');
    }
    
    // Activate user
    await User.updateOne(
      { username: 'sujeet.karn' },
      { isActive: true }
    );
    
    console.log('✅ User activated!\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAndFixUsers();
