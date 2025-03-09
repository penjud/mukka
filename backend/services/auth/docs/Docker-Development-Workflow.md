# Docker-Based Development Workflow

## Overview

This document outlines the proper development workflow for the MCP Authentication Server in the Docker production environment. Following this workflow will help prevent issues when transitioning from development to production.

## Key Principles

1. **Production-First Development**: Always develop directly in the Docker environment to ensure consistency between development and production.
2. **Service Registration Consistency**: Use proper service names for DNS resolution within the Docker network.
3. **Container-Centric Testing**: Test all changes directly in the containerized environment.

## Development Setup

### Prerequisites

- Docker and Docker Compose installed
- Basic understanding of Docker networking and volume mounts
- Access to the MCP project repository

### Initial Setup

1. Clone the MCP repository (if not already done):
   ```bash
   git clone <repository-url>
   cd mukka
   ```

2. Make sure you understand the distinction between:
   - **Service names** (e.g., `mcp-auth-server`): Used for DNS resolution in Docker network
   - **Container names** (e.g., `mukka-mcp-auth-server`): Used for Docker commands

## Development Workflow

### 1. Editing Files

All development should happen directly on the files in the host machine, which are mounted into the Docker containers:

```bash
# Edit files directly in their host locations
code /home/mothership/mukka/backend/services/auth/src/
```

### 2. Building and Testing Changes

After making changes, rebuild and restart the affected services:

```bash
# Rebuild and restart the Auth Server
docker-compose build mcp-auth-server
docker-compose up -d mcp-auth-server

# View logs to check for errors
docker logs mukka-mcp-auth-server -f
```

### 3. Testing Changes

Always test your changes through the Web UI or directly with the containerized services:

```bash
# Test the Auth Server API directly
curl http://localhost:8097/health

# Test authentication through the Web UI
# Open browser to http://localhost:3002 and test login
```

### 4. Debugging

When issues arise, check the container logs first:

```bash
# View logs for debugging
docker logs mukka-mcp-auth-server --tail 100

# Enter the container for interactive debugging
docker exec -it mukka-mcp-auth-server /bin/sh
```

## Common Pitfalls and Best Practices

### Service Registration

Always use the correct Docker service name in your code for service registration:

```javascript
// CORRECT - Use the service name from docker-compose.yml
url: `http://mcp-auth-server:${PORT}`

// INCORRECT - Don't use the container name
url: `http://mukka-mcp-auth-server:${PORT}`
```

### Environment Variables

Use the same environment variables in development and production:

1. Edit the `.env` file in the auth service directory
2. Rebuild the container to apply changes

```bash
# After changing .env
docker-compose build mcp-auth-server
docker-compose up -d mcp-auth-server
```

### Port Conflicts

If you encounter port conflicts:

1. Check for processes using the same port:
   ```bash
   sudo lsof -i :8097
   ```

2. Stop the conflicting process or change the port in your configuration

### Docker Network Issues

If services can't communicate:

1. Check the Docker network configuration:
   ```bash
   docker network inspect mukka_default
   ```

2. Verify service names in docker-compose.yml match what you're using in code

## Logging and Monitoring

### Standard Logging

All services should use consistent logging:

```javascript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'mcp-auth-server' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
```

### Debugging Procedures

1. Enable verbose logging:
   ```bash
   # Set environment variable in .env
   LOG_LEVEL=debug
   ```

2. Rebuild and restart the service:
   ```bash
   docker-compose build mcp-auth-server
   docker-compose up -d mcp-auth-server
   ```

3. Check the logs:
   ```bash
   docker logs mukka-mcp-auth-server -f
   ```

## Conclusion

By following this Docker-based development workflow, we can ensure a smoother transition between development and production environments, reduce integration issues, and maintain consistency across the system.

Remember, the key is to always develop in the Docker environment, use the correct service names, and test all changes in the actual containerized environment.
