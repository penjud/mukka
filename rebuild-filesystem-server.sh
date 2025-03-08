#!/bin/bash
set -e

echo "Building Filesystem MCP Server from source..."

# Create a temporary directory for the build
BUILD_DIR=$(mktemp -d)
echo "Using temporary build directory: $BUILD_DIR"

# Copy the source code
cp -r /home/mothership/mukka/backend/services/filesystem/* $BUILD_DIR/

# Build the Docker image
cd $BUILD_DIR
docker build -t mukka/mcp-filesystem-server:latest .

# Stop and remove the current container
echo "Stopping current container..."
docker stop mukka-mcp-filesystem-server || true
docker rm mukka-mcp-filesystem-server || true

# Run the new container
echo "Starting new container..."
docker run -d \
  --name mukka-mcp-filesystem-server \
  --network mukka_mukka-network \
  -v /home/mothership:/home/mothership:rw \
  -p 8095:8095 \
  mukka/mcp-filesystem-server:latest

echo "Filesystem MCP Server rebuilt and restarted."
