#!/bin/bash
# Script to properly rebuild all MukkaAI services

echo "===== MukkaAI Complete Rebuild Script ====="
echo "This script will rebuild all MukkaAI services in the correct order"
echo "Starting rebuild process at $(date)"

# Navigate to the project directory
cd /home/mothership/mukka

# Stop all running containers
echo -e "\n[1/7] Stopping all running containers..."
docker-compose down

# Remove old images to prevent the "no such image" error
echo -e "\n[2/7] Removing old images..."
docker-compose down --rmi local

# Make sure the Docker network exists
echo -e "\n[3/7] Ensuring Docker network exists..."
docker network create mukka-network 2>/dev/null || true

# Build all images with the no-cache option to ensure a clean build
echo -e "\n[4/7] Building all services (this may take a few minutes)..."
docker-compose build --no-cache

# Start all services
echo -e "\n[5/7] Starting all services..."
docker-compose up -d

# Check the status of all containers
echo -e "\n[6/7] Checking service status..."
docker-compose ps

# Show logs for any failed services
echo -e "\n[7/7] Checking for errors in service logs..."
for service in $(docker-compose ps --services); do
  container_name=$(docker-compose ps -q $service)
  status=$(docker inspect --format='{{.State.Status}}' $container_name)
  
  if [ "$status" != "running" ]; then
    echo -e "\nWARNING: Service $service is not running. Container logs:"
    docker logs $container_name | tail -20
  fi
done

echo -e "\n===== Rebuild process completed at $(date) ====="
echo "You can access the MukkaAI Dashboard at http://localhost:3002"
echo "If you encounter any issues, check the logs with: docker-compose logs"
