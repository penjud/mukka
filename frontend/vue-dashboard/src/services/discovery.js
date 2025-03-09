/**
 * MCP Service Discovery Module
 * 
 * This module handles the discovery and health checking of MCP services.
 * It uses the configuration from mcp-endpoints.js and provides real-time
 * status updates using a reactive store.
 */

import { ref, reactive } from 'vue';
import { MCP_SERVICES, DISCOVERY_ENDPOINT, CHECK_INTERVAL } from '../config/mcp-endpoints';

// Create reactive store for service status
const serviceStore = reactive({
  services: { ...MCP_SERVICES },
  discoveryRunning: false,
  lastCheck: null
});

// Reactive flag to track overall system status
const systemReady = ref(false);

/**
 * Check a single service's health
 * @param {string} serviceKey - The service key in the MCP_SERVICES object
 * @returns {Promise<boolean>} - Whether the service is healthy
 */
async function checkServiceHealth(serviceKey) {
  const service = serviceStore.services[serviceKey];
  if (!service) return false;
  
  // For debugging
  console.log(`Checking health of ${service.name} at ${service.endpoint}${DISCOVERY_ENDPOINT}`);
  
  try {
    // Add a timestamp to prevent caching
    const timestamp = new Date().getTime();
    let url = `${service.endpoint}${DISCOVERY_ENDPOINT}?ts=${timestamp}`;
    
    // For Auth service, check through the proxy 
    if (serviceKey === 'auth' && window.location.hostname === 'localhost') {
      // Use the Nginx proxy to access auth service
      const proxyUrl = new URL(window.location.href);
      url = `${proxyUrl.protocol}//${proxyUrl.host}/api/auth${DISCOVERY_ENDPOINT}?ts=${timestamp}`;
      console.log(`Using proxy URL for auth service: ${url}`);
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      timeout: 3000 // 3 second timeout
    });
    
    const status = response.status >= 200 && response.status < 300;
    
    // For debugging
    console.log(`Service ${service.name} health check result: ${status}`);
    
    // Update service status
    serviceStore.services[serviceKey].status = status;
    return status;
  } catch (error) {
    console.warn(`Failed to connect to ${service.name}:`, error);
    serviceStore.services[serviceKey].status = false;
    return false;
  }
}

/**
 * Check the health of all configured services
 * @returns {Promise<Object>} - Object with service status results
 */
async function checkAllServices() {
  const results = {};
  let readyCount = 0;
  const requiredCount = Object.keys(serviceStore.services).length;
  
  for (const serviceKey in serviceStore.services) {
    results[serviceKey] = await checkServiceHealth(serviceKey);
    if (results[serviceKey]) readyCount++;
  }
  
  // Update system ready status
  systemReady.value = readyCount > 0;
  
  // Update last check timestamp
  serviceStore.lastCheck = new Date();
  
  return results;
}

/**
 * Start the service discovery process
 * Runs on an interval defined by CHECK_INTERVAL
 */
function startDiscovery() {
  if (serviceStore.discoveryRunning) return;
  
  serviceStore.discoveryRunning = true;
  
  // Run initial check
  checkAllServices();
  
  // Set up interval for continuous checking
  const intervalId = setInterval(() => {
    checkAllServices();
  }, CHECK_INTERVAL);
  
  // Store interval ID for potential cleanup
  serviceStore.intervalId = intervalId;
}

/**
 * Stop the service discovery process
 */
function stopDiscovery() {
  if (!serviceStore.discoveryRunning) return;
  
  clearInterval(serviceStore.intervalId);
  serviceStore.discoveryRunning = false;
  serviceStore.intervalId = null;
}

// Export reactive store and functions
export {
  serviceStore,
  systemReady,
  checkServiceHealth,
  checkAllServices,
  startDiscovery,
  stopDiscovery
};
