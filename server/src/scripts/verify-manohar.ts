import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Configuration (manually extracted from decrypted config)
const MONGODB_URI = 'mongodb+srv://manoharpoojari76_db_user:Upgo452sIGRwep9j@leadflow.ps1rzw1.mongodb.net/';
const DATABASE_NAME = 'leadsflow';

async function checkUserCredentials() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DATABASE_NAME,
    });

    console.log('Connected to Cloud MongoDB');

    // Define User Schema locally to avoid import issues
    const UserSchema = new mongoose.Schema({
      username: String,
      email: String,
      password: { type: String, select: true },
      isActive: Boolean,
      name: String
    });

    const User = mongoose.model('User', UserSchema);

    const username = 'manohar';
    const testPassword = 'Manohar@123';

    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    });

    if (!user) {
      console.log(`User '${username}' not found in database.`);
    } else {
      console.log('User found:');
      console.log('  Name:', user.name);
      console.log('  Username:', user.username);
      console.log('  Email:', user.email);
      console.log('  Is Active:', user.isActive);

      const isMatch = await bcrypt.compare(testPassword, user.password as string);
      console.log(`  Password '${testPassword}' matches:`, isMatch);

      if (!isMatch) {
        console.log('  Password in DB (hash):', user.password);
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserCredentials();
