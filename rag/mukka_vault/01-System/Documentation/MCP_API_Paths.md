# MCP API Endpoints Documentation

This document outlines the API endpoints for the various MCP services to help frontend development and integration.

## Auth Server (http://localhost:8097)

The Auth Server provides JWT-based authentication and user management.

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

## Memory MCP Server (http://localhost:8094)

The Memory MCP Server manages conversation history and agent profiles.

### Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/health` | GET | Get server health | No |
| `/api/conversations` | GET | List conversations | No |
| `/api/conversations` | POST | Create conversation | No |
| `/api/conversations/:id` | GET | Get conversation | No |
| `/api/conversations/:id/messages` | GET | Get messages | No |
| `/api/conversations/:id/messages` | POST | Add message | No |

## Filesystem MCP Server (http://localhost:8095)

The Filesystem MCP Server provides file browsing and management.

### Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/health` | GET | Get server health | No |
| `/api/files` | GET | List files | No |
| `/api/files/:path` | GET | Get file content | No |
| `/api/files/:path` | PUT | Update file | No |
| `/api/files/:path` | DELETE | Delete file | No |

## Brave Search MCP Server (http://localhost:8096)

The Brave Search MCP Server provides web search capabilities.

### Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/health` | GET | Get server health | No |
| `/api/search` | GET | Perform web search | No |

## Ollama Bridge (http://localhost:8082)

The Ollama Bridge provides access to local Ollama models.

### Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/health` | GET | Get server health | No |
| `/api/models` | GET | List available models | No |
| `/api/chat` | POST | Chat with a model | No |

## Base MCP Server (http://localhost:8090)

The Base MCP Server provides service registration and discovery.

### Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/health` | GET | Get server health | No |
| `/services` | GET | List registered services | No |
| `/services/register` | POST | Register a service | No |

## API Endpoint Conventions

There are some inconsistencies in the API endpoint structures across different MCP services:

1. **Root Path vs /api Prefix**: 
   - Auth Server uses root paths (`/login`)
   - Other services use `/api` prefix (`/api/search`)

2. **Health Endpoint**:
   - Most services: `/health`
   - Auth Server: `/` (root path)

3. **Authentication**:
   - Token Format: `Bearer <token>` in Authorization header
   - Some services also support token in cookies

## Developer Notes

When integrating with these services, keep these tips in mind:

1. Always check the specific endpoint structure for each service
2. Use the MCP API service in the Vue Dashboard for consistent integration
3. Handle authentication properly based on the service requirements
4. For Auth Server, remember it uses HTTP-only cookies for token storage

## Default Credentials

The Auth Server comes with a default admin account:
- Username: `admin`
- Password: `admin123`

This should be changed in production.
