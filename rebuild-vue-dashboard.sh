#!/bin/bash
# Script to rebuild the Vue Dashboard

echo "Rebuilding Vue Dashboard with updated Admin Settings..."

# Navigate to the project directory
cd /home/mothership/mukka

# Stop the Vue Dashboard container
echo "Stopping Vue Dashboard container..."
docker stop mukka-vue-dashboard

# Remove the container
echo "Removing Vue Dashboard container..."
docker rm mukka-vue-dashboard

# Rebuild the Vue Dashboard
echo "Rebuilding Vue Dashboard..."
docker-compose build vue-dashboard

# Start the Vue Dashboard
echo "Starting Vue Dashboard..."
docker-compose up -d vue-dashboard

echo -e "\nRebuild complete. Vue Dashboard is now updated with new Admin Settings."
echo "Access the dashboard at http://localhost:3002"
