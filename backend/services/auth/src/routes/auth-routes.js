/**
 * Auth Routes
 * Main authentication routes for the MCP Auth Server
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');

// Create router
const router = express.Router();

// Initialize function to set up the router with dependencies
const initAuthRoutes = ({
  userRepository,
  refreshTokenRepository,
  passwordResetTokenRepository,
  features,
  usersData, // For file-based storage
  saveUsers, // For file-based storage
  logger,
  config
}) => {
  // Destructure config
  const {
    JWT_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY
  } = config;
  
  // Configure rate limiter
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per IP in the window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many login attempts, please try again later',
      status: 429,
      remainingTime: (req, res) => res.getHeader('Retry-After')
    }
  });
  
  // Auth middleware
  const authenticateToken = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      const err = new Error('Authentication required');
      err.status = 401;
      return next(err);
    }
    
    try {
      const user = jwt.verify(token, JWT_SECRET);
      req.user = user;
      next();
    } catch (error) {
      const err = new Error('Invalid or expired token');
      err.status = 403;
      return next(err);
    }
  };
  
  // Admin middleware
  const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      const err = new Error('Admin privileges required');
      err.status = 403;
      return next(err);
    }
    next();
  };
  
  // Login route - apply login rate limiter
  router.post('/login', loginLimiter, async (req, res, next) => {
    try {
      const { username, password } = req.body;
    
      if (!username || !password) {
        const err = new Error('Username and password required');
        err.status = 400;
        return next(err);
      }
      
      let user;
      let passwordMatch = false;
      
      // Get user based on storage type
      if (features.useMongoDB) {
        try {
          user = await userRepository.findByUsername(username);
          
          if (user) {
            // Add extra logging to debug password verification
            logger.info(`Starting password verification for user: ${username}`);
            passwordMatch = await user.verifyPassword(password);
            logger.info(`Password verification result: ${passwordMatch}`);
          }
        } catch (error) {
          logger.error(`MongoDB error during user authentication: ${error.message}`);
          logger.error(error.stack);
          
          // Fall back to file storage if MongoDB authentication fails
          logger.info('Falling back to file storage for this login attempt');
          user = usersData.users.find(u => u.username === username);
          
          if (user) {
            passwordMatch = await bcrypt.compare(password, user.passwordHash);
          }
        }
      } else {
        user = usersData.users.find(u => u.username === username);
        
        if (user) {
          passwordMatch = await bcrypt.compare(password, user.passwordHash);
        }
      }
      
      if (!user) {
        logger.warn(`Login attempt for non-existent user: ${username}`);
        const err = new Error('Invalid credentials');
        err.status = 401;
        return next(err);
      }
      
      if (!passwordMatch) {
        logger.warn(`Password mismatch for user: ${username}`);
        const err = new Error('Invalid credentials');
        err.status = 401;
        return next(err);
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
          parseInt(REFRESH_TOKEN_EXPIRY) || 7 // Days
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
        
        // Store refresh token in memory and file
        tokenId = Date.now().toString();
        usersData.refreshTokens[tokenId] = {
          token: refreshToken,
          username: user.username,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        };
        
        // Save the updated tokens to file
        saveUsers();
      }
      
      // Set cookies
      res.cookie('token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000, // 1 hour
        sameSite: 'strict' // Add CSRF protection
      });
      
      res.cookie('refreshToken', tokenId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/refresh-token', // Only sent to refresh endpoint
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'strict'
      });
      
      res.json({
        message: 'Login successful',
        user: {
          username: user.username,
          role: user.role
        },
        token: accessToken, // Include token in response for non-cookie environments
        expiresIn: 3600 // 1 hour in seconds
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Logout route
  router.post('/logout', async (req, res, next) => {
    try {
      // Get refresh token ID
      const refreshTokenId = req.cookies.refreshToken;
      
      if (refreshTokenId) {
        if (features.useMongoDB) {
          // Revoke the token in MongoDB
          await refreshTokenRepository.revokeToken(refreshTokenId);
        } else {
          // Remove refresh token from memory and file
          if (usersData.refreshTokens[refreshTokenId]) {
            delete usersData.refreshTokens[refreshTokenId];
            saveUsers();
          }
        }
      }
      
      // Clear all cookies
      res.clearCookie('token');
      res.clearCookie('refreshToken', { path: '/refresh-token' });
      
      res.json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  });
  
  // Refresh token endpoint
  router.post('/refresh-token', async (req, res, next) => {
    try {
      // Get refresh token ID from cookie
      const refreshTokenId = req.cookies.refreshToken;
      
      if (!refreshTokenId) {
        const err = new Error('Refresh token required');
        err.status = 401;
        return next(err);
      }
      
      let username;
      let isValid = false;
      
      if (features.useMongoDB) {
        // Validate token in MongoDB
        const token = await refreshTokenRepository.findByToken(refreshTokenId);
        
        if (token && !token.isRevoked && new Date() < token.expiresAt) {
          try {
            const payload = jwt.verify(token.token, REFRESH_TOKEN_SECRET);
            username = payload.username;
            isValid = true;
          } catch (error) {
            // Token verification failed, revoke it
            await refreshTokenRepository.revokeToken(refreshTokenId);
          }
        }
      } else {
        // Check token in memory
        const storedToken = usersData.refreshTokens[refreshTokenId];
        
        if (storedToken) {
          try {
            const payload = jwt.verify(storedToken.token, REFRESH_TOKEN_SECRET);
            username = payload.username;
            isValid = true;
          } catch (error) {
            // Token verification failed, remove it
            delete usersData.refreshTokens[refreshTokenId];
            saveUsers();
          }
        }
      }
      
      if (!isValid) {
        const err = new Error('Invalid refresh token');
        err.status = 401;
        return next(err);
      }
      
      // Get user data
      let user;
      
      if (features.useMongoDB) {
        user = await userRepository.findByUsername(username);
      } else {
        user = usersData.users.find(u => u.username === username);
      }
      
      if (!user) {
        const err = new Error('User not found');
        err.status = 401;
        return next(err);
      }
      
      // Create new access token
      const accessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRY }
      );
      
      // Set cookie with new access token
      res.cookie('token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000, // 1 hour
        sameSite: 'strict'
      });
      
      // Return new access token and user info
      res.json({
        message: 'Token refreshed successfully',
        user: {
          username: user.username,
          role: user.role
        },
        token: accessToken,
        expiresIn: 3600 // 1 hour in seconds
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Logout from all devices
  router.post('/logout-all', authenticateToken, async (req, res, next) => {
    try {
      const { username } = req.user;
      
      if (features.useMongoDB) {
        // Revoke all tokens for this user in MongoDB
        await refreshTokenRepository.revokeAllForUser(username);
      } else {
        // Remove all refresh tokens for this user from memory and file
        for (const id in usersData.refreshTokens) {
          if (usersData.refreshTokens[id].username === username) {
            delete usersData.refreshTokens[id];
          }
        }
        saveUsers();
      }
      
      // Clear cookies for current session
      res.clearCookie('token');
      res.clearCookie('refreshToken', { path: '/refresh-token' });
      
      res.json({ message: 'Logged out from all devices successfully' });
    } catch (error) {
      next(error);
    }
  });
  
  // Export middlewares for use in other routes
  router.authenticateToken = authenticateToken;
  router.requireAdmin = requireAdmin;

  return router;
};

module.exports = initAuthRoutes;
