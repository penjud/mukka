/**
 * Password Reset Routes
 * Routes for password reset functionality in the MCP Auth Server
 */

const express = require('express');
const bcrypt = require('bcryptjs');

// Create router
const router = express.Router();

// Initialize function to set up the router with dependencies
const initPasswordResetRoutes = ({
  userRepository,
  passwordResetTokenRepository,
  refreshTokenRepository,
  features,
  usersData, // For file-based storage
  saveUsers, // For file-based storage
  logger
}) => {
  
  // Request password reset
  router.post('/forgot-password', async (req, res, next) => {
    try {
      const { username, email } = req.body;
      
      if (!username && !email) {
        const err = new Error('Username or email required');
        err.status = 400;
        return next(err);
      }
      
      // Find user by username or email
      let user;
      
      if (features.useMongoDB) {
        // Find user in MongoDB
        if (username) {
          user = await userRepository.findByUsername(username);
        } else if (email) {
          user = await userRepository.findByEmail(email);
        }
      } else {
        // Find user in memory
        user = usersData.users.find(u => 
          (username && u.username === username) || 
          (email && u.email === email)
        );
      }
      
      if (!user) {
        // Don't reveal user existence - always return success even if user not found
        // This is for security reasons to prevent username enumeration
        return res.json({ 
          message: 'If that account exists, a password reset link has been sent' 
        });
      }
      
      // Generate reset token
      let resetToken, expiresAt;
      
      if (features.useMongoDB) {
        // Generate token with repository
        const result = await passwordResetTokenRepository.generate(user.username, 60); // 60 minutes expiry
        resetToken = result.token;
        expiresAt = result.expiresAt;
      } else {
        // Generate unique reset token
        resetToken = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
        
        // Calculate expiry (1 hour)
        expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        
        // Store token with 1-hour expiry
        usersData.passwordResetTokens[resetToken] = {
          username: user.username,
          createdAt: new Date().toISOString(),
          expiresAt
        };
        
        saveUsers();
      }
      
      logger.info(`Generated password reset token for user: ${user.username}`);
      
      // In a real system, we'd send an email here with a link containing the token
      // For this implementation in development mode, return the token in the response
      // In production, NEVER return the actual token to the client
      if (process.env.NODE_ENV !== 'production') {
        return res.json({
          message: 'Password reset token generated',
          resetToken, // Only for development/testing
          resetLink: `http://localhost:3001/auth/reset-password?token=${resetToken}`
        });
      }
      
      res.json({ 
        message: 'If that account exists, a password reset link has been sent to the registered email address' 
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Reset password using token
  router.post('/reset-password', async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        const err = new Error('Token and new password required');
        err.status = 400;
        return next(err);
      }
      
      let username;
      let tokenValid = false;
      
      if (features.useMongoDB) {
        // Verify and consume token in MongoDB
        username = await passwordResetTokenRepository.verifyAndConsume(token);
        tokenValid = !!username;
      } else {
        // Check if token exists and is valid in memory
        const resetData = usersData.passwordResetTokens[token];
        
        if (resetData) {
          // Check if token is expired
          if (new Date(resetData.expiresAt) >= new Date()) {
            username = resetData.username;
            tokenValid = true;
          }
          
          // Remove used token regardless of expiry
          delete usersData.passwordResetTokens[token];
          saveUsers();
        }
      }
      
      if (!tokenValid) {
        const err = new Error('Invalid or expired token');
        err.status = 400;
        return next(err);
      }
      
      // Update password
      if (features.useMongoDB) {
        // Update password in MongoDB
        await userRepository.update(username, { password: newPassword });
        
        // Revoke all refresh tokens for this user for security
        await refreshTokenRepository.revokeAllForUser(username);
      } else {
        // Find user in memory
        const userIndex = usersData.users.findIndex(u => u.username === username);
        
        if (userIndex === -1) {
          const err = new Error('User not found');
          err.status = 404;
          return next(err);
        }
        
        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10);
        
        // Update user password
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
      
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      next(error);
    }
  });
  
  return router;
};

module.exports = initPasswordResetRoutes;
