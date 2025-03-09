---
title: MukkaAI Interface Strategy
created: 2025-03-09 23:00:00
modified: 2025-03-09 23:00:00
tags:
  - interface
  - strategy
  - vue
  - dashboard
  - webui
  - mukkaai
status: complete
version: 1.0
---

# MukkaAI Interface Strategy

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-03-09 | Documentation Team | Updated from MCP to MukkaAI branding, added version history, updated container references |

> **Note on Naming**: While this document uses "MukkaAI" branding, some Docker containers still use "MCP" in their names as part of the transition process.

## Overview
This document outlines the strategy for user interfaces in the MukkaAI system. It clarifies which interfaces should be used, their purposes, and future plans.

## Current Status
As of March 9, 2025, the MukkaAI system has two primary user interfaces:

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
     - Basic interface for MukkaAI interactions
     - Direct access to MukkaAI services
     - Limited functionality compared to Vue Dashboard

## Decision
**Vue Dashboard** has been confirmed as the primary user interface for the MukkaAI system. All new features will be implemented in the Vue Dashboard, and users should be directed to use this interface.

## Next Steps

### Short Term
- Fix existing issues with the Vue Dashboard container
- Ensure all current functionality works correctly in Vue Dashboard
- Complete the pending features (Personal Settings, Admin Settings, Tool Integration)
- Update all interface elements with MukkaAI branding

### Medium Term
- Document differences between Web UI and Vue Dashboard
- Create data migration tools if needed to move user data between interfaces
- Develop feature parity charts for stakeholders
- Fully integrate MukkaAI branding across all UI components

### Long Term
- Consider deprecating the Web UI once Vue Dashboard has full feature parity
- Create a migration path for users of Web UI
- Consolidate documentation to focus on Vue Dashboard as the primary interface
- Ensure all legacy MCP references are updated to MukkaAI in both code and UI

## Why Two Interfaces?
The Web UI was the original interface for interacting with the former MCP services, while the Vue Dashboard represents a more modern, feature-rich implementation. Having two interfaces creates confusion for users and maintenance overhead, which is why the Vue Dashboard has been designated as the primary interface moving forward.

## Technical Considerations
- Both interfaces connect to the same backend MukkaAI services
- Data created in one interface should be accessible in the other
- Authentication may need to be shared between interfaces
- API compatibility must be maintained during the transition period
- Container names still reflect the original MCP naming convention

## Documentation Plan
- All new documentation should focus on Vue Dashboard usage
- Existing Web UI documentation should be updated to note its legacy status
- Training materials should emphasize Vue Dashboard as the preferred interface
- All documentation should be updated to use MukkaAI branding

## Branding Transition
The transition from MCP to MukkaAI branding is ongoing. The following elements require updates:

- Interface logos and branding elements
- Page titles and headers
- Documentation references
- URLs and endpoints (when appropriate)
- User-facing messaging

## References
- MukkaAI System Architecture: `/home/mothership/mukka/rag/mukka_vault/01-System/Documentation/MukkaAI_System_Architecture.md`
- MukkaAI API Reference: `/home/mothership/mukka/rag/mukka_vault/01-System/Documentation/MukkaAI_API_Reference.md`
- Vue Dashboard User Guide: `/home/mothership/mukka/rag/mukka_vault/01-System/Documentation/Vue_Dashboard_User_Guide.md`
