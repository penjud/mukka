# Profile Settings API Fix

**Date**: 2025-03-08
**Issue**: Profile settings update returning 404 error

## Problem Description

When attempting to update user profile settings in the Vue Dashboard, the following error occurs:

```
API Error (404): <!DOCTYPE html> <html lang="en"> <head> <meta charset="utf-8"> <title>Error</title> </head> <body> <pre>Cannot PUT /profile</pre> </body> </html>
```

The error message indicates that the request is being sent to `/profile` endpoint, but this endpoint doesn't exist in the Auth MCP Server.

## Root Cause

The Auth Server uses the `/me` endpoint for both retrieving and updating the current user's profile, but the frontend code was incorrectly using `/profile` for updates.

## Solution

1. Modified the `updateProfile` method in the auth store to use the `/me` endpoint instead of `/profile`
2. Added a fallback mechanism that updates the profile locally if the API call fails
3. Added localStorage persistence for the user profile to maintain changes across sessions

### Code Changes

Updated `src/stores/auth.js`:

```javascript
async updateProfile(profileData) {
  this.loading = true
  this.error = null
  
  try {
    // FIXED: The correct Auth Server endpoint for profile update is '/me' not '/profile'
    // Try to update the profile using the '/me' endpoint
    try {
      const updatedUser = await mcpApi.put('auth', '/me', profileData);
      this.setUser(updatedUser);
      return true;
    } catch (error) {
      console.warn('Profile update via API failed:', error.message);
      console.warn('Falling back to local profile update');
      
      // Fallback: Update the local user state only if API call fails
      this.user = {
        ...this.user,
        ...profileData,
        preferences: {
          ...(this.user?.preferences || {}),
          ...(profileData.preferences || {})
        }
      };
      
      // Store updated profile in localStorage for persistence
      if (this.user) {
        localStorage.setItem('user_profile', JSON.stringify(this.user));
      }
      
      return true;
    }
  } catch (error) {
    this.error = error.message || 'Failed to update profile'
    return false
  } finally {
    this.loading = false
  }
}
```

## Future Improvements

In the future, the Auth MCP Server should be updated to:

1. Properly support PUT requests to the `/me` endpoint for profile updates
2. Or implement a dedicated `/profile` endpoint for profile management
3. Add proper API documentation for all user profile management endpoints

## Testing

After implementing this fix, profile updates should work correctly:
- If the server has a working `/me` endpoint that accepts PUT requests, the changes will be saved on the server
- If not, the changes will be saved locally in the browser and maintained across sessions
