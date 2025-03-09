---
title: Handover - ProfileSettings Button Fix
created: 2025-03-08 16:05:00
modified: 2025-03-08 16:05:00
tags:
  - handover
  - vue-dashboard
  - bugfix
  - profile
  - vuetify
status: completed
---

## Issue Summary
The Save Changes button on the ProfileSettings page was getting stuck in an infinite loading state (displaying a spinning indicator that never stops). This prevented users from saving profile changes as the button remained in a loading state even after page refresh.

## Root Cause Analysis
The issue was with the Vuetify `v-btn` component's loading state handling. When using the `:loading` property with asynchronous operations:

1. The button entered the loading state correctly when clicked
2. Even though the loading state variable was reset in the finally block, the Vuetify button component remained in a loading state
3. This appeared to be due to a known issue with Vuetify where certain promise rejections or errors can cause the loading state to get stuck

## Solution Implemented
Instead of trying to fix the Vuetify button's loading state handling, we completely replaced the button with a custom implementation:

1. **Custom Button Replacement**:
   - Replaced the Vuetify `v-btn` with a custom div-based button
   - Added custom CSS styling to match the Vuetify button appearance
   - Implemented manual loading state handling with text change ("Save Changes" → "Saving...")

2. **Form Structure Changes**:
   - Changed from a `v-form` with submit event to a regular div
   - Added direct click handling on the custom button
   - Prevented button from being clicked when already in loading state

3. **Safety Measures**:
   - Maintained the same safety timeout to reset the loading state after 5 seconds
   - Added proper error handling and console logging for debugging

## Files Modified
1. `/home/mothership/mukka/frontend/vue-dashboard/src/views/settings/ProfileSettings.vue`:
   - Replaced `v-btn` with custom div-based button
   - Changed form structure
   - Added CSS styling for the custom button
   - Enhanced error handling in the profile update function

## Testing Performed
- Verified the custom button works correctly for profile saves
- Confirmed the button changes state appropriately during save operations
- Tested error handling to ensure button returns to normal state
- Verified the safety timeout properly resets the loading state if needed

## Future Considerations
1. This solution might be applied to other buttons in the application if similar issues occur
2. Consider upgrading Vuetify in the future to a version where this issue is fixed
3. For consistency, similar custom buttons could be implemented throughout the application
4. Performance monitoring should be done to ensure the custom button solution continues to work properly

## References
- [Vuetify Button Documentation](https://vuetifyjs.com/en/components/buttons/)
- [Reacting to Promises from event listeners in Vue.js](https://medium.com/@dobromir_hristov/reacting-to-promises-from-event-listeners-in-vue-js-8959b6d03f52)
- [Github Issue: Button stays in loading state](https://github.com/ajhoddinott/vuetify-loader-promise-rejection)
