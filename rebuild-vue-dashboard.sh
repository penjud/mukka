#!/bin/bash
set -e

echo "Rebuilding Vue Dashboard..."

# Stop and remove the current container
echo "Stopping current container..."
docker stop mukka-vue-dashboard || true
docker rm mukka-vue-dashboard || true

# Run the new container with volume mount
echo "Starting new container..."
docker run -d \
  --name mukka-vue-dashboard \
  --network mukka_mukka-network \
  -v /home/mothership/mukka/frontend/vue-dashboard:/app \
  -p 3002:8080 \
  -w /app \
  -e "HOST=0.0.0.0" \
  node:18-alpine \
  sh -c "npm install && npm run dev -- --host 0.0.0.0"

echo "Vue Dashboard rebuilt and restarted."
