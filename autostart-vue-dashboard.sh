#!/bin/bash

# Wait for Docker Desktop to be fully running
echo "Waiting for Docker Desktop to be fully running..."
until docker info &>/dev/null
do
    echo "Docker not yet available, waiting 5 seconds..."
    sleep 5
done

# Run the Vue Dashboard startup script
echo "Starting Vue Dashboard..."
/home/mothership/mukka/start-vue-dashboard.sh

echo "Vue Dashboard started successfully."
