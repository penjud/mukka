/**
 * Refresh Token Model
 * Represents a refresh token for JWT token refreshing
 */

const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: { 
    type: String, 
    required: true,
    index: true 
  },
  username: { 
    type: String, 
    required: true,
    index: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    index: true 
  },
  isRevoked: { 
    type: Boolean, 
    default: false,
    index: true 
  }
});

// Add index for token expiration queries
refreshTokenSchema.index({ expiresAt: 1 });

// Add compound index for cleanup
refreshTokenSchema.index({ username: 1, isRevoked: 1 });

/**
 * Check if token is expired
 * @returns {boolean} - True if token is expired
 */
refreshTokenSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

/**
 * Revoke token
 * @returns {Promise<void>}
 */
refreshTokenSchema.methods.revoke = function() {
  this.isRevoked = true;
  return this.save();
};

/**
 * Static method to find valid token by token string
 * @param {string} token - The token string
 * @returns {Promise<RefreshToken>}
 */
refreshTokenSchema.statics.findValidToken = function(token) {
  return this.findOne({
    token,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  });
};

/**
 * Static method to revoke all tokens for a user
 * @param {string} username - The username
 * @returns {Promise<object>} - Update result
 */
refreshTokenSchema.statics.revokeAllForUser = function(username) {
  return this.updateMany(
    { username, isRevoked: false },
    { isRevoked: true }
  );
};

/**
 * Static method to clean up expired tokens
 * @returns {Promise<object>} - Delete result
 */
refreshTokenSchema.statics.removeExpired = function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isRevoked: true, createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // 30 days old and revoked
    ]
  });
};

// Create and export the model
const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
module.exports = RefreshToken;
