# MongoDB Integration Plan for Auth Server

This document outlines the changes needed to integrate MongoDB into the Auth Server's main index.js file.

## Changes Needed

1. Import the database connection module
2. Import repositories
3. Import feature flags
4. Initialize the database connection
5. Create repository instances
6. Update all data access code to use repositories instead of direct JSON file manipulation
7. Add feature flag checks to toggle between file and database storage

## Implementation Details

### 1. Add New Imports

```javascript
// Database connection
const { initializeDatabase } = require('./db/connection');

// Data repositories
const { 
  UserRepository, 
  RefreshTokenRepository, 
  PasswordResetTokenRepository 
} = require('./repositories');

// Feature flags
const features = require('./config/features');
```

### 2. Initialize Database Connection

```javascript
// Initialize repositories
let userRepository, refreshTokenRepository, passwordResetTokenRepository;

// Initialize database if using MongoDB
if (features.useMongoDB) {
  logger.info('Using MongoDB for data storage');
  
  // Initialize database connection
  initializeDatabase(logger).catch(err => {
    logger.error(`Failed to connect to MongoDB: ${err.message}`);
    logger.info('Falling back to JSON file storage');
    features.useMongoDB = false;
  });
  
  // Create repository instances
  userRepository = new UserRepository();
  refreshTokenRepository = new RefreshTokenRepository();
  passwordResetTokenRepository = new PasswordResetTokenRepository();
} else {
  logger.info('Using JSON file for data storage');
}
```

### 3. Update Login Route Example

```javascript
// Original file-based implementation
app.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Validation...
    
    const user = usersData.users.find(u => u.username === username);
    
    // Password validation...
    
    // Create tokens...
    
    // Store refresh token
    const tokenId = Date.now().toString();
    usersData.refreshTokens[tokenId] = {
      token: refreshToken,
      username: user.username,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    // Save the updated tokens
    saveUsers();
    
    // Response...
  } catch (error) {
    next(error);
  }
});
```

### 4. Updated Login Route with MongoDB

```javascript
app.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // Validation...
    
    let user;
    
    // Get user data based on storage type
    if (features.useMongoDB) {
      user = await userRepository.findByUsername(username);
      
      if (!user) {
        logger.warn(`Login attempt for non-existent user: ${username}`);
        const err = new Error('Invalid credentials');
        err.status = 401;
        return next(err);
      }
      
      // Verify password
      const passwordMatch = await user.verifyPassword(password);
      
      if (!passwordMatch) {
        logger.warn(`Password mismatch for user: ${username}`);
        const err = new Error('Invalid credentials');
        err.status = 401;
        return next(err);
      }
    } else {
      // Original file-based implementation
      user = usersData.users.find(u => u.username === username);
      
      if (!user) {
        logger.warn(`Login attempt for non-existent user: ${username}`);
        const err = new Error('Invalid credentials');
        err.status = 401;
        return next(err);
      }
      
      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      
      if (!passwordMatch) {
        logger.warn(`Password mismatch for user: ${username}`);
        const err = new Error('Invalid credentials');
        err.status = 401;
        return next(err);
      }
    }
    
    logger.info(`Successful login for user: ${username}`);
    
    // Create access token with shorter expiry
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    
    // Create and store refresh token
    let refreshToken, tokenId;
    
    if (features.useMongoDB) {
      // Use repository to create refresh token
      const result = await refreshTokenRepository.create(
        user.username, 
        REFRESH_TOKEN_SECRET,
        7 // 7 days expiry
      );
      
      refreshToken = result.token;
      tokenId = result.tokenId;
    } else {
      // Original file-based implementation
      refreshToken = jwt.sign(
        { username: user.username },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
      );
      
      // Store refresh token
      tokenId = Date.now().toString();
      usersData.refreshTokens[tokenId] = {
        token: refreshToken,
        username: user.username,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      // Save the updated tokens
      saveUsers();
    }
    
    // Set cookies and response...
  } catch (error) {
    next(error);
  }
});
```

## Migration Strategy

1. Implement feature flag system
2. Add database connection initialization
3. Create repository instances when using MongoDB
4. Update each endpoint to check the feature flag and use the appropriate data access method
5. Test with both storage types to ensure compatibility
6. Set the feature flag to use MongoDB in production

## Fallback Mechanism

1. Initialize MongoDB connection
2. If connection fails, log error and fall back to file storage
3. Set the feature flag to use file storage
4. Use conditional logic in routes to determine the storage mechanism
5. Implement health check endpoints to monitor database connection status

## Testing Plan

1. Unit test each repository function
2. Integration test the full authentication flow with MongoDB
3. Test the fallback mechanism by simulating database connection failure
4. Performance test with multiple concurrent users
5. Test database connection recovery after temporary outage
