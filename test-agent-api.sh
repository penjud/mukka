#!/bin/bash

echo "Testing Memory MCP Agent Management API..."
echo "1. Getting all agents..."
curl -s http://localhost:8094/api/agents | jq

echo -e "\n2. Creating a test agent..."
curl -X POST -H "Content-Type: application/json" -d '{
  "name": "Test Script Agent",
  "description": "An agent created by the test script",
  "traits": ["friendly", "helpful"],
  "expertise": ["testing", "debugging"],
  "systemPrompt": "You are a helpful test agent."
}' http://localhost:8094/api/agents | jq

# Get the ID of the newly created agent
AGENT_ID=$(curl -s http://localhost:8094/api/agents | jq -r '.[0].id')

echo -e "\n3. Creating a conversation with agent ID $AGENT_ID..."
curl -X POST -H "Content-Type: application/json" -d "{
  \"title\": \"Test Conversation with Agent\",
  \"agentId\": \"$AGENT_ID\"
}" http://localhost:8094/conversations | jq

echo -e "\n4. Getting agent system prompt..."
curl -s http://localhost:8094/api/agents/$AGENT_ID/systemPrompt | jq

echo -e "\nTest completed."
