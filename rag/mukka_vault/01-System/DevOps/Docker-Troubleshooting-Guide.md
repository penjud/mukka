# Docker Troubleshooting Guide for MukkaAI

## Common Docker Issues and Solutions

This guide provides solutions for common Docker-related issues that might occur with the MukkaAI system deployment.

## Issue: Changes Not Appearing in Browser

### Symptoms
- You've made changes to files but don't see them in the browser
- The old version of the site/application is still showing

### Solutions

1. **Check Volume Mounts**
   ```bash
   # View the docker-compose.yml file
   cat docker-compose.yml
   
   # Verify the filesystem server has the correct volume mount
   # Should have: /home/mothership:/home/mothership
   ```

2. **Verify Container Rebuild**
   ```bash
   # Check when containers were created
   docker inspect mukka-vue-dashboard --format "{{.Created}}"
   docker inspect mukka-mcp-filesystem-server --format "{{.Created}}"
   
   # Rebuild specific containers
   ./rebuild-filesystem-server.sh
   ./rebuild-vue-dashboard.sh
   ```

3. **Clear Browser Cache**
   - Use Ctrl+F5 or Cmd+Shift+R to force refresh
   - Try incognito/private browsing window
   - Clear browser cache in browser settings

4. **Check Browser Console**
   - Open browser developer tools (F12)
   - Check for API errors in the Console tab
   - Verify network requests to filesystem service

5. **Restart Containers**
   ```bash
   # Restart Vue Dashboard
   docker restart mukka-vue-dashboard
   
   # Restart filesystem container
   docker restart mukka-mcp-filesystem-server
   ```

## Issue: Port Conflicts

### Symptoms
- Container fails to start
- Error messages about port binding failures

### Solutions

1. **Identify Conflicting Process**
   ```bash
   # Check what's using a specific port
   sudo lsof -i :<port_number>
   
   # Example
   sudo lsof -i :8095
   ```

2. **Modify Port Configuration**
   - Edit the .env file to use different ports
   - Update docker-compose.yml if necessary
   - Update frontend configuration in mcp-endpoints.js

3. **Stop Conflicting Service**
   ```bash
   # If it's another process
   sudo systemctl stop <service_name>
   
   # If it's another container
   docker stop <container_name>
   ```

## Issue: Container Communication Problems

### Symptoms
- Services can't connect to each other
- "Connection refused" errors in logs

### Solutions

1. **Check Docker Network**
   ```bash
   # List networks
   docker network ls
   
   # Inspect the network
   docker network inspect mukka-network
   
   # Make sure all containers are on the same network
   ```

2. **Check Service Discovery**
   - Verify service endpoints in frontend/vue-dashboard/src/config/mcp-endpoints.js
   - Make sure container names match the expected hostnames

3. **Test Connectivity**
   ```bash
   # Enter a container to test connectivity
   docker exec -it mukka-mcp-base-server sh
   
   # Try to connect to another service
   wget -O- http://mcp-filesystem-server:8095/health
   ```

## Issue: Volume Mounting Problems

### Symptoms
- Files are not accessible inside containers
- Changes to files not reflected in containers

### Solutions

1. **Check Docker Compose Configuration**
   ```bash
   # Verify volume mounts in docker-compose.yml
   grep -A 3 volumes docker-compose.yml
   ```

2. **Verify Directory Permissions**
   ```bash
   # Check permissions on host directory
   ls -la /home/mothership/mukka/rag/mukka_vault/
   
   # Check permissions inside container
   docker exec -it mukka-mcp-filesystem-server ls -la /home/mothership/mukka/rag/mukka_vault/
   ```

3. **Test File Access**
   ```bash
   # Test file access from inside container
   docker exec -it mukka-mcp-filesystem-server cat /home/mothership/mukka/rag/mukka_vault/01-System/Documentation/MukkaAI_System_Architecture.md
   ```

## Issue: Docker Compose Build Failures

### Symptoms
- Build process fails with errors
- Containers fail to start after build

### Solutions

1. **Check Docker Logs**
   ```bash
   # View logs for a specific container
   docker logs mukka-mcp-filesystem-server
   
   # Follow logs in real-time
   docker logs -f mukka-vue-dashboard
   ```

2. **Clean and Rebuild**
   ```bash
   # Stop all containers
   docker-compose down
   
   # Remove old images (optional, use with caution)
   docker-compose down --rmi local
   
   # Rebuild everything
   docker-compose up --build -d
   ```

3. **Check Disk Space**
   ```bash
   # Verify sufficient disk space
   df -h
   
   # Clean up unused Docker resources
   docker system prune
   ```

## Quick Reference: Common Docker Commands

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View container logs
docker logs <container_name>

# Execute command in container
docker exec -it <container_name> <command>

# Restart container
docker restart <container_name>

# Stop container
docker stop <container_name>

# Remove container
docker rm <container_name>

# List images
docker images

# Remove image
docker rmi <image_id>

# Clean up system
docker system prune
```

## MukkaAI Specific Commands

```bash
# Rebuild everything
cd /home/mothership/mukka/
docker-compose down
docker-compose up --build -d

# Rebuild specific services
./rebuild-filesystem-server.sh
./rebuild-vue-dashboard.sh

# Check logs for specific services
docker logs mukka-mcp-filesystem-server
docker logs mukka-vue-dashboard

# Back up to GitHub
./backup-to-github.sh
```

Remember: Always back up your changes to GitHub before making major changes to the Docker configuration. The backup script ensures you can recover your system even if the local environment is lost.
