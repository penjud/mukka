/**
 * Profile Service
 * 
 * Handles profile management with server persistence using the Filesystem MCP.
 * This is a robust solution to handle profile updates when the Auth server
 * doesn't provide a profile update endpoint.
 */

import mcpApi from './mcp-api';
import { serviceStore } from './discovery';

// Constants
const HOME_DIR = '/home/mothership'; // Simplified for Docker container path
const PROFILE_STORAGE_DIR = `${HOME_DIR}/profiles`;
const AVATAR_STORAGE_DIR = `${HOME_DIR}/avatars`;

class ProfileService {
  constructor() {
    // Initialize the service
    this.init();
  }

  /**
   * Initialize the profile service
   */
  async init() {
    try {
      // Ensure the profile and avatar directories exist
      await this.ensureDirectoriesExist();
    } catch (error) {
      console.warn('Failed to initialize profile service:', error);
    }
  }

  /**
   * Ensure the required directories exist in the filesystem
   */
  async ensureDirectoriesExist() {
    try {
      // Check if Filesystem MCP is available
      const service = serviceStore.services['filesystem'];
      if (!service || !service.status) {
        throw new Error('Filesystem MCP service is not available');
      }

      // Create directories if they don't exist
      await this.createDirectoryIfNotExists(PROFILE_STORAGE_DIR);
      await this.createDirectoryIfNotExists(AVATAR_STORAGE_DIR);

      return true;
    } catch (error) {
      console.error('Failed to ensure directories exist:', error);
      return false;
    }
  }

  /**
   * Create a directory if it doesn't exist
   * @param {string} path - Directory path
   */
  async createDirectoryIfNotExists(path) {
    try {
      // Try to list the directory to see if it exists
      await mcpApi.get('filesystem', `/api/files${path}`);
    } catch (error) {
      // If directory doesn't exist, create it
      if (error.message.includes('404')) {
        // Create an empty directory object
        await mcpApi.put('filesystem', `/api/files${path}?directory=true`, {});
      } else {
        throw error;
      }
    }
  }

  /**
   * Get user profile data from filesystem
   * @param {string} username - Username
   * @returns {Promise<Object|null>} - User profile data or null if not found
   */
  async getUserProfile(username) {
    try {
      // Get profile data from the filesystem
      const profilePath = `${PROFILE_STORAGE_DIR}/${username}.json`;
      const profileData = await mcpApi.get('filesystem', `/api/files${profilePath}`);
      
      // Parse the JSON data
      return typeof profileData === 'string' ? JSON.parse(profileData) : profileData;
    } catch (error) {
      // If profile doesn't exist, return null
      if (error.message.includes('404')) {
        return null;
      }
      
      throw error;
    }
  }

  /**
   * Save user profile data to filesystem
   * @param {string} username - Username
   * @param {Object} profileData - Profile data to save
   * @returns {Promise<boolean>} - Success status
   */
  async saveUserProfile(username, profileData) {
    try {
      // Prepare the profile path
      const profilePath = `${PROFILE_STORAGE_DIR}/${username}.json`;
      
      // Save the profile data to the filesystem
      await mcpApi.put('filesystem', `/api/files${profilePath}`, JSON.stringify(profileData, null, 2));
      
      return true;
    } catch (error) {
      console.error('Failed to save user profile:', error);
      throw error;
    }
  }

  /**
   * Upload an avatar image for a user
   * @param {string} username - Username
   * @param {File} file - Avatar image file
   * @returns {Promise<string>} - URL of the uploaded avatar
   */
  async uploadAvatar(username, file) {
    try {
      // Convert the file to a base64 data URL
      const dataUrl = await this.fileToDataUrl(file);
      
      // Extract the base64 data without the prefix
      const base64Data = dataUrl.split(',')[1];
      
      // Determine file extension based on mimetype
      const mimeType = dataUrl.match(/data:(.*);base64/)[1];
      const fileExtension = this.getFileExtensionFromMimeType(mimeType);
      
      // Create a unique filename based on username and timestamp
      const timestamp = new Date().getTime();
      const filename = `${username}_${timestamp}.${fileExtension}`;
      
      // Prepare the avatar path
      const avatarPath = `${AVATAR_STORAGE_DIR}/${filename}`;
      
      // Convert base64 back to binary
      const binaryData = atob(base64Data);
      
      // Create a Uint8Array from the binary data
      const uint8Array = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }
      
      // Create a Blob from the Uint8Array
      const blob = new Blob([uint8Array], { type: mimeType });
      
      // Upload the avatar image to the filesystem
      await mcpApi.request('filesystem', `/api/files${avatarPath}`, {
        method: 'PUT',
        headers: {
          'Content-Type': mimeType
        },
        body: blob
      });
      
      // Return the URL of the uploaded avatar
      return avatarPath;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw new Error('Avatar upload failed: ' + (error.message || 'Unknown error'));
    }
  }

  /**
   * Convert a File object to a data URL
   * @param {File} file - File object
   * @returns {Promise<string>} - Data URL
   */
  fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get file extension from MIME type
   * @param {string} mimeType - MIME type
   * @returns {string} - File extension
   */
  getFileExtensionFromMimeType(mimeType) {
    const mimeToExt = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg'
    };
    
    return mimeToExt[mimeType] || 'jpg';
  }

  /**
   * Update user profile with authentication store integration
   * @param {Object} user - Current user object from auth store
   * @param {Object} profileData - Profile data to update
   * @param {File} avatarFile - Avatar image file (optional)
   * @returns {Promise<Object>} - Updated user object
   */
  async updateUserProfile(user, profileData, avatarFile) {
    if (!user || !user.username) {
      throw new Error('User not authenticated or username missing');
    }

    try {
      // Get current profile data or create new one
      let currentProfile = await this.getUserProfile(user.username);
      
      if (!currentProfile) {
        // If no profile exists yet, create a new one based on the user object
        currentProfile = {
          username: user.username,
          name: user.name || '',
          email: user.email || '',
          role: user.role || 'user',
          avatar: user.avatar || '',
          preferences: user.preferences || {}
        };
      }
      
      // Process avatar upload if provided
      let avatarPath = currentProfile.avatar;
      if (avatarFile) {
        avatarPath = await this.uploadAvatar(user.username, avatarFile);
      }
      
      // Merge profile data
      const updatedProfile = {
        ...currentProfile,
        ...profileData,
        avatar: avatarPath,
        preferences: {
          ...(currentProfile.preferences || {}),
          ...(profileData.preferences || {})
        },
        updatedAt: new Date().toISOString()
      };
      
      // Save the updated profile
      await this.saveUserProfile(user.username, updatedProfile);
      
      // Return the updated profile for auth store
      return updatedProfile;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const profileService = new ProfileService();
export default profileService;
