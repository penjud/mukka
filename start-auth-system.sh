#!/bin/bash
# Script to start Base Server and Auth Server directly

echo "Starting MCP Authentication System..."

# Kill any processes using required ports
echo "Checking and freeing ports..."
kill -9 $(lsof -t -i:8090 2>/dev/null) 2>/dev/null
kill -9 $(lsof -t -i:8097 2>/dev/null) 2>/dev/null

# Wait for ports to be freed
sleep 2

# Start Base Server
echo "Starting Base Server..."
cd /home/mothership/mukka/backend/services/base
if [ ! -d "node_modules" ]; then
  echo "Installing Base Server dependencies..."
  npm install
fi
NODE_ENV=development PORT=8090 node src/index.js > base-server.log 2>&1 &
BASE_PID=$!
echo "Base Server started with PID $BASE_PID"

# Wait for Base Server to start
echo "Waiting for Base Server to initialize..."
sleep 5

# Start Auth Server
echo "Starting Auth Server..."
cd /home/mothership/mukka/backend/services/auth
if [ ! -d "node_modules" ]; then
  echo "Installing Auth Server dependencies..."
  npm install
fi

# Update the Auth Server code to use proper service naming
echo "Updating Auth Server registration URL..."
sed -i 's/http:\/\/mukka-mcp-auth-server/http:\/\/mcp-auth-server/g' src/index.js
sed -i 's/http:\/\/mukka-mcp-base-server/http:\/\/mcp-base-server/g' src/index.js

# Set environment variables and start the Auth Server
NODE_ENV=development PORT=8097 BASE_SERVER_URL=http://localhost:8090 node src/index.js > auth-server.log 2>&1 &
AUTH_PID=$!
echo "Auth Server started with PID $AUTH_PID"

echo "Done! Both servers should now be running."
echo "To check logs, run:"
echo "  cat /home/mothership/mukka/backend/services/base/base-server.log"
echo "  cat /home/mothership/mukka/backend/services/auth/auth-server.log"
