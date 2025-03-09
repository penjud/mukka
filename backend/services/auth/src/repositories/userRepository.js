/**
 * User Repository
 * Handles data access for user entities
 */

const { User } = require('../models');

class UserRepository {
  /**
   * Find a user by username
   * @param {string} username - The username to search for
   * @returns {Promise<User>} - The user document or null
   */
  async findByUsername(username) {
    return User.findOne({ username: username.toLowerCase() });
  }
  
  /**
   * Find a user by email
   * @param {string} email - The email to search for
   * @returns {Promise<User>} - The user document or null
   */
  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() });
  }
  
  /**
   * Find a user by username or email
   * @param {string} identifier - Username or email
   * @returns {Promise<User>} - The user document or null
   */
  async findByUsernameOrEmail(identifier) {
    return User.findByUsernameOrEmail(identifier);
  }
  
  /**
   * Create a new user
   * @param {object} userData - User data
   * @param {string} userData.username - Username
   * @param {string} userData.password - Plain text password
   * @param {string} [userData.role='user'] - User role
   * @param {string} [userData.email] - Email address
   * @param {string} [userData.displayName] - Display name
   * @param {object} [userData.preferences={}] - User preferences
   * @returns {Promise<User>} - The created user
   */
  async create(userData) {
    const { password, ...otherData } = userData;
    
    const user = new User({
      ...otherData,
      username: otherData.username.toLowerCase()
    });
    
    // Set password using method that handles hashing
    if (password) {
      await user.setPassword(password);
    }
    
    return user.save();
  }
  
  /**
   * Update an existing user
   * @param {string} username - Username of the user to update
   * @param {object} updates - Fields to update
   * @returns {Promise<User>} - The updated user
   */
  async update(username, updates) {
    const { password, ...otherUpdates } = updates;
    
    // First find the user
    const user = await this.findByUsername(username);
    if (!user) return null;
    
    // Update fields
    Object.assign(user, otherUpdates);
    
    // If password is provided, update it
    if (password) {
      await user.setPassword(password);
    }
    
    // Save changes
    return user.save();
  }
  
  /**
   * Delete a user
   * @param {string} username - Username of the user to delete
   * @returns {Promise<boolean>} - True if user was deleted
   */
  async delete(username) {
    const result = await User.deleteOne({ username: username.toLowerCase() });
    return result.deletedCount > 0;
  }
  
  /**
   * List all users
   * @param {object} options - Query options
   * @param {number} [options.limit] - Maximum number of users to return
   * @param {number} [options.skip] - Number of users to skip
   * @param {object} [options.sort] - Sort criteria
   * @returns {Promise<User[]>} - Array of users
   */
  async listAll(options = {}) {
    const { limit, skip, sort } = options;
    
    // Build query
    let query = User.find({}, { passwordHash: 0 }); // Exclude password hash
    
    // Apply options
    if (sort) query = query.sort(sort);
    if (skip) query = query.skip(skip);
    if (limit) query = query.limit(limit);
    
    return query.exec();
  }
  
  /**
   * Count users
   * @param {object} [filter] - Filter criteria
   * @returns {Promise<number>} - Count of users
   */
  async count(filter = {}) {
    return User.countDocuments(filter);
  }
  
  /**
   * Check if username exists
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} - True if username exists
   */
  async usernameExists(username) {
    const count = await User.countDocuments({ username: username.toLowerCase() });
    return count > 0;
  }
  
  /**
   * Check if email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} - True if email exists
   */
  async emailExists(email) {
    const count = await User.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }
  
  /**
   * Count users by role
   * @param {string} role - Role to count
   * @returns {Promise<number>} - Count of users with the specified role
   */
  async countByRole(role) {
    return User.countDocuments({ role });
  }
  
  /**
   * Check MongoDB connection status
   * @returns {Promise<boolean>} - True if connected to MongoDB
   */
  async checkConnection() {
    try {
      // Perform a simple operation to check connection
      if (!User.db || !User.db.command) {
        // Try to use mongoose connection directly
        const mongoose = require('mongoose');
        await mongoose.connection.db.command({ ping: 1 });
      } else {
        await User.db.command({ ping: 1 });
      }
      return true;
    } catch (error) {
      console.error('MongoDB connection check failed:', error);
      return false;
    }
  }
}

module.exports = UserRepository;
