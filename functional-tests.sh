#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}MCP Functional Tests${NC}"
echo "===============================\n"

# Function to discover API prefix for a service
discover_api_prefix() {
  local host=$1
  local port=$2
  local service_name=$3
  
  # Try different common API prefixes
  local prefixes=("/api" "/v1" "/api/v1" "")
  
  for prefix in "${prefixes[@]}"; do
    # For memory server, try to discover conversations endpoint
    if [[ "$service_name" == "memory" ]]; then
      local test_path="${prefix}/conversations"
      local response=$(curl -s -o /dev/null -w "%{http_code}" "http://${host}:${port}${test_path}")
      
      if [[ "$response" != "404" ]]; then
        echo "$prefix"
        return 0
      fi
    # For filesystem server, try to discover browse endpoint
    elif [[ "$service_name" == "filesystem" ]]; then
      local test_path="${prefix}/browse"
      local response=$(curl -s -o /dev/null -w "%{http_code}" "http://${host}:${port}${test_path}?path=/")
      
      if [[ "$response" != "404" ]]; then
        echo "$prefix"
        return 0
      fi
    # For Ollama bridge, try to discover models endpoint
    elif [[ "$service_name" == "ollama" ]]; then
      local test_path="${prefix}/models"
      local response=$(curl -s -o /dev/null -w "%{http_code}" "http://${host}:${port}${test_path}")
      
      if [[ "$response" != "404" ]]; then
        echo "$prefix"
        return 0
      fi
    # For Brave search, try to discover search endpoint
    elif [[ "$service_name" == "brave" ]]; then
      local test_path="${prefix}/search"
      local response=$(curl -s -o /dev/null -w "%{http_code}" "http://${host}:${port}${test_path}?query=test")
      
      if [[ "$response" != "404" ]]; then
        echo "$prefix"
        return 0
      fi
    fi
  done
  
  # If no valid prefix found, return empty string
  echo ""
  return 1
}

