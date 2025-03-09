/**
 * Database Connection
 * Sets up and manages MongoDB connection
 */

const mongoose = require('mongoose');
const winston = require('winston');

let logger;

/**
 * Initialize database connection
 * @param {winston.Logger} loggerInstance - Winston logger instance
 * @returns {Promise<mongoose.Connection>} - Mongoose connection
 */
const initializeDatabase = async (loggerInstance) => {
  logger = loggerInstance || console;
  
  // Get MongoDB connection string from environment variables
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mcp-auth';
  
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout for initial connection
      socketTimeoutMS: 45000, // 45 second timeout on socket operations
      maxPoolSize: process.env.MONGODB_CONNECTION_POOL_SIZE || 10
    });
    
    logger.info('Connected to MongoDB');
    
    // Set up event listeners
    setupEventListeners();
    
    return mongoose.connection;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

/**
 * Setup MongoDB connection event listeners
 */
const setupEventListeners = () => {
  // Connection error event
  mongoose.connection.on('error', err => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });
  
  // Disconnection event
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected, attempting to reconnect');
  });
  
  // Successful reconnection event
  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });
  
  // Process termination - close connection
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed due to application termination');
    process.exit(0);
  });
};

/**
 * Check if the database connection is active
 * @returns {boolean} - True if connected
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Close the database connection
 * @returns {Promise<void>}
 */
const closeConnection = async () => {
  if (isConnected()) {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  }
};

module.exports = {
  initializeDatabase,
  isConnected,
  closeConnection
};
