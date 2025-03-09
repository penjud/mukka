#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Loading Ollama Models${NC}"
echo "======================="

# Check if Ollama container is running
if ! docker ps | grep -q mukka-ollama; then
  echo -e "${RED}Error: Ollama container not running. Start containers first.${NC}"
  exit 1
fi

# List of models to load
MODELS=(
  "llama3.1:8b"
  "dolphin-mistral:7b"
  "qwen2.5:7b"
  "mistral:7b-instruct-v0.2"
  "phi4-mini:3.8b"
  "neural-daredevil:8b"
)

# Pull each model
for MODEL in "${MODELS[@]}"; do
  echo -e "\n${BLUE}Pulling model: ${MODEL}${NC}"
  docker exec -it mukka-ollama ollama pull $MODEL
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Successfully loaded ${MODEL}${NC}"
  else
    echo -e "${RED}✗ Failed to load ${MODEL}${NC}"
  fi
done

echo -e "\n${GREEN}Model loading complete!${NC}"
echo "You can now use these models via the Ollama Bridge Server"
