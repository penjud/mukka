---
title: Admin Settings Enhancement
created: 2025-03-09 20:29:00
modified: 2025-03-09 20:29:00
tags:
  - handover
  - admin
  - ui
  - settings
  - mukkaai
status: in-progress
assignee: Development Team
---

# Admin Settings Enhancement Handover

## Overview

This document provides a handover for the ongoing Admin Settings page enhancement in the MukkaAI Dashboard. We've successfully fixed the service health display in the monitoring tab, but several other issues need attention across the Admin Settings tabs.

## Current Status

1. **Service Health Cards**
   - ✅ Fixed: The service cards now properly show the status of all MCP services
   - ✅ Replaced: "MukkaAI Web UI" with "MukkaAI Dashboard" and updated port from 3001 to 3002
   - ✅ Added: Health endpoint to Brave Search service to ensure it shows correct status

2. **System Monitoring**
   - ⚠️ Partially Fixed: Added dynamic data for uptime calculation based on service status
   - ❌ Incomplete: Other metrics still use simulated values instead of real data

3. **Users Tab**
   - ❌ Incomplete: All content is placeholder data
   - ❌ Incomplete: Add User, Edit, and Delete functionality not implemented

4. **System Config Tab**
   - ❌ Incomplete: UI design issues with dropdown labels sitting inside the dropdown boxes
   - ❌ Incomplete: Save System Settings button doesn't work
   - ❌ Incomplete: Welcome Message field purpose is unclear
   - ❌ Incomplete: Allow User Registration and Enable Auto Tool Triggering switches functionality needs verification

5. **Authentication Issues**
   - ❌ Incomplete: Logging out behavior is inconsistent
   - ❌ Incomplete: User is logged out when refreshing specific pages

## Next Steps

### 1. Users Tab Enhancements
- Implement real user data fetching from Auth Server
- Add functionality for user management (Add, Edit, Delete)
- Implement proper role-based access controls

### 2. Monitoring Tab Enhancements
- Connect System Monitoring metrics to real data sources
- Implement API endpoints to retrieve actual usage statistics
- Add graphical representations of system usage over time

### 3. System Config Tab Fixes
- Fix the dropdown UI design issues
- Implement Save System Settings functionality
- Clarify the purpose of the Welcome Message field
- Connect toggle switches to actual configuration settings

### 4. Authentication Flow Fixes
- Fix inconsistent logout behavior
- Implement proper session persistence on page refreshes
- Ensure token refresh works correctly

## Technical Details

### Service Health Implementation

The service health cards in the Admin Settings monitoring tab are configured through:
- `/frontend/vue-dashboard/src/config/mcp-endpoints.js` - Service definitions
- `/frontend/vue-dashboard/src/services/discovery.js` - Health check mechanism

### Authentication Issues

The authentication flow issues are likely related to:
- Token storage and refresh mechanisms
- Route guards and session validation
- Inconsistent handling of authentication state across different routes

## Considerations

1. **UX Consistency**: Ensure that all UI elements follow the same design patterns
2. **Real Data Integration**: Replace placeholder data with actual API calls
3. **Error Handling**: Add proper error handling and user feedback throughout
4. **Authentication Flow**: Fix session persistence and logout behavior for a smoother user experience
5. **Documentation**: Update documentation to reflect changes to the Admin Settings interface

## References

- Docker Compose File: `/home/mothership/mukka/docker-compose.yml`
- Vue Dashboard: `/home/mothership/mukka/frontend/vue-dashboard/`
- Admin Settings View: `/home/mothership/mukka/frontend/vue-dashboard/src/views/settings/AdminSettings.vue`
- Authentication Routes: `/home/mothership/mukka/backend/services/auth/src/routes/auth-routes.js`

## Implementation Details

The following files need modification to address the outlined issues:

1. **User Management**:
   - `/frontend/vue-dashboard/src/views/settings/AdminSettings.vue`
   - Create new service for user management API calls

2. **System Config**:
   - Fix UI in `/frontend/vue-dashboard/src/views/settings/AdminSettings.vue`
   - Implement save functionality through a new API endpoint

3. **Authentication Flow**:
   - Review and update `/frontend/vue-dashboard/src/router/index.js`
   - Check token handling in `/frontend/vue-dashboard/src/stores/auth.js`

This handover provides a roadmap for the next phase of development, focusing on enhancing the Admin Settings interface and fixing the authentication flow issues.
