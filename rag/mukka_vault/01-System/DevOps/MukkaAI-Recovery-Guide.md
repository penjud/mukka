# MukkaAI System Recovery Guide

## Overview

This guide provides comprehensive instructions for recovering the entire MukkaAI system from the GitHub repository if you ever need to start from scratch on a new machine or if your local environment is lost.

## Prerequisites

- Git installed
- Docker and Docker Compose installed
- MongoDB installed (if using authentication with MongoDB)
- Ollama installed as a system service

## Step 1: Clone the Repository

```bash
git clone git@github.com:penjud/mukka.git
cd mukka
```

## Step 2: Set Up Environment Variables

1. Copy the example .env file if it exists:
   ```bash
   cp .env.example .env
   ```

2. Edit the .env file to match your requirements:
   ```bash
   nano .env
   ```

   Ensure the following variables are set correctly:
   - BASE_MCP_PORT=8090
   - MEMORY_MCP_PORT=8094
   - FILESYSTEM_MCP_PORT=8095
   - BRAVE_SEARCH_MCP_PORT=8096
   - AUTH_MCP_PORT=8097
   - OLLAMA_BRIDGE_PORT=8082
   - BRAVE_SEARCH_API_KEY=your_api_key_here
   - JWT_SECRET=your_jwt_secret_here

## Step 3: Deploy the System

Run the deployment script:

```bash
./deploy.sh
```

This script will:
- Build all Docker containers
- Start the services
- Initialize the system

## Step 4: Verify Deployment

1. Check if all containers are running:
   ```bash
   docker ps
   ```

2. Verify services are accessible:
   - Base Server: http://localhost:8090/health
   - Memory Server: http://localhost:8094/health
   - Filesystem Server: http://localhost:8095/health
   - Brave Search Server: http://localhost:8096/health
   - Auth Server: http://localhost:8097/health
   - Ollama Bridge: http://localhost:8082/health
   - Web UI: http://localhost:3001
   - Vue Dashboard: http://localhost:3002

## Step 5: Load Ollama Models (if needed)

If you're using Ollama with MukkaAI, load the required models:

```bash
./load-ollama-models.sh
```

## Step a: Configure MongoDB (if using Auth with MongoDB)

If you're using MongoDB for authentication:

1. Install MongoDB if it's not already installed:
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb
   ```

2. Start MongoDB:
   ```bash
   sudo systemctl start mongodb
   ```

3. Verify MongoDB is running:
   ```bash
   sudo systemctl status mongodb
   ```

## Step 7: Restore Data (if needed)

If you have backups of your data:

1. Restore memory files:
   ```bash
   cp /path/to/backup/memory.json ./data/memory.json
   ```

2. Restart Memory Server:
   ```bash
   docker restart mukka-mcp-memory-server
   ```

## Step 8: Set Up Auto-Start (Optional)

To configure the system to start automatically when your machine boots:

1. Install the Vue Dashboard service:
   ```bash
   ./install-vue-dashboard-service.sh
   ```

2. Enable the service:
   ```bash
   sudo systemctl enable vue-dashboard.service
   sudo systemctl start vue-dashboard.service
   ```

## Troubleshooting

### Port Conflicts

If you encounter port conflicts:

1. Check which process is using the port:
   ```bash
   sudo lsof -i :<port_number>
   ```

2. Either stop the conflicting process or modify the .env file to use different ports

### Docker Networking Issues

If containers can't communicate:

1. Check the Docker network:
   ```bash
   docker network ls
   docker network inspect mukka-network
   ```

2. Ensure the network is properly configured in docker-compose.yml

### Volume Mounting Issues

If the Filesystem Server can't access files:

1. Check the volume mounts in docker-compose.yml
2. Ensure the `/home/mothership:/home/mothership` mount is present for the filesystem service
3. Verify file permissions

### Browser Caching Issues

If you see old content in the UI:

1. Clear your browser cache
2. Try using incognito/private browsing mode
3. Check browser console for errors

## Regular Backup Procedure

To maintain regular backups:

1. Run the backup script:
   ```bash
   ./backup-to-github.sh
   ```

2. Verify the backup was successful:
   ```bash
   git log -1
   ```

This will commit and push all changes to GitHub, ensuring your system configuration and data are safely backed up.
