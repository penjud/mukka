# Vue Dashboard Deployment Guide

## Configuration Overview

The Vue Dashboard is an nginx-based container that serves the frontend application and proxies API requests to the backend services.

## Port Configuration

- The container exposes port 80 internally
- The host maps port 3002 to the container's port 80
- Access the dashboard at http://localhost:3002

## Troubleshooting

If the Vue Dashboard container fails to start or is not accessible after a system restart:

1. Check if the container is running:
   ```
   docker ps | grep vue-dashboard
   ```

2. If not running, start it:
   ```
   cd /home/mothership/mukka
   docker-compose up -d vue-dashboard
   ```

3. If running but not accessible, check the logs:
   ```
   docker logs mukka-vue-dashboard
   ```

4. Verify nginx configuration inside the container:
   ```
   docker exec mukka-vue-dashboard cat /etc/nginx/conf.d/default.conf
   ```

5. If you need to rebuild the container:
   ```
   cd /home/mothership/mukka
   docker-compose build vue-dashboard
   docker-compose up -d vue-dashboard
   ```

## Network Configuration

The Vue Dashboard connects to these services:
- MCP Base Server at http://mukka-mcp-base-server:8090
- MCP Memory Server at http://mukka-mcp-memory-server:8094
- MCP Filesystem Server at http://mukka-mcp-filesystem-server:8095
- MCP Brave Search Server at http://mukka-mcp-brave-search-server:8096
- MCP Auth Server at http://mukka-mcp-auth-server:8097
- MCP Ollama Bridge at http://mukka-mcp-ollama-bridge:8082

## Important Files

- Dockerfile: Defines the build process and container configuration
- nginx.conf: nginx server configuration with proxy rules
- .env: Environment variables used by the container
