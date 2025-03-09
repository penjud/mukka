---
title: Auth Server Docker Networking Fix - Resolution
created: 2025-03-09 16:45:00
modified: 2025-03-09 16:45:00
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

# Auth Server Docker Networking Fix - Resolution

## Overview

This document details the resolution of the authentication service connection issues between the Vue Dashboard and the Auth Server running in Docker containers. The original issue showed "Authentication service is currently unavailable" despite all services appearing to run correctly.

## Root Cause Analysis

After investigation, we identified the following root cause:

1. **Nginx Configuration Mismatch**: The Vue Dashboard's Nginx configuration was using an incorrect container reference for the Auth Server:
   - Incorrect: `proxy_pass http://mcp-auth-server:8097/;`
   - Correct: `proxy_pass http://mukka-mcp-auth-server:8097/;`

2. **Docker Image Reference Issues**: The Vue Dashboard container was using an outdated image reference, causing recreation issues when the container needed to be rebuilt.

## Solution Implemented

### 1. Nginx Configuration Fix

Updated the Nginx configuration file (`/home/mothership/mukka/frontend/vue-dashboard/nginx.conf`) to use the correct container name for the Auth Server:

```diff
# Proxy requests to MCP Auth Server
location /api/auth/ {
-   proxy_pass http://mcp-auth-server:8097/;
+   proxy_pass http://mukka-mcp-auth-server:8097/;
    proxy_set_header Host $host;
    # Other proxy settings...
}
```

### 2. Docker-Compose Configuration Enhancement

Modified the `docker-compose.yml` file to use build instructions instead of direct image references for the Vue Dashboard:

```diff
# Vue Dashboard - Primary User Interface
vue-dashboard:
-  image: mukka_vue-dashboard:latest
+  build:
+    context: ./frontend/vue-dashboard
+    dockerfile: Dockerfile
  container_name: mukka-vue-dashboard
  # Other settings...
```

### 3. Maintenance Scripts

Created two scripts to help manage and troubleshoot the Vue Dashboard and other Docker services:

1. **Vue Dashboard Rebuild Script** (`/home/mothership/mukka/scripts/rebuild-vue-dashboard.sh`):
   - Safely stops and removes the Vue Dashboard container
   - Cleans up dangling images
   - Rebuilds and restarts the Vue Dashboard

2. **Full MCP Rebuild Script** (`/home/mothership/mukka/scripts/rebuild-all.sh`):
   - Rebuilds all MCP services in the proper order
   - Provides feedback on the status of each container

### 4. Documentation

Created a comprehensive Docker troubleshooting guide (`/home/mothership/mukka/rag/mukka_vault/01-System/DevOps/Docker-Troubleshooting-Guide.md`) that includes:
   - Common Docker issues and solutions
   - Preventative measures
   - Debugging techniques
   - Reference information

## Current Status

- The Auth Server is properly connecting with the Vue Dashboard
- All MCP services are running correctly
- The Docker environment is more maintainable with better error recovery

## Next Steps

1. **Monitoring Implementation**:
   - Consider adding health check endpoints to all services
   - Implement proper health checks in docker-compose.yml

2. **Container Naming Standardization**:
   - Review and enforce consistent container naming throughout the system
   - Update all service discovery mechanisms to use the full container names

3. **Documentation Updates**:
   - Add Docker best practices to the developer onboarding guide
   - Document the container networking architecture

4. **Development Workflow Enhancement**:
   - Consider implementing a local development environment that's more resilient to Docker issues
   - Add GitLab CI/CD pipeline configurations for automated builds and testing

## Lessons Learned

1. Always use consistent naming conventions for container references
2. Prefer build instructions over direct image references in docker-compose.yml
3. Create automated scripts for common maintenance tasks
4. Document troubleshooting procedures for recurring issues

## References

- [Original Handover Document](/home/mothership/mukka/rag/mukka_vault/01-System/Handovers/2025-03-09_14-43_Auth_Server_Docker_Networking_Fix.md)
- [Docker Troubleshooting Guide](/home/mothership/mukka/rag/mukka_vault/01-System/DevOps/Docker-Troubleshooting-Guide.md)
- [Rebuild Scripts](/home/mothership/mukka/scripts/)
