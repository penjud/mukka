# Docker Debugging and Logging Guide

## Overview

This guide provides procedures for effectively debugging and logging in the Docker containerized environment for the MCP Authentication Server. Following these practices will help quickly identify and resolve issues in the production environment.

## Logging Configuration

### Winston Logger Setup

The Auth Server uses Winston for logging. The configuration is in `src/index.js`:

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

### Log Levels

Available log levels (from least to most verbose):
- `error`: Only critical errors
- `warn`: Warnings and errors
- `info` (default): General information plus warnings and errors
- `debug`: Detailed debugging information
- `silly`: Extremely verbose information

### Changing Log Level

1. Update the `.env` file:
   ```
   LOG_LEVEL=debug
   ```

2. Rebuild and restart the container:
   ```bash
   docker-compose build mcp-auth-server
   docker-compose up -d mcp-auth-server
   ```

## Debugging Procedures

### 1. View Container Logs

```bash
# View all logs
docker logs mukka-mcp-auth-server

# View last 100 lines
docker logs mukka-mcp-auth-server --tail 100

# Follow logs in real-time
docker logs mukka-mcp-auth-server -f

# Follow with timestamp
docker logs mukka-mcp-auth-server -f --timestamps
```

### 2. Interactive Container Access

```bash
# Get an interactive shell in the container
docker exec -it mukka-mcp-auth-server /bin/sh

# Once inside, you can:
# - Check environment variables: printenv
# - View file contents: cat /app/src/index.js
# - Check processes: ps aux
```

### 3. Service Registration Debugging

If the Auth Server isn't registering with the Base Server:

1. Check if the Base Server is running:
   ```bash
   docker ps | grep base-server
   curl http://localhost:8090/health
   ```

2. Verify the registration URL in the code:
   ```bash
   grep -r "registerWithBaseServer" /home/mothership/mukka/backend/services/auth/src/
   ```

3. Check if the network resolution works from within the container:
   ```bash
   docker exec -it mukka-mcp-auth-server ping mcp-base-server
   ```

### 4. Network Debugging

```bash
# List all Docker networks
docker network ls

# Inspect the MCP network
docker network inspect mukka_default

# List connected containers
docker network inspect mukka_default | grep -A 5 -B 5 "mcp-auth-server"
```

### 5. MongoDB Connection Debugging

If using MongoDB:

```bash
# Check MongoDB logs
docker logs mukka-mcp-mongodb

# Connect to MongoDB directly
docker exec -it mukka-mcp-mongodb mongo -u admin -p admin123 --authenticationDatabase admin

# From MongoDB shell:
use mcp_auth
db.users.find()
```

## Common Issues and Solutions

### 1. Service Not Found

**Symptoms**: Connection errors to services, DNS resolution failures

**Solutions**:
- Verify service name matches docker-compose.yml configuration
- Check Docker network configuration
- Use service name (e.g., `mcp-auth-server`) not container name (`mukka-mcp-auth-server`)

### 2. Port Conflicts

**Symptoms**: Container won't start, port already in use

**Solutions**:
- Check for processes using the port: `sudo lsof -i :8097`
- Kill conflicting processes: `sudo kill <PID>`
- Map to a different port in docker-compose.yml

### 3. Authentication Failures

**Symptoms**: Login fails, "Auth Server not available" errors

**Solutions**:
- Check if the Auth Server is running: `docker ps | grep auth-server`
- Verify correct service registration with Base Server
- Check for CORS issues in browser console
- Ensure environment variables are correctly set

### 4. File Permissions

**Symptoms**: Cannot write to files, permission denied errors

**Solutions**:
- Check ownership of mounted volumes: `ls -la /home/mothership/mukka/backend/services/auth/data`
- Fix permissions: `chmod -R 777 /home/mothership/mukka/backend/services/auth/data`
- Rebuild container with correct user: adjust Dockerfile and add `USER` directive

## Creating Health Check Scripts

### Basic Health Check Script

Create a script for automated health checks:

```bash
#!/bin/bash
# health-check.sh

echo "Checking Auth Server health..."
AUTH_RESPONSE=$(curl -s http://localhost:8097/health)

if [[ $AUTH_RESPONSE == *"healthy"* ]]; then
  echo "✅ Auth Server is healthy"
else
  echo "❌ Auth Server is not healthy"
  echo $AUTH_RESPONSE
fi

echo "Checking Base Server communication..."
REG_RESPONSE=$(curl -s http://localhost:8090/services/list)

if [[ $REG_RESPONSE == *"auth"* ]]; then
  echo "✅ Auth Server is registered with Base Server"
else
  echo "❌ Auth Server is not registered with Base Server"
  echo $REG_RESPONSE
fi
```

Save this script to `/home/mothership/mukka/backend/services/auth/scripts/health-check.sh` and make it executable:

```bash
chmod +x /home/mothership/mukka/backend/services/auth/scripts/health-check.sh
```

## Performance Monitoring

For ongoing monitoring, consider these approaches:

1. **Basic Monitoring**: Add the following endpoint to your Auth Server:

```javascript
app.get('/health/stats', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});
```

2. **Docker Stats**:
```bash
docker stats mukka-mcp-auth-server
```

## Conclusion

Effective debugging and logging are essential for maintaining the MCP Authentication Server in the Docker environment. By following these procedures, you can quickly identify and resolve issues, ensuring the stability and reliability of the service.

Remember to always start with the logs, check service registration, and verify Docker network connectivity when troubleshooting issues in the production environment.
