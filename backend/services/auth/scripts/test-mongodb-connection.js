#!/usr/bin/env node

/**
 * MongoDB Connection Test Script
 * Tests the connection to MongoDB and verifies schema setup
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mcp-auth';

async function testConnection() {
  console.log('Starting MongoDB connection test...');
  console.log(`Connection URI: ${MONGODB_URI}`);
  
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Successfully connected to MongoDB');
    
    // Get connection information
    const { host, port, name } = mongoose.connection;
    console.log(`Server: ${host}:${port}`);
    console.log(`Database: ${name}`);
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    if (collections.length === 0) {
      console.log('No collections found - this is normal for a new database');
    } else {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
    // Check server status
    const serverStatus = await mongoose.connection.db.admin().serverStatus();
    console.log('\nServer information:');
    console.log(`MongoDB version: ${serverStatus.version}`);
    console.log(`Uptime: ${Math.floor(serverStatus.uptime / 86400)} days, ${Math.floor((serverStatus.uptime % 86400) / 3600)} hours`);
    console.log(`Connections: ${serverStatus.connections.current} current / ${serverStatus.connections.available} available`);
    
    console.log('\n✅ MongoDB connection test completed successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error(error.message);
    
    // Check for common errors
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\nPossible causes:');
      console.log('1. MongoDB server is not running');
      console.log('2. MongoDB is running on a different port');
      console.log('3. Firewall is blocking the connection');
      
      console.log('\nTry the following:');
      console.log('- Check if MongoDB is running: sudo systemctl status mongodb');
      console.log('- Start MongoDB if needed: sudo systemctl start mongodb');
      console.log('- Verify the connection string in .env file');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.log('\nPossible causes:');
      console.log('1. Invalid username or password');
      console.log('2. User does not have access to the database');
      
      console.log('\nTry the following:');
      console.log('- Verify the username and password in the connection string');
      console.log('- Check user permissions in MongoDB');
    }
  } finally {
    // Close connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

testConnection();
