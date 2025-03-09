#!/bin/bash

# Start script for MCP Auth Server
# Usage: ./start.sh [options]
# Options:
#   --mongo      Enable MongoDB (default: false)
#   --dev        Run in development mode (default: production)
#   --port PORT  Set custom port (default: 8097)

# Default settings
USE_MONGO=false
NODE_ENV=production
PORT=8097

# Parse command line args
while [[ $# -gt 0 ]]; do
  case $1 in
    --mongo)
      USE_MONGO=true
      shift
      ;;
    --dev)
      NODE_ENV=development
      shift
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Set environment variables
export NODE_ENV=$NODE_ENV
export PORT=$PORT
export USE_MONGODB=$USE_MONGO

echo "Starting MCP Auth Server..."
echo "Environment: $NODE_ENV"
echo "Port: $PORT"
echo "MongoDB: $USE_MONGO"

# Start the server
node src/index.js
