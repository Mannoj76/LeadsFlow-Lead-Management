import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, updateConfigFromEncrypted } from '../config/index.js';
import { User } from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Load encrypted configuration
updateConfigFromEncrypted();

const MONGODB_URI = config.mongodb.uri || process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = config.mongodb.databaseName || process.env.DATABASE_NAME || 'leadsflow';

async function diagnoseUserPersistence() {
  try {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔍 DIAGNOSING USER PERSISTENCE ISSUE');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Step 1: Show connection details
    console.log('📋 STEP 1: MongoDB Connection Configuration');
    console.log('─────────────────────────────────────────────────────────');
    const sanitizedUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log('Connection URI:', sanitizedUri);
    console.log('Database Name:', DATABASE_NAME);
    console.log('');
    
    // Determine connection type
    if (MONGODB_URI.includes('mongodb+srv://')) {
      console.log('✅ Connection Type: MongoDB Atlas (Cloud)');
      const clusterMatch = MONGODB_URI.match(/@([^/]+)/);
      if (clusterMatch) {
        console.log('✅ Cluster:', clusterMatch[1]);
      }
    } else if (MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1')) {
      console.log('⚠️  Connection Type: Local MongoDB');
      console.log('⚠️  WARNING: Backend is using LOCAL MongoDB, not Atlas!');
    } else {
      console.log('Connection Type:', MONGODB_URI.split('@')[1]?.split('/')[0] || 'Unknown');
    }
    console.log('');
    
    // Step 2: Connect to MongoDB
    console.log('📋 STEP 2: Connecting to MongoDB');
    console.log('─────────────────────────────────────────────────────────');
    await mongoose.connect(MONGODB_URI, {
      dbName: DATABASE_NAME,
    });
    console.log('✅ Successfully connected to MongoDB');
    console.log('');
    
    // Step 3: Count users
    console.log('📋 STEP 3: Counting Users in Database');
    console.log('─────────────────────────────────────────────────────────');
    const totalUsers = await User.countDocuments();
    console.log(`Total users in database: ${totalUsers}`);
    console.log('');
    
    // Step 4: List all users
    console.log('📋 STEP 4: Listing All Users in Database');
    console.log('─────────────────────────────────────────────────────────');
    const allUsers = await User.find().sort({ createdAt: 1 });
    
    if (allUsers.length === 0) {
      console.log('❌ NO USERS FOUND IN DATABASE!');
      console.log('   This means the database is empty.');
    } else {
      allUsers.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log('  _id:', user._id.toString());
        console.log('  username:', user.username);
        console.log('  name:', user.name);
        console.log('  email:', user.email);
        console.log('  role:', user.role);
        console.log('  isActive:', user.isActive);
        console.log('  createdAt:', user.createdAt.toISOString());
        console.log('  updatedAt:', user.updatedAt.toISOString());
      });
    }
    console.log('');
    
    // Step 5: Check database collections
    console.log('📋 STEP 5: Checking All Collections in Database');
    console.log('─────────────────────────────────────────────────────────');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`  - ${collection.name}: ${count} documents`);
    }
    console.log('');
    
    // Step 6: Summary and recommendations
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 DIAGNOSIS SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('Backend Configuration:');
    console.log('  ✓ MongoDB URI:', sanitizedUri);
    console.log('  ✓ Database:', DATABASE_NAME);
    console.log('  ✓ Users Collection:', totalUsers, 'documents');
    console.log('');
    
    console.log('MongoDB Compass Connection String:');
    console.log('─────────────────────────────────────────────────────────');
    console.log('Use this EXACT connection string in MongoDB Compass:');
    console.log('');
    console.log(sanitizedUri.replace('****', '<YOUR_PASSWORD>'));
    console.log('');
    console.log('Replace <YOUR_PASSWORD> with your actual MongoDB password');
    console.log('');
    
    console.log('What to Check in MongoDB Compass:');
    console.log('─────────────────────────────────────────────────────────');
    console.log('1. Connection URI should match the one above');
    console.log('2. Database name should be:', DATABASE_NAME);
    console.log('3. Users collection should have:', totalUsers, 'documents');
    console.log('4. Click REFRESH button in Compass to reload data');
    console.log('');
    
    if (MONGODB_URI.includes('localhost')) {
      console.log('⚠️  CRITICAL WARNING:');
      console.log('─────────────────────────────────────────────────────────');
      console.log('Your backend is connected to LOCAL MongoDB, not Atlas!');
      console.log('This means:');
      console.log('  - Data is stored on your local machine');
      console.log('  - MongoDB Compass must connect to: mongodb://localhost:27017');
      console.log('  - NOT to MongoDB Atlas cloud');
      console.log('');
    }
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

diagnoseUserPersistence();

