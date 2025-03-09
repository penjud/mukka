import { ref, reactive, computed } from 'vue';
import { useThemeManager } from './useTheme';
import { useUserProfileStore } from '../stores/userProfile';
import { storeToRefs } from 'pinia';

export function useProfileManager() {
  const { currentTheme, setTheme } = useThemeManager();
  const userProfileStore = useUserProfileStore();
  
  // Destructure store properties with storeToRefs to maintain reactivity
  const { 
    displayName, 
    username, 
    email, 
    role, 
    createdAt, 
    avatarUrl, 
    bannerUrl, 
    theme, 
    isLoading: storeLoading, 
    error: storeError 
  } = storeToRefs(userProfileStore);
  
  // Local state
  const isUpdating = ref(false);
  const error = ref(null);
  const success = ref(null);
  
  // Create a reactive userData object that reflects the store
  const userData = reactive({
    get id() { return userProfileStore.id; },
    get displayName() { return displayName.value; },
    get username() { return username.value; },
    get email() { return email.value; },
    get role() { return role.value; },
    get createdAt() { return createdAt.value; },
    get avatarUrl() { return avatarUrl.value; },
    get bannerUrl() { return bannerUrl.value; },
    get theme() { return theme.value; },
    
    // Allow direct setting for easier component usage
    set displayName(value) { displayName.value = value; },
    set avatarUrl(value) { avatarUrl.value = value; },
    set bannerUrl(value) { bannerUrl.value = value; },
    set theme(value) { theme.value = value; }
  });
  
  // Computed properties (using store getters)
  const userInitials = computed(() => userProfileStore.userInitials);
  const userFirstName = computed(() => userProfileStore.userFirstName);
  const formattedJoinDate = computed(() => userProfileStore.formattedJoinDate);
  
  // Load user profile
  const loadUserProfile = async () => {
    try {
      error.value = null;
      await userProfileStore.init();
      
      // Sync theme with theme manager
      if (userData.theme && userData.theme !== currentTheme.value) {
        setTheme(userData.theme);
      }
      
      return userData;
    } catch (err) {
      error.value = storeError.value || 'Failed to load profile';
      console.error('Error loading user profile:', err);
      throw err;
    }
  };
  
  // Update profile data
  const updateProfile = async (profileData) => {
    isUpdating.value = true;
    error.value = null;
    success.value = null;
    
    try {
      // Handle specific profile fields
      if (profileData.displayName) {
        await userProfileStore.updateDisplayName(profileData.displayName);
      }
      
      if (profileData.theme) {
        await userProfileStore.updateTheme(profileData.theme);
        setTheme(profileData.theme);
      }
      
      success.value = 'Profile updated successfully';
      return { success: true };
    } catch (err) {
      error.value = storeError.value || 'Failed to update profile';
      console.error('Error updating profile:', err);
      throw err;
    } finally {
      isUpdating.value = false;
    }
  };
  
  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    isUpdating.value = true;
    error.value = null;
    success.value = null;
    
    try {
      await userProfileStore.updatePassword(currentPassword, newPassword);
      success.value = 'Password updated successfully';
      return { success: true };
    } catch (err) {
      error.value = storeError.value || 'Failed to update password';
      console.error('Error updating password:', err);
      throw err;
    } finally {
      isUpdating.value = false;
    }
  };
  
  // Upload avatar
  const uploadAvatar = async (file) => {
    if (!file) return null;
    
    isUpdating.value = true;
    error.value = null;
    
    try {
      // Create a data URL for the avatar
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
      
      // Update avatar in store
      await userProfileStore.updateAvatar(dataUrl);
      
      success.value = 'Avatar updated successfully';
      return { success: true };
    } catch (err) {
      error.value = storeError.value || 'Failed to upload avatar';
      console.error('Error uploading avatar:', err);
      throw err;
    } finally {
      isUpdating.value = false;
    }
  };
  
  // Upload banner
  const uploadBanner = async (file) => {
    if (!file) return null;
    
    isUpdating.value = true;
    error.value = null;
    
    try {
      // Create a data URL for the banner
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
      
      // Update banner in store
      await userProfileStore.updateBanner(dataUrl);
      
      success.value = 'Banner updated successfully';
      return { success: true };
    } catch (err) {
      error.value = storeError.value || 'Failed to upload banner';
      console.error('Error uploading banner:', err);
      throw err;
    } finally {
      isUpdating.value = false;
    }
  };
  
  // Remove banner
  const removeBanner = async () => {
    isUpdating.value = true;
    error.value = null;
    
    try {
      await userProfileStore.removeBanner();
      success.value = 'Banner removed successfully';
      return { success: true };
    } catch (err) {
      error.value = storeError.value || 'Failed to remove banner';
      console.error('Error removing banner:', err);
      throw err;
    } finally {
      isUpdating.value = false;
    }
  };
  
  // Return the API
  return {
    // State
    userData,
    isLoading: storeLoading,
    isUpdating,
    error,
    success,
    
    // Computed
    userInitials,
    userFirstName,
    formattedJoinDate,
    
    // Methods
    loadUserProfile,
    updateProfile,
    updatePassword,
    uploadAvatar,
    uploadBanner,
    removeBanner
  };
}
