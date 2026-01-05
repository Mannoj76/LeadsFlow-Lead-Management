import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { User } from '../models/User.js';

// Load environment variables
dotenv.config();

async function checkUsers() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        const DATABASE_NAME = process.env.DATABASE_NAME || 'leadsflow';

        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            dbName: DATABASE_NAME,
        });

        console.log('Connected to MongoDB');
        console.log('URI:', MONGODB_URI);
        console.log('Database:', DATABASE_NAME);
        console.log('---');

        // Get all users
        const users = await User.find().select('-password');

        console.log(`Total users in database: ${users.length}`);
        console.log('---');

        users.forEach((user, index) => {
            console.log(`User ${index + 1}:`);
            console.log(`  ID: ${user._id}`);
            console.log(`  Username: ${user.username}`);
            console.log(`  Name: ${user.name}`);
            console.log(`  Email: ${user.email || 'N/A'}`);
            console.log(`  Role: ${user.role}`);
            console.log(`  Active: ${user.isActive}`);
            console.log(`  Created: ${user.createdAt}`);
            console.log('---');
        });

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUsers();
