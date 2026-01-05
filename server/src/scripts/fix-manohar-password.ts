import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Configuration (manually extracted from decrypted config)
const MONGODB_URI = 'mongodb+srv://manoharpoojari76_db_user:Upgo452sIGRwep9j@leadflow.ps1rzw1.mongodb.net/';
const DATABASE_NAME = 'leadsflow';

async function resetPassword() {
    try {
        await mongoose.connect(MONGODB_URI, {
            dbName: DATABASE_NAME,
        });

        console.log('Connected to Cloud MongoDB');

        // Define User Schema locally
        const UserSchema = new mongoose.Schema({
            username: String,
            password: { type: String, select: true },
            isActive: Boolean
        });

        const User = mongoose.model('User', UserSchema);

        const username = 'manohar';
        const newPassword = 'Manohar@123';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const result = await User.updateOne(
            { username: username.toLowerCase() },
            { $set: { password: hashedPassword, isActive: true } }
        );

        if (result.matchedCount === 0) {
            console.log(`User '${username}' not found.`);
        } else {
            console.log(`Successfully reset password for user '${username}' to '${newPassword}'.`);
            console.log(`Update result:`, result);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

resetPassword();
