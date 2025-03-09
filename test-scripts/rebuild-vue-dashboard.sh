#!/bin/bash
# Script to rebuild the Vue Dashboard container
set -e

echo "Rebuilding Vue Dashboard container..."

# Navigate to the project directory
cd /home/mothership/mukka

# Docker container info
CONTAINER_NAME="mukka-vue-dashboard"
IMAGE_NAME="mukka_vue-dashboard"
CONTAINER_ID=$(docker ps -aq --filter name=$CONTAINER_NAME)

# Stop the current Vue Dashboard container
echo "Stopping the current Vue Dashboard container..."
docker stop $CONTAINER_ID || echo "Container not running"

# Remove the container
echo "Removing the container..."
docker rm $CONTAINER_ID || echo "Container already removed"

# Build the new image
echo "Building the new image..."
docker build -t $IMAGE_NAME ./frontend/vue-dashboard

# Start a new container
echo "Starting the rebuilt Vue Dashboard container..."
docker run -d \
  --name $CONTAINER_NAME \
  -p 3002:80 \
  -e MCP_BASE_URL=http://mcp-base-server:8090 \
  -e MCP_MEMORY_URL=http://mcp-memory-server:8094 \
  -e MCP_FILESYSTEM_URL=http://mcp-filesystem-server:8095 \
  -e MCP_BRAVE_SEARCH_URL=http://mcp-brave-search-server:8096 \
  -e MCP_OLLAMA_URL=http://mcp-ollama-bridge:8082 \
  -e MCP_AUTH_URL=http://mcp-auth-server:8097 \
  --network mukka_mukka-network \
  $IMAGE_NAME

echo "Vue Dashboard rebuild complete. Available at http://localhost:3002"
