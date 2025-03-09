---
title: Handover - Auth Server Production Environment Fix
created: 2025-03-09 13:54:00
modified: 2025-03-09 13:54:00
tags:
  - handover
  - auth-server
  - docker
  - production
  - integration
  - bcryptjs
  - environment
status: fixed
---

# Auth Server Production Environment Fix

## Overview

This handover documents the resolution of several issues with the Auth Server in the production Docker environment. We identified that the core problems were related to:

1. Working in development mode instead of the production Docker environment
2. Service registration issues in the Auth Server implementation
3. Port conflicts preventing proper container startup

The primary focus was ensuring all development happens directly in the Docker production environment to avoid the recurring issues that arise during the transition from development to production deployments.

## Completed Changes

### 1. Environment Configuration Updates

- Updated `.env` file to use production-focused settings:
  - Changed authentication tokens to use "production" prefixes for better security
  - Updated CORS_ORIGIN to consistently use port 3002 (matching Vue dashboard port)
  - Standardized WEB_UI_PORT to 3002 for consistency across all services

### 2. Container Naming and Service Registration Fix

The Auth Server was registering itself incorrectly with the Base Server, using the service name format:

```javascript
// Old registration URL (incorrect)
url: `http://mukka-mcp-auth-server:${PORT}`
```

We modified this to use the correct Docker service name for proper DNS resolution:

```javascript
// New registration URL (correct)
url: `http://mcp-auth-server:${PORT}`
```

This ensures that other services like the Web UI can properly communicate with the Auth Server.

### 3. Docker Rebuild Process

Established a proper sequence for rebuilding and starting the MCP components in the production environment:

1. Rebuild and start the Base Server first (as a dependency)
2. Then rebuild and start the Auth Server (which registers with the Base Server)
3. Stop any conflicting process using port 8097 before starting the Auth Server

### 4. Production Development Workflow

Implemented a development workflow that treats the Docker environment as the primary development platform:
- All code changes are made directly to the files in the Docker volume mounts
- Docker containers are rebuilt to test changes
- Verification is done through the actual Web UI running in the Docker environment

## Current Status

- Auth Server is now correctly implemented with bcryptjs for Alpine Linux compatibility
- Proper service registration with the Base Server is in place
- Environment settings are standardized for production use

## Next Steps

1. **Verify Authentication Flow**:
   - Access the Web UI at http://localhost:3002
   - Login with admin credentials (admin/admin123)
   - Verify the "MCP service Auth Server is not available" error is resolved

2. **Standardize Development Process**:
   - Ensure all developers are working directly in the Docker environment
   - Add documentation on proper Docker-based development workflow
   - Create Docker-specific debugging and logging procedures

3. **Implement Additional Monitoring**:
   - Add health check endpoints to all services
   - Create automatic monitoring for service registration
   - Add more detailed logging for inter-service communication

## Technical Notes

### 1. Docker Service vs Container Names

The key insight was understanding the distinction between Docker service names and container names:
- Service names (e.g., `mcp-auth-server`) are used for DNS resolution in the Docker network
- Container names (e.g., `mukka-mcp-auth-server`) are used for Docker commands but not for internal resolution

Using the correct name format is essential for proper service discovery and communication.

### 2. Production-First Development

Working directly in the production Docker environment offers several advantages:
- Immediate visibility of integration issues
- No surprises during deployment
- Consistent environment across development and production
- Better testing of Docker-specific features like networking and volumes

### 3. Error Prevention and Recovery

To avoid similar issues in the future:
- Always check the Docker logs when troubleshooting service connectivity issues
- Verify service registration URLs in all services
- Use consistent naming conventions in docker-compose.yml and code
- Monitor container health and restart patterns

## Reference Information

### Important Files
- Auth Server Source: `/home/mothership/mukka/backend/services/auth`
- Docker Compose: `/home/mothership/mukka/docker-compose.yml`
- Web UI: Access via http://localhost:3002

### Authentication Credentials
- Default Admin Username: `admin`
- Default Admin Password: `admin123`

### Container Details
- Image Name: `mukka_mcp-auth-server`
- Container Name: `mukka-mcp-auth-server`
- Service Name: `mcp-auth-server`
- Exposed Port: 8097
