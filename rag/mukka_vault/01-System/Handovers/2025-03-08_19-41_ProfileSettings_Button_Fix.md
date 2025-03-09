---
title: Handover - ProfileSettings Button Fix
created: 2025-03-08 19:41:00
modified: 2025-03-08 19:41:00
tags:
  - handover
  - vue-dashboard
  - bugfix
  - profile
  - vuetify
status: completed
---

## Issue Summary
The Save Changes button on the ProfileSettings page was getting stuck in an infinite loading state (displaying a "SAVING..." indicator that never resolved). This caused high CPU usage when viewing the profile page and prevented users from saving profile changes as the button remained in a loading state even after page refresh.

## Root Cause Analysis
After thorough investigation, the issue was caused by three JavaScript files in the `/public` directory that were being automatically included in the build process:

1. `profile-fix.js` - This script was specifically targeting the profile page, overriding the `window.fetch` function to intercept profile-related API calls, and creating mock responses.

2. `button-fix.js` - A general button fix that was monitoring the DOM for buttons in loading states.

3. `loading-state-fix.js` - A script that was continuously scanning the DOM for loading indicators.

These scripts were:
- Overriding standard functionality
- Continuously monitoring the DOM (causing CPU spikes)
- Getting copied into the final build automatically
- Interfering with our attempts to fix the issue through normal Vue component changes

## Solution Implemented
The solution involved removing these problematic scripts from the application entirely:

1. **Removed Problematic Scripts:**
   - Deleted `profile-fix.js`, `button-fix.js`, and `loading-state-fix.js` from the `/public` directory
   - Ensured they were also removed from the `dist` directory after builds

2. **Restored Standard Button Implementation:**
   - Replaced the custom button implementation with standard Vuetify button
   - Implemented proper loading state handling
   - Added clear user feedback for success/error states

3. **Updated Docker Configuration:**
   - Modified Dockerfile to ensure scripts wouldn't be reintroduced in production
   - Required rebuilding the Docker container to apply changes

4. **Removed References from Main.js:**
   - Cleaned up any imports or references to the fix scripts
   - Eliminated CSS overrides that were attempting to handle this issue

## Files Modified
1. `/home/mothership/mukka/frontend/vue-dashboard/src/views/settings/ProfileSettings.vue`:
   - Reverted to standard Vuetify button implementation
   - Simplified component structure
   - Added proper error handling and loading states

2. `/home/mothership/mukka/frontend/vue-dashboard/src/main.js`:
   - Removed imports for fix scripts

3. `/home/mothership/mukka/frontend/vue-dashboard/Dockerfile`:
   - Added steps to remove problematic scripts during build process

## Testing Performed
- Verified the button no longer gets stuck in loading state
- Confirmed profile updates save correctly
- Monitored CPU usage to ensure it remains normal on the profile page
- Tested error handling in cases where the API returns errors
- Verified changes persist after application restart

## Future Considerations
1. Review other scripts or automatic includes in the `public` directory
2. Consider implementing more robust error handling and loading state management across the application
3. Implement better safeguards against runaway CPU usage
4. Consider standardizing button behavior across the application

## References
- [Vue.js Documentation on Form Input Bindings](https://vuejs.org/guide/essentials/forms.html)
- [Vuetify Button Documentation](https://vuetifyjs.com/en/components/buttons/)
- [Docker Best Practices for Vue Applications](https://v2.vuejs.org/v2/cookbook/dockerize-vuejs-app.html)
