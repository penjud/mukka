---
title: MukkaAI API Endpoints Documentation
created: 2025-03-09 22:45:00
modified: 2025-03-09 22:45:00
tags:
  - api
  - endpoints
  - reference
  - documentation
  - mukkaai
status: complete
version: 1.0
---

# MukkaAI API Endpoints Documentation

This document outlines the API endpoints for the various MukkaAI services to help frontend development and integration.

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-03-09 | Documentation Team | Updated from MCP to MukkaAI branding, added version history, added container names |

> **Note on Naming**: While this document uses "MukkaAI" branding, the underlying Docker containers and environment variables still use "MCP" in their names as part of the transition process.

## Auth Service (http://localhost:8097)

**Container Name**: `mukka-mcp-auth-server`

The Auth Service provides JWT-based authentication and user management.

### Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/` | GET | Get server info | No |
| `/login` | POST | User login | No |
| `/logout` | POST | User logout | Yes |
| `/me` | GET | Get current user info | Yes |
| `/users` | GET | List all users | Yes (Admin) |
| `/users` | POST | Create new user | Yes (Admin) |
| `/users/:username` | DELETE | Delete user | Yes (Admin) |
| `/password` | PUT | Change password | Yes |
| `/verify` | POST | Verify token | No |

### Example Login Request:
```
POST /login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Example User Creation:
```
POST /users
Content-Type: application/json
Authorization: Bearer <token>

{
  "username": "newuser",
  "password": "Password123!",
  "role": "user"
}
```

## Memory Service (http://localhost:8094)

**Container Name**: `mukka-mcp-memory-server`

The Memory Service manages conversation history and agent profiles.

### Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/health` | GET | Get server health | No |
| `/api/conversations` | GET | List conversations | No |
| `/api/conversations` | POST | Create conversation | No |
| `/api/conversations/:id` | GET | Get conversation | No |
| `/api/conversations/:id/messages` | GET | Get messages | No |
| `/api/conversations/:id/messages` | POST | Add message | No |
| `/api/agents` | GET | List agents | No |
| `/api/agents` | POST | Create agent | No |
| `/api/agents/:id` | GET | Get agent | No |
| `/api/agents/:id` | PUT | Update agent | No |
| `/api/agents/:id` | DELETE | Delete agent | No |

## Filesystem Service (http://localhost:8095)

**Container Name**: `mukka-mcp-filesystem-server`

The Filesystem Service provides file browsing and management.

### Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/health` | GET | Get server health | No |
| `/api/files` | GET | List files | No |
| `/api/files/:path` | GET | Get file content | No |
| `/api/files/:path` | PUT | Update file | No |
| `/api/files/:path` | DELETE | Delete file | No |

## Brave Search Service (http://localhost:8096)

**Container Name**: `mukka-mcp-brave-search-server`

The Brave Search Service provides web search capabilities.

### Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/health` | GET | Get server health | No |
| `/api/search` | GET | Perform web search | No |
| `/api/search/local` | GET | Perform local search | No |

## Ollama Bridge (http://localhost:8082)

**Container Name**: `mukka-mcp-ollama-bridge`

The Ollama Bridge provides access to local Ollama models.

### Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/health` | GET | Get server health | No |
| `/api/models` | GET | List available models | No |
| `/api/chat` | POST | Chat with a model | No |

## Base Service (http://localhost:8090)

**Container Name**: `mukka-mcp-base-server`

The Base Service provides service registration and discovery.

### Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/health` | GET | Get server health | No |
| `/services` | GET | List registered services | No |
| `/services/register` | POST | Register a service | No |

## API Endpoint Conventions

There are some inconsistencies in the API endpoint structures across different MukkaAI services:

1. **Root Path vs /api Prefix**: 
   - Auth Service uses root paths (`/login`)
   - Other services use `/api` prefix (`/api/search`)

2. **Health Endpoint**:
   - Most services: `/health`
   - Auth Service: `/` (root path)

3. **Authentication**:
   - Token Format: `Bearer <token>` in Authorization header
   - Some services also support token in cookies

## Developer Notes

When integrating with these services, keep these tips in mind:

1. Always check the specific endpoint structure for each service
2. Use the MukkaAI API service in the Vue Dashboard for consistent integration
3. Handle authentication properly based on the service requirements
4. For Auth Service, remember it uses HTTP-only cookies for token storage

## Default Credentials

The Auth Service comes with a default admin account:
- Username: `admin`
- Password: `admin123`

This should be changed in production.

## Container Naming Convention

For MukkaAI services, we use the following naming convention despite the rebranding:
- Container names: `mukka-mcp-<service>-server` (e.g., `mukka-mcp-auth-server`)
- Service names in docker-compose: `mcp-<service>-server` (e.g., `mcp-auth-server`)

## References

- MukkaAI System Architecture: `/home/mothership/mukka/rag/mukka_vault/01-System/Documentation/MukkaAI_System_Architecture.md`
- MukkaAI API Reference: `/home/mothership/mukka/rag/mukka_vault/01-System/Documentation/MukkaAI_API_Reference.md`
- Environment Variables Configuration: `/home/mothership/mukka/rag/mukka_vault/01-System/Documentation/Environment_Variables_Configuration.md`
