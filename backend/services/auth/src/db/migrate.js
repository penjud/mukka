/**
 * Database Migration Script
 * Migrates data from JSON file to MongoDB
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { initializeDatabase, closeConnection } = require('./connection');
const { User, RefreshToken, PasswordResetToken } = require('../models');

// Configure logging
const winston = require('winston');
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'migration.log' })
  ]
});

// Configuration
const USERS_FILE_PATH = process.env.USERS_FILE_PATH || path.join(__dirname, '../../data/users.json');

/**
 * Migrate users from JSON file to MongoDB
 */
async function migrateUsers(usersData) {
  logger.info(`Starting user migration - ${usersData.users.length} users found`);
  let migratedCount = 0;
  let skippedCount = 0;

  for (const userData of usersData.users) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ username: userData.username.toLowerCase() });
      
      if (existingUser) {
        logger.info(`User ${userData.username} already exists, skipping`);
        skippedCount++;
        continue;
      }
      
      // Create new user
      const user = new User({
        username: userData.username.toLowerCase(),
        passwordHash: userData.passwordHash,
        role: userData.role || 'user',
        email: userData.email,
        displayName: userData.displayName,
        preferences: userData.preferences || {},
        createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date()
      });
      
      await user.save();
      logger.info(`Migrated user: ${userData.username}`);
      migratedCount++;
    } catch (error) {
      logger.error(`Failed to migrate user ${userData.username}: ${error.message}`);
    }
  }
  
  logger.info(`User migration completed: ${migratedCount} migrated, ${skippedCount} skipped`);
}

/**
 * Migrate refresh tokens from JSON file to MongoDB
 */
async function migrateRefreshTokens(usersData) {
  if (!usersData.refreshTokens) {
    logger.info('No refresh tokens to migrate');
    return;
  }
  
  const tokens = Object.entries(usersData.refreshTokens);
  logger.info(`Starting refresh token migration - ${tokens.length} tokens found`);
  
  let migratedCount = 0;
  let skippedCount = 0;
  
  for (const [tokenId, tokenData] of tokens) {
    try {
      // Check if this token already exists
      const existingToken = await RefreshToken.findOne({ token: tokenData.token });
      
      if (existingToken) {
        logger.info(`Token for user ${tokenData.username} already exists, skipping`);
        skippedCount++;
        continue;
      }
      
      // Create new token
      const refreshToken = new RefreshToken({
        token: tokenData.token,
        username: tokenData.username.toLowerCase(),
        createdAt: tokenData.createdAt ? new Date(tokenData.createdAt) : new Date(),
        expiresAt: tokenData.expiresAt ? new Date(tokenData.expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isRevoked: false
      });
      
      await refreshToken.save();
      logger.info(`Migrated refresh token for user: ${tokenData.username}`);
      migratedCount++;
    } catch (error) {
      logger.error(`Failed to migrate refresh token: ${error.message}`);
    }
  }
  
  logger.info(`Refresh token migration completed: ${migratedCount} migrated, ${skippedCount} skipped`);
}

/**
 * Migrate password reset tokens from JSON file to MongoDB
 */
async function migratePasswordResetTokens(usersData) {
  if (!usersData.passwordResetTokens) {
    logger.info('No password reset tokens to migrate');
    return;
  }
  
  const tokens = Object.entries(usersData.passwordResetTokens);
  logger.info(`Starting password reset token migration - ${tokens.length} tokens found`);
  
  let migratedCount = 0;
  let skippedCount = 0;
  
  for (const [token, tokenData] of tokens) {
    try {
      // Check if this token already exists
      const existingToken = await PasswordResetToken.findOne({ token });
      
      if (existingToken) {
        logger.info(`Password reset token for user ${tokenData.username} already exists, skipping`);
        skippedCount++;
        continue;
      }
      
      // Create new token
      const resetToken = new PasswordResetToken({
        token,
        username: tokenData.username.toLowerCase(),
        createdAt: tokenData.createdAt ? new Date(tokenData.createdAt) : new Date(),
        expiresAt: tokenData.expiresAt ? new Date(tokenData.expiresAt) : new Date(Date.now() + 60 * 60 * 1000),
        isUsed: false
      });
      
      await resetToken.save();
      logger.info(`Migrated password reset token for user: ${tokenData.username}`);
      migratedCount++;
    } catch (error) {
      logger.error(`Failed to migrate password reset token: ${error.message}`);
    }
  }
  
  logger.info(`Password reset token migration completed: ${migratedCount} migrated, ${skippedCount} skipped`);
}

/**
 * Main migration function
 */
async function migrateData() {
  logger.info('Starting migration from JSON file to MongoDB...');
  
  try {
    // Initialize database connection
    await initializeDatabase(logger);
    
    // Check if users file exists
    if (!fs.existsSync(USERS_FILE_PATH)) {
      logger.error(`Users file not found: ${USERS_FILE_PATH}`);
      return;
    }
    
    // Load users data from JSON file
    const usersDataRaw = fs.readFileSync(USERS_FILE_PATH, 'utf8');
    const usersData = JSON.parse(usersDataRaw);
    
    logger.info(`Loaded data from JSON file: ${USERS_FILE_PATH}`);
    
    // Run migrations
    await migrateUsers(usersData);
    await migrateRefreshTokens(usersData);
    await migratePasswordResetTokens(usersData);
    
    logger.info('Migration completed successfully!');
  } catch (error) {
    logger.error(`Migration failed: ${error.message}`);
    logger.error(error.stack);
  } finally {
    // Close database connection
    await closeConnection();
  }
}

// Run migration if script is executed directly
if (require.main === module) {
  migrateData();
}

module.exports = {
  migrateData
};
