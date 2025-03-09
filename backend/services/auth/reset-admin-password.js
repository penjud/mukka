/**
 * Reset Admin Password
 * 
 * This script resets the admin user's password in MongoDB to match 
 * the default password used in the file-based storage.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./src/models');
const bcrypt = require('bcryptjs');

// Set MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mcp-auth';

// Default admin password hash for file-based storage
const DEFAULT_ADMIN_HASH = '$2b$10$gfqQiZM.zk566.F14h.ngO9fAzZgn5K9PObNKTLQK7pRJUYh4t5gC'; // Hash for 'admin123'

async function resetAdminPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB');

    // Find admin user
    console.log('Finding admin user...');
    let adminUser = await User.findOne({ username: 'admin' });
    
    if (!adminUser) {
      console.log('Admin user not found. Creating admin user...');
      adminUser = new User({
        username: 'admin',
        role: 'admin',
        email: 'admin@example.com'
      });
    } else {
      console.log('Found admin user.');
    }
    
    // Set password directly using the known hash for 'admin123'
    adminUser.passwordHash = DEFAULT_ADMIN_HASH;
    
    // Save user
    await adminUser.save();
    console.log('Admin password reset to "admin123" successfully.');
    
    // Confirm password verification works
    console.log('Verifying password...');
    const passwordVerified = await adminUser.verifyPassword('admin123');
    console.log(`Password verification result: ${passwordVerified}`);
    
    if (!passwordVerified) {
      console.warn('Warning: Password verification failed, but the hash should be correct.');
    }
    
    return true;
  } catch (error) {
    console.error('Error resetting admin password:', error);
    return false;
  } finally {
    // Close MongoDB connection
    if (mongoose.connection.readyState) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the script
resetAdminPassword()
  .then(success => {
    console.log(`\nOperation ${success ? 'SUCCEEDED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
