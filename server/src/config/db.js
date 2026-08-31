const mongoose = require('mongoose');
const config = require('./env');

let mongoServer = null;

const connectDB = async () => {
  try {
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

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // If external mongo failed, try memory server fallback
    if (!mongoServer && !config.MONGODB_URI.includes('127.0.0.1')) {
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
        process.exit(1);
      }
    } else {
      process.exit(1);
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
