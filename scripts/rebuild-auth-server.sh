#!/bin/bash

# Script to safely rebuild and restart the Auth Server
# Author: Claude
# Date: 2025-03-09

# Set working directory
cd "$(dirname "$0")/.."
WORKING_DIR=$(pwd)

echo "=== Auth Server Rebuild and Restart ==="
echo "Working directory: $WORKING_DIR"

# Check if docker and docker-compose are available
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo "ERROR: docker or docker-compose not found. Please install them first."
    exit 1
fi

# Stop and remove existing container
echo "Stopping and removing Auth Server container..."
docker-compose stop mcp-auth-server
docker-compose rm -f mcp-auth-server

# Clean up any dangling images
echo "Cleaning up dangling images..."
docker image prune -f

# Rebuild Auth Server
echo "Rebuilding Auth Server..."
docker-compose build mcp-auth-server

# Start the service
echo "Starting Auth Server..."
docker-compose up -d mcp-auth-server

# Wait for container to start
echo "Waiting for container to start..."
sleep 3

# Check if container is running
if docker ps | grep -q "mukka-mcp-auth-server"; then
    echo "Auth Server successfully started!"
    echo "It should be available at http://localhost:8097"
else
    echo "WARNING: Auth Server container failed to start or is not running."
    echo "Check logs with: docker logs mukka-mcp-auth-server"
fi

# Show the logs
echo "=== Recent logs ==="
docker logs --tail 20 mukka-mcp-auth-server

echo "=== Done ==="
