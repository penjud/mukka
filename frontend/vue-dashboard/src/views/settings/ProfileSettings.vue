<template>
  <div class="profile-settings">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5 font-weight-bold">
            <v-icon start color="primary" class="me-2">mdi-account-cog</v-icon>
            Profile Settings
          </v-card-title>
          
          <v-divider class="my-3"></v-divider>
          
          <v-card-text>
            <!-- Alert for messages -->
            <v-alert
              v-if="successMessage"
              type="success"
              variant="tonal"
              closable
              class="mb-4"
            >
              {{ successMessage }}
            </v-alert>
            
            <v-alert
              v-if="authStore.error"
              type="error"
              variant="tonal"
              closable
              class="mb-4"
            >
              {{ authStore.error }}
            </v-alert>
            
            <v-form @submit.prevent="updateProfile" ref="profileForm">
              <v-row>
                <v-col cols="12" md="4" class="text-center">
                  <v-avatar size="150" color="secondary" class="mb-4">
                    <v-img v-if="profileData.avatar" :src="profileData.avatar" alt="User Avatar"></v-img>
                    <v-icon v-else size="80" color="white">mdi-account</v-icon>
                  </v-avatar>
                  
                  <v-file-input
                    v-model="avatarFile"
                    accept="image/*"
                    label="Change Avatar"
                    prepend-icon="mdi-camera"
                    variant="outlined"
                    hide-details
                    class="mt-2"
                  ></v-file-input>
                </v-col>
                
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="profileData.name"
                    label="Full Name"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                  ></v-text-field>
                  
                  <v-text-field
                    v-model="profileData.username"
                    label="Username"
                    prepend-inner-icon="mdi-account-circle"
                    variant="outlined"
                    disabled
                  ></v-text-field>
                  
                  <v-text-field
                    v-model="profileData.email"
                    label="Email"
                    prepend-inner-icon="mdi-email"
                    variant="outlined"
                    :rules="[rules.email]"
                  ></v-text-field>
                  
                  <v-select
                    v-model="profileData.theme"
                    label="Theme Preference"
                    prepend-inner-icon="mdi-theme-light-dark"
                    variant="outlined"
                    :items="[
                      { title: 'Light', value: 'light' },
                      { title: 'Dark', value: 'dark' },
                      { title: 'System Default', value: 'system' }
                    ]"
                  ></v-select>
                  
                  <v-select
                    v-model="profileData.language"
                    label="Interface Language"
                    prepend-inner-icon="mdi-translate"
                    variant="outlined"
                    :items="[
                      { title: 'English', value: 'en' },
                      { title: 'Spanish', value: 'es' },
                      { title: 'French', value: 'fr' },
                      { title: 'German', value: 'de' },
                      { title: 'Chinese', value: 'zh' }
                    ]"
                  ></v-select>
                </v-col>
              </v-row>
              
              <v-divider class="my-6"></v-divider>
              
              <v-row>
                <v-col cols="12">
                  <h3 class="text-h6 mb-4">Change Password</h3>
                  
                  <v-text-field
                    v-model="passwordData.currentPassword"
                    label="Current Password"
                    type="password"
                    prepend-inner-icon="mdi-lock"
                    variant="outlined"
                  ></v-text-field>
                  
                  <v-text-field
                    v-model="passwordData.newPassword"
                    label="New Password"
                    type="password"
                    prepend-inner-icon="mdi-lock-outline"
                    variant="outlined"
                    :rules="passwordData.newPassword ? [rules.password] : []"
                  ></v-text-field>
                  
                  <v-text-field
                    v-model="passwordData.confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    prepend-inner-icon="mdi-lock-check"
                    variant="outlined"
                    :rules="passwordData.confirmPassword ? [
                      value => value === passwordData.newPassword || 'Passwords do not match'
                    ] : []"
                  ></v-text-field>
                </v-col>
              </v-row>
              
              <v-row>
                <v-col cols="12" class="d-flex justify-end">
                  <v-btn
                    color="primary"
                    type="submit"
                    :loading="authStore.loading"
                  >
                    Save Changes
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';

// Component state
const authStore = useAuthStore();
const profileForm = ref(null);
const successMessage = ref('');
const avatarFile = ref(null);

// Profile data
const profileData = reactive({
  name: '',
  username: '',
  email: '',
  avatar: '',
  theme: 'system',
  language: 'en'
});

// Password change data
const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// Form validation rules
const rules = {
  email: value => {
    if (!value) return true;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || 'Enter a valid email address';
  },
  password: value => {
    // Password should be at least 8 characters with at least one number, 
    // one uppercase letter, and one special character
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return pattern.test(value) || 
      'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character';
  }
};

// Populate form with user data on mount
onMounted(() => {
  const user = authStore.userProfile;
  if (user) {
    profileData.name = user.name || '';
    profileData.username = user.username || '';
    profileData.email = user.email || '';
    profileData.avatar = user.avatar || '';
    profileData.theme = user.preferences?.theme || 'system';
    profileData.language = user.preferences?.language || 'en';
  }
});

// Update profile information
async function updateProfile() {
  // Reset success message
  successMessage.value = '';
  
  // Handle avatar upload if provided
  if (avatarFile.value) {
    // In a real implementation, this would upload the avatar
    // For now, we'll just mock it with a placeholder
    profileData.avatar = '/avatars/placeholder.jpg';
  }
  
  // Update profile data
  const profileSuccess = await authStore.updateProfile({
    name: profileData.name,
    email: profileData.email,
    preferences: {
      theme: profileData.theme,
      language: profileData.language
    }
  });
  
  // Handle password change if provided
  let passwordSuccess = true;
  if (passwordData.currentPassword && passwordData.newPassword) {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      authStore.error = 'New passwords do not match';
      return;
    }
    
    passwordSuccess = await authStore.changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    
    // Clear password fields if successful
    if (passwordSuccess) {
      passwordData.currentPassword = '';
      passwordData.newPassword = '';
      passwordData.confirmPassword = '';
    }
  }
  
  // Show success message if everything went well
  if (profileSuccess && passwordSuccess) {
    successMessage.value = 'Profile updated successfully';
  }
}
</script>
