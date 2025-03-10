#!/bin/bash
# Script to rebuild Vue Dashboard after making Admin Panel changes

echo "Rebuilding Vue Dashboard with updated Admin Panel configuration..."

# Navigate to the project directory
cd /home/mothership/mukka

# Stop the Vue Dashboard container
echo "Stopping Vue Dashboard container..."
docker stop mukka-vue-dashboard

# Remove the container
echo "Removing Vue Dashboard container..."
docker rm mukka-vue-dashboard

# Rebuild the Vue Dashboard
echo "Rebuilding Vue Dashboard container..."
docker-compose up -d --build vue-dashboard

# Check if the rebuild was successful
if [ $? -eq 0 ]; then
  echo "Vue Dashboard rebuild completed successfully!"
  echo "Admin Panel should now show the correct service health information."
  echo "Access the dashboard at http://localhost:3002"
else
  echo "Error: Vue Dashboard rebuild failed."
  echo "Please check the logs using: docker logs mukka-vue-dashboard"
fi
