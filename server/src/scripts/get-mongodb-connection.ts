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

console.log('\n🔗 MongoDB Connection Information for MongoDB Compass\n');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('📋 Connection String (with password hidden):');
console.log(MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));
console.log('');

console.log('📋 Database Name:');
console.log(DATABASE_NAME);
console.log('');

console.log('═══════════════════════════════════════════════════════════════\n');

console.log('📝 Instructions for MongoDB Compass:\n');
console.log('1. Open MongoDB Compass');
console.log('2. Click "New Connection"');
console.log('3. Paste the connection string above (replace **** with your password)');
console.log('4. Click "Connect"');
console.log('5. Navigate to database:', DATABASE_NAME);
console.log('6. Open "users" collection');
console.log('7. You should see all users including Manohar Poojari\n');

console.log('═══════════════════════════════════════════════════════════════\n');

console.log('🔐 If you don\'t know your MongoDB Atlas password:\n');
console.log('1. Go to: https://cloud.mongodb.com/');
console.log('2. Login to your account');
console.log('3. Click "Database Access" in left sidebar');
console.log('4. Find your user and click "Edit"');
console.log('5. Click "Edit Password" to set a new password\n');

console.log('═══════════════════════════════════════════════════════════════\n');

