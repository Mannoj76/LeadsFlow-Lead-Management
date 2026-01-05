import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = 'mongodb+srv://manoharpoojari76_db_user:Upgo452sIGRwep9j@leadflow.ps1rzw1.mongodb.net/leadsflow';

async function checkUserMohan() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully.');

        const UserSchema = new mongoose.Schema({
            username: String,
            name: String,
            email: String,
            role: String,
            isActive: Boolean,
            phone: String,
        }, { strict: false });

        const User = mongoose.model('User', UserSchema);

        console.log('Searching for user "mohan"...');
        const users = await User.find({
            $or: [
                { username: /mohan/i },
                { name: /mohan/i }
            ]
        });

        if (users.length > 0) {
            console.log(`Found ${users.length} matching user(s):`);
            users.forEach(u => {
                console.log('-------------------');
                console.log(`ID: ${u._id}`);
                console.log(`Username: ${u.username}`);
                console.log(`Name: ${u.name}`);
                console.log(`Email: ${u.email}`);
                console.log(`Phone: ${u.phone}`);
                console.log(`Role: ${u.role}`);
                console.log(`Active: ${u.isActive}`);
            });
        } else {
            console.log('No user found matching "mohan".');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

checkUserMohan();
