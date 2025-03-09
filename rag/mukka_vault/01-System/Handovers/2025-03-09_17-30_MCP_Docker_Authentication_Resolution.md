---
title: MCP Docker Authentication Resolution
created: 2025-03-09 17:30:00
modified: 2025-03-09 17:30:00
tags:
  - handover
  - docker
  - authentication
  - networking
  - vue-dashboard
  - mukka-mcp-auth-server
  - resolution
status: completed
assignee: DevOps Team
---

# MCP Docker Authentication Resolution Handover

## Overview

This document provides a comprehensive summary of the issues encountered and resolved with the MCP platform's authentication system. The issue involved multiple components and was resolved through a series of targeted fixes across the Docker networking configuration, service registration, and Vue.js frontend rendering.

## Issue Background

Users attempting to log in to the MCP Dashboard were encountering the error message "Authentication service is currently unavailable", despite all services appearing to be running correctly. Additionally, the login form was not rendering properly, showing only the username field without the password field or login button.

## Root Causes Identified

1. **Docker Networking Configuration**: 
   - Nginx was configured to use `http://mcp-auth-server:8097` instead of the full container name `http://mukka-mcp-auth-server:8097`.
   - The Auth Server was registering itself with the Base Server using an incorrect service URL.

2. **Vue.js Frontend Issues**:
   - The login form template had malformed HTML with improperly nested elements.
   - The Auth Service discovery mechanism was not properly detecting the Auth Server through the Nginx proxy.

3. **Express Configuration Issues**:
   - The Express `trust proxy` setting was causing warnings with the rate-limiter package.

## Solution Implemented

### 1. Docker Networking and Service Registration Fixes

- Updated the Nginx configuration in the Vue Dashboard to use correct container references:
  ```diff
  # Proxy requests to MCP Auth Server
  location /api/auth/ {
  -   proxy_pass http://mcp-auth-server:8097/;
  +   proxy_pass http://mukka-mcp-auth-server:8097/;
  ```

- Modified the Auth Server's service registration URL:
  ```diff
  const registerWithBaseServer = async () => {
    try {
      const response = await axios.post(`${BASE_SERVER_URL}/services/register`, {
        name: 'auth',
  -     url: `http://mcp-auth-server:${PORT}`,
  +     url: `http://mukka-mcp-auth-server:${PORT}`,
  ```

- Updated docker-compose.yml to use build instructions for the Vue Dashboard instead of direct image references to prevent image reference issues.

### 2. Vue.js Frontend Fixes

- Completely rewrote the Login.vue template to fix structural issues:
  - Properly structured all form elements
  - Removed improperly nested transitions
  - Added debug information to display service status

- Enhanced the service discovery mechanism to check Auth Server health through the Nginx proxy:
  ```javascript
  // For Auth service, check through the proxy 
  if (serviceKey === 'auth' && window.location.hostname === 'localhost') {
    // Use the Nginx proxy to access auth service
    const proxyUrl = new URL(window.location.href);
    url = `${proxyUrl.protocol}//${proxyUrl.host}/api/auth${DISCOVERY_ENDPOINT}?ts=${timestamp}`;
  }
  ```

### 3. Express Configuration Improvements

- Updated the Auth Server's trust proxy configuration:
  ```javascript
  // More secure and specific proxy trust configuration
  app.set('trust proxy', 'loopback, linklocal, uniquelocal');
  ```

### 4. Maintenance and Recovery Scripts

- Created specialized rebuild scripts to handle Docker container and image issues:
  - `/home/mothership/mukka/scripts/rebuild-vue-dashboard.sh`
  - `/home/mothership/mukka/scripts/rebuild-auth-server.sh`
  - `/home/mothership/mukka/scripts/rebuild-all.sh`

## Current Status

All issues are now resolved:
- The Auth Server is properly registering with the Base Server
- The Vue Dashboard can communicate with the Auth Server
- The login form renders correctly with all fields and buttons
- Users can successfully authenticate with the default credentials (admin/admin123)

## Files Modified

1. **Frontend**
   - `/home/mothership/mukka/frontend/vue-dashboard/nginx.conf`
   - `/home/mothership/mukka/frontend/vue-dashboard/src/views/auth/Login.vue`
   - `/home/mothership/mukka/frontend/vue-dashboard/src/services/discovery.js`

2. **Backend**
   - `/home/mothership/mukka/backend/services/auth/src/index.js`

3. **Docker**
   - `/home/mothership/mukka/docker-compose.yml`

4. **Scripts and Documentation**
   - `/home/mothership/mukka/scripts/rebuild-vue-dashboard.sh`
   - `/home/mothership/mukka/scripts/rebuild-auth-server.sh`
   - `/home/mothership/mukka/scripts/rebuild-all.sh`
   - `/home/mothership/mukka/rag/mukka_vault/01-System/DevOps/Docker-Troubleshooting-Guide.md`

## Deployment Instructions

The fixed version is already deployed on the development server. To deploy to other environments:

1. Pull the latest code from the repository
2. Use the rebuild scripts to rebuild and restart the services:
   ```bash
   # For a full system rebuild
   ./scripts/rebuild-all.sh
   
   # For targeted rebuilds
   ./scripts/rebuild-vue-dashboard.sh
   ./scripts/rebuild-auth-server.sh
   ```

## Lessons Learned

1. **Docker Container Naming Convention**: Ensure consistent use of container names in Docker Compose and application configurations. Follow our standard:
   - Docker Compose service names: `mcp-<service>-server` (e.g., `mcp-auth-server`)
   - Container names: `mukka-mcp-<service>-server` (e.g., `mukka-mcp-auth-server`)

2. **Build vs. Image References**: Use build instructions instead of direct image references in docker-compose.yml for more stable deployments.

3. **Vue.js Template Structure**: Be careful with nested components and transitions in Vue templates as they can cause rendering issues.

4. **Service Discovery Testing**: Test both direct and proxy-based service discovery mechanisms during development.

## Further Recommendations

1. **Automated Testing**: Implement automated tests for the login flow and service discovery mechanism.

2. **Monitoring Implementation**: Add health check endpoints to all services and implement proper health checks in docker-compose.yml.

3. **Documentation Updates**: Keep the Docker troubleshooting guide updated with new issues and solutions.

## Contact Information

For any questions or issues related to this fix, please contact:
- DevOps Team: devops@mukka.example.com
- Frontend Team: frontend@mukka.example.com

## References

- [Auth Server Docker Networking Fix](/home/mothership/mukka/rag/mukka_vault/01-System/Handovers/2025-03-09_14-43_Auth_Server_Docker_Networking_Fix.md)
- [Auth Server Registration Fix](/home/mothership/mukka/rag/mukka_vault/01-System/Handovers/2025-03-09_16-55_Auth_Server_Registration_Fix.md)
- [Vue Login Form Fix](/home/mothership/mukka/rag/mukka_vault/01-System/Handovers/2025-03-09_17-15_Vue_Login_Form_Fix.md)
- [Docker Troubleshooting Guide](/home/mothership/mukka/rag/mukka_vault/01-System/DevOps/Docker-Troubleshooting-Guide.md)