# Get auth token first
echo -e "${BLUE}Step 1: Authenticating with Auth Server${NC}"
AUTH_RESPONSE=$(curl -s -X POST http://localhost:8097/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}')

# Extract the token from the response
AUTH_TOKEN=$(echo $AUTH_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# If token isn't in the response, check if we have a token in a cookie
if [[ -z "$AUTH_TOKEN" ]]; then
  COOKIE_FILE=$(mktemp)
  curl -s -c "$COOKIE_FILE" -X POST http://localhost:8097/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' > /dev/null
  
  # Check cookie for token
  if grep -q "token" "$COOKIE_FILE"; then
    TOKEN_FROM_COOKIE=true
    echo -e "${GREEN}✓ Successfully obtained authentication token from cookie${NC}"
  else
    echo -e "${RED}✗ Authentication failed. Cannot proceed with tests.${NC}"
    rm -f "$COOKIE_FILE"
    exit 1
  fi
else
  TOKEN_FROM_COOKIE=false
  echo -e "${GREEN}✓ Successfully obtained authentication token from response${NC}"
fi

# Create auth header or use cookie file based on what we got
if [[ "$TOKEN_FROM_COOKIE" == "true" ]]; then
  AUTH_OPTION="-b $COOKIE_FILE"
else
  AUTH_OPTION="-H \"Authorization: Bearer $AUTH_TOKEN\""
fi

# Function to make API calls with proper auth
api_call() {
    local method=$1
    local url=$2
    local data=$3
    local headers=$4
    
    local command="curl -s -X $method '"
    
    # Add URL
    command+="$url'"
    
    # Add auth option
    if [[ "$TOKEN_FROM_COOKIE" == "true" ]]; then
        command+=" -b $COOKIE_FILE"
    else
        command+=" -H 'Authorization: Bearer $AUTH_TOKEN'"
    fi
    
    # Add content-type header for POST/PUT requests
    if [[ "$method" == "POST" || "$method" == "PUT" ]]; then
        command+=" -H 'Content-Type: application/json'"
    fi
    
    # Add additional headers if provided
    if [[ -n "$headers" ]]; then
        command+=" $headers"
    fi
    
    # Add data if provided
    if [[ -n "$data" ]]; then
        command+=" -d '$data'"
    fi
    
    # Execute the command and return the result
    eval "$command"
}

# Discover API prefixes for each service
echo -e "\n${BLUE}Step 2: Discovering API endpoints${NC}"
MEMORY_API_PREFIX=$(discover_api_prefix "localhost" "8092" "memory")
echo -e "Memory API prefix: $MEMORY_API_PREFIX"

FILESYSTEM_API_PREFIX=$(discover_api_prefix "localhost" "8091" "filesystem")
echo -e "Filesystem API prefix: $FILESYSTEM_API_PREFIX"

BRAVE_API_PREFIX=$(discover_api_prefix "localhost" "8096" "brave")
echo -e "Brave Search API prefix: $BRAVE_API_PREFIX"

OLLAMA_API_PREFIX=$(discover_api_prefix "localhost" "8082" "ollama")
echo -e "Ollama API prefix: $OLLAMA_API_PREFIX"
echo -e "\n${BLUE}Step 3: Testing Memory MCP - Conversation History${NC}"
echo -e "${YELLOW}Creating test conversation...${NC}"
# Create a conversation
CONV_RESPONSE=$(api_call "POST" "http://localhost:8092${MEMORY_API_PREFIX}/conversations" '{"title":"Test Conversation"}')
echo -e "${YELLOW}Debug - Response: ${NC}$(echo $CONV_RESPONSE | cut -c 1-100)..."
CONV_ID=$(echo $CONV_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [[ -z "$CONV_ID" ]]; then
  echo -e "${RED}✗ Failed to create conversation${NC}"
else
  echo -e "${GREEN}✓ Created test conversation with ID: $CONV_ID${NC}"
  
  # Add a message to the conversation
  echo -e "${YELLOW}Adding message to conversation...${NC}"
  MSG_RESPONSE=$(api_call "POST" "http://localhost:8092${MEMORY_API_PREFIX}/conversations/$CONV_ID/messages" '{"role":"user","content":"This is a test message"}')
  echo -e "${YELLOW}Debug - Response: ${NC}$(echo $MSG_RESPONSE | cut -c 1-100)..."
  
  if echo $MSG_RESPONSE | grep -q "id"; then
    echo -e "${GREEN}✓ Added message to conversation${NC}"
    
    # Retrieve messages to verify
    echo -e "${YELLOW}Retrieving conversation messages...${NC}"
    MSGS_RESPONSE=$(api_call "GET" "http://localhost:8092${MEMORY_API_PREFIX}/conversations/$CONV_ID/messages")
    echo -e "${YELLOW}Debug - Response: ${NC}$(echo $MSGS_RESPONSE | cut -c 1-100)..."
    
    if echo $MSGS_RESPONSE | grep -q "This is a test message"; then
      echo -e "${GREEN}✓ Successfully retrieved message from conversation${NC}"
    else
      echo -e "${RED}✗ Could not retrieve message from conversation${NC}"
    fi
  else
    echo -e "${RED}✗ Failed to add message to conversation${NC}"
  fi
fi

echo -e "\n${BLUE}Step 4: Testing Filesystem MCP - File Browsing${NC}"
echo -e "${YELLOW}Listing files in root directory...${NC}"
FS_RESPONSE=$(api_call "GET" "http://localhost:8091${FILESYSTEM_API_PREFIX}/browse?path=/home/mothership")
echo -e "${YELLOW}Debug - Response: ${NC}$(echo $FS_RESPONSE | cut -c 1-100)..."

if echo $FS_RESPONSE | grep -q "mukka"; then
  echo -e "${GREEN}✓ Successfully listed files in the root directory${NC}"
  
  # Try to read a file
  echo -e "${YELLOW}Reading a file...${NC}"
  FILE_RESPONSE=$(api_call "GET" "http://localhost:8091${FILESYSTEM_API_PREFIX}/read?file=/home/mothership/mukka/README.md")
  echo -e "${YELLOW}Debug - Response: ${NC}$(echo $FILE_RESPONSE | cut -c 1-100)..."
  
  if [[ -n "$FILE_RESPONSE" && "$FILE_RESPONSE" != "null" ]]; then
    echo -e "${GREEN}✓ Successfully read a file${NC}"
  else
    echo -e "${RED}✗ Failed to read a file${NC}"
  fi
else
  echo -e "${RED}✗ Failed to list files in the root directory${NC}"
fi

echo -e "\n${BLUE}Step 5: Testing Brave Search MCP${NC}"
echo -e "${YELLOW}Performing a web search...${NC}"
SEARCH_RESPONSE=$(api_call "GET" "http://localhost:8096${BRAVE_API_PREFIX}/search?query=test%20query")
echo -e "${YELLOW}Debug - Response: ${NC}$(echo $SEARCH_RESPONSE | cut -c 1-100)..."

if echo $SEARCH_RESPONSE | grep -q "results"; then
  echo -e "${GREEN}✓ Web search successful${NC}"
else
  echo -e "${RED}✗ Web search failed${NC}"
fi

echo -e "\n${BLUE}Step 6: Testing Ollama Bridge - Model Switching${NC}"
echo -e "${YELLOW}Listing available models...${NC}"
MODELS_RESPONSE=$(api_call "GET" "http://localhost:8082${OLLAMA_API_PREFIX}/models")
echo -e "${YELLOW}Debug - Response: ${NC}$(echo $MODELS_RESPONSE | cut -c 1-100)..."

if echo $MODELS_RESPONSE | grep -q "name"; then
  echo -e "${GREEN}✓ Successfully listed available models${NC}"
  
  # Get the first model name
  MODEL_NAME=$(echo $MODELS_RESPONSE | grep -o '"name":"[^"]*' | head -1 | cut -d'"' -f4)
  
  if [[ -n "$MODEL_NAME" ]]; then
    echo -e "${YELLOW}Testing chat with model: $MODEL_NAME${NC}"
    CHAT_RESPONSE=$(api_call "POST" "http://localhost:8082${OLLAMA_API_PREFIX}/chat" "{\"model\":\"$MODEL_NAME\",\"messages\":[{\"role\":\"user\",\"content\":\"Hello, this is a test\"}]}")
    echo -e "${YELLOW}Debug - Response: ${NC}$(echo $CHAT_RESPONSE | cut -c 1-100)..."
    
    if echo $CHAT_RESPONSE | grep -q "content"; then
      echo -e "${GREEN}✓ Chat with model successful${NC}"
    else
      echo -e "${RED}✗ Chat with model failed${NC}"
    fi
  else
    echo -e "${RED}✗ Could not determine model name${NC}"
  fi
else
  echo -e "${RED}✗ Failed to list available models${NC}"
fi

echo -e "\n${YELLOW}Functional Tests Complete!${NC}"
echo "===============================\n"

# Clean up
if [[ "$TOKEN_FROM_COOKIE" == "true" ]]; then
  rm -f "$COOKIE_FILE"
fi
