<template>
  <div class="profile-dashboard">
    <v-container fluid>
      <!-- Banner with Avatar -->
      <BannerUpload
        :banner-url="userData.bannerUrl"
        :avatar-url="userData.avatarUrl"
        :user-initials="userInitials"
        @banner-change="handleBannerChange"
        class="mb-6"
      />
      
      <!-- Success Message -->
      <v-snackbar
        v-model="showSuccess"
        color="success"
        timeout="3000"
        location="top"
      >
        {{ successMessage }}
      </v-snackbar>
      
      <!-- Error Message -->
      <v-snackbar
        v-model="showError"
        color="error"
        timeout="5000"
        location="top"
      >
        {{ errorMessage }}
      </v-snackbar>
      
      <!-- Profile Content Grid -->
      <v-row>
        <!-- Main Content with Tabs -->
        <v-col cols="12">
          <v-card>
            <v-tabs v-model="activeTab" color="primary">
              <v-tab value="profile">
                <v-icon start>mdi-account-outline</v-icon>
                Profile
              </v-tab>
              <v-tab value="avatar">
                <v-icon start>mdi-camera</v-icon>
                Photo
              </v-tab>
              <v-tab value="appearance">
                <v-icon start>mdi-theme-light-dark</v-icon>
                Appearance
              </v-tab>
              <v-tab value="security">
                <v-icon start>mdi-shield-outline</v-icon>
                Security
              </v-tab>
            </v-tabs>
            
            <v-card-text>
              <!-- Profile Tab -->
              <v-window v-model="activeTab">
                <v-window-item value="profile">
                  <div class="d-flex align-center mb-6">
                    <v-avatar size="80" class="mr-6">
                      <v-img v-if="userData.avatarUrl" :src="userData.avatarUrl" cover></v-img>
                      <span v-else class="text-h3">{{ userInitials }}</span>
                    </v-avatar>
                    
                    <div>
                      <h2 class="text-h5 mb-1">{{ userData.displayName }}</h2>
                      <p class="text-subtitle-1 text-medium-emphasis">{{ userData.role }}</p>
                    </div>
                  </div>
                  
                  <h3 class="text-h6 mb-4">Personal Information</h3>
                  
                  <v-form @submit.prevent="saveDisplayName">
                    <v-text-field
                      v-model="editData.displayName"
                      label="Display Name"
                      variant="outlined"
                      :rules="[v => !!v || 'Display name is required']"
                      class="mb-4"
                    ></v-text-field>
                    
                    <div class="d-flex mb-6">
                      <v-btn 
                        type="submit" 
                        color="primary" 
                        :loading="isUpdating"
                      >
                        Save Changes
                      </v-btn>
                    </div>
                  </v-form>
                  
                  <h3 class="text-h6 mb-4">Account Information</h3>
                  <v-list>
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-email</v-icon>
                      </template>
                      <v-list-item-title>Email</v-list-item-title>
                      <v-list-item-subtitle>{{ userData.email }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-account</v-icon>
                      </template>
                      <v-list-item-title>Username</v-list-item-title>
                      <v-list-item-subtitle>{{ userData.username }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-calendar</v-icon>
                      </template>
                      <v-list-item-title>Member Since</v-list-item-title>
                      <v-list-item-subtitle>{{ formattedJoinDate }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-window-item>
                
                <!-- Avatar Tab -->
                <v-window-item value="avatar">
                  <h3 class="text-h6 mb-4">Profile Photo</h3>
                  
                  <div class="text-center my-4">
                    <v-avatar size="150" class="mb-6">
                      <v-img v-if="userData.avatarUrl" :src="userData.avatarUrl" cover></v-img>
                      <span v-else class="text-h2">{{ userInitials }}</span>
                    </v-avatar>
                    
                    <div class="d-flex justify-center">
                      <v-btn
                        color="primary"
                        prepend-icon="mdi-camera"
                        @click="dialogs.avatar = true"
                        class="mx-2"
                      >
                        Change Photo
                      </v-btn>
                      
                      <v-btn
                        v-if="userData.avatarUrl"
                        color="error"
                        variant="outlined"
                        prepend-icon="mdi-delete"
                        @click="removeAvatar"
                        class="mx-2"
                      >
                        Remove Photo
                      </v-btn>
                    </div>
                  </div>
                </v-window-item>
                
                <!-- Appearance Tab -->
                <v-window-item value="appearance">
                  <h3 class="text-h6 mb-4">Theme Settings</h3>
                  
                  <div class="theme-options">
                    <v-radio-group v-model="editData.theme" @update:model-value="saveTheme">
                      <v-radio
                        v-for="option in themeOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      ></v-radio>
                    </v-radio-group>
                  </div>
                  
                  <h3 class="text-h6 mb-4 mt-6">Preview</h3>
                  <div class="d-flex flex-wrap gap-4">
                    <v-card
                      v-for="theme in ['light', 'dark', 'midnight-nebula', 'eco-tech', 'corporate-clarity']"
                      :key="theme"
                      width="150"
                      height="100"
                      :class="`theme-preview ${theme}`"
                      @click="quickSelectTheme(theme)"
                    >
                      <v-card-item>
                        <v-card-title class="text-caption">
                          {{ getThemeLabel(theme) }}
                        </v-card-title>
                      </v-card-item>
                    </v-card>
                  </div>
                </v-window-item>
                
                <!-- Security Tab -->
                <v-window-item value="security">
                  <h3 class="text-h6 mb-4">Change Password</h3>
                  
                  <v-form @submit.prevent="savePassword">
                    <v-text-field
                      v-model="passwordData.current"
                      label="Current Password"
                      type="password"
                      variant="outlined"
                      :rules="[v => !!v || 'Current password is required']"
                      class="mb-4"
                    ></v-text-field>
                    
                    <v-text-field
                      v-model="passwordData.new"
                      label="New Password"
                      type="password"
                      variant="outlined"
                      :rules="passwordRules"
                      class="mb-4"
                    ></v-text-field>
                    
                    <v-text-field
                      v-model="passwordData.confirm"
                      label="Confirm New Password"
                      type="password"
                      variant="outlined"
                      :rules="[
                        v => !!v || 'Please confirm your password',
                        v => v === passwordData.new || 'Passwords do not match'
                      ]"
                      class="mb-4"
                    ></v-text-field>
                    
                    <div class="d-flex">
                      <v-btn 
                        type="submit" 
                        color="primary" 
                        :loading="isUpdating"
                        :disabled="!canSavePassword"
                      >
                        Update Password
                      </v-btn>
                    </div>
                  </v-form>
                  
                  <v-divider class="my-6"></v-divider>
                  
                  <h3 class="text-h6 mb-4">Active Sessions</h3>
                  <v-table>
                    <thead>
                      <tr>
                        <th>Device</th>
                        <th>Location</th>
                        <th>Last Active</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div class="d-flex align-center">
                            <v-icon color="primary" class="mr-2">mdi-laptop</v-icon>
                            Current Device
                          </div>
                        </td>
                        <td>New York, USA</td>
                        <td>Just now</td>
                        <td>
                          <v-btn color="primary" variant="text" size="small">
                            This Device
                          </v-btn>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="d-flex align-center">
                            <v-icon color="primary" class="mr-2">mdi-cellphone</v-icon>
                            Mobile Device
                          </div>
                        </td>
                        <td>New York, USA</td>
                        <td>2 days ago</td>
                        <td>
                          <v-btn color="error" variant="text" size="small" @click="logoutSession(2)">
                            Sign Out
                          </v-btn>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                  
                  <div class="d-flex justify-end mt-4">
                    <v-btn color="error" variant="outlined" @click="logoutAllSessions">
                      Sign Out All Devices
                    </v-btn>
                  </div>
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- DIALOGS -->
    
    <!-- Avatar Dialog -->
    <v-dialog v-model="dialogs.avatar" max-width="500">
      <v-card>
        <v-card-title>Update Profile Picture</v-card-title>
        <v-card-text>
          <div class="text-center my-4">
            <v-avatar size="150" class="mb-4">
              <v-img v-if="previewAvatar" :src="previewAvatar" cover></v-img>
              <v-img v-else-if="userData.avatarUrl" :src="userData.avatarUrl" cover></v-img>
              <span v-else class="text-h2">{{ userInitials }}</span>
            </v-avatar>
            
            <v-file-input
              v-model="avatarFile"
              accept="image/*"
              label="Select an image"
              prepend-icon="mdi-camera"
              @change="previewImage"
            ></v-file-input>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="default" variant="text" @click="cancelAvatar">Cancel</v-btn>
          <v-btn color="primary" @click="saveAvatar" :loading="isUpdating">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useThemeManager } from '../composables/useTheme';
import { useProfileManager } from '../composables/useProfileManager';
import BannerUpload from '../components/profile/BannerUpload.vue';

export default defineComponent({
  name: 'ProfileSettingsNew',
  
  components: {
    BannerUpload
  },
  
  setup() {
    // Theme management
    const { currentTheme, setTheme } = useThemeManager();
    
    // Profile management
    const {
      userData,
      isLoading,
      isUpdating,
      error,
      success,
      userInitials,
      userFirstName,
      formattedJoinDate,
      loadUserProfile,
      updateProfile,
      updatePassword,
      uploadAvatar,
      uploadBanner,
      removeBanner
    } = useProfileManager();
    
    // UI state
    const activeTab = ref('profile');
    const avatarFile = ref(null);
    const previewAvatar = ref(null);
    const bannerFile = ref(null);
    const showSuccess = ref(false);
    const showError = ref(false);
    const successMessage = ref('');
    const errorMessage = ref('');
    
    // Dialog visibility
    const dialogs = ref({
      avatar: false
    });
    
    // Edit data
    const editData = ref({
      displayName: '',
      theme: 'system'
    });
    
    // Password form
    const passwordData = ref({
      current: '',
      new: '',
      confirm: ''
    });
    
    // Password validation rules
    const passwordRules = [
      v => !!v || 'Password is required',
      v => v.length >= 8 || 'Password must be at least 8 characters',
      v => /[A-Z]/.test(v) || 'Password must contain at least one uppercase letter',
      v => /[0-9]/.test(v) || 'Password must contain at least one number'
    ];
    
    // Computed properties
    const canSavePassword = computed(() => {
      return passwordData.value.current && 
             passwordData.value.new && 
             passwordData.value.confirm &&
             passwordData.value.new === passwordData.value.confirm;
    });
    
    // Theme options
    const themeOptions = [
      { label: 'Light Theme', value: 'light' },
      { label: 'Dark Theme', value: 'dark' },
      { label: 'Use System Settings', value: 'system' },
      { label: 'Midnight Nebula', value: 'midnight-nebula' },
      { label: 'Eco-Tech', value: 'eco-tech' },
      { label: 'Corporate Clarity', value: 'corporate-clarity' }
    ];
    
    // Helper functions
    const getThemeLabel = (themeValue) => {
      const option = themeOptions.find(opt => opt.value === themeValue);
      return option ? option.label : themeValue;
    };
    
    // Load user profile on mount
    onMounted(async () => {
      try {
        await loadUserProfile();
        editData.value.displayName = userData.displayName;
        editData.value.theme = userData.theme;
      } catch (err) {
        showErrorMessage('Failed to load profile data');
      }
    });
    
    // Watch for success/error messages
    watch(success, (val) => {
      if (val) {
        showSuccessMessage(val);
      }
    });
    
    watch(error, (val) => {
      if (val) {
        showErrorMessage(val);
      }
    });
    
    // Methods
    const showSuccessMessage = (message) => {
      successMessage.value = message;
      showSuccess.value = true;
    };
    
    const showErrorMessage = (message) => {
      errorMessage.value = message;
      showError.value = true;
    };
    
    // Avatar methods
    const previewImage = () => {
      if (!avatarFile.value) {
        previewAvatar.value = null;
        return;
      }
      
      const reader = new FileReader();
      reader.readAsDataURL(avatarFile.value);
      reader.onload = e => {
        previewAvatar.value = e.target.result;
      };
    };
    
    const cancelAvatar = () => {
      avatarFile.value = null;
      previewAvatar.value = null;
      dialogs.value.avatar = false;
    };
    
    const saveAvatar = async () => {
      if (!avatarFile.value) {
        dialogs.value.avatar = false;
        return;
      }
      
      try {
        await uploadAvatar(avatarFile.value);
        cancelAvatar();
      } catch (err) {
        showErrorMessage('Failed to upload avatar');
      }
    };
    
    // Banner methods
    const handleBannerChange = async (data) => {
      if (data.remove) {
        await removeBanner();
      } else if (data.file) {
        bannerFile.value = data.file;
        try {
          await uploadBanner(data.file);
          bannerFile.value = null;
        } catch (err) {
          showErrorMessage('Failed to upload banner');
        }
      }
    };
    
    // Remove avatar
    const removeAvatar = async () => {
      try {
        // Clear avatar in localStorage
        localStorage.removeItem('mcp_avatar');
        // Update store
        userData.avatarUrl = '';
        showSuccessMessage('Profile photo removed successfully');
      } catch (err) {
        showErrorMessage('Failed to remove profile photo');
      }
    };
    
    // Profile methods
    const saveDisplayName = async () => {
      if (!editData.value.displayName) return;
      
      try {
        await updateProfile({ displayName: editData.value.displayName });
      } catch (err) {
        showErrorMessage('Failed to update display name');
      }
    };
    
    // Theme methods
    const saveTheme = async () => {
      try {
        await updateProfile({ theme: editData.value.theme });
      } catch (err) {
        showErrorMessage('Failed to update theme preference');
      }
    };
    
    const quickSelectTheme = (theme) => {
      editData.value.theme = theme;
      saveTheme();
    };
    
    // Password methods
    const savePassword = async () => {
      if (!canSavePassword.value) return;
      
      try {
        await updatePassword(passwordData.value.current, passwordData.value.new);
        // Reset form on success
        passwordData.value = {
          current: '',
          new: '',
          confirm: ''
        };
      } catch (err) {
        // Error is already handled in the composable and watched above
      }
    };
    
    // Session management
    const logoutSession = (sessionId) => {
      console.log(`Logging out session ${sessionId}`);
      showSuccessMessage('Device signed out successfully');
    };
    
    const logoutAllSessions = () => {
      console.log('Logging out all sessions');
      showSuccessMessage('Signed out from all devices');
    };
    
    return {
      // State
      userData,
      isLoading,
      isUpdating,
      activeTab,
      avatarFile,
      previewAvatar,
      bannerFile,
      dialogs,
      editData,
      passwordData,
      showSuccess,
      showError,
      successMessage,
      errorMessage,
      
      // Computed
      userInitials,
      userFirstName,
      formattedJoinDate,
      canSavePassword,
      themeOptions,
      passwordRules,
      
      // Methods
      showSuccessMessage,
      showErrorMessage,
      previewImage,
      cancelAvatar,
      saveAvatar,
      removeAvatar,
      handleBannerChange,
      saveDisplayName,
      saveTheme,
      quickSelectTheme,
      getThemeLabel,
      savePassword,
      logoutSession,
      logoutAllSessions
    };
  }
});
</script>

<style scoped>
.profile-dashboard {
  margin-bottom: 40px;
}

.gap-4 {
  gap: 1rem;
}

.theme-preview {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.theme-preview:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.1);
}

.theme-preview.light {
  background-color: #FFFFFF;
  color: #333333;
  border: 1px solid #EEEEEE;
}

.theme-preview.dark {
  background-color: #121212;
  color: #FFFFFF;
}

.theme-preview.midnight-nebula {
  background-color: #7E57C2;
  color: #FFFFFF;
}

.theme-preview.eco-tech {
  background-color: #F5F5F5;
  color: #2E7D32;
  border: 1px solid #E0E0E0;
}

.theme-preview.corporate-clarity {
  background-color: #FFFFFF;
  color: #0D47A1;
  border: 1px solid #E0E0E0;
}
</style>
