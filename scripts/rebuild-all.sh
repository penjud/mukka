#!/bin/bash

# Script to rebuild and restart all MCP services
# Author: Claude
# Date: 2025-03-09

# Set working directory
cd "$(dirname "$0")/.."
WORKING_DIR=$(pwd)

echo "=== MCP Services Full Rebuild ==="
echo "Working directory: $WORKING_DIR"

# Check if docker and docker-compose are available
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo "ERROR: docker or docker-compose not found. Please install them first."
    exit 1
fi

# Function to check if a user wants to proceed
confirm() {
    read -r -p "${1:-Are you sure? [y/N]} " response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            true
            ;;
        *)
            false
            ;;
    esac
}

# Warn about data loss
echo "WARNING: This will stop all MCP services and rebuild them."
echo "Any unsaved data might be lost."
if ! confirm "Do you want to proceed? [y/N]"; then
    echo "Operation cancelled."
    exit 0
fi

# Stop all services
echo "Stopping all services..."
docker-compose down

# Clean up any dangling images
echo "Cleaning up dangling images..."
docker image prune -f

# Rebuild all services
echo "Rebuilding all services..."
docker-compose build

# Start all services
echo "Starting all services..."
docker-compose up -d

# Wait for containers to start
echo "Waiting for containers to start..."
sleep 5

# Check if all containers are running
echo "=== Container Status ==="
docker-compose ps

echo "=== Done ==="
echo "The MCP Dashboard should be available at http://localhost:3002"
echo "If you encounter any issues, check individual container logs with:"
echo "docker logs [container-name]"
