/**
 * Test Script for Password Verification
 * 
 * This script tests the password verification functionality after the fix
 * to ensure it doesn't crash with a segmentation fault.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./src/models');
const bcrypt = require('bcrypt');

// Set MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mcp-auth';

// Test function
async function testPasswordVerification() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB');

    // Fetch a test user
    console.log('Fetching a test user...');
    const user = await User.findOne();
    
    if (!user) {
      console.log('No user found. Creating a test user...');
      const newUser = new User({
        username: 'testuser',
        role: 'user',
      });
      
      // Set password
      await newUser.setPassword('password123');
      await newUser.save();
      console.log('Test user created');
      return await testVerification(newUser);
    } else {
      console.log(`Found user: ${user.username}`);
      return await testVerification(user);
    }
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Close MongoDB connection
    if (mongoose.connection.readyState) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Test verification with different scenarios
async function testVerification(user) {
  try {
    // 1. Test with correct password
    console.log('\n---- Test with correct password ----');
    const correctResult = await user.verifyPassword('password123');
    console.log(`Verification result (should be true): ${correctResult}`);
    
    // 2. Test with incorrect password
    console.log('\n---- Test with incorrect password ----');
    const incorrectResult = await user.verifyPassword('wrongpassword');
    console.log(`Verification result (should be false): ${incorrectResult}`);
    
    // 3. Test with null password - should not crash
    console.log('\n---- Test with null password ----');
    const nullResult = await user.verifyPassword(null);
    console.log(`Verification result (should be false): ${nullResult}`);
    
    // 4. Test with undefined password - should not crash
    console.log('\n---- Test with undefined password ----');
    const undefinedResult = await user.verifyPassword(undefined);
    console.log(`Verification result (should be false): ${undefinedResult}`);
    
    // 5. Test with empty string password - should not crash
    console.log('\n---- Test with empty string password ----');
    const emptyResult = await user.verifyPassword('');
    console.log(`Verification result (should be false): ${emptyResult}`);
    
    console.log('\n**** All tests completed without crashing! ****');
    return true;
  } catch (error) {
    console.error('Error during verification test:', error);
    return false;
  }
}

// Run the test
testPasswordVerification()
  .then(success => {
    console.log(`\nTest ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
