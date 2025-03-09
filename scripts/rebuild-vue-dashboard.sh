#!/bin/bash

# Script to safely rebuild and restart the Vue Dashboard
# Author: Claude
# Date: 2025-03-09

# Set working directory
cd "$(dirname "$0")/.."
WORKING_DIR=$(pwd)

echo "=== Vue Dashboard Rebuild and Restart ==="
echo "Working directory: $WORKING_DIR"

# Check if docker and docker-compose are available
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo "ERROR: docker or docker-compose not found. Please install them first."
    exit 1
fi

# Stop and remove existing container
echo "Stopping and removing Vue Dashboard container..."
docker-compose stop vue-dashboard
docker-compose rm -f vue-dashboard

# Clean up any dangling images
echo "Cleaning up dangling images..."
docker image prune -f

# Rebuild Vue Dashboard
echo "Rebuilding Vue Dashboard..."
docker-compose build vue-dashboard

# Start the service
echo "Starting Vue Dashboard..."
docker-compose up -d vue-dashboard

# Wait for container to start
echo "Waiting for container to start..."
sleep 3

# Check if container is running
if docker ps | grep -q "mukka-vue-dashboard"; then
    echo "Vue Dashboard successfully started!"
    echo "It should be available at http://localhost:3002"
else
    echo "WARNING: Vue Dashboard container failed to start or is not running."
    echo "Check logs with: docker logs mukka-vue-dashboard"
fi

# Show the logs
echo "=== Recent logs ==="
docker logs --tail 20 mukka-vue-dashboard

echo "=== Done ==="
