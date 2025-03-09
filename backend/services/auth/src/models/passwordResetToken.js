/**
 * Password Reset Token Model
 * Represents a password reset token for password recovery
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetTokenSchema = new mongoose.Schema({
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
  isUsed: { 
    type: Boolean, 
    default: false,
    index: true
  }
});

// Add index for expiration queries
passwordResetTokenSchema.index({ expiresAt: 1 });

/**
 * Check if token is expired
 * @returns {boolean} - True if token is expired
 */
passwordResetTokenSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

/**
 * Mark token as used
 * @returns {Promise<void>}
 */
passwordResetTokenSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  return this.save();
};

/**
 * Static method to find valid token by token string
 * @param {string} token - The token string
 * @returns {Promise<PasswordResetToken>}
 */
passwordResetTokenSchema.statics.findValidToken = function(token) {
  return this.findOne({
    token,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
};

/**
 * Static method to invalidate all tokens for a user
 * @param {string} username - The username
 * @returns {Promise<object>} - Update result
 */
passwordResetTokenSchema.statics.invalidateAllForUser = function(username) {
  return this.updateMany(
    { username, isUsed: false },
    { isUsed: true }
  );
};

/**
 * Static method to generate a new password reset token
 * @param {string} username - The username
 * @param {number} expiryMinutes - Token expiry in minutes (default: 60)
 * @returns {Promise<PasswordResetToken>}
 */
passwordResetTokenSchema.statics.generate = async function(username, expiryMinutes = 60) {
  // Generate random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Calculate expiry
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);
  
  // Invalidate any existing tokens for this user
  await this.invalidateAllForUser(username);
  
  // Create new token
  const resetToken = new this({
    token,
    username,
    expiresAt
  });
  
  await resetToken.save();
  return resetToken;
};

/**
 * Static method to clean up expired or used tokens
 * @returns {Promise<object>} - Delete result
 */
passwordResetTokenSchema.statics.cleanup = function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isUsed: true, createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // 7 days old and used
    ]
  });
};

// Create and export the model
const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
module.exports = PasswordResetToken;
