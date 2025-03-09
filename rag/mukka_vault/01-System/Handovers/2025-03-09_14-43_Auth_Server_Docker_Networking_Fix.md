---
title: Handover - Auth Server Docker Networking Fix
created: 2025-03-09 14:43:00
modified: 2025-03-09 14:43:00
tags:
  - handover
  - auth-server
  - docker
  - networking
  - vue-dashboard
  - authentication
  - troubleshooting
status: in-progress
---

# Auth Server Docker Networking Fix

## Overview

This handover documents our troubleshooting efforts to fix the authentication service connection issues between the Vue Dashboard and the Auth Server running in Docker containers. The Dashboard is displaying "Authentication service is currently unavailable" despite all services appearing to run correctly.

## Current Status

### What's Working
- All MCP services are running in Docker containers
- Auth Server is properly registering with the Base Server
- Auth Server logs indicate successful startup and MongoDB connection
- Services can communicate with each other within the Docker network

### What's Not Working
- Vue Dashboard cannot connect to the Auth Server
- Dashboard shows "Authentication service is currently unavailable"
- User login is not possible

## Technical Details

### Container Configuration
- Auth Server container IP: 172.18.0.7
- Vue Dashboard container IP: 172.18.0.8
- Both containers are on the `mukka_mukka-network` bridge network
- Auth Server is correctly registering with Base Server using service name `mcp-auth-server`

### Potential Issues Identified
1. **Dashboard Configuration**: The Vue Dashboard may be configured to look for Auth Server at incorrect URL
2. **CORS Configuration**: Possible CORS issues preventing the Dashboard from accessing the Auth Server
3. **Network Communication**: Docker bridge network might not be allowing proper communication
4. **Nginx Configuration**: The Vue Dashboard's Nginx proxy configuration might have incorrect routing

## Investigation Progress

We've made significant progress in understanding and addressing several aspects of the issue:

1. **Docker Compose Simplification**
   - Removed problematic volume mounts that were causing `ContainerConfig` errors
   - Created a simplified `docker-compose.yml` that allows all services to start

2. **Service Registration Fix**
   - Updated Auth Server code to register with Base Server using proper service name format
   - Confirmed successful registration via Base Server `/services` endpoint

3. **Network Analysis**
   - Identified container IPs and confirmed they're on the same network
   - Verified Auth Server is accessible within the Docker network

4. **Docker Environment**
   - Eliminated port conflicts by properly shutting down previous instances
   - Ensured Auth Server is running with correct environment variables

## Next Steps

The following tasks need to be addressed in the next session:

1. **Vue Dashboard Frontend Configuration**
   - Check the frontend code for how it's attempting to connect to the Auth Server
   - Verify if the frontend is using the correct URL format for service discovery
   - May need to inspect `/frontend/vue-dashboard/src/services/discovery.js`

2. **Nginx Proxy Configuration**
   - Review the Vue Dashboard's Nginx configuration (`nginx.conf`)
   - Ensure it's correctly proxying requests to the Auth Server
   - Consider updating proxy paths from `http://mukka-mcp-auth-server:8097/` to `http://mcp-auth-server:8097/`

3. **Dashboard Health Check**
   - Implement detailed logging in the Vue Dashboard to show exactly where the connection is failing
   - Add a test endpoint in the Auth Server to verify direct connectivity

4. **Environment Variables**
   - Verify the Vue Dashboard container has all necessary environment variables
   - Consider hardcoding service URLs for testing

## Documentation Updates

We should update the following documentation:

1. **Docker Configuration Guide**
   - Document the correct service naming convention for Docker services
   - Clarify the difference between container names and service names for DNS resolution

2. **Development Environment Setup**
   - Update to ensure all developers use consistent Docker-based workflow
   - Include troubleshooting steps for common connection issues

3. **Vue Dashboard Configuration**
   - Document the correct way to configure service discovery in the Dashboard
   - Provide examples of valid service URLs

## Reference Information

### Important Files
- Auth Server Source: `/home/mothership/mukka/backend/services/auth`
- Vue Dashboard Source: `/home/mothership/mukka/frontend/vue-dashboard`
- Docker Compose: `/home/mothership/mukka/docker-compose.yml`
- Vue Dashboard Nginx Config: `/home/mothership/mukka/frontend/vue-dashboard/nginx.conf`

### Container Details
- Auth Server Container: `mukka-mcp-auth-server` (service: `mcp-auth-server`)
- Vue Dashboard Container: `mukka-vue-dashboard`
- Base Server Container: `mukka-mcp-base-server` (service: `mcp-base-server`)

### Other Considerations
- Check if MongoDB is accessible from the Auth Server container
- Verify that the Auth Server is returning proper CORS headers
- Consider trying direct non-Docker deployment for comparison

## Conclusion

The MCP system has been successfully deployed in Docker, but there remains an issue with the Vue Dashboard connecting to the Auth Server. The next session should focus on resolving the specific connection issue between these two services.
