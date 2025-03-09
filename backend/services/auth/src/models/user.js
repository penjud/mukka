/**
 * User Model
 * Represents a user in the authentication system
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    required: true, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  email: { 
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  displayName: { 
    type: String 
  },
  preferences: { 
    type: Object, 
    default: {} 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

/**
 * Password verification method
 * @param {string} password - The plain text password to verify
 * @returns {Promise<boolean>} - True if the password is correct
 */
userSchema.methods.verifyPassword = async function(password) {
  try {
    // Defensive check for input password
    if (!password || typeof password !== 'string') {
      console.error('Invalid password format during verification');
      return false;
    }

    // Defensive check for passwordHash
    if (!this.passwordHash || typeof this.passwordHash !== 'string') {
      console.error('Invalid password hash format during verification');
      return false;
    }
    
    // Log hash format for debugging (without revealing the actual hash)
    console.log(`Password hash length: ${this.passwordHash.length}, format check: ${this.passwordHash.startsWith('$2')}`);
    
    // Use bcrypt to compare passwords with proper error handling
    return await bcrypt.compare(password, this.passwordHash);
  } catch (error) {
    console.error('Error during password verification:', error);
    return false;
  }
};

/**
 * Set password method (handles hashing)
 * @param {string} password - The plain text password to set
 * @returns {Promise<void>}
 */
userSchema.methods.setPassword = async function(password) {
  try {
    // Validate input
    if (!password || typeof password !== 'string') {
      throw new Error('Invalid password format');
    }
    
    // Hash the password
    this.passwordHash = await bcrypt.hash(password, 10);
  } catch (error) {
    console.error('Error setting password:', error);
    throw error; // Re-throw to allow handling at the caller level
  }
};

/**
 * Pre-save hook to update the updatedAt timestamp
 */
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Static method to find a user by username or email
 * @param {string} identifier - Username or email
 * @returns {Promise<User>}
 */
userSchema.statics.findByUsernameOrEmail = function(identifier) {
  return this.findOne({
    $or: [
      { username: identifier.toLowerCase() },
      { email: identifier.toLowerCase() }
    ]
  });
};

// Create and export the model
const User = mongoose.model('User', userSchema);
module.exports = User;
