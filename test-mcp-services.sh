#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing MCP Services Connectivity${NC}"
echo "=================================="

# Test Base Server
echo -e "\n${YELLOW}Testing Base MCP Server (port 8090)${NC}"
if curl -s http://localhost:8090 > /dev/null; then
  echo -e "${GREEN}✓ Base MCP Server is running${NC}"
else
  echo -e "${RED}✗ Base MCP Server is not responding${NC}"
fi

# Test Memory Server
echo -e "\n${YELLOW}Testing Memory MCP Server (port 8092)${NC}"
if curl -s http://localhost:8092 > /dev/null; then
  echo -e "${GREEN}✓ Memory MCP Server is running${NC}"
else
  echo -e "${RED}✗ Memory MCP Server is not responding${NC}"
fi

# Test Filesystem Server
echo -e "\n${YELLOW}Testing Filesystem MCP Server (port 8091)${NC}"
if curl -s http://localhost:8091 > /dev/null; then
  echo -e "${GREEN}✓ Filesystem MCP Server is running${NC}"
else
  echo -e "${RED}✗ Filesystem MCP Server is not responding${NC}"
fi

# Test Brave Search Server
echo -e "\n${YELLOW}Testing Brave Search MCP Server (port 8096)${NC}"
if curl -s http://localhost:8096 > /dev/null; then
  echo -e "${GREEN}✓ Brave Search MCP Server is running${NC}"
else
  echo -e "${RED}✗ Brave Search MCP Server is not responding${NC}"
fi

# Test Auth Server
echo -e "\n${YELLOW}Testing Auth MCP Server (port 8097)${NC}"
if curl -s http://localhost:8097 > /dev/null; then
  echo -e "${GREEN}✓ Auth MCP Server is running${NC}"
else
  echo -e "${RED}✗ Auth MCP Server is not responding${NC}"
fi

# Test Ollama Server
echo -e "\n${YELLOW}Testing Ollama Server (port 11434)${NC}"
if curl -s http://localhost:11434/api/version > /dev/null; then
  echo -e "${GREEN}✓ Ollama Server is running${NC}"
else
  echo -e "${RED}✗ Ollama Server is not responding${NC}"
fi

# Test Ollama Bridge Server
echo -e "\n${YELLOW}Testing Ollama Bridge Server (port 8082)${NC}"
if curl -s http://localhost:8082 > /dev/null; then
  echo -e "${GREEN}✓ Ollama Bridge Server is running${NC}"
else
  echo -e "${RED}✗ Ollama Bridge Server is not responding${NC}"
fi

# Test Web UI
echo -e "\n${YELLOW}Testing MCP Web UI (port 3001)${NC}"
if curl -s http://localhost:3001 > /dev/null; then
  echo -e "${GREEN}✓ MCP Web UI is running${NC}"
else
  echo -e "${RED}✗ MCP Web UI is not responding${NC}"
fi

# Check service registry in Base Server
echo -e "\n${YELLOW}Checking service registry in Base Server${NC}"
REGISTRY=$(curl -s http://localhost:8090/services 2>/dev/null || curl -s http://localhost:8090/api/services 2>/dev/null || echo '{}')

# Log what we received for debugging
echo -e "${YELLOW}Registry response: ${NC}$(echo $REGISTRY | cut -c 1-100)..."

# Simple checks for service names in response
echo $REGISTRY | grep -q "memory" && echo -e "${GREEN}\u2713 Memory service found in response${NC}" || echo -e "${RED}\u2717 Memory service not found in response${NC}"
echo $REGISTRY | grep -q "filesystem" && echo -e "${GREEN}\u2713 Filesystem service found in response${NC}" || echo -e "${RED}\u2717 Filesystem service not found in response${NC}"
echo $REGISTRY | grep -q "brave-search" && echo -e "${GREEN}\u2713 Brave Search service found in response${NC}" || echo -e "${RED}\u2717 Brave Search service not found in response${NC}"
echo $REGISTRY | grep -q "ollama" && echo -e "${GREEN}\u2713 Ollama service found in response${NC}" || echo -e "${RED}\u2717 Ollama service not found in response${NC}"
echo $REGISTRY | grep -q "auth" && echo -e "${GREEN}\u2713 Auth service found in response${NC}" || echo -e "${RED}\u2717 Auth service not found in response${NC}"

# Test Auth Login with default credentials
echo -e "\n${YELLOW}Testing Auth Login with default credentials${NC}"
LOGIN_RESULT=$(curl -s -X POST http://localhost:8097/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}')
if echo $LOGIN_RESULT | grep -q "Login successful"; then
  echo -e "${GREEN}✓ Auth login successful${NC}"
else
  echo -e "${RED}✗ Auth login failed${NC}"
fi

echo -e "\n${YELLOW}Test complete!${NC}"
