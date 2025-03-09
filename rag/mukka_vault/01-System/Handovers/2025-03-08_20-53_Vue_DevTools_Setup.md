---
title: Handover - Vue DevTools Setup for Performance Debugging
created: 2025-03-08 20:53:00
modified: 2025-03-08 20:53:00
tags:
  - handover
  - vue-dashboard
  - debugging
  - performance
  - devtools
status: in-progress
---

## Overview
This handover documents the evaluation and implementation plan for Vue DevTools to assist with performance debugging in the Vue Dashboard, specifically focusing on CPU usage issues in the profile page. These tools are expected to help identify and resolve reactive component issues and DOM manipulation problems.

## Background
A recent issue with the profile settings page causing severe CPU spikes was resolved through manual code fixes. The CPU spikes were caused by aggressive DOM manipulation code in `profile-button-remover.js` creating a feedback loop with Vuetify's reactive components. Vue DevTools can help identify similar issues early and provide better debugging capabilities.

## Vue DevTools Options

Three main approaches for using Vue DevTools are available:

1. **Browser Extension (Recommended)**
   - Install from [Chrome Web Store](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
   - Works directly within Chrome Developer Tools
   - No code changes required
   - Easiest to set up and use

2. **Vite Plugin (For Vite-based projects)**
   - Install: `npm add -D vite-plugin-vue-devtools`
   - Configure in `vite.config.js`:
     ```javascript
     import { defineConfig } from 'vite'
     import vueDevTools from 'vite-plugin-vue-devtools'
     
     export default defineConfig({
       plugins: [
         vueDevTools(),
       ],
     })
     ```

3. **Standalone App (Installation issues encountered)**
   - Global installation attempted: `npm add -g @vue/devtools`
   - Executable path issues encountered
   - Package verified: `@vue/devtools@7.7.2` is installed
   - Further investigation required to successfully run the standalone app

## Resolved Issues

We encountered and solved two critical issues with Vue DevTools standalone app installation:

1. **X Server/Display Issues**
   - **Problem**: When running the Vue DevTools Electron app, it fails with `Missing X server or $DISPLAY` error
   - **Root Cause**: Electron applications require a display server, which may not be available in headless environments
   - **Solution**: Using `xvfb-run` to create a virtual framebuffer that simulates a display server
   - **Command Used**: `xvfb-run -a /home/mothership/.npm-global/bin/vue-devtools`

2. **Chrome Sandbox Permissions**
   - **Problem**: Electron security sandbox failing with: "The SUID sandbox helper binary was found, but is not configured correctly"
   - **Root Cause**: Chrome sandbox requires specific permissions to function correctly
   - **Solution**: Change ownership and permissions of the sandbox binary:
     ```bash
     sudo chown root:root /home/mothership/.npm-global/lib/node_modules/@vue/devtools/node_modules/electron/dist/chrome-sandbox
     sudo chmod 4755 /home/mothership/.npm-global/lib/node_modules/@vue/devtools/node_modules/electron/dist/chrome-sandbox
     ```

3. **Multiple Instances**
   - **Note**: If you encounter `Error: listen EADDRINUSE: address already in use :::8098`, it means the Vue DevTools server is already running on port 8098.
   - You can check with: `lsof -i :8098` to see the running instances

## Accessing Vue DevTools

After successfully starting the standalone app, you can access Vue DevTools at:

- **URL**: http://localhost:8098

The Vue DevTools server provides a connection interface for your Vue application. You'll need to add the following connection script to your Vue application's entry file (usually `main.js` or `App.vue`):

```javascript
// Add this to your Vue application
if (process.env.NODE_ENV === 'development') {
  const { connectToDevTools } = require('@vue/devtools')
  connectToDevTools({
    host: 'localhost',
    port: 8098
  })
}
```

## Running Vue DevTools

The recommended command to start Vue DevTools is:

```bash
xvfb-run -a /home/mothership/.npm-global/bin/vue-devtools
```

This will start the Vue DevTools server with a virtual display.


## How Vue DevTools Can Help

1. **Performance Monitoring**
   - Timeline features to identify when CPU spikes occur
   - Component render tracking to find excessive re-renders

2. **Component Inspection**
   - Real-time inspection of component hierarchies, props, data
   - Visualization of component tree and relationships

3. **State Management Debugging**
   - Visibility into Vue's reactivity system
   - Tracking state changes that might cause performance issues

4. **DOM Element Inspection**
   - Bridge between Vue components and DOM elements
   - Helps diagnose DOM manipulation issues like those in the profile page

## Usage Guidelines

1. Open application in Chrome with Vue DevTools extension installed
2. Open Chrome DevTools (F12 or right-click > Inspect)
3. Look for the "Vue" tab in the DevTools panel
4. Use component inspector to examine component hierarchy
5. Use timeline to identify performance bottlenecks
6. Monitor component re-renders during interactions with problematic pages

## Related Files

Key files that could benefit from Vue DevTools debugging:
- `/home/mothership/mukka/frontend/vue-dashboard/src/views/settings/ProfileSettings.vue`
- `/home/mothership/mukka/frontend/vue-dashboard/src/views/settings/profile-button-remover.js`
- `/home/mothership/mukka/frontend/vue-dashboard/src/views/settings/profile-update-fix.js`
- `/home/mothership/mukka/frontend/vue-dashboard/src/layouts/AppLayout.vue`
- `/home/mothership/mukka/frontend/vue-dashboard/src/layouts/AuthLayout.vue`
- `/home/mothership/mukka/frontend/vue-dashboard/src/components/SimpleFooter.vue`

## Future Considerations

1. **Integration into CI/CD**
   - Consider integrating Vue DevTools performance metrics into automated testing

2. **Team Training**
   - Provide team training on using Vue DevTools for debugging

3. **Documentation Updates**
   - Update project documentation to include Vue DevTools usage guidelines

## References
- [Vue DevTools GitHub Repository](https://github.com/vuejs/devtools)
- [Vue DevTools Documentation](https://devtools.vuejs.org/)
- [Browser Extension](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
