# Vue DevTools Standalone Installation Fix

## Overview

This document details how to properly set up Vue DevTools standalone application on a headless or remote environment. We encountered and solved two key issues related to X server configuration and Chrome sandbox permissions.

## Issues and Solutions

### 1. Missing X Server / DISPLAY Environment

**Problem:**
```
[ERROR:ozone_platform_x11.cc(245)] Missing X server or $DISPLAY
[ERROR:env.cc(258)] The platform failed to initialize. Exiting.
```

**Root Cause:**
Electron applications (including Vue DevTools) require a graphical display environment to run. In headless servers or remote environments, there is no physical display attached.

**Solution:**
Use Xvfb (X Virtual Framebuffer) to create a virtual display:

```bash
xvfb-run -a /home/mothership/.npm-global/bin/vue-devtools
```

The `-a` flag automatically selects a free display number, avoiding conflicts with other Xvfb instances.

### 2. Chrome Sandbox Permissions Issue

**Problem:**
```
The SUID sandbox helper binary was found, but is not configured correctly. 
Rather than run without sandboxing I'm aborting now. 
You need to make sure that /path/to/chrome-sandbox is owned by root and has mode 4755.
```

**Root Cause:**
Electron's Chrome sandbox requires specific file permissions and ownership to function securely.

**Solution:**
Set the correct permissions on the sandbox helper:

```bash
sudo chown root:root /home/mothership/.npm-global/lib/node_modules/@vue/devtools/node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 /home/mothership/.npm-global/lib/node_modules/@vue/devtools/node_modules/electron/dist/chrome-sandbox
```

### 3. Port Already In Use

**Problem:**
```
Error: listen EADDRINUSE: address already in use :::8098
```

**Root Cause:**
Vue DevTools is already running in another process and listening on port 8098.

**Solution:**
Check for existing Vue DevTools processes:
```bash
lsof -i :8098
```

Either use the already running instance or terminate it before starting a new one:
```bash
kill <PID>
```

## Connecting Vue Application to Vue DevTools

After successfully launching Vue DevTools standalone, you need to connect your Vue application to it by adding the following code to your application's entry point:

```javascript
// In main.js or similar file
import { connectToDevTools } from '@vue/devtools'

if (process.env.NODE_ENV === 'development') {
  connectToDevTools({
    host: 'localhost',
    port: 8098
  })
}
```

## Starting Vue DevTools as a Service

For development environments, it's useful to have Vue DevTools running as a background service. You can create a systemd service file:

```
[Unit]
Description=Vue DevTools Standalone
After=network.target

[Service]
ExecStart=/usr/bin/xvfb-run -a /home/mothership/.npm-global/bin/vue-devtools
Restart=on-failure
User=mothership

[Install]
WantedBy=multi-user.target
```

Save this as `/etc/systemd/system/vue-devtools.service` and run:
```bash
sudo systemctl enable vue-devtools
sudo systemctl start vue-devtools
```

## References

1. [Vue DevTools GitHub Repository](https://github.com/vuejs/devtools)
2. [Electron Documentation on Sandboxing](https://www.electronjs.org/docs/latest/tutorial/sandbox)
3. [Xvfb Documentation](https://www.x.org/releases/X11R7.6/doc/man/man1/Xvfb.1.xhtml)
