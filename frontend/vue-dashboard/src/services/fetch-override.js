/**
 * Fetch API Override
 * 
 * This module provides a global fetch override that intercepts specific
 * API calls and redirects them to the appropriate services.
 * 
 * Currently, it handles:
 * - /profile endpoints redirect to use the profile service
 */

import profileService from './profile-service';
import { useAuthStore } from '../stores/auth';

// Store the original fetch function
const originalFetch = window.fetch;

/**
 * Initialize the fetch override
 */
export function initFetchOverride() {
  console.log('Initializing fetch API override');
  
  // Override the global fetch function
  window.fetch = async function(resource, options = {}) {
    // Convert Request objects to string URLs
    const url = resource instanceof Request ? resource.url : resource;
    
    // Handle profile endpoint requests
    if (typeof url === 'string' && url.includes('/profile')) {
      return handleProfileRequest(url, options);
    }
    
    // Pass through all other requests to the original fetch
    return originalFetch(resource, options);
  };
}

/**
 * Handle requests to the /profile endpoint
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
async function handleProfileRequest(url, options = {}) {
  console.log(`Intercepting profile request: ${url}`, options);
  
  // Get current user from auth store
  const authStore = useAuthStore();
  const user = authStore.userProfile;
  
  if (!user) {
    // Return error response if user is not authenticated
    return createErrorResponse('User not authenticated', 401);
  }
  
  try {
    // Handle different HTTP methods
    const method = options.method || 'GET';
    
    if (method === 'GET') {
      // For GET /profile - Return user profile
      const profileData = await profileService.getUserProfile(user.username);
      return createJsonResponse(profileData || user);
      
    } else if (method === 'PUT' || method === 'POST') {
      // For PUT or POST /profile - Update user profile
      
      // Parse request body
      let profileData = {};
      if (options.body) {
        try {
          profileData = typeof options.body === 'string' 
            ? JSON.parse(options.body) 
            : options.body;
        } catch (e) {
          console.error('Failed to parse profile update body:', e);
        }
      }
      
      // Update profile using profile service
      const updatedProfile = await profileService.updateUserProfile(
        user,
        profileData,
        null // No avatar file in this flow
      );
      
      // Update auth store with the new profile data
      authStore.setUser({
        ...user,
        ...updatedProfile
      });
      
      return createJsonResponse(updatedProfile);
    }
    
    // For other methods, return method not allowed
    return createErrorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('Profile request handler error:', error);
    return createErrorResponse(error.message, 500);
  }
}

/**
 * Create a JSON response object
 * @param {Object} data - Response data
 * @param {number} status - Status code (default: 200)
 * @returns {Response} - Fetch Response object
 */
function createJsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Create an error response object
 * @param {string} message - Error message
 * @param {number} status - Status code
 * @returns {Response} - Fetch Response object
 */
function createErrorResponse(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
