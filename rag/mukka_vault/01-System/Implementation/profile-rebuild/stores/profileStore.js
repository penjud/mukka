/**
 * Profile Store
 * Centralized state management for user profile
 */

import { defineStore } from 'pinia';
import { ref, computed, shallowRef } from 'vue';
import { profileService } from '../services/profileService';

export const useProfileStore = defineStore('profile', () => {
  // State
  const profile = shallowRef(null);
  const isLoading = ref(false);
  const error = ref(null);
  const isSaving = ref(false);
  const lastSaved = ref(null);
  
  // Original profile copy for comparison/reset
  const originalProfile = shallowRef(null);
  
  // Computed
  const fullName = computed(() => {
    if (!profile.value) return '';
    return `${profile.value.firstName || ''} ${profile.value.lastName || ''}`.trim();
  });
  
  const hasChanges = computed(() => {
    if (!profile.value || !originalProfile.value) return false;
    
    // Compare only the fields we care about
    const fieldsToCompare = [
      'firstName', 'lastName', 'email', 'displayName', 
      'bio', 'location', 'theme', 'avatarUrl'
    ];
    
    return fieldsToCompare.some(field => 
      profile.value[field] !== originalProfile.value[field]
    );
  });
  
  // Actions
  async function fetchProfile() {
    error.value = null;
    isLoading.value = true;
    
    try {
      const data = await profileService.fetchProfile();
      profile.value = data;
      // Create a deep copy to compare against for changes
      originalProfile.value = JSON.parse(JSON.stringify(data));
      return data;
    } catch (err) {
      error.value = err.message || 'Failed to load profile';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  async function saveProfile() {
    if (!hasChanges.value) return;
    
    error.value = null;
    isSaving.value = true;
    
    try {
      const updatedProfile = await profileService.updateProfile(profile.value);
      profile.value = updatedProfile;
      // Update original copy after successful save
      originalProfile.value = JSON.parse(JSON.stringify(updatedProfile));
      lastSaved.value = new Date();
      return updatedProfile;
    } catch (err) {
      error.value = err.message || 'Failed to save profile';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }
  
  function resetProfile() {
    if (!originalProfile.value) return;
    // Reset to original state
    profile.value = JSON.parse(JSON.stringify(originalProfile.value));
  }
  
  async function updatePassword(passwordData) {
    error.value = null;
    isSaving.value = true;
    
    try {
      const result = await profileService.updatePassword(passwordData);
      return result;
    } catch (err) {
      error.value = err.message || 'Failed to update password';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }
  
  async function uploadAvatar(file) {
    error.value = null;
    isSaving.value = true;
    
    try {
      const result = await profileService.uploadAvatar(file);
      if (result.avatarUrl) {
        profile.value.avatarUrl = result.avatarUrl;
      }
      return result;
    } catch (err) {
      error.value = err.message || 'Failed to upload avatar';
      throw err;
    } finally {
      isSaving.value = false;
    }
  }
  
  return {
    // State
    profile,
    isLoading,
    error,
    isSaving,
    lastSaved,
    
    // Computed
    fullName,
    hasChanges,
    
    // Actions
    fetchProfile,
    saveProfile,
    resetProfile,
    updatePassword,
    uploadAvatar
  };
});
