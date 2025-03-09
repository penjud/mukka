#!/bin/bash
# MCP Service Startup Script
# This script handles port cleanup and service startup for the MCP system

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service ports to check and clean up
declare -A SERVICE_PORTS=(
  ["auth-server"]=8097
  ["base-server"]=8090
  ["memory-server"]=8094
  ["filesystem-server"]=8095
  ["brave-search-server"]=8096
  ["ollama-bridge"]=8082
  ["web-ui"]=3001
  ["vue-dashboard"]=3002
)

# Function to check if a port is in use
check_port() {
  local port=$1
  lsof -i :$port >/dev/null 2>&1
  return $?
}

# Function to kill processes using a specific port
kill_port() {
  local port=$1
  local force=$2
  
  echo -e "${YELLOW}Checking port $port...${NC}"
  
  # Find PIDs using this port
  local pids=$(lsof -t -i :$port 2>/dev/null)
  
  if [ -z "$pids" ]; then
    echo -e "${GREEN}Port $port is free${NC}"
    return 0
  fi
  
  echo -e "${RED}Port $port is in use by process(es): $pids${NC}"
  
  for pid in $pids; do
    local process_name=$(ps -p $pid -o comm= 2>/dev/null)
    
    if [ -n "$process_name" ]; then
      if [ "$force" = "true" ]; then
        echo -e "${YELLOW}Killing process $pid ($process_name) using port $port...${NC}"
        kill -9 $pid
        if [ $? -eq 0 ]; then
          echo -e "${GREEN}Process $pid killed successfully${NC}"
        else
          echo -e "${RED}Failed to kill process $pid${NC}"
          return 1
        fi
      else
        echo -e "${RED}Process $pid ($process_name) is using port $port.${NC}"
        read -p "Kill this process? (y/n): " choice
        if [[ $choice == "y" || $choice == "Y" ]]; then
          kill -9 $pid
          if [ $? -eq 0 ]; then
            echo -e "${GREEN}Process $pid killed successfully${NC}"
          else
            echo -e "${RED}Failed to kill process $pid${NC}"
            return 1
          fi
        else
          echo -e "${YELLOW}Skipping process $pid${NC}"
          return 1
        fi
      fi
    else
      echo -e "${RED}Process $pid not found${NC}"
    fi
  done
  
  # Double check the port is now free
  sleep 1
  if check_port $port; then
    echo -e "${RED}Port $port is still in use!${NC}"
    return 1
  else
    echo -e "${GREEN}Port $port is now free${NC}"
    return 0
  fi
}

# Function to start MCP service
start_service() {
  local service=$1
  local force=$2
  local port=${SERVICE_PORTS[$service]}
  
  echo -e "\n${BLUE}=== Starting MCP $service ===${NC}"
  
  # Kill any processes using the required port
  if ! kill_port $port $force; then
    echo -e "${RED}Failed to free port $port for $service${NC}"
    return 1
  fi
  
  # Start the service based on service name
  case $service in
    "auth-server")
      echo -e "${BLUE}Starting Auth Server...${NC}"
      cd /home/mothership/mukka/backend/services/auth && npm start &
      ;;
    "base-server")
      echo -e "${BLUE}Starting Base Server...${NC}"
      cd /home/mothership/mukka/backend/services/base && npm start &
      ;;
    "memory-server")
      echo -e "${BLUE}Starting Memory Server...${NC}"
      cd /home/mothership/mukka/backend/services/memory && npm start &
      ;;
    "filesystem-server")
      echo -e "${BLUE}Starting Filesystem Server...${NC}"
      cd /home/mothership/mukka/backend/services/filesystem && npm start &
      ;;
    "brave-search-server")
      echo -e "${BLUE}Starting Brave Search Server...${NC}"
      cd /home/mothership/mukka/backend/services/brave-search && npm start &
      ;;
    "ollama-bridge")
      echo -e "${BLUE}Starting Ollama Bridge...${NC}"
      cd /home/mothership/mukka/backend/services/ollama-bridge && npm start &
      ;;
    "web-ui")
      echo -e "${BLUE}Starting Web UI...${NC}"
      cd /home/mothership/mukka/frontend/web-ui && npm start &
      ;;
    "vue-dashboard")
      echo -e "${BLUE}Starting Vue Dashboard...${NC}"
      cd /home/mothership/mukka/frontend/vue-dashboard && npm run serve &
      ;;
    *)
      echo -e "${RED}Unknown service: $service${NC}"
      return 1
      ;;
  esac
  
  echo -e "${GREEN}Started $service on port $port${NC}"
  return 0
}

# Function to start Docker services
start_docker_services() {
  local force=$1
  
  echo -e "\n${BLUE}=== Starting Docker Services ===${NC}"
  
  # First, check and free all required ports
  for service in "${!SERVICE_PORTS[@]}"; do
    local port=${SERVICE_PORTS[$service]}
    kill_port $port $force
  done
  
  # Start all services using docker-compose
  echo -e "${BLUE}Starting all MCP services with Docker Compose...${NC}"
  cd /home/mothership/mukka && docker-compose up -d
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Docker services started successfully${NC}"
    return 0
  else
    echo -e "${RED}Failed to start Docker services${NC}"
    return 1
  fi
}

# Function to display help
show_help() {
  echo -e "${BLUE}MCP Service Startup Script${NC}"
  echo -e "Usage: $0 [options] [service...]"
  echo -e "\nOptions:"
  echo -e "  -h, --help     Show this help message"
  echo -e "  -f, --force    Kill processes without asking"
  echo -e "  -d, --docker   Start all services with Docker Compose"
  echo -e "\nAvailable services:"
  for service in "${!SERVICE_PORTS[@]}"; do
    echo -e "  $service (port: ${SERVICE_PORTS[$service]})"
  done
  echo -e "\nExamples:"
  echo -e "  $0 auth-server                # Start Auth Server only"
  echo -e "  $0 base-server auth-server    # Start Base and Auth servers"
  echo -e "  $0 -f auth-server             # Force start Auth Server (kill processes without asking)"
  echo -e "  $0 -d                         # Start all services with Docker Compose"
}

# Main script
force_mode=false
use_docker=false
services=()

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_help
      exit 0
      ;;
    -f|--force)
      force_mode=true
      shift
      ;;
    -d|--docker)
      use_docker=true
      shift
      ;;
    *)
      if [[ -n ${SERVICE_PORTS[$1]} ]]; then
        services+=("$1")
      else
        echo -e "${RED}Unknown service or option: $1${NC}"
        show_help
        exit 1
      fi
      shift
      ;;
  esac
done

# If Docker mode is specified, start all services with Docker
if [ "$use_docker" = true ]; then
  start_docker_services $force_mode
  exit $?
fi

# If no services specified and not using Docker, show help
if [ ${#services[@]} -eq 0 ]; then
  echo -e "${YELLOW}No services specified${NC}"
  show_help
  exit 1
fi

# Start each specified service
for service in "${services[@]}"; do
  start_service $service $force_mode
done

echo -e "\n${GREEN}Startup complete!${NC}"
echo -e "${YELLOW}Note: Services are running in the background. Use 'docker ps' or 'ps aux | grep node' to check the status.${NC}"
