/**
 * User Management Service
 * 
 * Provides methods for managing users through the Auth MCP service.
 * UPDATED: Fixed endpoints to match the actual Auth Server implementation
 */

import mcpApi from './mcp-api';

class UserManagementService {
  /**
   * Fetch all users from the Auth service
   * @returns {Promise<Array>} Array of user objects
   */
  async getAllUsers() {
    try {
      console.log('Fetching users from /users endpoint');
      try {
        // First try with admin-specific endpoint
        const response = await mcpApi.get('auth', '/admin/users');
        console.log('Fetched users from admin endpoint:', response);
        return this._processUsersList(response);
      } catch (adminError) {
        console.warn('Admin users endpoint failed:', adminError);
        
        // Fall back to standard users endpoint
        const response = await mcpApi.get('auth', '/users');
        console.log('Fetched users from standard endpoint:', response);
        return this._processUsersList(response);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  }
  
  /**
   * Process users list from different possible response formats
   * @private
   */
  _processUsersList(response) {
    // Handle different response formats
    let users = [];
    
    if (Array.isArray(response)) {
      users = response;
    } else if (response && response.users && Array.isArray(response.users)) {
      users = response.users;
    } else if (response && typeof response === 'object') {
      // Try to extract users from object response
      users = Object.values(response).filter(item => 
        item && typeof item === 'object' && item.username);
    }
    
    // Map to consistent format
    return users.map(user => ({
      id: user.id || user._id || user.username, // Use username as fallback ID
      username: user.username,
      email: user.email || '', 
      role: user.role || 'user',
      status: user.active !== undefined ? (user.active ? 'active' : 'inactive') : 'active',
      created: user.createdAt || user.created || '',
      lastLogin: user.lastLogin || ''
    }));
  }

  /**
   * Create a new user
   * @param {Object} userData User data including username, email, password, role
   * @returns {Promise<Object>} The created user object
   */
  async createUser(userData) {
    try {
      // Format the user data to match what the backend expects
      const formattedData = {
        username: userData.username,
        password: userData.password,
        email: userData.email || '',
        role: userData.role || 'user',
        displayName: userData.displayName || userData.username,
        active: userData.status === 'active'
      };
      
      console.log('Creating user with data:', formattedData);
      
      try {
        // Try admin endpoint first
        return await mcpApi.post('auth', '/admin/users', formattedData);
      } catch (adminError) {
        console.warn('Admin create user endpoint failed:', adminError);
        
        // Fall back to standard endpoint for user creation
        return await mcpApi.post('auth', '/users', formattedData);
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Update an existing user
   * @param {string} userId User ID or username to update
   * @param {Object} userData Updated user data
   * @returns {Promise<Object>} The updated user object
   */
  async updateUser(userId, userData) {
    try {
      // Format the user data to match what the backend expects
      const formattedData = {
        email: userData.email,
        role: userData.role,
        displayName: userData.displayName || userData.username,
        active: userData.status === 'active',
        preferences: userData.preferences || {}
      };
      
      // Add password only if provided (for password updates)
      if (userData.password) {
        formattedData.password = userData.password;
      }
      
      console.log(`Updating user ${userId} with data:`, formattedData);
      
      try {
        // Try admin endpoint first with ID
        return await mcpApi.put('auth', `/admin/users/${userId}`, formattedData);
      } catch (adminIdError) {
        console.warn(`Admin update user endpoint with ID failed:`, adminIdError);
        
        try {
          // Try admin endpoint with username
          const username = userData.username;
          return await mcpApi.put('auth', `/admin/users/${username}`, formattedData);
        } catch (adminUsernameError) {
          console.warn('Admin update user endpoint with username failed:', adminUsernameError);
          
          // Fall back to standard endpoints
          if (userId === userData.username) {
            return await mcpApi.put('auth', `/users/${userData.username}`, formattedData);
          } else {
            throw new Error('Cannot update user: user ID does not match username');
          }
        }
      }
    } catch (error) {
      console.error(`Failed to update user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a user
   * @param {string} userId User ID or username to delete
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteUser(userId) {
    try {
      console.log(`Deleting user ${userId}`);
      
      try {
        // Try admin endpoint first
        return await mcpApi.delete('auth', `/admin/users/${userId}`);
      } catch (adminError) {
        console.warn('Admin delete user endpoint failed:', adminError);
        
        // Fall back to username-based endpoint
        return await mcpApi.delete('auth', `/users/${userId}`);
      }
    } catch (error) {
      console.error(`Failed to delete user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get system configuration settings
   * @returns {Promise<Object>} System configuration object
   */
  async getSystemConfig() {
    try {
      // Try multiple endpoint patterns to find the right one
      const endpoints = [
        '/admin/config',
        '/config',
        '/system/config',
        '/system-config'
      ];
      
      let config = null;
      let lastError = null;
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying to fetch system config from ${endpoint}`);
          config = await mcpApi.get('auth', endpoint);
          console.log(`Successfully fetched system config from ${endpoint}:`, config);
          break;
        } catch (error) {
          console.warn(`Endpoint ${endpoint} failed:`, error);
          lastError = error;
        }
      }
      
      if (config) {
        return this._normalizeConfig(config);
      }
      
      throw lastError || new Error('All config endpoints failed');
    } catch (error) {
      console.error('Failed to fetch system configuration:', error);
      // Return default configuration instead of throwing
      return {
        systemName: 'MukkaAI',
        defaultModel: 'llama3',
        defaultTheme: 'System Default',
        defaultLanguage: 'English',
        allowRegistration: true,
        autoToolTriggering: true,
        welcomeMessage: 'Welcome to MukkaAI!'
      };
    }
  }
  
  /**
   * Normalize config object to expected format
   * @private
   */
  _normalizeConfig(config) {
    const normalizedConfig = {
      systemName: config.systemName || config.name || 'MukkaAI',
      defaultModel: config.defaultModel || config.model || 'llama3',
      defaultTheme: config.defaultTheme || config.theme || 'System Default',
      defaultLanguage: config.defaultLanguage || config.language || 'English',
      allowRegistration: 
        config.allowRegistration !== undefined ? config.allowRegistration : 
        config.registration !== undefined ? config.registration : true,
      autoToolTriggering: 
        config.autoToolTriggering !== undefined ? config.autoToolTriggering : 
        config.autoTools !== undefined ? config.autoTools : true,
      welcomeMessage: config.welcomeMessage || config.welcome || 'Welcome to MukkaAI!'
    };
    
    return normalizedConfig;
  }

  /**
   * Update system configuration
   * @param {Object} configData Updated configuration settings
   * @returns {Promise<Object>} Updated configuration
   */
  async updateSystemConfig(configData) {
    try {
      console.log('Updating system config with:', configData);
      
      // Try multiple HTTP methods and endpoints
      const attempts = [
        { method: 'put', endpoint: '/admin/config' },
        { method: 'post', endpoint: '/admin/config' },
        { method: 'put', endpoint: '/config' },
        { method: 'post', endpoint: '/config' },
        { method: 'put', endpoint: '/system/config' },
        { method: 'post', endpoint: '/system/config' }
      ];
      
      let lastError = null;
      
      for (const { method, endpoint } of attempts) {
        try {
          console.log(`Trying to update system config with ${method.toUpperCase()} to ${endpoint}`);
          
          if (method === 'put') {
            return await mcpApi.put('auth', endpoint, configData);
          } else {
            return await mcpApi.post('auth', endpoint, configData);
          }
        } catch (error) {
          console.warn(`Failed to update config with ${method.toUpperCase()} to ${endpoint}:`, error);
          lastError = error;
        }
      }
      
      throw lastError || new Error('All config update attempts failed');
    } catch (error) {
      console.error('Failed to update system configuration:', error);
      throw error;
    }
  }

  /**
   * Get system monitoring metrics
   * @returns {Promise<Object>} System metrics
   */
  async getSystemMetrics() {
    try {
      // Try multiple endpoints for metrics
      const endpoints = [
        '/metrics',
        '/admin/metrics',
        '/system/metrics',
        '/stats'
      ];
      
      let metrics = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying to fetch metrics from ${endpoint}`);
          metrics = await mcpApi.get('auth', endpoint);
          console.log(`Successfully fetched metrics from ${endpoint}:`, metrics);
          break;
        } catch (error) {
          console.warn(`Metrics endpoint ${endpoint} failed:`, error);
        }
      }
      
      if (metrics) {
        return this._normalizeMetrics(metrics);
      }
      
      // Return default values if all endpoints fail
      return {
        activeUsers: 0,
        conversations: 0,
        customAgents: 0
      };
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      // Return default values if API fails
      return {
        activeUsers: 0,
        conversations: 0,
        customAgents: 0
      };
    }
  }
  
  /**
   * Normalize metrics object to expected format
   * @private
   */
  _normalizeMetrics(metrics) {
    return {
      activeUsers: 
        metrics.activeUsers !== undefined ? metrics.activeUsers :
        metrics.active_users !== undefined ? metrics.active_users : 0,
      conversations: 
        metrics.conversations !== undefined ? metrics.conversations :
        metrics.total_conversations !== undefined ? metrics.total_conversations : 0,
      customAgents: 
        metrics.customAgents !== undefined ? metrics.customAgents :
        metrics.custom_agents !== undefined ? metrics.custom_agents : 0
    };
  }
}

// Create and export singleton instance
const userManagementService = new UserManagementService();
export default userManagementService;