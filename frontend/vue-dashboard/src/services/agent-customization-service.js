/**
 * Agent Customization Service
 * 
 * Provides methods for interacting with the agent customization API endpoints.
 */

import mcpApi from './mcp-api';

class AgentCustomizationService {
  /**
   * Get the customization flow configuration
   * @returns {Promise<Object>} Customization flow configuration
   */
  async getCustomizationFlow() {
    try {
      return await mcpApi.get('auth', '/agents/customization-flow');
    } catch (error) {
      console.error('Error getting customization flow:', error);
      throw error;
    }
  }

  /**
   * Get the quick edit configuration
   * @returns {Promise<Object>} Quick edit configuration
   */
  async getQuickEditConfig() {
    try {
      return await mcpApi.get('auth', '/agents/quick-edit-config');
    } catch (error) {
      console.error('Error getting quick edit config:', error);
      throw error;
    }
  }

  /**
   * Get the template forking configuration
   * @returns {Promise<Object>} Template forking configuration
   */
  async getTemplateForkingConfig() {
    try {
      return await mcpApi.get('auth', '/agents/template-forking-config');
    } catch (error) {
      console.error('Error getting template forking config:', error);
      throw error;
    }
  }

  /**
   * Get all available templates
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Available templates
   */
  async getTemplates(options = {}) {
    try {
      const queryParams = {};
      if (options.page) queryParams.page = options.page;
      if (options.limit) queryParams.limit = options.limit;
      if (options.sortBy) queryParams.sortBy = options.sortBy;
      if (options.sortDir) queryParams.sortDir = options.sortDir;
      if (options.category) queryParams.category = options.category;
      
      return await mcpApi.get('auth', '/agents/templates', queryParams);
    } catch (error) {
      console.error('Error getting templates:', error);
      throw error;
    }
  }

  /**
   * Get all available personality traits
   * @returns {Promise<Array>} Personality traits
   */
  async getPersonalityTraits() {
    try {
      // This endpoint is included in the customization flow, but we provide a direct method
      const response = await this.getCustomizationFlow();
      return response.personalityTraits || [];
    } catch (error) {
      console.error('Error getting personality traits:', error);
      return [];
    }
  }

  /**
   * Get all available knowledge domains
   * @returns {Promise<Array>} Knowledge domains
   */
  async getKnowledgeDomains() {
    try {
      // This endpoint is included in the customization flow, but we provide a direct method
      const response = await this.getCustomizationFlow();
      return response.knowledgeDomains || [];
    } catch (error) {
      console.error('Error getting knowledge domains:', error);
      return [];
    }
  }

  /**
   * Create a new agent
   * @param {Object} agentData - Agent data
   * @returns {Promise<Object>} Created agent
   */
  async createAgent(agentData) {
    try {
      return await mcpApi.post('auth', '/agents', agentData);
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  }

  /**
   * Create an agent from a template
   * @param {String} templateId - Template ID
   * @param {Object} customizations - Customizations to apply
   * @returns {Promise<Object>} Created agent
   */
  async createFromTemplate(templateId, customizations) {
    try {
      return await mcpApi.post('auth', '/agents/from-template', {
        templateId,
        customizations
      });
    } catch (error) {
      console.error('Error creating from template:', error);
      throw error;
    }
  }

  /**
   * Fork an existing agent
   * @param {String} agentId - Agent ID to fork
   * @param {Object} customizations - Customizations to apply
   * @returns {Promise<Object>} Forked agent
   */
  async forkAgent(agentId, customizations) {
    try {
      return await mcpApi.post(`auth`, `/agents/${agentId}/fork`, customizations);
    } catch (error) {
      console.error('Error forking agent:', error);
      throw error;
    }
  }

  /**
   * Get version history for an agent
   * @param {String} agentId - Agent ID
   * @returns {Promise<Array>} Version history
   */
  async getVersionHistory(agentId) {
    try {
      const response = await mcpApi.get('auth', `/agents/versions/${agentId}`);
      return response.versions || [];
    } catch (error) {
      console.error('Error getting version history:', error);
      return [];
    }
  }

  /**
   * Upload an avatar for an agent
   * @param {File} file - Avatar file
   * @returns {Promise<String>} Avatar URL
   */
  async uploadAvatar(file) {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Get filesystem service endpoint
      const filesystemService = window.serviceStore.services['filesystem'];
      if (!filesystemService || !filesystemService.status) {
        throw new Error('Filesystem service not available');
      }
      
      // Upload the file
      const uploadUrl = filesystemService.endpoint + '/uploads/avatar';
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Return the avatar URL
      return filesystemService.endpoint + result.filePath;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const agentCustomizationService = new AgentCustomizationService();
export default agentCustomizationService;
