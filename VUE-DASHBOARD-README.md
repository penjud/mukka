# Mukka Vue Dashboard Autostart Configuration

## Overview

This document explains how the Mukka Vue Dashboard container is configured to start automatically when you log in to your system.

## Current Configuration

The Vue Dashboard is configured to start automatically using a desktop autostart entry:

- Autostart entry: `/home/mothership/.config/autostart/mukka-vue-dashboard.desktop`
- Startup script: `/home/mothership/mukka/start-vue-dashboard.sh`

## How It Works

1. When you log in to your desktop environment, the autostart entry runs the start script
2. The script waits for Docker Desktop to be fully running (tries for up to 5 minutes)
3. Once Docker is available, it stops and removes any existing Vue Dashboard container
4. It then creates a new container with the correct configuration

## Manual Start/Restart

If you need to manually start or restart the Vue Dashboard:

```bash
cd /home/mothership/mukka
./start-vue-dashboard.sh
```

## Troubleshooting

If the Vue Dashboard doesn't start automatically after login:

1. Check if Docker Desktop is running
2. Check if the script ran by looking for errors in the system logs:
   ```
   grep "Vue Dashboard" /var/log/syslog
   ```
3. Try running the script manually to see any error messages
4. Verify that the autostart entry exists:
   ```
   ls -la ~/.config/autostart/mukka-vue-dashboard.desktop
   ```

## Configuration Files

- `/home/mothership/.config/autostart/mukka-vue-dashboard.desktop` - Desktop autostart entry
- `/home/mothership/mukka/start-vue-dashboard.sh` - Script to start the container
- `/home/mothership/mukka/frontend/vue-dashboard/nginx.conf` - Nginx configuration
- `/home/mothership/mukka/frontend/vue-dashboard/Dockerfile` - Container definition

## Container Details

- Image: `mukka_vue-dashboard`
- Container name: `mukka-vue-dashboard`
- Port mapping: `3002:80` (host:container)
- Access URL: http://localhost:3002
