#!/bin/bash

# This script installs the Vue Dashboard systemd service
# Run with sudo: sudo ./install-vue-dashboard-service.sh

if [ "$EUID" -ne 0 ]; then
  echo "This script must be run as root (with sudo)"
  exit 1
fi

echo "Installing Vue Dashboard systemd service..."

# Copy the service file to systemd directory
cp /home/mothership/mukka/vue-dashboard.service /etc/systemd/system/

# Reload systemd to recognize the new service
systemctl daemon-reload

# Enable the service to start on boot
systemctl enable vue-dashboard.service

# Start the service
systemctl start vue-dashboard.service

echo "Vue Dashboard service installed and started successfully."
echo "It will now start automatically on system boot."
echo ""
echo "To check status: sudo systemctl status vue-dashboard.service"
echo "To stop service: sudo systemctl stop vue-dashboard.service"
echo "To disable autostart: sudo systemctl disable vue-dashboard.service"

