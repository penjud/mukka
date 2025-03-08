/**
 * MCP Service Monitoring Script
 * 
 * This script checks the status of all MCP services and reports their availability.
 * It can be run periodically to monitor service health.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Load MCP service configuration
const MCP_SERVICES = {
  base: {
    name: 'Base MCP Server',
    endpoint: 'http://localhost:8090',
    healthEndpoint: '/health'
  },
  memory: {
    name: 'Memory MCP',
    endpoint: 'http://localhost:8094',
    healthEndpoint: '/health'
  },
  filesystem: {
    name: 'Filesystem MCP',
    endpoint: 'http://localhost:8095',
    healthEndpoint: '/health'
  },
  braveSearch: {
    name: 'Brave Search MCP',
    endpoint: 'http://localhost:8096',
    healthEndpoint: '/health'
  },
  ollama: {
    name: 'Ollama Bridge',
    endpoint: 'http://localhost:8082',
    healthEndpoint: '/health'
  },
  webUi: {
    name: 'MCP Web UI',
    endpoint: 'http://localhost:3001',
    healthEndpoint: '/'
  },
  vueUi: {
    name: 'Vue Dashboard',
    endpoint: 'http://localhost:3002',
    healthEndpoint: '/'
  }
};

/**
 * Check health of a single service
 * @param {Object} service - Service configuration object
 * @returns {Promise<boolean>} - Whether the service is healthy
 */
async function checkServiceHealth(service) {
  return new Promise((resolve) => {
    const url = `${service.endpoint}${service.healthEndpoint}`;
    const isHttps = url.startsWith('https');
    const requester = isHttps ? https : http;
    
    // Add a timeout to avoid hanging
    const req = requester.get(url, { timeout: 3000 }, (res) => {
      const status = res.statusCode >= 200 && res.statusCode < 300;
      resolve(status);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Check health of all services
 * @returns {Promise<Object>} - Object with service status results
 */
async function checkAllServices() {
  const results = {};
  
  for (const [key, service] of Object.entries(MCP_SERVICES)) {
    console.log(`Checking ${service.name}...`);
    results[key] = await checkServiceHealth(service);
    console.log(`  ${service.name}: ${results[key] ? 'ONLINE' : 'OFFLINE'}`);
  }
  
  return results;
}

/**
 * Save results to a JSON file
 * @param {Object} results - Service check results
 */
function saveResults(results) {
  const timestamp = new Date().toISOString();
  const data = {
    timestamp,
    results
  };
  
  const filePath = path.join(__dirname, 'service-status.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Results saved to ${filePath}`);
}

// Run the checks
checkAllServices()
  .then(results => {
    saveResults(results);
    
    // Check if any critical services are down
    const criticalServices = ['base', 'memory', 'filesystem'];
    const downServices = criticalServices.filter(s => !results[s]);
    
    if (downServices.length > 0) {
      console.error('ALERT: Critical services are down!');
      downServices.forEach(s => console.error(`  - ${MCP_SERVICES[s].name}`));
      process.exit(1);
    } else {
      console.log('All critical services are running.');
      process.exit(0);
    }
  })
  .catch(error => {
    console.error('Error running service checks:', error);
    process.exit(1);
  });
