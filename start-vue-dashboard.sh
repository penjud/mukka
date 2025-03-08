#!/bin/bash

# Script to start the Vue Dashboard container
# Created on 2025-03-08

echo "==========================================="
echo "Starting Vue Dashboard"
echo "==========================================="

# Check if docker is running
for i in {1..30}; do
  if docker info > /dev/null 2>&1; then
    echo "Docker is running, proceeding..."
    break
  fi
  if [ $i -eq 30 ]; then
    echo "Error: Docker is not running or not accessible after waiting"
    exit 1
  fi
  echo "Waiting for Docker to be available... (attempt $i/30)"
  sleep 10
done

# Check if vue-dashboard container exists
if docker ps -a | grep -q mukka-vue-dashboard; then
  echo "Vue Dashboard container exists, removing it..."
  docker stop mukka-vue-dashboard || true
  docker rm mukka-vue-dashboard || true
fi

# Start the Vue Dashboard container
echo "Starting Vue Dashboard container..."
docker run -d --name mukka-vue-dashboard --network mukka_mukka-network -p 3002:80 \
  -e MCP_BASE_URL=http://mukka-mcp-base-server:8090 \
  -e MCP_MEMORY_URL=http://mukka-mcp-memory-server:8094 \
  -e MCP_FILESYSTEM_URL=http://mukka-mcp-filesystem-server:8095 \
  -e MCP_BRAVE_SEARCH_URL=http://mukka-mcp-brave-search-server:8096 \
  -e MCP_OLLAMA_URL=http://mukka-mcp-ollama-bridge:8082 \
  -e MCP_AUTH_URL=http://mukka-mcp-auth-server:8097 \
  mukka_vue-dashboard

if [ $? -eq 0 ]; then
  echo "Vue Dashboard started successfully"
  echo "Access Vue Dashboard at http://localhost:3002"
else
  echo "Failed to start Vue Dashboard"
  exit 1
fi

echo "==========================================="
