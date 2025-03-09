#!/bin/bash
# Simple script to start the Auth Server after killing any process using port 8097

echo "Checking for processes using port 8097..."
PORT_PIDS=$(lsof -t -i:8097 2>/dev/null)

if [ -n "$PORT_PIDS" ]; then
  echo "Found processes using port 8097: $PORT_PIDS"
  echo "Killing processes..."
  
  # Kill each process
  for PID in $PORT_PIDS; do
    echo "Killing process $PID"
    kill -9 $PID
  done
  
  # Wait a moment to ensure processes are killed
  sleep 1
  
  # Double check
  REMAINING=$(lsof -t -i:8097 2>/dev/null)
  if [ -n "$REMAINING" ]; then
    echo "ERROR: Failed to kill all processes. Port 8097 is still in use."
    exit 1
  fi
else
  echo "Port 8097 is free."
fi

# Go to Auth Server directory
cd /home/mothership/mukka/backend/services/auth

# Update the service registration URL if needed
echo "Checking service registration URL in index.js..."
if grep -q "mukka-mcp-auth-server" src/index.js; then
  echo "Updating service registration URL to use correct service name..."
  sed -i 's/http:\/\/mukka-mcp-auth-server/http:\/\/mcp-auth-server/g' src/index.js
  echo "Updated service registration URL."
fi

# Start the Auth Server
echo "Starting Auth Server..."
npm start
