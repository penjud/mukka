/**
 * MCP Services Configuration
 * 
 * This file contains the configuration for all MCP service endpoints.
 * Update these values to match your Docker container setup.
 */

export const MCP_SERVICES = {
  // Base MCP Server
  base: {
    name: 'Base MCP Server',
    endpoint: 'http://localhost:8090',
    status: false,
    icon: 'mdi-server',
    description: 'Core MCP server providing base functionality'
  },
  
  // Memory MCP Server
  memory: {
    name: 'Memory MCP',
    endpoint: 'http://localhost:8094',
    status: false,
    icon: 'mdi-memory',
    description: 'Knowledge graph and memory storage'
  },
  
  // Filesystem MCP Server
  filesystem: {
    name: 'Filesystem MCP',
    endpoint: 'http://localhost:8095',
    status: false,
    icon: 'mdi-folder',
    description: 'File browsing and management'
  },
  
  // Brave Search MCP Server
  braveSearch: {
    name: 'Brave Search MCP',
    endpoint: 'http://localhost:8096',
    status: false,
    icon: 'mdi-search-web',
    description: 'Web search integration'
  },
  
  // Ollama Bridge
  ollama: {
    name: 'Ollama Bridge',
    endpoint: 'http://localhost:8082',
    status: false,
    icon: 'mdi-brain',
    description: 'Local AI model integration'
  },
  
  // Authentication Server
  auth: {
    name: 'Auth Server',
    endpoint: 'http://localhost:8097',
    status: false,
    icon: 'mdi-shield-account',
    description: 'User authentication and management'
  },
  
  // Web UI
  webUi: {
    name: 'MCP Web UI',
    endpoint: 'http://localhost:3001',
    status: true,
    icon: 'mdi-monitor-dashboard',
    description: 'User interface'
  }
};

// Discovery endpoint for service health check
export const DISCOVERY_ENDPOINT = '/health';

// Service check interval in milliseconds
export const CHECK_INTERVAL = 30000;
