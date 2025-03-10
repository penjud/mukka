#!/bin/bash
# Script to rebuild the Brave Search server with the new health endpoint

echo "Rebuilding Brave Search Server with health endpoint..."

# Navigate to the project directory
cd /home/mothership/mukka

# Stop the Brave Search container
echo "Stopping Brave Search container..."
docker stop mukka-mcp-brave-search-server

# Remove the container
echo "Removing Brave Search container..."
docker rm mukka-mcp-brave-search-server

# Rebuild the Brave Search Server
echo "Rebuilding Brave Search Server..."
docker-compose build mcp-brave-search-server

# Start the Brave Search Server
echo "Starting Brave Search Server..."
docker-compose up -d mcp-brave-search-server

# Wait for the container to start
echo "Waiting for container to start..."
sleep 5

# Test the health endpoint
echo "Testing health endpoint..."
curl -s http://localhost:8096/health

echo -e "\nRebuild complete. Brave Search Server should now respond to health checks."
