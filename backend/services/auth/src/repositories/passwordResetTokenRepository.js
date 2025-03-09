/**
 * Password Reset Token Repository
 * Handles data access for password reset token entities
 */

const { PasswordResetToken } = require('../models');

class PasswordResetTokenRepository {
  /**
   * Generate a new password reset token
   * @param {string} username - Username
   * @param {number} expiryMinutes - Token expiry in minutes (default: 60)
   * @returns {Promise<object>} - Object with token value and expiry
   */
  async generate(username, expiryMinutes = 60) {
    const resetToken = await PasswordResetToken.generate(username, expiryMinutes);
    
    return {
      token: resetToken.token,
      expiresAt: resetToken.expiresAt
    };
  }
  
  /**
   * Find a token by token string
   * @param {string} token - Token string
   * @returns {Promise<PasswordResetToken>} - Token document or null
   */
  async findByToken(token) {
    return PasswordResetToken.findOne({ token });
  }
  
  /**
   * Find a valid token by token string
   * @param {string} token - Token string
   * @returns {Promise<PasswordResetToken>} - Valid token document or null
   */
  async findValidToken(token) {
    return PasswordResetToken.findValidToken(token);
  }
  
  /**
   * Verify and consume a token
   * @param {string} token - Token string
   * @returns {Promise<string|null>} - Username associated with token or null if invalid
   */
  async verifyAndConsume(token) {
    const resetToken = await PasswordResetToken.findValidToken(token);
    
    if (!resetToken) {
      return null;
    }
    
    // Mark token as used
    await resetToken.markAsUsed();
    
    return resetToken.username;
  }
  
  /**
   * Invalidate all tokens for a user
   * @param {string} username - Username
   * @returns {Promise<number>} - Number of tokens invalidated
   */
  async invalidateAllForUser(username) {
    const result = await PasswordResetToken.invalidateAllForUser(username);
    return result.modifiedCount || 0;
  }
  
  /**
   * Clean up expired or used tokens
   * @returns {Promise<number>} - Number of tokens removed
   */
  async cleanup() {
    const result = await PasswordResetToken.cleanup();
    return result.deletedCount || 0;
  }
}

module.exports = PasswordResetTokenRepository;
