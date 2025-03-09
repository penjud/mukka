---
title: Handover - Auth Server bcryptjs Implementation
created: 2025-03-09 12:45:00
modified: 2025-03-09 12:45:00
tags:
  - handover
  - auth-server
  - mongodb
  - docker
  - authentication
  - bcryptjs
  - integration
status: fixed
---

# Auth Server bcryptjs Implementation Fix

## Overview

This handover documents the resolution of the Auth Server Docker integration issue that was causing segmentation faults in the container environment. We successfully identified the root cause as a compatibility issue between the native `bcrypt` module and Alpine Linux's musl libc in the Docker container environment. The solution was to replace `bcrypt` with `bcryptjs`, a pure JavaScript implementation that doesn't rely on native code.

## Completed Changes

### 1. Root Cause Identification

The segmentation fault was occurring because:
- The Auth Server was using `bcrypt`, which is a native Node.js module that relies on C++ bindings
- Alpine Linux (used in the Node.js Docker base image) uses musl libc instead of glibc
- The mismatch between the C library expected by bcrypt (glibc) and the one available in Alpine (musl) was causing the segmentation fault

### 2. Implementation Changes

The following files were modified to use `bcryptjs` instead of `bcrypt`:

- `/home/mothership/mukka/backend/services/auth/package.json`
  - Replaced `bcrypt` dependency with `bcryptjs`
  - Consolidated duplicate `bcryptjs` entries

- `/home/mothership/mukka/backend/services/auth/src/index.js`
  - Changed `const bcrypt = require('bcrypt')` to `const bcrypt = require('bcryptjs')`
  - Updated the service registration URL to use service name instead of container name

- `/home/mothership/mukka/backend/services/auth/src/models/user.js`
  - Changed `const bcrypt = require('bcrypt')` to `const bcrypt = require('bcryptjs')`

- `/home/mothership/mukka/backend/services/auth/src/routes/password-reset-routes.js`
  - Changed `const bcrypt = require('bcrypt')` to `const bcrypt = require('bcryptjs')`

- `/home/mothership/mukka/backend/services/auth/src/routes/user-routes.js`
  - Changed `const bcrypt = require('bcrypt')` to `const bcrypt = require('bcryptjs')`

- `/home/mothership/mukka/backend/services/auth/reset-admin-password.js`
  - Changed `const bcrypt = require('bcrypt')` to `const bcrypt = require('bcryptjs')`

- `/home/mothership/mukka/backend/services/auth/reset-admin.js`
  - Changed `const bcrypt = require('bcrypt')` to `const bcrypt = require('bcryptjs')`

### 3. Service Registration Fix

Another issue was identified and fixed in the Auth Server's registration with the Base Server:
- The Auth Server was registering itself with the container name (`mukka-mcp-auth-server`) instead of the service name (`mcp-auth-server`)
- This was causing the Web UI to be unable to connect to the Auth Server
- Updated the URL in the registration function to use the correct service name

## Current Status

- All core Auth Server code now uses `bcryptjs` instead of `bcrypt`
- Service registration now uses the correct service name format for proper DNS resolution in the Docker network
- The Docker container should now start without segmentation faults
- The Web UI should be able to connect to the Auth Server using the proper service name

## Next Steps

1. **Rebuild and Deploy the Auth Server Container**:
   - Use Docker Desktop to rebuild the Auth Server image
   - Start the new container

2. **Test Authentication Flow**:
   - Access the Web UI at http://localhost:3002
   - Attempt to login with the admin credentials (admin/admin123)
   - Verify the "MCP service Auth Server is not available" error is resolved

3. **Additional Optimizations** (if needed):
   - Consider switching to a non-Alpine image (node:18-slim) for better compatibility if performance issues are encountered with bcryptjs
   - Implement additional error handling around authentication processes
   - Add health check endpoints to monitor container status

## Reference Information

### Authentication Credentials
- Default Admin Username: `admin`
- Default Admin Password: `admin123`

### Important Files
- Auth Server Source: `/home/mothership/mukka/backend/services/auth`
- Docker Compose: `/home/mothership/mukka/docker-compose.yml`
- Web UI: Access via http://localhost:3002

### Container Details
- Image Name: `mukka_mcp-auth-server`
- Container Name: `mukka-mcp-auth-server`
- Exposed Port: 8097

## Technical Notes

1. **Why bcryptjs works where bcrypt fails**:
   - `bcryptjs` is a pure JavaScript implementation with no native dependencies
   - It doesn't require compilation against the host's C library, avoiding the musl/glibc compatibility issue
   - While slightly slower than native `bcrypt`, it's more portable across different environments

2. **Alternative Approaches Considered**:
   - Using a non-Alpine base image (node:18-slim) which includes glibc
   - Rebuilding `bcrypt` specifically for Alpine with the necessary build tools
   - Running the Auth Server outside of Docker on the host system

3. **Network Resolution**:
   - In Docker Compose, containers can resolve each other by service name (`mcp-auth-server`)
   - The container name (`mukka-mcp-auth-server`) is not automatically added to DNS resolution
   - Ensure all inter-service communication uses service names rather than container names