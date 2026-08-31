const mongoose = require('mongoose');
const config = require('./env');

let mongoServer = null;

const connectDB = async () => {
  let uri = config.MONGODB_URI;

  if (!uri) {
    console.log('ℹ️ No MONGODB_URI provided in environment. Initializing in-memory MongoDB server for development...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log('✅ In-Memory MongoDB Server started successfully.');
    } catch (memErr) {
      console.warn('⚠️ Could not start mongodb-memory-server:', memErr.message);
      uri = 'mongodb://127.0.0.1:27017/mailpilot';
    }
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️ Note: If connecting to MongoDB Atlas, ensure Network Access allows 0.0.0.0/0 (anywhere) and username/password are correct.');
    
    // Try in-memory fallback in dev if not already attempted
    if (!mongoServer && config.NODE_ENV !== 'production') {
      try {
        console.log('🔄 Attempting fallback to in-memory MongoDB server...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        const fallbackUri = mongoServer.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`📦 MongoDB In-Memory Fallback Connected: ${conn.connection.host}`);
        return conn;
      } catch (fallbackErr) {
        console.error(`❌ Fallback MongoDB Memory Server failed: ${fallbackErr.message}`);
      }
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (err) {
    console.error('Error disconnecting database:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
