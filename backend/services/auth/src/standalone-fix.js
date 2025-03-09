/**
 * Standalone Fix for MongoDB Password Verification
 * 
 * This script modifies the database to ensure passwords are verified correctly
 * without relying on Mongoose methods that might cause segmentation faults.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mcp-auth';

// Connect to MongoDB
async function main() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define a simplified User schema
    const userSchema = new mongoose.Schema({
      username: String,
      passwordHash: String,
      role: String
    });

    const User = mongoose.model('User', userSchema);

    // Find admin user
    const admin = await User.findOne({ username: 'admin' });
    
    if (!admin) {
      console.log('Admin user not found, creating...');
      const passwordHash = '$2b$10$gfqQiZM.zk566.F14h.ngO9fAzZgn5K9PObNKTLQK7pRJUYh4t5gC'; // Hash for 'admin123'
      const newAdmin = new User({
        username: 'admin',
        passwordHash,
        role: 'admin'
      });
      await newAdmin.save();
      console.log('Admin user created with passwordHash: ', passwordHash);
    } else {
      console.log('Admin user found:', admin.username);
      // Create direct JS fix
      console.log('Writing direct authentication fix...');
      
      // Write a special direct-auth.js file to bypass Mongoose methods
      const directAuthPath = path.join(__dirname, 'direct-auth.js');
      const directAuthContent = `/**
 * Direct Authentication Handler
 * Bypasses Mongoose methods for password verification to avoid segmentation faults
 */

const bcrypt = require('bcrypt');
const User = require('./models/user');

/**
 * Direct verification function - avoids using Mongoose methods
 * @param {string} username - The username
 * @param {string} password - The plain text password
 * @returns {Promise<object|null>} - User object or null
 */
async function directVerifyPassword(username, password) {
  try {
    // Find user directly
    const user = await User.findOne({ username: username.toLowerCase() });
    
    if (!user || !user.passwordHash) {
      console.log('User not found or missing password hash');
      return null;
    }

    // Use bcrypt directly instead of Mongoose method
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      console.log('Password does not match');
      return null;
    }
    
    // Return a plain object instead of Mongoose document
    return {
      id: user._id,
      username: user.username,
      role: user.role
    };
  } catch (error) {
    console.error('Error in direct verification:', error);
    return null;
  }
}

module.exports = {
  directVerifyPassword
};`;
      
      fs.writeFileSync(directAuthPath, directAuthContent);
      console.log(`Direct authentication bypass written to ${directAuthPath}`);
      
      // Now modify the auth-routes.js to use this direct method
      const authRoutesPath = path.join(__dirname, 'routes', 'auth-routes.js');
      
      // Read the current file
      let authRoutesContent = fs.readFileSync(authRoutesPath, 'utf8');
      
      // Check if our fix is already applied
      if (!authRoutesContent.includes('directVerifyPassword')) {
        console.log('Modifying auth-routes.js to use direct verification...');
        
        // Add import for direct auth
        authRoutesContent = authRoutesContent.replace(
          "const jwt = require('jsonwebtoken');",
          "const jwt = require('jsonwebtoken');\nconst { directVerifyPassword } = require('../direct-auth');"
        );
        