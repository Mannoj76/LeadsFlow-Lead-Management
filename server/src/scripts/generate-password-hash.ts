/**
 * Password Hash Generator
 * 
 * Generates a bcrypt hash for a password using the same settings as the User model.
 * Useful for manual password updates in MongoDB.
 * 
 * Usage:
 *   npx tsx src/scripts/generate-password-hash.ts <password>
 *   npx tsx src/scripts/generate-password-hash.ts MyNewPassword123
 */

import bcrypt from 'bcryptjs';

async function generateHash(password: string) {
  try {
    console.log('\n🔐 Password Hash Generator\n');
    
    if (!password) {
      console.error('❌ Error: Password is required\n');
      console.log('Usage:');
      console.log('  npx tsx src/scripts/generate-password-hash.ts <password>\n');
      console.log('Example:');
      console.log('  npx tsx src/scripts/generate-password-hash.ts MyNewPassword123\n');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ Error: Password must be at least 6 characters long\n');
      process.exit(1);
    }

    console.log(`Password: ${password}`);
    console.log('Generating bcrypt hash (salt rounds: 10)...\n');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    console.log('✅ Hash generated successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Copy this hash:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(hash);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 To update password in MongoDB:\n');
    console.log('Option 1: Using MongoDB Compass');
    console.log('  1. Open MongoDB Compass');
    console.log('  2. Connect to mongodb://localhost:27017');
    console.log('  3. Database: leadsflow → Collection: users');
    console.log('  4. Find your user document');
    console.log('  5. Edit the "password" field');
    console.log('  6. Paste the hash above');
    console.log('  7. Save\n');

    console.log('Option 2: Using MongoDB Shell (mongosh)');
    console.log('  mongosh');
    console.log('  use leadsflow');
    console.log(`  db.users.updateOne(`);
    console.log(`    { email: "your-email@example.com" },`);
    console.log(`    { $set: { password: "${hash}" } }`);
    console.log(`  )\n`);

    console.log('💡 Tip: Use the reset-password.ts script for easier password reset:');
    console.log('   npx tsx src/scripts/reset-password.ts your-email@example.com NewPassword123\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Get password from command line arguments
const password = process.argv[2];
generateHash(password);

