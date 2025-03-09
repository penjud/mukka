/**
 * Reset Admin Password Script
 * 
 * This script resets the admin password in MongoDB to ensure it's in the same format
 * as the file-based storage to avoid segmentation faults during login.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mcp-auth';

async function resetAdminPassword() {
  console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    
    // Load the User model
    console.log('Loading User model...');
    const User = require('./src/models/user');
    console.log(`User model loaded: ${User.modelName}`);

    
    // Find admin user
    const admin = await User.findOne({ username: 'admin' });
    
    if (!admin) {
      console.log('Admin user not found. Creating new admin user...');
      
      // Create default password hash for 'admin123'
      const passwordHash = '$2b$10$gfqQiZM.zk566.F14h.ngO9fAzZgn5K9PObNKTLQK7pRJUYh4t5gC';
      
      // Create admin user with the default password hash
      const newAdmin = new User({
        username: 'admin',
        passwordHash,
        role: 'admin',
        email: 'admin@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await newAdmin.save();
      console.log('Admin user created successfully with password: admin123');
    } else {
      console.log('Admin user found. Resetting password...');
      
      // Reset password to 'admin123'
      const password = 'admin123';
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Update user with new password hash
      admin.passwordHash = passwordHash;
      await admin.save();
      
      console.log('Admin password reset successfully to: admin123');
      console.log(`Password hash: ${passwordHash.substring(0, 10)}... (${passwordHash.length} chars)`);
    }
    
    // Test password verification
    console.log('\nTesting password verification...');
    const testUser = await User.findOne({ username: 'admin' });
    
    if (testUser) {
      console.log(`User found: ${testUser.username}, passwordHash length: ${testUser.passwordHash.length}`);
      console.log(`Password hash format check: ${testUser.passwordHash.startsWith('$2')}`);
      
      try {
        // Manually test with bcrypt.compare
        const match = await bcrypt.compare('admin123', testUser.passwordHash);
        console.log(`Direct bcrypt.compare result: ${match}`);
        
        // Test the model's verifyPassword method
        if (typeof testUser.verifyPassword === 'function') {
          const modelMatch = await testUser.verifyPassword('admin123');
          console.log(`Model verifyPassword result: ${modelMatch}`);
        } else {
          console.log('User model does not have verifyPassword method');
        }
      } catch (error) {
        console.error('Error testing password:', error);
      }
    } else {
      console.log('Failed to find admin user for testing');
    }
    
    return true;
  } catch (error) {
    console.error('Error resetting admin password:', error);
    return false;
  } finally {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (err) {
      console.error('Error closing MongoDB connection:', err);
    }
  }
}

// Run the reset script
resetAdminPassword()
  .then(success => {
    console.log(success ? 'Operation completed successfully' : 'Operation failed');
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
