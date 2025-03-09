---
title: Docker Troubleshooting Guide
created: 2025-03-09 04:45:00
modified: 2025-03-09 04:45:00
tags:
  - docker
  - troubleshooting
  - devops
  - deployment
  - vue-dashboard
  - development
status: complete
---

# Docker Troubleshooting Guide for MCP

This guide provides solutions for common Docker-related issues encountered when working with the MCP system.

## Common Issues and Solutions

### 1. "No such image" Error During Container Recreation

**Problem:**
When trying to restart or recreate a container, you see an error like:
```
ERROR: for vue-dashboard No such image: sha256:100f811c7a7159559b105524c88f6d3561201ef22c8a99b264dba4466b62d82c
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
- For the MCP system, containers should reference each other using their full container names (e.g., `mukka-mcp-auth-server`) not service names (e.g., `mcp-auth-server`)
- Check the `docker-compose.yml` file to confirm all services are on the `mukka-network`

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

### 4. Port Conflicts

**Problem:**
Container fails to start due to port conflicts.

**Solution:**
1. Check if ports are already in use:
   ```bash
   sudo lsof -i :<port_number>
   ```

2. Stop the conflicting service or change the port mapping in `docker-compose.yml`

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

When troubleshooting Docker issues:

1. **Check container logs**:
   ```bash
   docker logs mukka-vue-dashboard
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
   docker exec mukka-vue-dashboard env
   ```

## Reference

### Important Files

- **Docker Compose**: `/home/mothership/mukka/docker-compose.yml`
- **Vue Dashboard Nginx Config**: `/home/mothership/mukka/frontend/vue-dashboard/nginx.conf`
- **Dockerfile**: `/home/mothership/mukka/frontend/vue-dashboard/Dockerfile`
- **Maintenance Scripts**: `/home/mothership/mukka/scripts/`

### Container Naming Convention

For MCP services, we use the following naming convention:
- Container names: `mukka-mcp-<service>-server` (e.g., `mukka-mcp-auth-server`)
- Service names in docker-compose: `mcp-<service>-server` (e.g., `mcp-auth-server`)

Always use the full container name when referencing containers in Nginx configurations or other Docker service discovery mechanisms.
