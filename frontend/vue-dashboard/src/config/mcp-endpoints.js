/**
 * MukkaAI Services Configuration
 * 
 * This file contains the configuration for all MukkaAI service endpoints.
 * Update these values to match your Docker container setup.
 */

export const MCP_SERVICES = {
  // Base Server
  base: {
    name: 'Base Server',
    endpoint: 'http://localhost:8090',
    status: false,
    icon: 'mdi-server',
    description: 'Core server providing base functionality'
  },
  
  // Memory Server
  memory: {
    name: 'Memory Service',
    endpoint: 'http://localhost:8094',
    status: false,
    icon: 'mdi-memory',
    description: 'Knowledge graph and memory storage'
  },
  
  // Filesystem Server
  filesystem: {
    name: 'Filesystem Service',
    endpoint: 'http://localhost:8095',
    status: false,
    icon: 'mdi-folder',
    description: 'File browsing and management'
  },
  
  // Brave Search Server
  braveSearch: {
    name: 'Brave Search',
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
    endpoint: 'http://localhost:8097', // Using localhost from host machine to Docker container
    status: false,
    icon: 'mdi-shield-account',
    description: 'User authentication and management'
  },
  
  // Web UI
  webUi: {
    name: 'MukkaAI Web UI',
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
