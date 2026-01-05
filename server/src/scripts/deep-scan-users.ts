import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://manoharpoojari76_db_user:Upgo452sIGRwep9j@leadflow.ps1rzw1.mongodb.net/leadsflow';

async function deepScan() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;

        console.log('--- ALL DOCUMENTS IN "users" ---');
        const users = await db.collection('users').find({}).toArray();

        users.forEach((u, i) => {
            console.log(`[${i + 1}] ID: ${u._id} | Username: ${u.username} | Name: ${u.name} | CreatedAt: ${u.createdAt}`);
        });

        console.log('\nScanning for any other collections that might contain users...');
        const collections = await db.listCollections().toArray();
        for (const col of collections) {
            if (col.name !== 'users') {
                const hasUser = await db.collection(col.name).findOne({ username: /mohan/i });
                if (hasUser) {
                    console.log(`⚠️ WARNING: Found a user-like document in collection: "${col.name}"`);
                }
            }
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

deepScan();
