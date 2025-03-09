#!/bin/bash

# Deploy script for MCP Project
# Created on 2025-03-07

set -e

echo "==========================================="
echo "MCP Project Deployment Script"
echo "==========================================="

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running or not accessible"
  exit 1
fi

# Create necessary directories
mkdir -p ./backend/data/memory
mkdir -p ./backend/data/ollama
mkdir -p ./backend/config

# Build and deploy specific containers
deploy_container() {
  local service_name=$1
  echo "Building and deploying $service_name..."
  
  # Get container name from docker-compose
  local container_name=$(docker-compose config | grep -A 1 "$service_name:" | grep container_name | awk '{print $2}')
  
  # Check if an old container with the same name exists but different format
  if [[ -z "$container_name" ]]; then
    echo "Container name not found in docker-compose.yml"
  else
    # Stop and remove any existing container with same name
    echo "Checking for existing container: $container_name"
    if docker ps -a | grep -q "$container_name"; then
      echo "Stopping and removing existing container: $container_name"
      docker stop "$container_name" || true
      docker rm "$container_name" || true
    fi
    
    # Also check for old naming format containers
    local old_name="mothership_${service_name/mcp-/mcp_}"
    if docker ps -a | grep -q "$old_name"; then
      echo "Stopping and removing old format container: $old_name"
      docker stop "$old_name" || true
      docker rm "$old_name" || true
    fi
  fi
  
  docker-compose build "$service_name"
  docker-compose up -d "$service_name"
  echo "$service_name deployed successfully"
}

# Deploy all containers
deploy_all() {
  echo "Building and deploying all containers..."
  
  # Stop all existing containers that might conflict
  echo "Stopping existing containers..."
  docker-compose down
  
  # Stop any remaining containers with old naming format
  local old_containers=$(docker ps -a | grep 'mothership_mcp' | awk '{print $1}')
  if [[ -n "$old_containers" ]]; then
    echo "Stopping old format containers..."
    docker stop $old_containers || true
    docker rm $old_containers || true
  fi
  
  docker-compose build
  docker-compose up -d
  echo "All containers deployed successfully"
}

# Show help
show_help() {
  echo "Usage: ./deploy.sh [OPTION]"
  echo "Options:"
  echo "  base       - Deploy Base MCP Server"
  echo "  memory     - Deploy Memory MCP Server"
  echo "  filesystem - Deploy Filesystem MCP Server"
  echo "  brave      - Deploy Brave Search MCP Server"
  echo "  auth       - Deploy Auth MCP Server"
  echo "  ollama     - Deploy Ollama Server"
  echo "  bridge     - Deploy Ollama Bridge"
  echo "  webui      - Deploy Web UI"
  echo "  dashboard  - Deploy Vue Dashboard"  # Added this option
  echo "  all        - Deploy all containers"
  echo "  help       - Show this help"
}

# Process command line arguments
if [ $# -eq 0 ]; then
  show_help
  exit 0
fi

case "$1" in
  base)
    deploy_container "mcp-base-server"
    ;;
  memory)
    deploy_container "mcp-memory-server"
    ;;
  filesystem)
    deploy_container "mcp-filesystem-server"
    ;;
  brave)
    deploy_container "mcp-brave-search-server"
    ;;
  auth)
    deploy_container "mcp-auth-server"
    ;;
  ollama)
    deploy_container "ollama"
    ;;
  bridge)
    deploy_container "mcp-ollama-bridge"
    ;;
  webui)
    deploy_container "mcp-web-ui"
    ;;
  dashboard)  # Added this option
    deploy_container "vue-dashboard"
    ;;
  all)
    deploy_all
    ;;
  help)
    show_help
    ;;
  *)
    echo "Unknown option: $1"
    show_help
    exit 1
    ;;
esac

echo "==========================================="
echo "Deployment completed"
echo "==========================================="

# Display running containers
docker-compose ps