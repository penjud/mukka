# Auth Server Database Integration Plan

## Overview

This document outlines the plan to transition the Auth Server from using JSON file storage to a proper database for user data, refresh tokens, and password reset tokens.

## Current Implementation

The current implementation stores user data, refresh tokens, and password reset tokens in a JSON file:
- Uses Node.js fs module to read/write JSON data
- All data is loaded into memory on server startup
- Changes are saved to disk on each modification
- Single file contains all sensitive information

## Proposed Database Solution

### 1. Database Selection: MongoDB

MongoDB is proposed as the database solution for the following reasons:
- Schema flexibility supports rapid development and iterations
- JSON-like document structure makes the migration from JSON files straightforward
- Scalability for future growth
- Good support for Node.js applications via Mongoose ODM

### 2. Data Models

#### User Model
```javascript
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, enum: ['user', 'admin'], default: 'user' },
  email: { type: String, sparse: true },
  displayName: { type: String },
  preferences: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

#### Refresh Token Model
```javascript
const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  isRevoked: { type: Boolean, default: false }
});
```

#### Password Reset Token Model
```javascript
const passwordResetTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  isUsed: { type: Boolean, default: false }
});
```

### 3. Implementation Strategy

#### Phase 1: Environment Setup
1. Add MongoDB connection configuration to environment variables
2. Implement MongoDB connection setup with error handling and reconnection logic
3. Create Mongoose models for users, refresh tokens, and password reset tokens

#### Phase 2: Create Data Access Layer
1. Implement user repository with CRUD operations
2. Implement refresh token repository
3. Implement password reset token repository
4. Add validation and error handling

#### Phase 3: Migrate Endpoints
1. Update login, logout, and token refresh endpoints
2. Update user profile and password management endpoints
3. Update reset password flow
4. Update admin endpoints

#### Phase 4: Data Migration
1. Create a migration script to import existing JSON data
2. Test migration with validation steps
3. Implement fallback mechanism for migration failures

#### Phase 5: Testing and Optimization
1. Test all endpoints with the new database implementation
2. Implement database connection pooling and performance optimization
3. Add database health check to system monitoring
4. Create database backup strategy

## Implementation Details

### Connection Setup

```javascript
const mongoose = require('mongoose');
const winston = require('winston');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mcp-auth';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}).then(() => {
  logger.info('Connected to MongoDB');
}).catch(err => {
  logger.error(`MongoDB connection error: ${err.message}`);
});

// Handle connection events
mongoose.connection.on('error', err => {
  logger.error(`MongoDB connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected, attempting to reconnect');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

// Close MongoDB connection when process terminates
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
  process.exit(0);
});
```

### Sample Repository Implementation

```javascript
// User repository
class UserRepository {
  async findByUsername(username) {
    return User.findOne({ username });
  }
  
  async findByEmail(email) {
    return User.findOne({ email });
  }
  
  async create(userData) {
    const user = new User(userData);
    return user.save();
  }
  
  async update(username, updates) {
    return User.findOneAndUpdate(
      { username },
      { ...updates, updatedAt: Date.now() },
      { new: true }
    );
  }
  
  async delete(username) {
    return User.findOneAndDelete({ username });
  }
  
  async listAll() {
    return User.find({}, { passwordHash: 0 });
  }
}
```

## Environment Variables

Add the following environment variables to the Auth Server configuration:

```
# MongoDB Connection
MONGODB_URI=mongodb://username:password@hostname:port/database
MONGODB_DATABASE=mcp-auth
MONGODB_USER=mcp-auth-user
MONGODB_PASSWORD=secure-password

# Connection Options
MONGODB_CONNECTION_POOL_SIZE=10
MONGODB_RETRY_WRITES=true
```

## Migration Script

To migrate existing user data from the JSON file to MongoDB, we'll create a migration script that does the following:

```javascript
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { User, RefreshToken, PasswordResetToken } = require('./models');

// Configuration
const USERS_FILE_PATH = process.env.USERS_FILE_PATH || path.join(__dirname, '../data/users.json');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mcp-auth';

async function migrateData() {
  console.log('Starting migration from JSON file to MongoDB...');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    
    console.log('Connected to MongoDB');
    
    // Load JSON data
    if (!fs.existsSync(USERS_FILE_PATH)) {
      console.error(`Users file not found: ${USERS_FILE_PATH}`);
      process.exit(1);
    }
    
    const usersData = JSON.parse(fs.readFileSync(USERS_FILE_PATH, 'utf8'));
    console.log(`Loaded ${usersData.users.length} users from JSON file`);
    
    // Migrate users
    for (const userData of usersData.users) {
      // Check if user already exists
      const existingUser = await User.findOne({ username: userData.username });
      
      if (existingUser) {
        console.log(`User ${userData.username} already exists in database, skipping...`);
        continue;
      }
      
      // Create new user
      const user = new User({
        username: userData.username,
        passwordHash: userData.passwordHash,
        role: userData.role,
        email: userData.email,
        displayName: userData.displayName,
        preferences: userData.preferences,
        createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date()
      });
      
      await user.save();
      console.log(`Migrated user: ${userData.username}`);
    }
    
    // Migrate refresh tokens
    if (usersData.refreshTokens) {
      for (const [tokenId, tokenData] of Object.entries(usersData.refreshTokens)) {
        const refreshToken = new RefreshToken({
          token: tokenData.token,
          username: tokenData.username,
          createdAt: tokenData.createdAt ? new Date(tokenData.createdAt) : new Date(),
          expiresAt: tokenData.expiresAt ? new Date(tokenData.expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        
        await refreshToken.save();
      }
      
      console.log(`Migrated ${Object.keys(usersData.refreshTokens).length} refresh tokens`);
    }
    
    // Migrate password reset tokens
    if (usersData.passwordResetTokens) {
      for (const [token, tokenData] of Object.entries(usersData.passwordResetTokens)) {
        const passwordResetToken = new PasswordResetToken({
          token,
          username: tokenData.username,
          createdAt: tokenData.createdAt ? new Date(tokenData.createdAt) : new Date(),
          expiresAt: tokenData.expiresAt ? new Date(tokenData.expiresAt) : new Date(Date.now() + 60 * 60 * 1000)
        });
        
        await passwordResetToken.save();
      }
      
      console.log(`Migrated ${Object.keys(usersData.passwordResetTokens).length} password reset tokens`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run migration
migrateData();
```

## Rollback Strategy

In case the migration to MongoDB causes issues, we'll implement a rollback strategy:

1. Keep the original JSON file intact for a defined period after migration
2. Implement a feature flag to switch between file-based and database storage
3. Create a database-to-JSON export function to reverse the migration if needed

## Testing Plan

1. **Unit Tests**:
   - Create tests for each database model
   - Test CRUD operations for each repository
   - Ensure validation rules are working

2. **Integration Tests**:
   - Test the full authentication flow
   - Verify token refresh functionality
   - Test password reset workflows
   - Verify user management operations

3. **Migration Tests**:
   - Test migration with sample data
   - Verify data integrity after migration
   - Test the rollback mechanism

## Next Steps

1. Install MongoDB and Mongoose dependencies
2. Create the database models
3. Implement repositories for each entity
4. Update the controllers to use the repositories
5. Create and test the migration script
6. Deploy the solution with proper monitoring