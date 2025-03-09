/**
 * Feature Flags Configuration
 * Enables toggling features on/off for testing and migration
 */

// Load environment variables
const { env } = process;

// Feature flags - default to using MongoDB in production
const features = {
  // Use MongoDB for data storage (vs. JSON file)
  useMongoDB: env.USE_MONGODB === 'true' || env.NODE_ENV === 'production',
  
  // Enable account lockout after multiple failed attempts
  enableAccountLockout: env.ENABLE_ACCOUNT_LOCKOUT !== 'false',
  
  // Enable password reset functionality
  enablePasswordReset: env.ENABLE_PASSWORD_RESET !== 'false',
  
  // Enable refresh tokens
  enableRefreshTokens: env.ENABLE_REFRESH_TOKENS !== 'false',
  
  // Send password reset emails (vs. returning token in response)
  sendPasswordResetEmails: env.NODE_ENV === 'production',
  
  // Enable detailed error messages in development
  detailedErrors: env.NODE_ENV !== 'production',
};

module.exports = features;
