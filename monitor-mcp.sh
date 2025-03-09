#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a container is running
check_container() {
  local container_name=$1
  if docker ps | grep -q $container_name; then
    echo -e "${GREEN}✓ $container_name is running${NC}"
    return 0
  else
    echo -e "${RED}✗ $container_name is not running${NC}"
    return 1
  fi
}

# Function to check if a service is responding
check_service() {
  local service_name=$1
  local url=$2
  if curl -s $url > /dev/null; then
    echo -e "${GREEN}✓ $service_name is responding${NC}"
    return 0
  else
    echo -e "${RED}✗ $service_name is not responding${NC}"
    return 1
  fi
}

# Clear screen
clear

echo -e "${YELLOW}MCP Services Monitor${NC}"
echo "======================"
echo "Press Ctrl+C to exit"
echo ""

while true; do
  echo -e "${BLUE}$(date)${NC}"
  echo "--------------------"
  
  # Check containers
  check_container "mukka-mcp-base-server"
  check_container "mukka-mcp-memory-server"
  check_container "mukka-mcp-filesystem-server"
  check_container "mukka-mcp-brave-search-server"
  check_container "mukka-ollama"
  check_container "mukka-mcp-ollama-server"
  check_container "mukka-mcp-web-ui"
  
  echo ""
  echo -e "${YELLOW}Service Health${NC}"
  echo "--------------------"
  
  # Check services
  check_service "Base Server" "http://localhost:8090"
  check_service "Memory Server" "http://localhost:8094"
  check_service "Filesystem Server" "http://localhost:8095"
  check_service "Brave Search Server" "http://localhost:8096"
  check_service "Ollama Server" "http://localhost:11434/api/version"
  check_service "Ollama Bridge" "http://localhost:8082"
  check_service "Web UI" "http://localhost:3001"
  
  # Get service registry from base server
  echo ""
  echo -e "${YELLOW}Registered Services${NC}"
  echo "--------------------"
  services=$(curl -s http://localhost:8090/services/list)
  if [ $? -eq 0 ]; then
    echo "$services" | grep -o '"name":"[^"]*' | cut -d'"' -f4 | while read service; do
      echo -e "${GREEN}✓ $service${NC}"
    done
  else
    echo -e "${RED}✗ Could not retrieve service registry${NC}"
  fi
  
  # Sleep and clear screen
  sleep 10
  clear
done
