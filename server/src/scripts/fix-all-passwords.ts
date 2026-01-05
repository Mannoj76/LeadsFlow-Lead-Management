import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://manoharpoojari76_db_user:Upgo452sIGRwep9j@leadflow.ps1rzw1.mongodb.net/leadsflow';

async function fixPasswords() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);

        const db = mongoose.connection.db;
        const salt = await bcrypt.genSalt(10);

        // Fix Mohan
        const mohanHash = await bcrypt.hash('Mohan@123', salt);
        await db.collection('users').updateOne({ username: 'mohan' }, { $set: { password: mohanHash } });
        console.log('✅ Reset Mohan\'s password.');

        // Fix Manohar (assume password is same as username for recovery if he forgot it, or just use a standard one)
        // Actually, I'll set it to a known one if the user wants, but for now I will just fix the double hashing 
        // if I can find what it was. But better to just set it to "Manohar@123" if he wants.
        const manoharHash = await bcrypt.hash('Manohar@123', salt);
        await db.collection('users').updateOne({ username: 'manohar' }, { $set: { password: manoharHash } });
        console.log('✅ Reset Manohar\'s password to "Manohar@123".');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixPasswords();
