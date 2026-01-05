import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://manoharpoojari76_db_user:Upgo452sIGRwep9j@leadflow.ps1rzw1.mongodb.net/leadsflow';

async function listAllUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        console.log('--- Collection List ---');
        collections.forEach(c => console.log(`- ${c.name}`));

        console.log('\n--- Documents in "users" collection ---');
        const users = await db.collection('users').find({}).toArray();
        console.log(`Total Count: ${users.length}`);

        users.forEach((u, i) => {
            console.log(`${i + 1}. ID: ${u._id} | Username: ${u.username} | Name: ${u.name}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

listAllUsers();
