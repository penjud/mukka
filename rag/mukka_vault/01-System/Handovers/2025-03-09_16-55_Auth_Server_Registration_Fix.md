---
title: Auth Server Registration Fix
created: 2025-03-09 16:55:00
modified: 2025-03-09 16:55:00
tags:
  - handover
  - auth-server
  - docker
  - networking
  - vue-dashboard
  - authentication
  - resolution
status: completed
---

# Auth Server Registration Fix

## Overview

This document details an additional fix required to resolve the authentication service connection issues between the Vue Dashboard and the Auth Server. Despite the earlier fixes to the Nginx configuration, the Auth Server was still registering with the Base Server using an incorrect URL format.

## Root Cause Analysis

After further investigation, we identified the following issues:

1. **Incorrect Service Registration**: The Auth Server was registering itself with the Base Server using the service name format instead of the container name:
   - Incorrect: `http://mcp-auth-server:8097`
   - Correct: `http://mukka-mcp-auth-server:8097`

2. **Docker Image Reference Issues**: Similar to the Vue Dashboard, the Auth Server container was experiencing image reference issues during rebuilds.

## Solution Implemented

### 1. Service Registration URL Fix

Updated the service registration URL in the Auth Server's code (`/home/mothership/mukka/backend/services/auth/src/index.js`):

```diff
const registerWithBaseServer = async () => {
  try {
    const response = await axios.post(`${BASE_SERVER_URL}/services/register`, {
      name: 'auth',
-      url: `http://mcp-auth-server:${PORT}`,
+      url: `http://mukka-mcp-auth-server:${PORT}`,
      type: 'auth',
      description: 'MCP Authentication Server'
    });
    logger.info('Registered with base MCP server', response.data);
  } catch (error) {
    logger.error('Failed to register with base MCP server:', error.message);
    // Retry after delay
    setTimeout(registerWithBaseServer, 5000);
  }
};
```

### 2. Auth Server Rebuild Script

Created a dedicated script for safely rebuilding the Auth Server (`/home/mothership/mukka/scripts/rebuild-auth-server.sh`), similar to the Vue Dashboard rebuild script. This script:

- Safely stops and removes the Auth Server container
- Cleans up any dangling images
- Rebuilds and restarts the Auth Server
- Verifies its successful startup

### 3. Verified Service Registration

After implementing these changes, we verified that:
- The Auth Server registered correctly with the URL `http://mukka-mcp-auth-server:8097`
- The Vue Dashboard could successfully communicate with the Auth Server via its proxy configuration
- The health endpoint was accessible through the proxy

## Current Status

- The Auth Server is properly registering with the correct container name
- The Vue Dashboard can communicate with the Auth Server
- All services are running correctly

## Lessons Learned

1. **Consistent Naming is Critical**: Always ensure that Docker service references use the correct and consistent naming pattern throughout all configurations. For our system:
   - Service names in docker-compose.yml use the format: `mcp-<service>-server`
   - Container names use the format: `mukka-mcp-<service>-server`
   - Containers should always reference each other using the full container name

2. **Automated Rebuilding**: The specialized rebuild scripts make it much easier to recover from Docker image and container issues.

3. **Service Registration Verification**: Always verify service registration entries after making networking changes to ensure they contain the correct URLs.

## Additional Notes

The same solution implemented for the Auth Server may need to be applied to other services if they're experiencing similar issues. Review all service registration code to ensure consistency.

## Related Documentation

- [Original Handover Document](/home/mothership/mukka/rag/mukka_vault/01-System/Handovers/2025-03-09_14-43_Auth_Server_Docker_Networking_Fix.md)
- [First Resolution Document](/home/mothership/mukka/rag/mukka_vault/01-System/Handovers/2025-03-09_16-45_Auth_Server_Docker_Networking_Fix_Resolution.md)
- [Docker Troubleshooting Guide](/home/mothership/mukka/rag/mukka_vault/01-System/DevOps/Docker-Troubleshooting-Guide.md)
- [Rebuild Scripts](/home/mothership/mukka/scripts/)
