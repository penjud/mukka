---
title: Environment Variables Configuration
created: 2025-03-09 20:15:00
modified: 2025-03-09 20:15:00
tags:
  - configuration
  - environment
  - deployment
  - docker
  - mukkaai
status: complete
version: 1.0
---

# MukkaAI Environment Variables Configuration

This document describes all environment variables used in the MukkaAI system (formerly MCP). These variables control the behavior and configuration of all MukkaAI services.

## Core System Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MCP_AUTH_TOKEN` | Authentication token used for service-to-service communication | None | Yes |
| `JWT_SECRET` | Secret key used for JWT token generation and validation | None | Yes |
| `CORS_ORIGIN` | Allowed origin for CORS requests, typically the Web UI URL | `http://localhost:3002` | Yes |

## Service Port Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `BASE_MCP_PORT` | Port for the Base Service | 8090 | Yes |
| `MEMORY_MCP_PORT` | Port for the Memory Service | 8094 | Yes |
| `FILESYSTEM_MCP_PORT` | Port for the Filesystem Service | 8095 | Yes |
| `BRAVE_SEARCH_MCP_PORT` | Port for the Brave Search Service | 8096 | Yes |
| `AUTH_MCP_PORT` | Port for the Auth Service | 8097 | Yes |
| `OLLAMA_BRIDGE_PORT` | Port for the Ollama Bridge | 8082 | Yes |
| `OLLAMA_PORT` | Port for the Ollama service (system service, not containerized) | 11434 | Yes |
| `WEB_UI_PORT` | Port for the Vue Dashboard (Web UI) | 3002 | Yes |

## Service-Specific Configuration

### Base Service

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `BASE_MCP_LOG_LEVEL` | Logging level for the Base Service | `info` | No |

### Memory Service

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MEMORY_FILE_PATH` | Path to store memory data within the container | `/app/data/memory/memory.json` | Yes |

### Auth Service

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `USERS_FILE_PATH` | Path to the users file within the container | `/app/data/users.json` | Yes |
| `USE_MONGODB` | Whether to use MongoDB for user data storage | `true` | No |
| `MONGODB_URI` | MongoDB connection string if `USE_MONGODB` is true | `mongodb://host.docker.internal:27017/mcp-auth` | Conditional |
| `MONGODB_CONNECTION_POOL_SIZE` | MongoDB connection pool size | 10 | No |

### Brave Search Service

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `BRAVE_SEARCH_API_KEY` | API key for Brave Search | None | Yes |

### Ollama Bridge

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OLLAMA_HOST` | URL for the Ollama service | `http://host.docker.internal:11434` | Yes |
| `OLLAMA_MODELS` | Comma-separated list of models to use (preload) | `llama2,mistral,codellama` | No |

## Example Configuration

Below is an example `.env` file that can be used for a standard deployment:

```sh
# Authentication tokens
MCP_AUTH_TOKEN=your-secure-auth-token-here
JWT_SECRET=your-secure-jwt-secret-here

# API Keys
BRAVE_SEARCH_API_KEY=your-brave-search-api-key

# Base MCP Settings
BASE_MCP_PORT=8090
BASE_MCP_LOG_LEVEL=info

# Memory MCP Settings
MEMORY_MCP_PORT=8094
MEMORY_FILE_PATH=/app/data/memory/memory.json

# Filesystem MCP Settings
FILESYSTEM_MCP_PORT=8095

# Brave Search MCP Settings
BRAVE_SEARCH_MCP_PORT=8096

# Auth MCP Settings
AUTH_MCP_PORT=8097
CORS_ORIGIN=http://localhost:3002
USERS_FILE_PATH=/app/data/users.json
USE_MONGODB=true
MONGODB_URI=mongodb://host.docker.internal:27017/mcp-auth
MONGODB_CONNECTION_POOL_SIZE=10

# Ollama Settings
OLLAMA_PORT=11434
OLLAMA_MODELS=llama2,mistral,codellama

# Ollama Bridge Settings
OLLAMA_BRIDGE_PORT=8082
OLLAMA_HOST=http://host.docker.internal:11434

# Web UI Settings
WEB_UI_PORT=3002
```

## Environment Configurations

### Development Environment

For development environments, you might want to modify certain values:

- Set `BASE_MCP_LOG_LEVEL` to `debug` for more verbose logging
- Use simpler, non-production values for `MCP_AUTH_TOKEN` and `JWT_SECRET`
- Consider setting `USE_MONGODB` to `false` for simpler user data storage
- Add additional development-specific variables as needed

### Production Environment

For production deployments, ensure:

- Use strong, randomly generated values for `MCP_AUTH_TOKEN` and `JWT_SECRET`
- Set `CORS_ORIGIN` to the actual domain where the Web UI is hosted
- Use proper MongoDB connection settings with authentication
- Consider using environment-specific files (.env.production, .env.development)

## Troubleshooting

If services fail to connect to each other:
- Verify that port configurations match between the `.env` file and `docker-compose.yml`
- Ensure container names match the expected service discovery names 
- Remember that service URLs within the Docker network use the container names, not localhost

If authentication fails:
- Check that `JWT_SECRET` matches between Auth Service and consumers
- Verify that `MCP_AUTH_TOKEN` is consistent across all services
- Ensure MongoDB connection is working if using `USE_MONGODB=true`

## Notes

- Never commit sensitive values like API keys or secrets to version control
- Consider using Docker secrets or a secret management solution for production
- Environment variable names still use the "MCP" prefix despite the rebranding to MukkaAI
- All containerized services maintain the "MCP" naming convention

## References

- Docker Compose: `/home/mothership/mukka/docker-compose.yml`
- Example .env file: `/home/mothership/mukka/.env`
- MukkaAI System Architecture: `/home/mothership/mukka/rag/mukka_vault/01-System/Documentation/MCP_System_Architecture.md`
