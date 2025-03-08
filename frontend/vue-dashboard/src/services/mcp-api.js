/**
 * MCP API Service
 * 
 * Provides unified access to all MCP services through a single interface.
 * Handles authentication, request formatting, and error handling.
 */

import { serviceStore } from './discovery';

class McpApiService {
  constructor() {
    this.authToken = null;
  }

  /**
   * Set authentication token for API requests
   * @param {string} token - Authentication token
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Get headers for API requests including authentication if available
   * @returns {Object} - Headers object
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Make a request to an MCP service
   * @param {string} serviceKey - Key of the service in MCP_SERVICES
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} - Response data
   */
  async request(serviceKey, endpoint, options = {}) {
    const service = serviceStore.services[serviceKey];
    
    if (!service) {
      throw new Error(`Unknown MCP service: ${serviceKey}`);
    }

    if (!service.status) {
      throw new Error(`MCP service ${service.name} is not available`);
    }

    const url = `${service.endpoint}${endpoint}`;
    
    // Merge default headers with provided options
    const fetchOptions = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(url, fetchOptions);
      
      // Handle non-2xx responses
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      
      // Parse JSON response if available
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      // Return text for non-JSON responses
      return await response.text();
    } catch (error) {
      console.error(`MCP API Error (${serviceKey}/${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Make a GET request to an MCP service
   * @param {string} serviceKey - Key of the service in MCP_SERVICES
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} params - URL parameters
   * @returns {Promise<Object>} - Response data
   */
  async get(serviceKey, endpoint, params = {}) {
    // Convert params to URL query string
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(serviceKey, url, { method: 'GET' });
  }

  /**
   * Make a POST request to an MCP service
   * @param {string} serviceKey - Key of the service in MCP_SERVICES
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} data - Request body data
   * @returns {Promise<Object>} - Response data
   */
  async post(serviceKey, endpoint, data = {}) {
    return this.request(serviceKey, endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Make a PUT request to an MCP service
   * @param {string} serviceKey - Key of the service in MCP_SERVICES
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} data - Request body data
   * @returns {Promise<Object>} - Response data
   */
  async put(serviceKey, endpoint, data = {}) {
    return this.request(serviceKey, endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * Make a DELETE request to an MCP service
   * @param {string} serviceKey - Key of the service in MCP_SERVICES
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} - Response data
   */
  async delete(serviceKey, endpoint) {
    return this.request(serviceKey, endpoint, {
      method: 'DELETE'
    });
  }

  /**
   * Create an SSE (Server-Sent Events) connection to an MCP service
   * @param {string} serviceKey - Key of the service in MCP_SERVICES
   * @param {string} endpoint - API endpoint for SSE stream
   * @param {Function} onMessage - Callback for received messages
   * @param {Function} onError - Callback for errors
   * @returns {EventSource} - EventSource object
   */
  createSSEConnection(serviceKey, endpoint, onMessage, onError) {
    const service = serviceStore.services[serviceKey];
    
    if (!service) {
      throw new Error(`Unknown MCP service: ${serviceKey}`);
    }

    if (!service.status) {
      throw new Error(`MCP service ${service.name} is not available`);
    }

    const url = `${service.endpoint}${endpoint}`;
    
    // Create new EventSource for SSE connection
    const eventSource = new EventSource(url);
    
    // Set up event handlers
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
        onMessage(event.data);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      if (onError) onError(error);
    };
    
    return eventSource;
  }
}

// Create and export singleton instance
const mcpApi = new McpApiService();
export default mcpApi;
