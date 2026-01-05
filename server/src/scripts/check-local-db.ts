import mongoose from 'mongoose';

const LOCAL_URI = 'mongodb://localhost:27017/leadsflow';

async function checkLocal() {
    try {
        console.log('Connecting to LOCAL MongoDB...');
        await mongoose.connect(LOCAL_URI);
        const db = mongoose.connection.db;

        const count = await db.collection('users').countDocuments({});
        console.log(`\nLocal "users" collection count: ${count}`);

        if (count > 0) {
            const users = await db.collection('users').find({}).toArray();
            users.forEach((u, i) => {
                console.log(`${i + 1}. Username: ${u.username} | Name: ${u.name}`);
            });
        } else {
            console.log('Local database is empty.');
        }

    } catch (error: any) {
        console.log('Could not connect to local MongoDB. (It might not be running)');
    } finally {
        await mongoose.disconnect();
    }
}

checkLocal();
