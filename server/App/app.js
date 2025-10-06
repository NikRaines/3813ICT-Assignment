const { MongoClient } = require('mongodb');

// MongoDB connection URL and database name
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'chatdb';

async function connect() {
  try {
    const client = new MongoClient(url, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    await client.connect();
    const db = client.db(dbName);
    console.log('Connected to MongoDB successfully');
    
    await createCollections(db);
    return { db, client };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Create collections
async function createCollections(db) {
  const collections = ['users', 'groups', 'messages', 'notifications'];
  
  for (const collectionName of collections) {
    try {
      await db.createCollection(collectionName);
      //console.log(`Collection '${collectionName}' created or already exists`);
    } catch {}
  }
}

// Close MongoDB connection
async function closeConnection(client) {
  try {
    await client.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
}

module.exports = { connect, closeConnection };