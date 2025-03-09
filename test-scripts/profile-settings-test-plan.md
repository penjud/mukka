# Profile Settings Test Plan

## Overview
This test plan outlines how to verify that the Profile Settings API 404 error has been fixed. The issue was that the Vue Dashboard was making requests directly to `/profile` which isn't supported by the Auth Server.

## Prerequisites
1. Ensure all MCP services are running
2. Ensure the rebuild script has been executed to apply our changes
3. Ensure the profile directories exist at `/home/mothership/profiles` and `/home/mothership/avatars` with proper permissions

## Test Cases

### 1. Profile Settings Load Test
1. Log in to the Vue Dashboard (http://localhost:3001)
2. Navigate to Profile Settings (usually in the user menu)
3. **Expected Result**: Profile settings should load without errors
4. **Verification**: Open browser dev tools (F12) and check the Network tab for any 404 errors

### 2. Profile Update Test
1. Make changes to your profile (e.g., change name, email, theme preference)
2. Click "Save Changes"
3. **Expected Result**: Profile should update successfully with a success message
4. **Verification**: 
   - No error messages should appear
   - Check the Network tab for successful PUT request
   - Refresh the page and verify changes persisted

### 3. Avatar Update Test
1. Click the "Change Avatar" button and select an image
2. Click "Save Changes"
3. **Expected Result**: Avatar should update successfully
4. **Verification**: 
   - New avatar should display in the UI
   - Check Network tab for successful file upload

### 4. Password Change Test
1. Fill in the password change fields (current and new passwords)
2. Click "Save Changes"
3. **Expected Result**: Password should update successfully
4. **Verification**: 
   - Success message should appear
   - Try logging out and in with the new password

### 5. Network Intercept Verification
1. Open browser dev tools (F12)
2. Go to the Network tab
3. Navigate to Profile Settings page
4. **Expected Result**: Any requests to `/profile` should be intercepted
5. **Verification**: 
   - Look for console logs indicating "Intercepting profile request"
   - No 404 errors should be present

## Troubleshooting

If issues persist:

1. **Console Logging**: Check the browser console for error messages or our intercept logs
2. **Docker Logs**: Check the Vue Dashboard container logs:
   ```
   docker-compose logs -f mcp-web-ui
   ```
3. **Network Analysis**: In browser dev tools, examine exactly what requests are being made and their responses
4. **API Testing**: Use a tool like curl or Postman to test the profile endpoints directly

## Next Steps

If all tests pass:
1. Update the MCP Deployment Checklist
2. Document the fix in the handover notes
3. Proceed with the remaining verification items
