import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://manoharpoojari76_db_user:Upgo452sIGRwep9j@leadflow.ps1rzw1.mongodb.net/';

async function locateMohan() {
    try {
        console.log('Connecting to MongoDB Atlas Cluster...');
        const client = await mongoose.connect(MONGODB_URI);

        // Get list of all databases
        const admin = client.connection.db.admin();
        const dbs = await admin.listDatabases();

        console.log('\nScanning all databases for "Mohan"...');

        for (const dbInfo of dbs.databases) {
            const dbName = dbInfo.name;
            if (['admin', 'local', 'config'].includes(dbName)) continue;

            const db = client.connection.useDb(dbName);
            const collections = await db.db.listCollections().toArray();

            for (const col of collections) {
                const colName = col.name;
                const count = await db.collection(colName).countDocuments({
                    $or: [
                        { username: /mohan/i },
                        { name: /mohan/i }
                    ]
                });

                if (count > 0) {
                    console.log(`✅ FOUND in Database: "${dbName}" | Collection: "${colName}" | Count: ${count}`);
                    const docs = await db.collection(colName).find({ name: /mohan/i }).toArray();
                    docs.forEach(d => console.log(`   - ID: ${d._id} | Name: ${d.name}`));
                }
            }
        }

    } catch (error) {
        console.error('Error during search:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nSearch complete.');
    }
}

locateMohan();
