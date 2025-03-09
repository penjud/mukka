---
title: Service Discovery Fix for Auth Server
created: 2025-03-09 17:05:00
modified: 2025-03-09 17:05:00
tags:
  - handover
  - auth-server
  - docker
  - networking
  - vue-dashboard
  - authentication
  - discovery
  - resolution
status: completed
---

# Service Discovery Fix for Auth Server

## Overview

This document details the final fixes required to resolve the authentication service connection issues with the Vue Dashboard. Despite previous fixes to the Nginx configuration and Auth Server registration, the Vue Dashboard was still showing the "Authentication service is currently unavailable" error.

## Root Cause Analysis

After deeper investigation, we identified the following core issues:

1. **Service Discovery Mechanism**: The Vue Dashboard's service discovery mechanism was checking the Auth Server's health endpoint directly at `http://localhost:8097/health` instead of using the Nginx proxy at `http://localhost:3002/api/auth/health`.

2. **Express Rate Limiter Warning**: The Auth Server was generating warnings about X-Forwarded-For headers because Express was not configured to trust proxies.

3. **Different Direct vs. Proxy Access**: While the Auth Server and its API endpoints were accessible directly, the Vue Dashboard's service discovery was failing because it didn't use the same path as the actual API calls.

## Solution Implemented

### 1. Fixed Express Proxy Trust Setting

Updated the Auth Server (`/home/mothership/mukka/backend/services/auth/src/index.js`) to trust proxies:

```javascript
// Create Express app
const app = express();

// Trust proxy - needed for proper handling of X-Forwarded-For headers
app.set('trust proxy', true);
```

This fixed the X-Forwarded-For header warnings that were occurring when requests passed through the Nginx proxy.

### 2. Enhanced Service Discovery Mechanism

Modified the Vue Dashboard's service discovery mechanism (`/home/mothership/mukka/frontend/vue-dashboard/src/services/discovery.js`) to use the Nginx proxy for Auth Server health checks:

```javascript
// For Auth service, check through the proxy 
if (serviceKey === 'auth' && window.location.hostname === 'localhost') {
  // Use the Nginx proxy to access auth service
  const proxyUrl = new URL(window.location.href);
  url = `${proxyUrl.protocol}//${proxyUrl.host}/api/auth${DISCOVERY_ENDPOINT}?ts=${timestamp}`;
  console.log(`Using proxy URL for auth service: ${url}`);
}
```

This ensures that the Auth Server health check follows the same path as the actual API calls, making the discovery mechanism consistent with real usage.

### 3. Added Debug Logging

Added detailed logging to the service discovery process to help with future troubleshooting:

```javascript
// For debugging
console.log(`Checking health of ${service.name} at ${service.endpoint}${DISCOVERY_ENDPOINT}`);

// Later in the code...
console.log(`Service ${service.name} health check result: ${status}`);
```

## Current Status

- The Auth Server is now properly detected by the Vue Dashboard's service discovery mechanism
- The login functionality should now be working correctly
- All error messages about the authentication service being unavailable should be gone

## Key Lessons Learned

1. **Consistency in Service Access**: When a service is accessed through a proxy in production code, the same proxy path should be used for service discovery and health checks.

2. **Trust Proxy Setting**: Express applications behind proxies must have the 'trust proxy' setting enabled to correctly handle forwarded headers.

3. **Debug Logging**: Adding detailed logging to service discovery mechanisms can greatly help in diagnosing connectivity issues.

4. **Docker Network Complexity**: Containerized applications need different URLs based on whether they're accessed from within the Docker network or from outside (browser).

## Additional Recommendations

1. **Health Check Standardization**: Standardize how health checks are performed across all services to ensure consistency.

2. **Service Discovery Enhancement**: Consider adding retry mechanisms and fallback options to the service discovery to make it more resilient.

3. **Logging Strategy**: Implement a centralized logging strategy for easier troubleshooting of cross-service issues.

## Reference Information

- Updated Auth Server: `/home/mothership/mukka/backend/services/auth/src/index.js`
- Updated Service Discovery: `/home/mothership/mukka/frontend/vue-dashboard/src/services/discovery.js`
- Documentation: `/home/mothership/mukka/rag/mukka_vault/01-System/DevOps/Docker-Troubleshooting-Guide.md`

This fix completes the resolution of the authentication service issues. The system should now be fully functional.
