<template>
  <div class="profile-card-dashboard">
    <v-container>
      <!-- Simple Profile Header -->
      <v-card class="mb-4">
        <v-card-title class="text-h5">Profile Settings</v-card-title>
        <v-card-subtitle>Manage your account information</v-card-subtitle>
      </v-card>
      
      <!-- Status messages -->
      <v-alert v-if="message" :type="messageType" class="mb-4" closable>
        {{ message }}
      </v-alert>
      
      <!-- Simple Form -->
      <form @submit.prevent="simpleSubmit">
        <v-row>
          <!-- User Info -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="profileData.name"
              label="Full Name"
              variant="outlined"
            ></v-text-field>
            
            <v-text-field
              v-model="profileData.email"
              label="Email"
              variant="outlined"
              readonly
            ></v-text-field>
            
            <v-select
              v-model="profileData.theme"
              label="Theme"
              :items="[
                { title: 'Light', value: 'light' },
                { title: 'Dark', value: 'dark' },
                { title: 'System', value: 'system' },
                { title: 'Midnight Nebula', value: 'midnight-nebula' },
                { title: 'Eco-Tech', value: 'eco-tech' },
                { title: 'Corporate Clarity', value: 'corporate-clarity' }
              ]"
              variant="outlined"
            ></v-select>
          </v-col>
          
          <!-- Password Form -->
          <v-col cols="12" md="6">
            <v-card class="pa-4">
              <v-card-title class="text-h6">Change Password</v-card-title>
              
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
              
              <v-btn 
                color="primary" 
                @click="changePassword" 
                :loading="isUpdatingPassword"
                :disabled="!canChangePassword"
              >
                Update Password
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
        
        <div class="d-flex justify-end mt-4">
          <button type="submit" class="simple-button">
            Save Changes
          </button>
        </div>
      </form>
    </v-container>
  </div>
</template>

<script>
import { useThemeManager } from '../../composables/useTheme';

export default {
  name: 'ProfileSettings',
  
  setup() {
    const { setTheme } = useThemeManager();
    return { setTheme };
  },
  
  data() {
    return {
      profileData: {
        name: 'User Name',
        email: 'user@example.com',
        theme: localStorage.getItem('mcp_theme') || 'system'
      },
      
      passwordData: {
        current: '',
        new: '',
        confirm: ''
      },
      
      isUpdatingPassword: false,
      message: '',
      messageType: 'info',
      
      // Password validation rules
      passwordRules: [
        v => !!v || 'Password is required',
        v => v.length >= 8 || 'Password must be at least 8 characters',
        v => /[A-Z]/.test(v) || 'Password must contain at least one uppercase letter',
        v => /[0-9]/.test(v) || 'Password must contain at least one number'
      ]
    }
  },
  
  computed: {
    canChangePassword() {
      return this.passwordData.current && 
             this.passwordData.new && 
             this.passwordData.confirm &&
             this.passwordData.new === this.passwordData.confirm;
    }
  },
  
  mounted() {
    // Simple load profile
    setTimeout(() => {
      // Keep the theme from data, but update other fields
      const currentTheme = this.profileData.theme;
      this.profileData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        theme: currentTheme
      }
    }, 500)
  },
  
  methods: {
    simpleSubmit() {
      // Apply the selected theme
      this.setTheme(this.profileData.theme);
      
      // Store theme in localStorage
      localStorage.setItem('mcp_theme', this.profileData.theme);
      
      // Simple submit without complex logic
      this.message = 'Profile updated successfully'
      this.messageType = 'success'
      
      // Clear message after 3 seconds
      setTimeout(() => {
        this.message = ''
      }, 3000)
    },
    
    async changePassword() {
      if (!this.canChangePassword) return;
      
      this.isUpdatingPassword = true;
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Show success message
        this.message = 'Password updated successfully';
        this.messageType = 'success';
        
        // Reset form
        this.passwordData = {
          current: '',
          new: '',
          confirm: ''
        };
      } catch (error) {
        // Show error message
        this.message = 'Failed to update password. Please try again.';
        this.messageType = 'error';
      } finally {
        this.isUpdatingPassword = false;
        
        // Clear message after 3 seconds
        setTimeout(() => {
          this.message = '';
        }, 3000);
      }
    }
  }
}
</script>

<style scoped>
.simple-button {
  background-color: #1976d2;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.simple-button:hover {
  background-color: #1565c0;
}
</style>
