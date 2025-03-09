# MCP Interface Strategy

## Overview
This document outlines the strategy for user interfaces in the MCP system. It clarifies which interfaces should be used, their purposes, and future plans.

## Current Status
As of March 8, 2025, the MCP system has two primary user interfaces:

1. **Vue Dashboard** (Primary Interface)
   - URL: http://localhost:3002
   - Container: `mukka-vue-dashboard`
   - Features:
     - Modern Vue.js-based UI
     - Authentication and user management
     - Personal workspace with conversation history
     - Agent management capabilities
     - Enhanced layouts and components
     - Future: Personal settings, admin settings, tool integration

2. **Web UI** (Legacy Interface)
   - URL: http://localhost:3001
   - Container: `mukka-mcp-web-ui`
   - Features:
     - Basic interface for MCP interactions
     - Direct access to MCP services
     - Limited functionality compared to Vue Dashboard

## Decision
**Vue Dashboard** has been confirmed as the primary user interface for the MCP system. All new features will be implemented in the Vue Dashboard, and users should be directed to use this interface.

## Next Steps

### Short Term
- Fix existing issues with the Vue Dashboard container
- Ensure all current functionality works correctly in Vue Dashboard
- Complete the pending features (Personal Settings, Admin Settings, Tool Integration)

### Medium Term
- Document differences between Web UI and Vue Dashboard
- Create data migration tools if needed to move user data between interfaces
- Develop feature parity charts for stakeholders

### Long Term
- Consider deprecating the Web UI once Vue Dashboard has full feature parity
- Create a migration path for users of Web UI
- Consolidate documentation to focus on Vue Dashboard as the primary interface

## Why Two Interfaces?
The Web UI was likely the original interface for interacting with MCP services, while the Vue Dashboard represents a more modern, feature-rich implementation. Having two interfaces creates confusion for users and maintenance overhead, which is why the Vue Dashboard has been designated as the primary interface moving forward.

## Technical Considerations
- Both interfaces connect to the same backend MCP services
- Data created in one interface should be accessible in the other
- Authentication may need to be shared between interfaces
- API compatibility must be maintained during the transition period

## Documentation Plan
- All new documentation should focus on Vue Dashboard usage
- Existing Web UI documentation should be updated to note its legacy status
- Training materials should emphasize Vue Dashboard as the preferred interface
