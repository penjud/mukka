#!/bin/bash

# Redeploy script for MCP Project
# Created on 2025-03-07

set -e

echo "==========================================="
echo "MCP Project Redeployment Script"
echo "==========================================="

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running or not accessible"
  exit 1
fi

# Stop and remove existing containers
echo "Stopping existing containers..."
docker stop mothership_mcp-memory_1 mothership_mcp-filesystem mothership_mcp-web-ui_1 2>/dev/null || true
docker rm mothership_mcp-memory_1 mothership_mcp-filesystem mothership_mcp-web-ui_1 2>/dev/null || true

# Create necessary directories
mkdir -p ./backend/data/memory
mkdir -p ./backend/data/ollama
mkdir -p ./backend/config

# Ensure .env file exists and has required values
if [ ! -f ".env" ]; then
  echo "Creating .env file with default values"
  cat > .env << EOF
# Authentication tokens
MCP_AUTH_TOKEN=development-auth-token-12345
JWT_SECRET=development-jwt-secret-12345

# API Keys
BRAVE_SEARCH_API_KEY=

# Base MCP Settings
BASE_MCP_PORT=8090
BASE_MCP_LOG_LEVEL=info

# Memory MCP Settings
MEMORY_MCP_PORT=8000
MEMORY_FILE_PATH=/app/data/memory/memory.json

# Filesystem MCP Settings
FILESYSTEM_MCP_PORT=8000

# Brave Search MCP Settings
BRAVE_SEARCH_MCP_PORT=8096

# Auth MCP Settings
AUTH_MCP_PORT=8097
CORS_ORIGIN=http://localhost:3001
USERS_FILE_PATH=/app/data/users.json

# Ollama Settings
OLLAMA_PORT=11434
OLLAMA_MODELS=llama2,mistral,codellama

# Ollama Bridge Settings
OLLAMA_BRIDGE_PORT=8082
OLLAMA_HOST=http://ollama:11434

# Web UI Settings
WEB_UI_PORT=3000
EOF
fi

# Load environment variables from .env
set -a
source .env
set +a

# Deploy all containers
echo "Building and deploying all containers..."
docker-compose build
docker-compose up -d

echo "==========================================="
echo "Redeployment completed"
echo "==========================================="

# Display running containers
echo "Running containers:"
docker-compose ps