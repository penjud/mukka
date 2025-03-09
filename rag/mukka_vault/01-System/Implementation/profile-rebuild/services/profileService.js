/**
 * Profile Service
 * Handles all API interactions related to user profile
 */

import { ref } from 'vue';

// API configuration - update with actual API base URL
const API_BASE = '/api';

/**
 * Service for handling profile-related API calls
 */
export const profileService = {
  /**
   * Fetch user profile data
   * @returns {Promise<Object>} User profile data
   */
  async fetchProfile() {
    try {
      const response = await fetch(`${API_BASE}/profile`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  /**
   * Update user profile data
   * @param {Object} profileData Updated profile data
   * @returns {Promise<Object>} Updated profile
   */
  async updateProfile(profileData) {
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  /**
   * Update user password
   * @param {Object} passwordData Object containing current and new password
   * @returns {Promise<Object>} Response data
   */
  async updatePassword(passwordData) {
    try {
      const response = await fetch(`${API_BASE}/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update password: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },
  
  /**
   * Upload profile avatar
   * @param {File} file Image file to upload
   * @returns {Promise<Object>} Response with avatar URL
   */
  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch(`${API_BASE}/profile/avatar`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload avatar: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }
};
