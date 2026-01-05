import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://manoharpoojari76_db_user:Upgo452sIGRwep9j@leadflow.ps1rzw1.mongodb.net/leadsflow';

async function fixMohanPassword() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);

        const db = mongoose.connection.db;

        // We compute the bcrypt hash for "Mohan@123"
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Mohan@123', salt);

        console.log('Resetting password for user "mohan"...');
        const result = await db.collection('users').updateOne(
            { username: 'mohan' },
            { $set: { password: hashedPassword } }
        );

        if (result.matchedCount > 0) {
            console.log('✅ Successfully reset Mohan\'s password to "Mohan@123" (properly hashed).');
        } else {
            console.log('❌ User "mohan" not found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixMohanPassword();
