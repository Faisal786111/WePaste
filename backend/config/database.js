const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

/**
 * MongoDB Connection Configuration
 * Connects to MongoDB Atlas and initializes GridFS bucket
 */
let gridFSBucket = null;

const connectDB = async () => {
  try {
    // Debug: Check if MONGODB_URI is loaded
    console.log('MONGODB_URI =>', process.env.MONGODB_URI);
    
    // Validate MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables. Please check your .env file.');
    }

    // MongoDB connection options
    const connectionOptions = {
      dbName: 'wepaste',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, connectionOptions);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Initialize GridFS bucket for file storage
    const db = mongoose.connection.db;
    gridFSBucket = new GridFSBucket(db, {
      bucketName: process.env.GRIDFS_BUCKET_NAME || 'uploads',
    });

    console.log('GridFS Bucket initialized');
    return gridFSBucket;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Get GridFS Bucket instance
 */
const getGridFSBucket = () => {
  if (!gridFSBucket) {
    throw new Error('GridFS bucket not initialized. Connect to database first.');
  }
  return gridFSBucket;
};

module.exports = { connectDB, getGridFSBucket };

