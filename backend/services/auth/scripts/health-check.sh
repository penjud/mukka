#!/bin/bash
# Auth Server Health Check Script

echo "=================================================="
echo "     MCP Auth Server Health Check                 "
echo "=================================================="

# Check if the Auth Server is running
echo -n "🔍 Checking if Auth Server is running... "
if curl -s http://localhost:8097/health > /dev/null; then
  echo "✅ Running"
else
  echo "❌ Not running"
  echo "   Try: docker-compose up -d mcp-auth-server"
  exit 1
fi

# Check health endpoint
echo -n "🔍 Checking Auth Server health... "
AUTH_RESPONSE=$(curl -s http://localhost:8097/health)

if [[ $AUTH_RESPONSE == *"healthy"* ]]; then
  echo "✅ Healthy"
else
  echo "❌ Unhealthy"
  echo "   Response: $AUTH_RESPONSE"
  exit 1
fi

# Check MongoDB connection (if applicable)
echo -n "🔍 Checking database connection... "
DB_RESPONSE=$(curl -s http://localhost:8097/health/db)

if [[ $DB_RESPONSE == *"connected"* || $DB_RESPONSE == *"active"* ]]; then
  echo "✅ Connected"
  echo "   $(echo $DB_RESPONSE | sed 's/[{}]//g')"
else
  echo "❌ Disconnected"
  echo "   Response: $DB_RESPONSE"
fi

# Check Base Server communication
echo -n "🔍 Checking Base Server communication... "
if curl -s http://localhost:8090/health > /dev/null; then
  echo "✅ Base Server running"
else
  echo "❌ Base Server not running"
  echo "   Try: docker-compose up -d mcp-base-server"
  exit 1
fi

# Check service registration
echo -n "🔍 Checking Auth Server registration... "
REG_RESPONSE=$(curl -s http://localhost:8090/services/list)

if [[ $REG_RESPONSE == *"auth"* ]]; then
  echo "✅ Registered with Base Server"
else
  echo "❌ Not registered with Base Server"
  echo "   Services: $REG_RESPONSE"
  echo "   The Auth Server might still be trying to register."
  echo "   Wait a few seconds and try again."
fi

# Check Web UI accessibility
echo -n "🔍 Checking Web UI accessibility... "
if curl -s http://localhost:3002 > /dev/null; then
  echo "✅ Web UI accessible"
else
  echo "❌ Web UI not accessible"
  echo "   Try: docker-compose up -d mcp-web-ui"
fi

# Check for log errors
echo -n "🔍 Checking for recent errors in logs... "
ERROR_COUNT=$(docker logs --tail 100 mukka-mcp-auth-server 2>&1 | grep -i error | wc -l)

if [ $ERROR_COUNT -eq 0 ]; then
  echo "✅ No recent errors"
else
  echo "⚠️ Found $ERROR_COUNT errors in recent logs"
  echo "   View with: docker logs mukka-mcp-auth-server | grep -i error"
fi

echo ""
echo "=================================================="
echo "                 OVERALL STATUS                    "
echo "=================================================="
echo ""
echo "Auth Server appears to be running correctly."
echo "For more detailed diagnostics, run:"
echo "  docker logs mukka-mcp-auth-server -f"
echo ""
echo "To check environment variables:"
echo "  docker exec mukka-mcp-auth-server env"
echo ""
echo "To enter the container:"
echo "  docker exec -it mukka-mcp-auth-server /bin/sh"
echo ""
echo "=================================================="
