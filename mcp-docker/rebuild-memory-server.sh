#!/bin/bash

echo "Stopping existing Memory MCP container..."
docker-compose stop mcp-memory

echo "Building new Memory MCP container with Agent Management..."
docker-compose build mcp-memory

echo "Starting the updated Memory MCP container..."
docker-compose up -d mcp-memory

echo "Memory MCP container has been updated and restarted."
echo "You can check the logs with: docker-compose logs -f mcp-memory"
