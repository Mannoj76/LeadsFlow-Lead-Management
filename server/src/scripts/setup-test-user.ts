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
  username: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  email: { type: String, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'sales'], default: 'admin' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { collection: 'users' });

async function setupUser() {
  try {
    console.log('\n🔧 Setting up test user...\n');
    
    await mongoose.connect(MONGODB_URI, {
      dbName: DATABASE_NAME,
    });
    
    const User = mongoose.model('User', UserSchema, 'users');
    
    // List all users
    const allUsers = await User.find().select('-password');
    console.log('Current users in database:');
    allUsers.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.username} (${u.email || 'no email'})`);
    });
    console.log();
    
    // Create/Update user with username: sujeet.karn
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const result = await User.updateOne(
      { username: 'sujeet.karn' },
      {
        $set: {
          username: 'sujeet.karn',
          name: 'Sujeet Karn',
          email: 'sujeet.karn@erpca.com',
          password: hashedPassword,
          role: 'admin',
          isActive: true,
          updatedAt: new Date(),
        }
      },
      { upsert: true }
    );
    
    console.log('✅ User updated/created successfully!');
    console.log(`   Username: sujeet.karn`);
    console.log(`   Email: sujeet.karn@erpca.com`);
    console.log(`   Password: Admin@123`);
    console.log(`   Role: admin`);
    console.log(`   Active: true\n`);
    
    // Verify
    const user = await User.findOne({ username: 'sujeet.karn' }).select('-password');
    console.log('Verified user:', {
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupUser();
