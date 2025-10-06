const { connect } = require('./app');

async function resetDatabase() {
    try {
        const { db, client } = await connect();
        
        const collections = ['users', 'groups', 'messages', 'notifications'];
        
        for (const collectionName of collections) {
            try {
                await db.collection(collectionName).drop();
                console.log(`Collection '${collectionName}' dropped`);
            } catch (error) {
                console.log(`Collection '${collectionName}' doesn't exist or already dropped`);
            }
        }
        
        console.log("Database reset complete!");
        await client.close();
    } catch (error) {
        console.error('Error resetting database:', error);
    }
}

resetDatabase();