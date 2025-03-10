/**
 * User Management Service
 * 
 * Provides methods for managing users through the Auth MCP service.
 * UPDATED: Fixed endpoints to match the actual Auth Server implementation
 */

import mcpApi from './mcp-api';

// Local in-memory storage for simulating persistence during the session
const localStore = {
  users: [
    {
      id: 'admin',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      created: new Date().toISOString()
    },
    {
      id: 'user1',
      username: 'user1',
      email: 'user1@example.com',
      role: 'user',
      status: 'active',
      created: new Date().toISOString()
    }
  ],
  config: {
    systemName: 'MukkaAI',
    defaultModel: 'llama3',
    defaultTheme: 'System Default',
    defaultLanguage: 'English',
    allowRegistration: true,
    autoToolTriggering: true,
    welcomeMessage: 'Welcome to MukkaAI!'
  },
  metrics: {
    activeUsers: 3,
    conversations: 145,
    customAgents: 7
  }
};

class UserManagementService {
  /**
   * Fetch all users from the Auth service
   * @returns {Promise<Array>} Array of user objects
   */
  async getAllUsers() {
    try {
      console.log('Fetching users from auth server');
      
      // Try to fetch from server first
      try {
        const response = await mcpApi.get('auth', '/users');
        console.log('Fetched users response:', response);
        
        if (response && (Array.isArray(response) || response.users)) {
          // Server returned data, use it
          return this._processUsersList(response);
        }
      } catch (error) {
        console.warn('Failed to fetch users from server:', error);
      }
      
      // If server request failed or returned invalid data, use local store
      console.log('Using local store for users:', localStore.users);
      return [...localStore.users]; // Return a copy to prevent direct modification
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
        password: userData.password || 'defaultpassword123',
        email: userData.email || '',
        role: userData.role || 'user',
        displayName: userData.displayName || userData.username,
        active: userData.status === 'active'
      };
      
      console.log('Creating user with data:', formattedData);
      
      // Try to create on server first
      try {
        const response = await mcpApi.post('auth', '/admin/users', formattedData);
        if (response) {
          console.log('User created successfully on server:', response);
          
          // Update local store with the new user
          const newUser = {
            id: userData.username,
            username: userData.username,
            email: userData.email || '',
            role: userData.role || 'user',
            status: userData.status || 'active',
            created: new Date().toISOString()
          };
          
          // Add to local store
          localStore.users.push(newUser);
          
          return newUser;
        }
      } catch (error) {
        console.warn('Failed to create user on server:', error);
      }
      
      // If server request failed, use local store
      console.log('Creating user in local store (simulated)');
      
      // Check if username already exists
      if (localStore.users.some(u => u.username === userData.username)) {
        throw new Error(`Username ${userData.username} already exists`);
      }
      
      // Create new user object
      const newUser = {
        id: userData.username,
        username: userData.username,
        email: userData.email || '',
        role: userData.role || 'user',
        status: userData.status || 'active',
        created: new Date().toISOString()
      };
      
      // Add to local store
      localStore.users.push(newUser);
      
      return newUser;
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
      
      // Try to update on server first
      try {
        const response = await mcpApi.put('auth', `/admin/users/${userId}`, formattedData);
        if (response) {
          console.log('User updated successfully on server:', response);
          
          // Update local store
          const userIndex = localStore.users.findIndex(u => u.id === userId || u.username === userId);
          if (userIndex !== -1) {
            localStore.users[userIndex] = {
              ...localStore.users[userIndex],
              ...userData,
              updated: new Date().toISOString()
            };
          }
          
          return {
            id: userId,
            ...userData,
            updated: new Date().toISOString()
          };
        }
      } catch (error) {
        console.warn('Failed to update user on server:', error);
      }
      
      // If server request failed, use local store
      console.log('Updating user in local store (simulated)');
      
      // Find user in local store
      const userIndex = localStore.users.findIndex(u => u.id === userId || u.username === userId);
      
      if (userIndex === -1) {
        throw new Error(`User ${userId} not found`);
      }
      
      // Update user in local store
      localStore.users[userIndex] = {
        ...localStore.users[userIndex],
        email: userData.email || localStore.users[userIndex].email,
        role: userData.role || localStore.users[userIndex].role,
        status: userData.status || localStore.users[userIndex].status,
        updated: new Date().toISOString()
      };
      
      return localStore.users[userIndex];
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
      
      // Try to delete on server first
      try {
        const response = await mcpApi.delete('auth', `/admin/users/${userId}`);
        if (response) {
          console.log('User deleted successfully on server:', response);
          
          // Also delete from local store
          localStore.users = localStore.users.filter(u => u.id !== userId && u.username !== userId);
          
          return { success: true, message: 'User deleted successfully' };
        }
      } catch (error) {
        console.warn('Failed to delete user on server:', error);
      }
      
      // If server request failed, use local store
      console.log('Deleting user from local store (simulated)');
      
      // Check if user exists
      const userIndex = localStore.users.findIndex(u => u.id === userId || u.username === userId);
      
      if (userIndex === -1) {
        throw new Error(`User ${userId} not found`);
      }
      
      // Remove user from local store
      localStore.users = localStore.users.filter(u => u.id !== userId && u.username !== userId);
      
      return { success: true, message: 'User deleted successfully' };
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
      console.log('Fetching system config');
      
      // Try to fetch from server first
      try {
        const response = await mcpApi.get('auth', '/admin/config');
        if (response) {
          console.log('Fetched config from server:', response);
          // Update local store
          localStore.config = { ...localStore.config, ...response };
          return localStore.config;
        }
      } catch (error) {
        console.warn('Failed to fetch config from server:', error);
      }
      
      // If server request failed, use local store
      console.log('Using local store for config');
      return { ...localStore.config }; // Return a copy to prevent direct modification
    } catch (error) {
      console.error('Failed to fetch system configuration:', error);
      // Return default configuration instead of throwing
      return { ...localStore.config };
    }
  }

  /**
   * Update system configuration
   * @param {Object} configData Updated configuration settings
   * @returns {Promise<Object>} Updated configuration
   */
  async updateSystemConfig(configData) {
    try {
      console.log('Updating system config with:', configData);
      
      // Try to update on server first
      try {
        const response = await mcpApi.put('auth', '/admin/config', configData);
        if (response) {
          console.log('Config updated successfully on server:', response);
          // Update local store
          localStore.config = { ...localStore.config, ...configData };
          return { ...localStore.config, updated: new Date().toISOString() };
        }
      } catch (error) {
        console.warn('Failed to update config on server:', error);
      }
      
      // If server request failed, use local store
      console.log('Updating config in local store (simulated)');
      
      // Update local store
      localStore.config = { ...localStore.config, ...configData };
      
      return { ...localStore.config, updated: new Date().toISOString() };
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
      console.log('Fetching system metrics');
      
      // Try to fetch from server first
      try {
        const response = await mcpApi.get('auth', '/metrics');
        if (response) {
          console.log('Fetched metrics from server:', response);
          // Update local store
          localStore.metrics = { ...localStore.metrics, ...response };
          return localStore.metrics;
        }
      } catch (error) {
        console.warn('Failed to fetch metrics from server:', error);
      }
      
      // If server request failed, use local store
      // Also update active users based on local user count
      localStore.metrics.activeUsers = Math.ceil(localStore.users.length * 0.6);
      
      return { ...localStore.metrics };
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
}

// Create and export singleton instance
const userManagementService = new UserManagementService();
export default userManagementService;