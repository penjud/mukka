---
title: MukkaAI Troubleshooting Guide
created: 2025-03-09 20:45:00
modified: 2025-03-09 20:45:00
tags:
  - docker
  - troubleshooting
  - devops
  - deployment
  - vue-dashboard
  - development
  - mukkaai
status: complete
version: 1.0
---

# MukkaAI Troubleshooting Guide

This guide provides solutions for common issues encountered when working with the MukkaAI system (formerly MCP).

## Common Issues and Solutions

### 1. "No such image" Error During Container Recreation

**Problem:**
When trying to restart or recreate a container, you see an error like:
```
ERROR: for mukka-vue-dashboard No such image: sha256:100f811c7a7159559b105524c88f6d3561201ef22c8a99b264dba4466b62d82c
ERROR: The image for the service you're trying to recreate has been removed.
```

**Solution:**
This happens when Docker can't find the image reference it expects. To fix:

1. Use our maintenance scripts:
   ```bash
   # For Vue Dashboard issues:
   ./scripts/rebuild-vue-dashboard.sh
   
   # For rebuilding everything:
   ./scripts/rebuild-all.sh
   ```

2. Manual fix:
   ```bash
   # Remove the problematic container
   docker-compose rm -f vue-dashboard
   
   # Rebuild the service
   docker-compose build vue-dashboard
   
   # Start it again
   docker-compose up -d vue-dashboard
   ```

### 2. Container Networking Issues

**Problem:**
Containers can't communicate with each other despite being on the same network.

**Solution:**
- Ensure containers are using the correct hostnames in the Docker network
- For the MukkaAI system, containers should reference each other using their full container names (e.g., `mukka-mcp-auth-server`) not service names (e.g., `mcp-auth-server`)
- Check the `docker-compose.yml` file to confirm all services are on the `mukka-network`

> **Important Note:** Despite the rebranding to MukkaAI, container names still use the "MCP" naming convention (e.g., `mukka-mcp-auth-server`).

### 3. Service Discovery Problems

**Problem:**
The Vue Dashboard can't discover or connect to backend services.

**Solution:**
1. Check the nginx.conf file to ensure it's properly configured:
   ```
   location /api/auth/ {
       proxy_pass http://mukka-mcp-auth-server:8097/;
       # other proxy settings...
   }
   ```

2. Review the frontend's service discovery configuration in `src/config/mcp-endpoints.js`

3. Verify that environment variables in the `.env` file match the port settings in `docker-compose.yml`

### 4. Port Conflicts

**Problem:**
Container fails to start due to port conflicts.

**Solution:**
1. Check if ports are already in use:
   ```bash
   sudo lsof -i :<port_number>
   ```

2. Stop the conflicting service or change the port mapping in `docker-compose.yml`

3. Update the `.env` file with the new port settings

4. For Ollama conflicts, remember that the system is configured to use the host Ollama service rather than a containerized version

### 5. Authentication Issues

**Problem:**
Authentication failures between services or from the Web UI.

**Solution:**
1. Verify that the `JWT_SECRET` and `MCP_AUTH_TOKEN` variables match across all services
2. Check that the Auth Service is running and accessible
3. Verify that MongoDB is running if `USE_MONGODB=true` is set
4. Check the Auth Service logs for specific error messages:
   ```bash
   docker logs mukka-mcp-auth-server
   ```

### 6. Data Persistence Issues

**Problem:**
Data is not persisting between container restarts.

**Solution:**
1. Verify that the volume mounts are correctly configured in `docker-compose.yml`
2. Check that the data directories exist on the host system
3. Check file permissions on data directories
4. For the Memory Service, confirm that `MEMORY_FILE_PATH` points to a mounted volume

## Preventative Measures

To avoid Docker image and container issues:

1. **Always use build instructions** instead of direct image references in docker-compose.yml:
   ```yaml
   vue-dashboard:
     build:
       context: ./frontend/vue-dashboard
       dockerfile: Dockerfile
     # instead of: image: mukka_vue-dashboard:latest
   ```

2. **Use the maintenance scripts**:
   - `./scripts/rebuild-vue-dashboard.sh` - Rebuilds just the Vue Dashboard
   - `./scripts/rebuild-all.sh` - Rebuilds all services

3. **Regularly clean up Docker resources**:
   ```bash
   # Remove unused images
   docker image prune
   
   # Remove unused containers
   docker container prune
   
   # Remove all unused resources
   docker system prune
   ```

## Debugging Techniques

When troubleshooting MukkaAI issues:

1. **Check container logs**:
   ```bash
   docker logs mukka-vue-dashboard
   docker logs mukka-mcp-auth-server
   # etc. for other services
   ```

2. **Inspect network settings**:
   ```bash
   docker network inspect mukka_mukka-network
   ```

3. **Enter a running container**:
   ```bash
   docker exec -it mukka-vue-dashboard /bin/sh
   ```

4. **Check container health**:
   ```bash
   docker-compose ps
   ```

5. **Review environment variables**:
   ```bash
   docker exec mukka-mcp-auth-server env
   ```

6. **Monitor service communications**:
   ```bash
   # Install netstat if not available
   apt-get update && apt-get install -y net-tools
   
   # Check open connections
   netstat -tuln
   ```

## Reference

### Important Files

- **Docker Compose**: `/home/mothership/mukka/docker-compose.yml`
- **Environment Variables**: `/home/mothership/mukka/.env`
- **Vue Dashboard Nginx Config**: `/home/mothership/mukka/frontend/vue-dashboard/nginx.conf`
- **Dockerfile**: `/home/mothership/mukka/frontend/vue-dashboard/Dockerfile`
- **Maintenance Scripts**: `/home/mothership/mukka/scripts/`
- **Environment Variables Documentation**: `/home/mothership/mukka/rag/mukka_vault/01-System/Documentation/Environment_Variables_Configuration.md`

### Container Naming Convention

For MukkaAI services, we use the following naming convention despite the rebranding:
- Container names: `mukka-mcp-<service>-server` (e.g., `mukka-mcp-auth-server`)
- Service names in docker-compose: `mcp-<service>-server` (e.g., `mcp-auth-server`)

Always use the full container name when referencing containers in Nginx configurations or other Docker service discovery mechanisms.

## Notes on MCP to MukkaAI Transition

As part of the transition from MCP to MukkaAI branding, please note:
1. Container names, service names, and environment variables still use "MCP" terminology
2. Documentation has been updated to use "MukkaAI" where appropriate
3. When troubleshooting, remember that logs and configuration files may contain a mix of "MCP" and "MukkaAI" terminology

## Contact

For additional support with MukkaAI deployment issues, contact the DevOps team.
