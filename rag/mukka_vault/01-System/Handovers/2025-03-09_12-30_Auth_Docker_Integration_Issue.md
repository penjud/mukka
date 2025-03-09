---
title: Handover - Auth Server Docker Integration Issue
created: 2025-03-09 12:30:00
modified: 2025-03-09 12:30:00
tags:
  - handover
  - auth-server
  - mongodb
  - docker
  - authentication
  - troubleshooting
  - integration
status: in-progress
---

# Auth Server Docker Integration Issue

## Overview

This handover documents the current status of the MCP Auth Server with MongoDB integration. While we've successfully fixed the password verification code that was causing segmentation faults, we're facing an issue with the Web UI being unable to connect to the Auth Server when it's running in Docker. The Auth Server works correctly when run directly on the host but fails when containerized.

## Current Status

### What's Working
- Auth Server running directly on the host (port 8097)
- Command-line authentication using cURL works successfully
- MongoDB integration and password verification logic fixed
- All other MCP components running in Docker containers

### What's Not Working
- Web UI shows "MCP service Auth Server is not available" error
- Auth Server Docker container crashes with segmentation fault
- Web UI login not functioning due to this connection issue

## Technical Details

### Direct Host Deployment (Working)
- Process ID: 803792
- Command: `node src/index.js`
- Working Directory: `/home/mothership/mukka/backend/services/auth`
- Environment Variables:
  - PORT=8097
  - BASE_SERVER_URL=http://localhost:8090
  - USE_MONGODB=true
  - MONGODB_URI=mongodb://localhost:27017/mcp-auth

### Docker Deployment (Not Working)
- Image: `mukka_mcp-auth-server:latest`
- Container Name: `mukka-mcp-auth-server`
- Port Mapping: 8097:8097
- Crashes with segmentation fault during password verification

### Connection Issue
- Web UI is configured to connect to `http://mcp-auth-server:8097`
- Direct host server uses `localhost:8097`
- Possible network/DNS resolution issue between containers

## Investigation Progress

We've made the following progress in troubleshooting:

1. **Fixed Password Verification Logic**:
   - Added defensive checks for password and hash formats
   - Added proper error handling around bcrypt operations
   - Added detailed logging for debugging

2. **Reset Admin Password**:
   - Created script to reset admin password with correct format
   - Verified working via cURL to localhost

3. **Tested Docker Container**:
   - Rebuilt Docker image with updated code
   - Container still crashes during password verification

## Next Steps

The following tasks need to be addressed in the next session:

1. **Docker Container Investigation**:
   - Address segmentation fault in Docker environment
   - Determine if the issue is related to bcrypt compilation in Alpine Linux
   - Try using a non-Alpine Node.js base image

2. **Network Configuration**:
   - Investigate network connectivity between Web UI and Auth Server
   - Configure Web UI to connect to the correct Auth Server endpoint

3. **Possible Alternative Approaches**:
   - Consider implementing a proxy for the Auth Server
   - Investigate using bcryptjs (pure JavaScript) instead of bcrypt (native)
   - Explore Docker volume mounting for closer parity with host environment

## Notes for Next Session

To continue from exactly where we're leaving off:
- The direct host Auth Server is still running (PID: 803792)
- Docker containers for other services are running
- Web UI is accessible but can't connect to Auth Server
- Password verification logic has been fixed in the code

The primary goal for the next session should be getting the Auth Server running reliably in Docker so the Web UI can connect to it and authenticate users. This will require addressing both the segmentation fault issue and ensuring proper network connectivity between containers.

## Reference Files

- Dockerfile: `/home/mothership/mukka/backend/services/auth/Dockerfile`
- User Model: `/home/mothership/mukka/backend/services/auth/src/models/user.js`
- Docker Compose: `/home/mothership/mukka/docker-compose.yml`
- Auth Routes: `/home/mothership/mukka/backend/services/auth/src/routes/auth-routes.js`
