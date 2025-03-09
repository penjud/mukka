/**
 * Refresh Token Repository
 * Handles data access for refresh token entities
 */

const { RefreshToken } = require('../models');
const jwt = require('jsonwebtoken');

class RefreshTokenRepository {
  /**
   * Create a new refresh token
   * @param {string} username - Username
   * @param {string} refreshTokenSecret - Secret for token signing
   * @param {string} expiryDays - Token expiry in days
   * @returns {Promise<object>} - Object with token and tokenId
   */
  async create(username, refreshTokenSecret, expiryDays = 7) {
    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);
    
    // Generate JWT token
    const token = jwt.sign(
      { username },
      refreshTokenSecret,
      { expiresIn: `${expiryDays}d` }
    );
    
    // Create record in database
    const refreshToken = new RefreshToken({
      token,
      username,
      expiresAt
    });
    
    await refreshToken.save();
    
    return {
      token,
      tokenId: refreshToken._id.toString()
    };
  }
  
  /**
   * Find a token by token string
   * @param {string} token - Token string
   * @returns {Promise<RefreshToken>} - Token document or null
   */
  async findByToken(token) {
    return RefreshToken.findOne({ token });
  }
  
  /**
   * Find a valid token by token string
   * @param {string} token - Token string
   * @returns {Promise<RefreshToken>} - Valid token document or null
   */
  async findValidToken(token) {
    return RefreshToken.findValidToken(token);
  }
  
  /**
   * Revoke a token
   * @param {string} token - Token string
   * @returns {Promise<boolean>} - True if token was revoked
   */
  async revokeToken(token) {
    const refreshToken = await this.findByToken(token);
    if (!refreshToken) return false;
    
    refreshToken.isRevoked = true;
    await refreshToken.save();
    return true;
  }
  
  /**
   * Revoke all tokens for a user
   * @param {string} username - Username
   * @returns {Promise<number>} - Number of tokens revoked
   */
  async revokeAllForUser(username) {
    const result = await RefreshToken.revokeAllForUser(username);
    return result.modifiedCount || 0;
  }
  
  /**
   * List all tokens for a user
   * @param {string} username - Username
   * @returns {Promise<RefreshToken[]>} - Array of token documents
   */
  async findByUsername(username) {
    return RefreshToken.find({ username }).sort({ createdAt: -1 });
  }
  
  /**
   * Clean up expired tokens
   * @returns {Promise<number>} - Number of tokens removed
   */
  async cleanupExpired() {
    const result = await RefreshToken.removeExpired();
    return result.deletedCount || 0;
  }
}

module.exports = RefreshTokenRepository;
