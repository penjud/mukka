/**
 * User Routes
 * Routes for user management in the MCP Auth Server
 */

const express = require('express');
const bcrypt = require('bcryptjs');

// Create router
const router = express.Router();

// Initialize function to set up the router with dependencies
const initUserRoutes = ({
  userRepository,
  refreshTokenRepository,
  features,
  usersData, // For file-based storage
  saveUsers, // For file-based storage
  logger,
  middlewares
}) => {
  const { authenticateToken, requireAdmin } = middlewares;
  
  // Get current user
  router.get('/me', authenticateToken, async (req, res, next) => {
    try {
      const { username } = req.user;
      let user;
      
      if (features.useMongoDB) {
        user = await userRepository.findByUsername(username);
        
        if (!user) {
          const err = new Error('User not found');
          err.status = 404;
          return next(err);
        }
        
        res.json({
          username: user.username,
          role: user.role,
          displayName: user.displayName,
          email: user.email,
          preferences: user.preferences
        });
      } else {
        user = usersData.users.find(u => u.username === username);
        
        if (!user) {
          const err = new Error('User not found');
          err.status = 404;
          return next(err);
        }
        
        res.json({
          username: user.username,
          role: user.role,
          displayName: user.displayName,
          email: user.email,
          preferences: user.preferences
        });
      }
    } catch (error) {
      next(error);
    }
  });
  
  // Update user profile
  router.put('/me', authenticateToken, async (req, res, next) => {
    try {
      const { username } = req.user;
      const updatableFields = ['displayName', 'email', 'preferences'];
      let updatedUser;
      
      // Create update object with allowed fields
      const updates = {};
      for (const field of updatableFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }
      
      if (features.useMongoDB) {
        // Update user in MongoDB
        updatedUser = await userRepository.update(username, updates);
        
        if (!updatedUser) {
          const err = new Error('User not found');
          err.status = 404;
          return next(err);
        }
      } else {
        // Update user in memory and file
        const userIndex = usersData.users.findIndex(u => u.username === username);
        
        if (userIndex === -1) {
          const err = new Error('User not found');
          err.status = 404;
          return next(err);
        }
        
        const user = usersData.users[userIndex];
        
        // Apply updates
        for (const [field, value] of Object.entries(updates)) {
          if (field === 'preferences') {
            user.preferences = {
              ...(user.preferences || {}),
              ...value
            };
          } else {
            user[field] = value;
          }
        }
        
        // Save changes
        if (!saveUsers()) {
          const err = new Error('Failed to save user data');
          err.status = 500;
          return next(err);
        }
        
        updatedUser = user;
      }
      
      // Return the updated user profile
      res.json({
        username: updatedUser.username,
        role: updatedUser.role,
        displayName: updatedUser.displayName,
        email: updatedUser.email,
        preferences: updatedUser.preferences
      });
    } catch (error) {
      next(error);
    }
  });
  
  // List users (admin only)
  router.get('/', authenticateToken, requireAdmin, async (req, res, next) => {
    try {
      let users;
      
      if (features.useMongoDB) {
        // Get users from MongoDB
        const options = {
          limit: req.query.limit ? parseInt(req.query.limit) : undefined,
          skip: req.query.skip ? parseInt(req.query.skip) : undefined,
          sort: req.query.sort
        };
        
        users = await userRepository.listAll(options);
        
        // Map to response format
        users = users.map(user => ({
          username: user.username,
          role: user.role,
          createdAt: user.createdAt
        }));
      } else {
        // Get users from memory
        users = usersData.users.map(user => ({
          username: user.username,
          role: user.role,
          createdAt: user.createdAt
        }));
      }
      
      res.json({ users });
    } catch (error) {
      next(error);
    }
  });
  
  // Create user (admin only)
  router.post('/', authenticateToken, requireAdmin, async (req, res, next) => {
    try {
      const { username, password, role = 'user', email, displayName } = req.body;
      
      if (!username || !password) {
        const err = new Error('Username and password required');
        err.status = 400;
        return next(err);
      }
      
      // Check if user already exists
      let userExists = false;
      
      if (features.useMongoDB) {
        userExists = await userRepository.usernameExists(username);
      } else {
        userExists = usersData.users.some(u => u.username === username);
      }
      
      if (userExists) {
        const err = new Error('Username already exists');
        err.status = 409;
        return next(err);
      }
      
      let newUser;
      
      if (features.useMongoDB) {
        // Create user in MongoDB
        newUser = await userRepository.create({
          username,
          password,
          role,
          email,
          displayName
        });
      } else {
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Create new user in memory and file
        newUser = {
          username,
          passwordHash,
          role,
          email,
          displayName,
          createdAt: new Date().toISOString()
        };
        
        usersData.users.push(newUser);
        
        if (!saveUsers()) {
          const err = new Error('Failed to save user data');
          err.status = 500;
          return next(err);
        }
      }
      
      res.status(201).json({
        message: 'User created successfully',
        user: {
          username: newUser.username,
          role: newUser.role,
          createdAt: newUser.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Delete user (admin only)
  router.delete('/:username', authenticateToken, requireAdmin, async (req, res, next) => {
    try {
      const { username } = req.params;
      
      let success = false;
      
      if (features.useMongoDB) {
        // Delete user from MongoDB
        success = await userRepository.delete(username);
        
        if (success) {
          // Also revoke all refresh tokens for this user
          await refreshTokenRepository.revokeAllForUser(username);
        }
      } else {
        // Delete user from memory and file
        const initialCount = usersData.users.length;
        usersData.users = usersData.users.filter(u => u.username !== username);
        
        success = usersData.users.length < initialCount;
        
        if (success) {
          // Also remove all refresh tokens for this user
          for (const id in usersData.refreshTokens) {
            if (usersData.refreshTokens[id].username === username) {
              delete usersData.refreshTokens[id];
            }
          }
          
          if (!saveUsers()) {
            const err = new Error('Failed to save user data');
            err.status = 500;
            return next(err);
          }
        }
      }
      
      if (!success) {
        const err = new Error('User not found');
        err.status = 404;
        return next(err);
      }
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  });
  
  // Change password
  router.put('/password', authenticateToken, async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const { username } = req.user;
      
      if (!currentPassword || !newPassword) {
        const err = new Error('Current and new passwords required');
        err.status = 400;
        return next(err);
      }
      
      let passwordMatch = false;
      
      if (features.useMongoDB) {
        // Verify password in MongoDB
        const user = await userRepository.findByUsername(username);
        
        if (!user) {
          const err = new Error('User not found');
          err.status = 404;
          return next(err);
        }
        
        passwordMatch = await user.verifyPassword(currentPassword);
        
        if (!passwordMatch) {
          const err = new Error('Current password is incorrect');
          err.status = 401;
          return next(err);
        }
        
        // Update password
        await userRepository.update(username, { password: newPassword });
        
        // Revoke all refresh tokens for security
        await refreshTokenRepository.revokeAllForUser(username);
      } else {
        // Verify password in memory
        const userIndex = usersData.users.findIndex(u => u.username === username);
        
        if (userIndex === -1) {
          const err = new Error('User not found');
          err.status = 404;
          return next(err);
        }
        
        const user = usersData.users[userIndex];
        passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        
        if (!passwordMatch) {
          const err = new Error('Current password is incorrect');
          err.status = 401;
          return next(err);
        }
        
        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10);
        
        // Update user
        usersData.users[userIndex].passwordHash = passwordHash;
        
        // Remove all refresh tokens for this user for security
        for (const id in usersData.refreshTokens) {
          if (usersData.refreshTokens[id].username === username) {
            delete usersData.refreshTokens[id];
          }
        }
        
        if (!saveUsers()) {
          const err = new Error('Failed to save user data');
          err.status = 500;
          return next(err);
        }
      }
      
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  });
  
  return router;
};

module.exports = initUserRoutes;
