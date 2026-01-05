import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://manoharpoojari76_db_user:Upgo452sIGRwep9j@leadflow.ps1rzw1.mongodb.net/leadsflow';

async function auditPasswords() {
    try {
        await mongoose.connect(MONGODB_URI);
        const db = mongoose.connection.db;
        const users = await db.collection('users').find({}).toArray();

        console.log('--- Password Audit ---');
        users.forEach(u => {
            // Bcrypt hashes usually start with $2a$ or $2b$
            const isBcrypt = u.password.startsWith('$2a$') || u.password.startsWith('$2b$');
            // Our broken hashing started with $demo$
            const isDoubleHashed = u.password.includes('$demo$');

            console.log(`User: ${u.username} | Valid Hash format: ${isBcrypt} | Double Hashed: ${isDoubleHashed}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

auditPasswords();
